<template>
  <div class="dashboard-page">
    <!-- Verifying Overlay -->
    <div v-if="verifying" class="verifying-overlay">
      <div class="spinner"></div>
      <p>正在验证访问权限...</p>
    </div>

    <!-- Main Content (Only shown after verification) -->
    <div v-else-if="authorized" class="dashboard-container">
      <h1 class="page-title">数据看板</h1>
      
      <div class="tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'global' }]" 
          @click="activeTab = 'global'"
        >
          全局数据
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'team' }]" 
          @click="activeTab = 'team'"
        >
          团队数据
        </button>
      </div>

      <!-- Global View -->
      <div v-if="activeTab === 'global'" class="view-content">
        <div v-if="loadingGlobal" class="loading">正在加载全局数据...</div>
        <div v-else-if="!globalData" class="no-data">暂无全局数据</div>
        <div v-else class="charts-grid">
          <div class="chart-card">
            <h3>全局质押分布</h3>
            <v-chart class="chart-container" :option="globalPieOption" autoresize />
          </div>
          <div class="chart-card">
            <h3>全局到期金额趋势 (未来30天)</h3>
            <v-chart class="chart-container" :option="globalBarOption" autoresize />
          </div>
        </div>
      </div>

      <!-- Team View -->
      <div v-if="activeTab === 'team'" class="view-content team-view-layout">
        <!-- Left Column: Team List -->
        <div class="team-list-column" :class="{ 'mobile-hidden': showMobileDetail }">
          <div class="list-header">
            <h3>团队列表</h3>
            <button @click="loadTeamsList" class="refresh-btn" title="刷新列表">
              ↻
            </button>
          </div>
          
          <div v-if="loadingTeamsList" class="loading-small">加载中...</div>
          <div v-else-if="teamsList.length === 0" class="no-data-small">暂无团队数据</div>
          <div v-else class="team-list">
            <div 
              v-for="team in teamsList" 
              :key="team.id"
              :class="['team-item', { active: selectedTeamId === team.id }]"
              @click="selectTeam(team.id)"
            >
              <div class="team-id">{{ formatAddress(team.id) }}</div>
              <div class="team-stat">总质押: {{ formatTotalStaked(team) }}</div>
            </div>
          </div>
        </div>

        <!-- Right Column: Team Details -->
        <div class="team-details-column" :class="{ 'mobile-hidden': !showMobileDetail }">
          <div v-if="!selectedTeamId" class="empty-state">
            <p>请从左侧选择一个团队查看详情</p>
          </div>
          <div v-else class="details-content">
            <div class="details-header">
              <button class="mobile-back-btn" @click="closeMobileDetail">← 返回列表</button>
              <h2>团队: {{ selectedTeamId }}</h2>
            </div>

            <div v-if="loadingTeam" class="loading">正在加载团队数据...</div>
            <div v-else-if="teamData" class="team-charts-grid">
              <div class="chart-card">
                <h3>团队质押分布</h3>
                <v-chart class="chart-container-small" :option="teamPieOption" autoresize />
              </div>
              <div class="chart-card">
                <h3>团队到期金额趋势</h3>
                <v-chart class="chart-container-small" :option="teamBarOption" autoresize />
              </div>
            </div>
            <div v-else-if="teamLoaded && !teamData" class="no-data">
              未找到该团队的详情数据
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart, BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import { fetchGlobalDashboardData, fetchTeamDashboardData, fetchAllTeams } from '../services/subgraph';
import { walletState, formatAddress as formatAddr } from '../services/wallet';
import { DASHBOARD_WHITELIST } from '../services/environment';

// Register ECharts components
use([
  CanvasRenderer,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
]);

const router = useRouter();

// Auth & State
const verifying = ref(true);
const authorized = ref(false);
const activeTab = ref('global');
const showMobileDetail = ref(false);

// Data Loading States
const loadingGlobal = ref(false);
const loadingTeamsList = ref(false);
const loadingTeam = ref(false);

const globalData = ref(null);
const teamsList = ref([]);
const selectedTeamId = ref(null);
const teamData = ref(null);
const teamLoaded = ref(false);

// Reactive Options for Charts
const globalPieOption = ref({});
const globalBarOption = ref({});
const teamPieOption = ref({});
const teamBarOption = ref({});

const DECIMALS = 1e18; 

