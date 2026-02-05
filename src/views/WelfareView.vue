<template>
  <div class="welfare-page">
    <!-- Background Effect -->
    <div class="s-img_item">
      <div class="aurora-bg">
        <div class="aurora-item"></div>
        <div class="aurora-item"></div>
        <div class="aurora-item"></div>
      </div>
    </div>

    <div class="page-container">
      <!-- Header -->
      <div class="page-header wow fadeInUp">
        <div class="header-content">
          <h1 class="page-title">
            {{ t('welfare.title') }}
          </h1>
        </div>
        <div class="header-actions">
          <button class="add-token-btn glass-icon-btn" @click="handleAddToken" :title="t('welfare.addToken')">
            <span class="icon">+</span>
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-container wow fadeInUp" data-wow-delay="0.1s">
        <button class="toggle-button" @click="toggleTab">
            <span class="tab-text" :class="{ active: activeTab === 1 }">
              {{ t('welfare.unclaimed') }}
              <span class="count-badge" v-if="unclaimedTotal > 0">{{ unclaimedTotal }}</span>
            </span>
            <span class="tab-divider"></span>
            <span class="tab-text" :class="{ active: activeTab === 2 }">{{ t('welfare.claimed') }}</span>
        </button>
      </div>

      <!-- Action Bar (Moved to top) -->
      <div class="action-bar glass-panel wow fadeInUp" data-wow-delay="0.2s" v-if="activeTab === 1 && records.length > 0">
        <div class="action-info">
          {{ t('welfare.pageUnclaimed', { count: unclaimedTotal }) }}
        </div>
        <button 
          class="batch-claim-btn btn-liquid" 
          @click="handleBatchClaim"
          :disabled="batchClaiming || unclaimedTotal === 0"
        >
          <span>{{ (batchClaiming && claimType === 'all') ? t('welfare.claiming') : t('welfare.batchClaimAll', { count: unclaimedTotal }) }}</span>
        </button>
        <button 
          class="batch-claim-btn btn-liquid" 
          @click="handlePageClaim"
          :disabled="batchClaiming || pageUnclaimedCount === 0"
        >
          <span>{{ (batchClaiming && claimType === 'page') ? t('welfare.claiming') : '领取当页' }}</span>
        </button>
      </div>

      <!-- List Container -->
      <div class="list-container" ref="listContainer">
        <div v-if="loading && records.length === 0" class="loading-state glass-panel">
          <div class="spinner"></div>
          <p>{{ t('common.loading') }}</p>
        </div>

        <div v-else-if="!walletState.isConnected" class="empty-state glass-panel star-empty-state">
           <div class="stars-bg stars-bg-1">
               <div class="stars"></div>
               <div class="stars2"></div>
               <div class="stars3"></div>
           </div>
           <p style="position: relative; z-index: 2;">{{ t('welfare.connectFirst') }}</p>
        </div>

        <div v-else-if="records.length === 0" class="empty-state glass-panel">
          <!-- <div class="empty-icon">📭</div> -->
          <p class="empty-text">{{ t('welfare.noRecords') }}</p>
        </div>

        <div v-else class="records-grid">
          <div 
            v-for="(item, index) in records" 
            :key="item.orderId" 
            class="record-card glass-card wow fadeInUp"
            :style="{ 'animation-delay': `${index * 0.1}s` }"
            :class="{ 'claimed': item.isClaimed }"
          >
            <div class="card-header">
              <span class="order-id">#{{ parseInt(item.orderId) + 1 }}</span>
              <span class="status-tag" :class="item.stakingStatus ? 'status-ended' : 'status-active'">
                {{ item.stakingStatus ? t('welfare.statusEnded') : t('welfare.statusActive') }}
              </span>
            </div>
            
            <div class="card-body">
              <div class="info-row">
                <span class="label">{{ t('welfare.claimablePoints') }}</span>
                <div class="amount-group">
                  <span class="amount-value">
                    <AnimatedNumber :value="parseFloat(item.claimableAmount)" :decimals="4" />
                  </span>
                  <span class="amount-unit">ATHP</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <button 
                v-if="!item.isClaimed"
                class="claim-btn btn-liquid full-width"
                @click.stop="handleClaim(item)"
                :disabled="claimingId === item.orderId"
              >
                <span>{{ claimingId === item.orderId ? t('banker.processing') : t('welfare.claim') }}</span>
              </button>
              <div v-else class="claimed-text">
                <span>{{ t('welfare.claimed') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination Controls -->
        <div v-if="records.length > 0 && totalPages > 1" class="pagination-list wow fadeInUp" data-wow-delay="0.3s">
            <a href="#" class="pagination-item glass-btn" @click.prevent="changePage(currentPage - 1)" :class="{ 'disabled': currentPage === 1 }" style="flex: none !important;">
                <div class="glass-filter"></div>
                <div class="btn-content">
                    <span>&lt;</span>
                </div>
            </a>
            <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
            <a href="#" class="pagination-item glass-btn" @click.prevent="changePage(currentPage + 1)" :class="{ 'disabled': currentPage === totalPages }"  style="flex: none !important;">
                <div class="glass-filter"></div>
                <div class="btn-content">
                    <span>&gt;</span>
                </div>
            </a>
        </div>
      </div>

      <!-- Claim Modal -->
      <div v-if="showClaimModal" class="modal-overlay" @click.self="showClaimModal = false">
        <div class="modal-content glass-card-modal">
          <div class="glass-filter"></div>
          <div class="glass-overlay"></div>
          <div class="glass-specular"></div>
          
          <div class="glass-content">
            <!-- Glow Effects -->
            <div class="glow-effect-top-left"></div>
            <div class="glow-effect-bottom"></div>
            
            <button @click="showClaimModal = false" class="close-button">
              <span class="icon">×</span>
            </button>

            <div class="modal-body-custom">
              <div class="title_holder">
                <h3>{{ claimType === 'page' ? '领取当页' : t('welfare.batchClaim') }}</h3>
                <p class="modal-subtitle">{{ claimType === 'page' ? '确认领取当前页面的未领取奖励？' : t('welfare.confirmBatchClaim') }}</p>
              </div>

              <div class="modal-actions-glass">
                <button class="glass-btn cancel-btn" @click="showClaimModal = false">
                  <div class="glass-filter"></div>
                  <div class="glass-specular"></div>
                  <div class="btn-content">
                    {{ t('common.cancel') || '取消' }}
                  </div>
                </button>
                <button class="glass-btn confirm-btn" @click="confirmBatchClaim">
                  <div class="glass-filter"></div>
                  <div class="glass-specular"></div>
                  <div class="btn-content">
                    {{ t('common.confirm') || '确认' }}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Token Modal -->
      <div v-if="showAddTokenModal" class="modal-overlay" @click.self="showAddTokenModal = false">
        <div class="modal-content glass-card-modal">
          <div class="glass-filter"></div>
          <div class="glass-overlay"></div>
          <div class="glass-specular"></div>
          
          <div class="glass-content">
            <!-- Glow Effects -->
            <div class="glow-effect-top-left"></div>
            <div class="glow-effect-bottom"></div>
            
            <button @click="showAddTokenModal = false" class="close-button">
              <span class="icon">×</span>
            </button>

            <div class="modal-body-custom">
              <div class="title_holder">
                <h3>{{ t('welfare.confirmAddTokenTitle') }}</h3>
                <p class="modal-subtitle">{{ t('welfare.confirmAddTokenDesc') }}</p>
              </div>

              <div class="modal-actions-glass">
                <button class="glass-btn cancel-btn" @click="showAddTokenModal = false">
                  <div class="glass-filter"></div>
                  <div class="glass-specular"></div>
                  <div class="btn-content">
                    {{ t('common.cancel') || '取消' }}
                  </div>
                </button>
                <button class="glass-btn confirm-btn" @click="confirmAddToken">
                  <div class="glass-filter"></div>
                  <div class="glass-specular"></div>
                  <div class="btn-content">
                    {{ t('common.confirm') || '确认' }}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    <!-- Sidebar Trigger Button -->
    <div class="btn-sidebar-mb right">
        <button @click="openSidebar" class="nav-btn glass-btn sidebar-trigger">
            <div class="glass-filter"></div>
            <div class="glass-specular"></div>
            <div class="btn-content">
                 <!-- Hamburger Icon -->
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </div>
        </button>
    </div>

    <!-- Right Sidebar -->
    <HomeRightSidebar 
      :is-open="isSidebarOpen" 
      @close="closeSidebar" 
    />
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
import AnimatedNumber from '../components/AnimatedNumber.vue';
import HomeRightSidebar from '../components/HomeRightSidebar.vue';

// State
const activeTab = ref(1); // 1: Unclaimed, 2: Claimed
const records = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const claimingId = ref(null);
const batchClaiming = ref(false);
const unclaimedTotal = ref(0); // Total count from contract
const showAddTokenModal = ref(false);
const showClaimModal = ref(false);
const isSidebarOpen = ref(false);

// Pagination
const limit = 20;
const currentPage = ref(1);
const claimType = ref('all'); // 'all' or 'page'

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
  } else if (!connected) {
    // Reset state on disconnect
    records.value = [];
    totalRecords.value = 0;
    unclaimedTotal.value = 0;
    currentPage.value = 1;
  }
});

