<template>
  <div class="welfare-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">
          {{ t('welfare.title') || '历史质押福利' }}
        </h1>
        <div class="header-actions">
           <button class="refresh-btn" @click="loadData(true)" :disabled="loading" title="刷新">
            <span class="icon" :class="{ 'spinning': loading }">↻</span>
          </button>
          <button class="add-token-btn" @click="handleAddToken">
            <span class="icon">+</span> {{ t('welfare.addToken') }}
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-container">
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 1 }"
          @click="switchTab(1)"
        >
          {{ t('welfare.unclaimed') }}
          <span class="count-badge" v-if="unclaimedTotal > 0">{{ unclaimedTotal }}</span>
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 2 }"
          @click="switchTab(2)"
        >
          {{ t('welfare.claimed') }}
        </div>
      </div>

      <!-- Action Bar (Moved to top) -->
      <div class="action-bar" v-if="activeTab === 1 && records.length > 0">
        <div class="action-info">
          {{ t('welfare.pageUnclaimed', { count: pageUnclaimedCount }) }}
        </div>
        <button 
          class="batch-claim-btn" 
          @click="handleBatchClaim"
          :disabled="batchClaiming || pageUnclaimedCount === 0"
        >
          {{ batchClaiming ? t('welfare.claiming') : t('welfare.batchClaim') }}
        </button>
      </div>

      <!-- List Container -->
      <div class="list-container" ref="listContainer">
        <div v-if="loading && records.length === 0" class="loading-state">
          <div class="spinner"></div>
          <p>{{ t('common.loading') }}</p>
        </div>

        <div v-else-if="records.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <p class="empty-text">{{ t('welfare.noRecords') }}</p>
          <p class="empty-subtext" v-if="!walletState.isConnected">{{ t('welfare.connectFirst') }}</p>
          <button v-if="!walletState.isConnected" class="connect-btn" @click="connectWallet">{{ t('header.connectWallet') }}</button>
        </div>

        <div v-else class="records-list">
          <div 
            v-for="item in records" 
            :key="item.orderId" 
            class="record-card compact"
            :class="{ 'claimed': item.isClaimed }"
          >
            <div class="card-main-row">
              <div class="order-info">
                <span class="order-id">#{{ item.orderId }}</span>
                <span class="status-tag-mini" :class="item.stakingStatus ? 'status-ended' : 'status-active'">
                  {{ item.stakingStatus ? t('welfare.statusEnded') : t('welfare.statusActive') }}
                </span>
              </div>
              
              <div class="right-actions">
                <div class="amount-group">
                  <span class="amount-value">{{ formatAmount(item.claimableAmount) }}</span>
                  <span class="amount-unit">ATHP</span>
                </div>
                
                <button 
                  v-if="!item.isClaimed"
                  class="claim-btn-mini"
                  @click.stop="handleClaim(item)"
                  :disabled="claimingId === item.orderId"
                >
                  {{ claimingId === item.orderId ? '...' : t('welfare.claim') }}
                </button>
                <div v-else class="claimed-text-mini">{{ t('welfare.claimed') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination Controls -->
        <div v-if="records.length > 0 && totalPages > 1" class="pagination-controls">
            <button 
                class="page-btn" 
                :disabled="currentPage === 1" 
                @click="changePage(currentPage - 1)"
            >
                &lt;
            </button>
            <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
            <button 
                class="page-btn" 
                :disabled="currentPage === totalPages" 
                @click="changePage(currentPage + 1)"
            >
                &gt;
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { 
  getWelfareRecords, 
  claimWelfareReward, 
  batchClaimWelfareRewards, 
  addAthpToWallet 
} from '../services/contracts';
import { walletState } from '../services/wallet';
import { showToast } from '../services/notification';
import { t } from '../i18n';

// State
const activeTab = ref(1); // 1: Unclaimed, 2: Claimed
const records = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const claimingId = ref(null);
const batchClaiming = ref(false);
const unclaimedTotal = ref(0); // Total count from contract

// Pagination
const limit = 20;
const currentPage = ref(1);

// Computed
const totalPages = computed(() => {
    return Math.max(1, Math.ceil(totalRecords.value / limit));
});

const pageUnclaimedCount = computed(() => {
  return records.value.filter(r => !r.isClaimed).length;
});

const connectWallet = () => {
  const event = new CustomEvent('open-wallet-modal');
  document.dispatchEvent(event);
};

// Lifecycle
onMounted(() => {
  console.log("WelfareView Mounted. Wallet State:", { 
    connected: walletState.isConnected, 
    initialized: walletState.contractsInitialized 
  });
  
  // Try loading regardless of state initially, getWelfareRecords handles null user/contract gracefully
  loadData();
});

// Watchers
watch(() => [walletState.isConnected, walletState.contractsInitialized], ([connected, init]) => {
  console.log("Wallet state changed:", { connected, init });
  if (connected && init) {
    currentPage.value = 1;
    loadData(); // Reload when connection is established
  }
});

// Methods
const switchTab = (tab) => {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
  currentPage.value = 1;
  loadData();
};

const changePage = (page) => {
    if (page < 1 || page > totalPages.value) return;
    currentPage.value = page;
    loadData();
    // Scroll to top of list
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const loadData = async (refresh = false) => {
  loading.value = true;
  if (refresh) records.value = [];
  
  try {
    const offset = (currentPage.value - 1) * limit;
    const res = await getWelfareRecords(offset, limit, activeTab.value);
    
    records.value = res.records;
    totalRecords.value = res.total;
    if (activeTab.value === 1) {
      unclaimedTotal.value = res.total;
    }
  } catch (error) {
    console.error("Failed to load welfare records", error);
    showToast(t('toast.fetchDataFailed'));
  } finally {
    loading.value = false;
  }
};

const handleClaim = async (item) => {
  if (claimingId.value) return;
  claimingId.value = item.orderId;
  
  const success = await claimWelfareReward(item.orderId);
  if (success) {
    // Optimistic update
    item.isClaimed = true;
    // Delay removal for user feedback
    setTimeout(() => {
        // Only remove if we are in "Unclaimed" tab
        if (activeTab.value === 1) {
            // Reload data to reflect changes accurately across pages
            loadData();
        }
    }, 1000);
  }
  
  claimingId.value = null;
};

const handleBatchClaim = async () => {
  if (batchClaiming.value) return;
  
  const idsToClaim = records.value
    .filter(r => !r.isClaimed)
    .map(r => r.orderId);
    
  if (idsToClaim.length === 0) return;

  batchClaiming.value = true;
  const success = await batchClaimWelfareRewards(idsToClaim);
  
  if (success) {
    // Reload to be safe
    loadData();
  }
  
  batchClaiming.value = false;
};

const handleAddToken = () => {
  addAthpToWallet();
};

const formatAmount = (val) => {
  const num = parseFloat(val);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
};
</script>

<style scoped>
.welfare-page {
  min-height: 100vh;
  background-color: #0f0f0f;
  color: #fff;
  padding-top: 60px; /* Header height */
}

.page-container {
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 80vh;
  position: relative;
  padding-bottom: 40px;
}

.page-header {
  padding: 20px 20px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0f0f0f;
  flex-shrink: 0;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #fff, #aaa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.spinning {
  animation: spin 1s linear infinite;
  display: inline-block;
}

.add-token-btn {
  background: linear-gradient(135deg, rgba(66, 185, 131, 0.2) 0%, rgba(44, 62, 80, 0.4) 100%);
  border: 1px solid rgba(66, 185, 131, 0.3);
  color: #fff;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.add-token-btn:hover {
  background: linear-gradient(135deg, rgba(66, 185, 131, 0.3) 0%, rgba(44, 62, 80, 0.5) 100%);
  border-color: rgba(66, 185, 131, 0.5);
  transform: translateY(-1px);
}

.tabs-container {
  display: flex;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: #0f0f0f;
  flex-shrink: 0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 15px 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  position: relative;
  transition: color 0.3s;
}

.tab-item.active {
  color: #fff;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 25%;
  width: 50%;
  height: 3px;
  background: #42b983; /* Theme color */
  border-radius: 3px 3px 0 0;
  box-shadow: 0 -2px 10px rgba(66, 185, 131, 0.5);
}

.count-badge {
  background: #ff4757;
  color: #fff;
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 10px;
  vertical-align: top;
  margin-left: 4px;
}

.action-bar {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.action-info {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.batch-claim-btn {
  background: #42b983;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(66, 185, 131, 0.3);
  transition: transform 0.2s;
}

.batch-claim-btn:active {
  transform: scale(0.95);
}

.batch-claim-btn:disabled {
  background: #555;
  color: #aaa;
  box-shadow: none;
  cursor: not-allowed;
}

.list-container {
  padding: 15px 20px;
  padding-bottom: 80px; 
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 8px; /* Reduced gap */
}

/* Compact Card Styling */
.record-card.compact {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 15px; /* Reduced padding */
  transition: transform 0.2s, background 0.2s;
}

.record-card.claimed {
  opacity: 0.6;
  background: rgba(255, 255, 255, 0.02);
}

.card-main-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.order-info {
  display: flex;
  flex-direction: column; /* Stack order ID and status */
  gap: 4px;
}

.order-id {
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.status-tag-mini {
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 4px;
  align-self: flex-start;
}

.status-active {
  background: rgba(66, 185, 131, 0.2);
  color: #42b983;
}

.status-ended {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 15px; /* Spacing between amount and button */
}

.amount-group {
  text-align: right;
  line-height: 1.2;
}

.amount-value {
  display: block;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
}

.amount-unit {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
}

.claim-btn-mini {
  background: linear-gradient(135deg, #42b983 0%, #2c3e50 100%);
  border: none;
  color: #fff;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  min-width: 60px;
  transition: all 0.2s;
}

.claim-btn-mini:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.claim-btn-mini:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(66, 185, 131, 0.3);
}

.claimed-text-mini {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
  min-width: 60px;
  text-align: center;
}

/* Pagination */
.pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 20px;
    padding-bottom: 20px;
}

.page-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: monospace;
}

.page-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
    background: rgba(255, 255, 255, 0.2);
}

.page-info {
    font-variant-numeric: tabular-nums;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: rgba(255, 255, 255, 0.5);
  gap: 15px;
}

.empty-text {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.empty-subtext {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 10px;
}

.connect-btn {
  background: #42b983;
  border: none;
  color: #fff;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 10px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (min-width: 768px) {
  .page-container {
    border-left: 1px solid rgba(255, 255, 255, 0.05);
    border-right: 1px solid rgba(255, 255, 255, 0.05);
  }
}
</style>