// --- ACCESS CONTROL LOGIC ---
const checkAccess = () => {
  const cachedAddress = localStorage.getItem('ath_walletAddress')?.toLowerCase();
  
  if (!cachedAddress || !DASHBOARD_WHITELIST.includes(cachedAddress)) {
    console.warn('Dashboard denied: No valid cached session.');
    router.replace('/');
    return;
  }

  if (walletState.isConnected && walletState.isAuthenticated) {
    if (DASHBOARD_WHITELIST.includes(walletState.address.toLowerCase())) {
      grantAccess();
    } else {
      router.replace('/');
    }
    return;
  }

  const timeout = setTimeout(() => {
    if (!authorized.value) {
      console.warn('Dashboard denied: Verification timeout.');
      router.replace('/');
    }
  }, 3000);

  const unwatch = watch(() => [walletState.isConnected, walletState.isAuthenticated], ([connected, auth]) => {
    if (connected && auth) {
      if (DASHBOARD_WHITELIST.includes(walletState.address.toLowerCase())) {
        clearTimeout(timeout);
        unwatch();
        grantAccess();
      } else {
        router.replace('/');
      }
    }
  });
};

const grantAccess = () => {
  authorized.value = true;
  verifying.value = false;
  loadGlobalData();
};

// Watch for disconnects or de-authentication
watch(() => [walletState.isConnected, walletState.isAuthenticated], ([connected, auth]) => {
  if (authorized.value) {
    if (!connected || !auth) {
      console.log('Dashboard: Wallet disconnected or de-authenticated. Redirecting...');
      authorized.value = false;
      globalData.value = null;
      teamData.value = null;
      teamsList.value = [];
      selectedTeamId.value = null;
      router.replace('/');
    }
  }
});

// --- DATA LOGIC ---

const formatAddress = (addr) => formatAddr(addr);

const formatAmount = (value) => {
  if (!value) return 0;
  return (Number(value) / DECIMALS).toFixed(2);
};

const formatTotalStaked = (team) => {
  const total = Number(team.totalStaked1Day || 0) + 
                Number(team.totalStaked15Days || 0) + 
                Number(team.totalStaked30Days || 0);
  return formatAmount(total);
};

const formatDate = (timestamp) => {
  return new Date(Number(timestamp) * 1000).toLocaleDateString();
};

const loadGlobalData = async () => {
  loadingGlobal.value = true;
  try {
    const data = await fetchGlobalDashboardData();
    globalData.value = data;
    if (data) {
      updateGlobalCharts(data);
    }
  } catch (e) {
    console.error(e);
  } finally {
    loadingGlobal.value = false;
  }
};

const loadTeamsList = async () => {
  loadingTeamsList.value = true;
  try {
    const list = await fetchAllTeams();
    teamsList.value = list;
  } catch (e) {
    console.error(e);
  } finally {
    loadingTeamsList.value = false;
  }
};

const closeMobileDetail = () => {
  showMobileDetail.value = false;
};

const selectTeam = async (id) => {
  if (selectedTeamId.value === id) {
    showMobileDetail.value = true;
    return;
  }
  
  selectedTeamId.value = id;
  showMobileDetail.value = true;
  
  loadingTeam.value = true;
  teamLoaded.value = false;
  teamData.value = null;

  try {
    const data = await fetchTeamDashboardData(id);
    teamData.value = data && data.teamStat ? data : null;
    teamLoaded.value = true;
    if (teamData.value) {
      updateTeamCharts(teamData.value);
    }
  } catch (e) {
    console.error(e);
  } finally {
    loadingTeam.value = false;
  }
};

// --- CHART OPTIONS GENERATORS ---

const getPieOption = (statData) => {
  const data = [
    { value: formatAmount(statData.totalStaked1Day), name: '1天' },
    { value: formatAmount(statData.totalStaked15Days), name: '15天' },
    { value: formatAmount(statData.totalStaked30Days), name: '30天' },
  ].filter(item => item.value > 0);

  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', left: 'center', textStyle: { color: '#fff' } },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#1a1a1a', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold', color: '#fff' } },
        labelLine: { show: false },
        data: data.length ? data : [{ value: 0, name: '无数据' }]
      }
    ]
  };
};

const getBarOption = (buckets) => {
  const dates = buckets.map(b => formatDate(b.date));
  const values = buckets.map(b => formatAmount(b.totalAmount));

  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [
      {
        type: 'category',
        data: dates,
        axisTick: { alignWithLabel: true },
        axisLabel: { rotate: 45, color: '#ccc' },
        axisLine: { lineStyle: { color: '#555' } }
      }
    ],
    yAxis: [{ type: 'value', axisLabel: { color: '#ccc' }, splitLine: { lineStyle: { color: '#333' } } }],
    series: [
      {
        name: '到期金额',
        type: 'bar',
        barWidth: '60%',
        data: values,
        itemStyle: { color: '#5470c6' }
      }
    ]
  };
};

const updateGlobalCharts = (data) => {
  if (data?.globalStat) {
    globalPieOption.value = getPieOption(data.globalStat);
  }
  if (data?.maturityBuckets) {
    globalBarOption.value = getBarOption(data.maturityBuckets);
  }
};