// Methods
const toggleTab = () => {
  const newTab = activeTab.value === 1 ? 2 : 1;
  switchTab(newTab);
};

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

const handleBatchClaim = () => {
  if (batchClaiming.value || unclaimedTotal.value === 0) return;
  claimType.value = 'all';
  showClaimModal.value = true;
};

const handlePageClaim = () => {
  if (batchClaiming.value || pageUnclaimedCount.value === 0) return;
  claimType.value = 'page';
  showClaimModal.value = true;
};

const confirmBatchClaim = async () => {
  showClaimModal.value = false;
  if (batchClaiming.value) return;
  
  try {
    batchClaiming.value = true;
    
    let idsToClaim = [];

    if (claimType.value === 'page') {
      // Claim only current page records that are not claimed
      idsToClaim = records.value.filter(r => !r.isClaimed).map(r => r.orderId);
    } else {
      // Fetch all unclaimed records to get their IDs
      // Use a safe large limit or the known total
      const limitToFetch = unclaimedTotal.value > 0 ? unclaimedTotal.value : 1000;
      const res = await getWelfareRecords(0, limitToFetch, 1); // status 1 = Unclaimed
      idsToClaim = res.records.map(r => r.orderId);
    }
      
    if (idsToClaim.length === 0) {
      batchClaiming.value = false;
      return;
    }

    const success = await batchClaimWelfareRewards(idsToClaim);
    
    if (success) {
      // Reload to be safe
      loadData(true);
    }
  } catch (error) {
    console.error("Batch claim failed:", error);
    showToast(t('toast.claimFailed', { reason: 'Fetch error' }));
  } finally {
    batchClaiming.value = false;
  }
};

const handleAddToken = () => {
  showAddTokenModal.value = true;
};

const confirmAddToken = () => {
  addAthpToWallet();
  showAddTokenModal.value = false;
};

const formatAmount = (val) => {
  const num = parseFloat(val);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
};

const openSidebar = () => {
  isSidebarOpen.value = true;
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
};
</script>

<style scoped>
.welfare-page {
  min-height: 100vh;
  background-color: #0f0f0f;
  color: #fff;
  padding: 20px 10px 0px 10px;
  position: relative;
  overflow-x: hidden;
  --primary: #00d2ff;
}

/* Background Effects */
.s-img_item {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 0;
    pointer-events: none;
    background: radial-gradient(circle at 50% 30%, rgba(15, 20, 30, 0.4) 0%, #0f0f0f 100%);
}

.s-img_item::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    /* Stronger gradient for top/bottom blackout */
    background: linear-gradient(to bottom, 
        #0f0f0f 0%, 
        rgba(15, 15, 15, 0.9) 15%, 
        transparent 30%, 
        transparent 60%, 
        rgba(15, 15, 15, 0.9) 85%, 
        #0f0f0f 100%
    );
}

.aurora-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
}

.aurora-item {
    position: absolute;
    border-radius: 50%;
    mix-blend-mode: screen; /* Changed to screen for brighter effect */
    filter: blur(80px);
    opacity: 0.8; /* Increased opacity */
}