const updateTeamCharts = (data) => {
  if (data?.teamStat) {
    teamPieOption.value = getPieOption(data.teamStat);
  }
  if (data?.teamMaturityBuckets) {
    teamBarOption.value = getBarOption(data.teamMaturityBuckets);
  }
};

onMounted(() => {
  checkAccess();
});

watch(activeTab, (newTab) => {
  if (newTab === 'team' && teamsList.value.length === 0) {
    loadTeamsList();
  }
});

</script>

<style scoped>
.dashboard-page {
  padding-top: 40px;
  min-height: 100vh;
  background-color: #0f0f0f;
  color: #fff;
  padding-bottom: 50px;
}

.verifying-overlay {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 60vh;
  color: rgba(255,255,255,0.7);
  gap: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255,255,255,0.1);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.dashboard-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 40px;
  height: calc(100vh - 100px); /* Fill remaining height */
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 0 15px;
    height: calc(100vh - 80px);
  }
}

.page-title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.8rem;
  font-weight: bold;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
    margin-bottom: 15px;
  }
}

.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  gap: 20px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .tabs {
    gap: 10px;
    margin-bottom: 15px;
  }
}

.view-content {
  flex: 1;
  overflow: hidden; /* Prevent double scrollbars */
  display: flex;
  flex-direction: column;
}

/* Global View Specifics */
.view-content:not(.team-view-layout) {
  overflow-y: auto;
}

.tab-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.6);
  padding: 8px 24px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.95rem;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .tab-btn {
    padding: 6px 16px;
    font-size: 0.9rem;
  }
}

.tab-btn:hover {
  border-color: rgba(255, 255, 255, 0.5);
  color: #fff;
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.1);
  border-color: #fff;
  color: #fff;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  padding-bottom: 20px;
}

@media (min-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.chart-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.chart-card h3 {
  text-align: center;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
}

.chart-container {
  width: 100%;
  height: 350px;
}

@media (max-width: 768px) {
  .chart-container {
    height: 300px;
  }
}

.chart-container-small {
  width: 100%;
  height: 300px;
}

.loading, .no-data {
  text-align: center;
  padding: 50px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.2rem;
}

/* Team View Layout */
.team-view-layout {
  display: flex;
  flex-direction: row; /* Ensure row layout */
  gap: 20px;
  height: 100%; /* Take full available height from parent */
  overflow: hidden; /* Container doesn't scroll, children do */
}

.team-list-column {
  width: 280px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
}

@media (max-width: 768px) {
  .team-list-column {
    width: 100%;
    border: none;
    background: transparent;
  }
}

.list-header {
  padding: 12px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.list-header h3 {
  margin: 0;
  font-size: 1rem;
}

.refresh-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 4px;
}

.team-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

/* Custom Scrollbar for list */
.team-list::-webkit-scrollbar {
  width: 6px;
}
.team-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}
.team-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}

.team-item {
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 4px;
}

@media (max-width: 768px) {
  .team-item {
    background: rgba(255, 255, 255, 0.05);
    padding: 15px;
    margin-bottom: 8px;
  }
}

.team-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.team-item.active {
  background: rgba(44, 62, 80, 0.8);
  border: 1px solid #2c3e50;
}

.team-id {
  font-weight: bold;
  font-size: 0.85rem;
  font-family: monospace;
}

@media (max-width: 768px) {
  .team-id {
    font-size: 1rem;
  }
}

.team-stat {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

.team-details-column {
  flex: 1;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 0; /* Remove padding from container to let scrollbar be at edge */
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

@media (max-width: 768px) {
  .team-details-column {
    width: 100%;
    border: none;
    background: transparent;
  }
}

.details-content {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
}

@media (max-width: 768px) {
  .details-content {
    padding: 0;
  }
}

.details-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.details-header h2 {
  font-size: 1.2rem;
  margin: 0;
  word-break: break-all;
}

@media (max-width: 768px) {
  .details-header h2 {
    font-size: 1rem;
    margin-top: 10px;
  }
}

.mobile-back-btn {
  display: none;
  background: none;
  border: none;
  color: #42b983; /* Vue green or theme color */
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
  margin-bottom: 5px;
  font-weight: bold;
}

@media (max-width: 768px) {
  .mobile-back-btn {
    display: block;
  }
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.4);
  font-size: 1rem;
}

@media (max-width: 768px) {
  .empty-state {
    display: none; /* Hide empty state on mobile since we show list instead */
  }
}

.team-charts-grid {
  display: grid;
  grid-template-columns: 1fr; /* Default stack */
  gap: 20px;
}

@media (min-width: 1200px) {
  .team-charts-grid {
    grid-template-columns: 1fr 1fr; /* Side by side on larger screens */
  }
}

.loading-small, .no-data-small {
  padding: 15px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

/* Mobile Visibility Utilities */
@media (max-width: 768px) {
  .mobile-hidden {
    display: none !important;
  }
}
</style>