/* Blue-Purple dominant colors - Increased opacity/brightness */
.aurora-item:nth-child(1) {
    top: -10%;
    left: -10%;
    width: 80%;
    height: 60%;
    background: radial-gradient(circle, rgba(60, 50, 255, 0.5), transparent 70%); /* Brighter Blue-Indigo */
    animation: aurora-1 15s infinite alternate;
}

.aurora-item:nth-child(2) {
    top: 20%;
    right: -10%;
    width: 70%;
    height: 60%;
    background: radial-gradient(circle, rgba(140, 30, 255, 0.45), transparent 70%); /* Brighter Purple */
    animation: aurora-2 20s infinite alternate;
}

.aurora-item:nth-child(3) {
    bottom: -20%;
    left: 20%;
    width: 80%;
    height: 50%;
    background: radial-gradient(circle, rgba(100, 100, 255, 0.4), transparent 70%); /* Brighter Light Blue-Purple */
    animation: aurora-3 18s infinite alternate;
}

@keyframes aurora-1 {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(5%, 5%) scale(1.1); }
}
@keyframes aurora-2 {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(-5%, 10%) scale(1.1); }
}
@keyframes aurora-3 {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(5%, -5%) scale(1.05); }
}

.page-container {
  max-width: 900px; /* Wider container for grid */
  width: 95%;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  padding-bottom: 60px;
}

.page-header {
  padding: 20px 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(90deg, #fff, #888);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.5);
  margin-top: 5px;
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

/* Glass Buttons */
.glass-icon-btn {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.glass-icon-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: rotate(30deg);
  box-shadow: 0 0 15px rgba(0, 210, 255, 0.3);
  border-color: rgba(0, 210, 255, 0.5);
}

/* Tabs */
.tabs-container {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.toggle-button {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 100px;
    padding: 6px;
    display: flex;
    position: relative;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.tab-text {
    padding: 10px 30px;
    border-radius: 100px;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 600;
    transition: all 0.3s;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 8px;
}

.tab-text.active {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.tab-divider {
    display: none; /* Hide vertical divider as requested */
}

.count-badge {
    background: #ff4757;
    color: white;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 10px;
    line-height: 1;
}

/* Action Bar */
.action-bar {
  padding: 10px 20px;
  display: flex;
  justify-content: flex-end; /* Align right as requested */
  gap: 15px; /* Add gap between text and button */
  align-items: center;
  margin-bottom: 10px;
  border-radius: 16px;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.action-info {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

/* Grid Layout */
.records-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
  padding-bottom: 40px;
}

/* Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  /* border: 1px solid rgba(255, 255, 255, 0.08); Removed to fix double border issue */
  border-radius: 24px; /* More rounded like HowToUseSection */
  padding: 20px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 15px;
  /* Hero shadows */
  box-shadow: 
      0 6px 12px rgba(0, 0, 0, 0.25), 
      0 0 40px rgba(255, 255, 255, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.1); /* Specular highlight simulation */
}

.glass-card::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit; /* Match parent radius */
    padding: 1px;
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.4) 0%,
        rgba(255, 255, 255, 0.1) 40%,
        rgba(255, 255, 255, 0.05) 100%
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 2; /* Ensure border is on top */
    opacity: 0.6; /* Softer border */
}

.glass-card:hover {
  transform: scale(1.02); /* Scale up like HowToUse */
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 
      0 8px 20px rgba(0, 0, 0, 0.3), 
      0 0 50px rgba(255, 255, 255, 0.1);
  /* border-color removed as it's handled by ::before */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-id {
  font-family: 'SF Mono', monospace;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 8px;
  border-radius: 6px;
}

.status-tag {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #fff; /* Force white text */
}

.status-active {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: none;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff; /* White text */
}

.status-ended {
  background: rgba(255, 255, 255, 0.1);
  color: #fff; /* Changed to white */
  opacity: 0.7;
}

.card-body {
  padding: 10px 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.amount-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  /* text-shadow: 0 0 15px rgba(0, 210, 255, 0.5); Removed blue glow */
  /* background: linear-gradient(90deg, #fff, #00d2ff); Removed gradient */
  /* -webkit-background-clip: text; */
  /* background-clip: text; */
  /* -webkit-text-fill-color: transparent; */
}

.amount-unit {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 5px;
}

.claim-btn {
  /* Inherit btn-liquid styles */
  border-radius: 20px !important; /* Pill shape like redeem button */
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  box-shadow: none !important;
  color: #fff !important;
}

.claim-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2) !important;
  transform: translateY(-2px);
}

.card-footer {
  margin-top: auto;
}

/* Liquid Button */
.btn-liquid {
  position: relative;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 10px 20px;
  border-radius: 100px;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-liquid:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 210, 255, 0.4);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-liquid:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.full-width {
  width: 100%;
}

.claimed-text {
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
  font-size: 0.9rem;
  padding: 10px;
}

/* Pagination */
.pagination-list {
    display: flex;
    justify-content: center;
    gap: 10px;
    align-items: center;
    margin-top: 30px;
}

.pagination-item {
    width: 40px;
    height: 40px;
    border-radius: 50% !important;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
}

.pagination-item:hover:not(.disabled) {
    border-color: var(--primary);
    color: var(--primary);
    background: rgba(0, 210, 255, 0.1);
    transform: scale(1.1);
}

.pagination-item.disabled {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
}

.page-info {
    font-family: monospace;
    color: rgba(255, 255, 255, 0.5);
    margin: 0 10px;
}

/* Loading & Empty States */
.loading-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    border-radius: 20px;
    min-height: 300px;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.8rem;
  }

  .records-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .card-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    margin-bottom: 2px;
  }

  .order-id {
    font-size: 0.75rem;
    padding: 2px 4px;
    background: rgba(0, 0, 0, 0.3); /* Slightly darker for contrast */
  }

  .status-tag {
    font-size: 0.6rem;
    padding: 2px 6px;
    align-self: center; /* Center vertically with ID */
  }

  .glass-card {
    padding: 10px;
    gap: 6px; /* Tighter vertical spacing */
    border-radius: 16px; /* Slightly tighter radius for mobile but matching style */
  }

  .card-body {
    padding: 0; /* Remove extra padding */
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
  }

  .label {
    font-size: 0.65rem;
    margin-bottom: 2px;
    opacity: 0.7;
  }

  .amount-value {
    font-size: 1rem;
    line-height: 1.1;
  }
  
  .amount-unit {
    font-size: 0.6rem;
  }

  .card-footer {
    margin-top: 4px;
  }

  .btn-liquid {
    padding: 4px 0; /* Vertical padding */
    font-size: 0.75rem;
    min-height: 28px;
    border-radius: 8px; /* Slightly less rounded for compact look */
    width: 100%; /* Ensure full width on mobile if needed */
  }

  /* Specific mobile override for batch claim button to prevent crowding */
  .batch-claim-btn {
    min-width: auto !important; /* Reset min-width */
    padding: 6px 16px !important; /* Adjust padding */
    width: auto !important; /* Allow auto width */
    font-size: 0.8rem !important;
  }

  .claimed-text {
    font-size: 0.75rem;
    padding: 4px;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  /* Common reset */
  width: 90%;
  max-width: 320px;
  border-radius: 20px;
  animation: modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Specific style for Add Token Modal (Legacy) */
.modal-content.glass-panel {
  padding: 25px;
  text-align: center;
}

/* New Glass Modal Style (Matches ConnectWalletModal) */
.glass-card-modal {
  position: relative;
  max-width: 400px;
  padding: 0;
  border-radius: 34px;
  background: transparent;
  box-shadow:
    0 6px 12px rgba(0, 0, 0, 0.25),
    0 0 40px rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

/* Glassmorphism Elements */
.glass-filter {
  position: absolute;
  inset: 0;
  z-index: 0;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  filter: url(#liquid-lens);
}

.glass-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: var(--lg-bg-color);
}

.glass-specular {
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: inherit;
  box-shadow:
    inset 1px 1px 0 var(--lg-highlight),
    inset 0 0 5px var(--lg-highlight);
  pointer-events: none;
}

.glass-content {
  position: relative;
  z-index: 3;
  width: 100%;
  height: 100%;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Glow Effects */
.glow-effect-bottom {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  width: 120%;
  height: 120px;
  background: radial-gradient(
    ellipse at center bottom,
    rgb(255, 255, 255) 0%,
    rgb(255, 255, 255) 10%,
    rgba(var(--primary-rgb, 0, 210, 255), 1) 25%,
    rgba(var(--primary-rgb, 0, 210, 255), 0.8) 50%,
    transparent 80%
  );
  opacity: 1;
  filter: blur(35px);
  pointer-events: none;
  z-index: -1;
  mix-blend-mode: screen;
}

.glow-effect-top-left {
  position: absolute;
  top: -60px;
  left: -60px;
  width: 150px;
  height: 150px;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(var(--primary-rgb, 0, 210, 255), 0.8) 30%,
    transparent 70%
  );
  opacity: 0.6;
  filter: blur(40px);
  pointer-events: none;
  z-index: -1;
  mix-blend-mode: screen;
}

/* Close Button */
.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.6);
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.modal-body-custom {
  width: 100%;
  text-align: center;
}

.title_holder {
  margin-bottom: 32px;
}

.title_holder h3 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.modal-subtitle {
  color: #fff;
  font-size: 1.1rem;
}

/* Glass Buttons in Modal */
.modal-actions-glass {
  display: flex;
  gap: 15px;
  width: 100%;
}

.glass-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 20px;
  text-decoration: none;
  color: #fff;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  border: none;
  background: transparent;
  flex: 1;
  cursor: pointer;
  font-weight: 600;
}

.glass-btn:hover {
  transform: translateY(-2px);
}

.glass-btn .glass-filter {
    filter: url(#liquid-lens);
}

.glass-btn .glass-specular {
    box-shadow:
    inset 1px 1px 0 var(--lg-highlight),
    inset 0 0 5px var(--lg-highlight);
}

.glass-btn .btn-content {
    position: relative;
    z-index: 5;
}

.cancel-btn {
  /* color: rgba(255,255,255,0.7); */
}

.confirm-btn {
  /* highlight */
}

.confirm-btn .glass-specular {
    box-shadow:
    inset 1px 1px 0 rgba(0, 210, 255, 0.8),
    inset 0 0 5px rgba(0, 210, 255, 0.5);
}

@keyframes modal-pop {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Legacy Modal Styles (kept for Add Token Modal) */
.modal-title {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #fff;
  font-weight: 700;
}

.modal-text {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 25px;
  font-size: 0.95rem;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.modal-btn {
  padding: 10px 0;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.modal-btn.cancel {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.modal-btn.cancel:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.modal-btn.confirm {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 4px 15px rgba(0, 210, 255, 0.3);
}

.modal-btn.confirm:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

/* Star Empty State Styles from HowToUseSection */
.star-empty-state {
  position: relative;
  overflow: hidden;
}

.star-empty-state p {
    position: relative;
    z-index: 2;
}

.stars-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.stars, .stars2, .stars3 {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  background: transparent;
}

.stars {
  box-shadow: 123px 45px rgba(0, 210, 255, 0.6), 255px 189px rgba(0, 210, 255, 0.6), 345px 8px rgba(0, 210, 255, 0.6), 99px 345px rgba(0, 210, 255, 0.6), 487px 233px rgba(0, 210, 255, 0.6), 321px 487px rgba(0, 210, 255, 0.6), 499px 10px rgba(0, 210, 255, 0.6), 23px 187px rgba(0, 210, 255, 0.6), 176px 455px rgba(0, 210, 255, 0.6), 433px 321px rgba(0, 210, 255, 0.6), 45px 23px rgba(0, 210, 255, 0.6), 231px 480px rgba(0, 210, 255, 0.6), 467px 98px rgba(0, 210, 255, 0.6), 33px 256px rgba(0, 210, 255, 0.6), 198px 321px rgba(0, 210, 255, 0.6), 349px 465px rgba(0, 210, 255, 0.6), 480px 12px rgba(0, 210, 255, 0.6), 12px 190px rgba(0, 210, 255, 0.6), 256px 432px rgba(0, 210, 255, 0.6), 490px 211px rgba(0, 210, 255, 0.6), 54px 49px rgba(0, 210, 255, 0.6), 289px 344px rgba(0, 210, 255, 0.6), 411px 189px rgba(0, 210, 255, 0.6), 76px 287px rgba(0, 210, 255, 0.6), 201px 477px rgba(0, 210, 255, 0.6), 389px 23px rgba(0, 210, 255, 0.6), 477px 376px rgba(0, 210, 255, 0.6), 156px 143px rgba(0, 210, 255, 0.6), 301px 499px rgba(0, 210, 255, 0.6), 432px 65px rgba(0, 210, 255, 0.6);
}

.stars2 {
  width: 2px;
  height: 2px;
  box-shadow: 234px 123px rgba(0, 210, 255, 0.6), 456px 345px rgba(0, 210, 255, 0.6), 12px 487px rgba(0, 210, 255, 0.6), 498px 65px rgba(0, 210, 255, 0.6), 213px 289px rgba(0, 210, 255, 0.6), 45px 456px rgba(0, 210, 255, 0.6), 345px 98px rgba(0, 210, 255, 0.6), 187px 399px rgba(0, 210, 255, 0.6), 432px 187px rgba(0, 210, 255, 0.6), 88px 88px rgba(0, 210, 255, 0.6), 287px 465px rgba(0, 210, 255, 0.6), 478px 243px rgba(0, 210, 255, 0.6), 143px 32px rgba(0, 210, 255, 0.6), 365px 398px rgba(0, 210, 255, 0.6), 499px 488px rgba(0, 210, 255, 0.6);
}

.stars3 {
  width: 3px;
  height: 3px;
  box-shadow: 87px 345px rgba(0, 210, 255, 0.6), 465px 87px rgba(0, 210, 255, 0.6), 234px 487px rgba(0, 210, 255, 0.6), 487px 234px rgba(0, 210, 255, 0.6), 156px 156px rgba(0, 210, 255, 0.6), 387px 432px rgba(0, 210, 255, 0.6), 432px 32px rgba(0, 210, 255, 0.6);
}

.stars:after, .stars2:after, .stars3:after {
  content: " ";
  position: absolute;
  top: 250px;
  width: inherit;
  height: inherit;
  background: transparent;
  box-shadow: inherit;
}

/* Sidebar Trigger Button Styling */
.btn-sidebar-mb {
  position: fixed;
  bottom: 90px; /* Above GoTop (40px bottom + 38px height + 12px gap) */
  right: 20px;
  top: auto;
  transform: none;
  z-index: 9990;
}

/* Override .nav-btn if it exists, or define it */
.nav-btn.sidebar-trigger {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s;
    flex: unset; /* Override flex: 1 from glass-btn */
    padding: 0; /* Reset padding */
}

.nav-btn.sidebar-trigger:hover {
    transform: scale(1.1);
}

.nav-btn.sidebar-trigger .btn-content {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav-btn.sidebar-trigger .glass-filter {
    position: absolute;
    inset: 0;
    z-index: 0;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.nav-btn.sidebar-trigger .glass-specular {
    position: absolute;
    inset: 0;
    z-index: 2;
    border-radius: inherit;
    box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.1), inset 0 0 5px rgba(255, 255, 255, 0.1);
    pointer-events: none;
}
</style>