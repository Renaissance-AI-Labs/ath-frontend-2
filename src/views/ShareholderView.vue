<template>
  <div class="shareholder-page">
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
            {{ t('banker.title') }}
          </h1>
        </div>
      </div>
    
      <div class="content-wrapper wow fadeInUp" data-wow-delay="0.1s" style="margin-top: 40px;">
        <!-- 3.1 Core Data Display -->
        <div class="row mb-3">
            <div class="col-12">
                <div class="glass-card mb-2" style="padding: 15px;">
                    <!-- Top Row: 4 Data Points -->
                    <div class="row g-2 align-items-start">
                        <!-- Total Liquidity -->
                        <div class="col-6 col-md-3 border-end-md">
                            <div class="p-2">
                                <div class="label text-white-50 fs-extra-small mb-1">{{ t('banker.tvl') }}</div>
                                <div class="amount-value fs-6 fw-bold">{{ formatNumber(bankerData.tvl) }} ATHP</div>
                            </div>
                        </div>
                        <!-- My Principal -->
                        <div class="col-6 col-md-3 border-end-md">
                            <div class="p-2">
                                <div class="label text-white-50 fs-extra-small mb-1">{{ t('banker.myPrincipal') }}</div>
                                <div class="amount-value fs-6 fw-bold">{{ formatNumber(bankerData.invested) }} ATHP</div>
                            </div>
                        </div>
                        <!-- Current Position Value -->
                        <div class="col-6 col-md-3 border-end-md">
                            <div class="p-2">
                                <div class="label text-white-50 fs-extra-small mb-1">{{ t('banker.currentValue') }}</div>
                                <div class="amount-value fs-6 fw-bold">{{ formatNumber(bankerData.value) }} ATHP</div>
                                <div class="fs-extra-small mt-1" :class="bankerData.pnl >= 0 ? 'text-success' : 'text-danger'" style="line-height: 1;">
                                     PnL: {{ bankerData.pnl >= 0 ? '+' : '' }}{{ formatNumber(bankerData.pnl) }}
                                </div>
                            </div>
                        </div>
                        <!-- Share Price -->
                        <div class="col-6 col-md-3">
                            <div class="p-2">
                                <div class="label text-white-50 fs-extra-small mb-1">{{ t('banker.sharePrice') }}</div>
                                <div class="amount-value fs-6 fw-bold">{{ formatNumber(bankerData.sharePrice) }} ATHP</div>
                                <div class="fs-extra-small text-white-50 mt-1" style="line-height: 1;">
                                    {{ t('banker.myShares') }}: {{ formatNumber(bankerData.shares) }}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Divider -->
                    <div class="my-2 border-top border-white-10"></div>

                    <!-- Bottom Row: Pending Dividend & Harvest -->
                    <div class="d-flex justify-content-between align-items-center px-2 pt-1">
                        <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center">
                            <span class="label text-white-50 fs-extra-small me-2">{{ t('banker.pendingDividend') }}</span>
                            <span class="amount-value fs-5 fw-bold text-gradient">{{ formatNumber(bankerData.pending) }} ATHP</span>
                        </div>
                        <div>
                            <button class="btn-liquid btn-sm py-1 px-3 fs-extra-small" @click="handleHarvest" :disabled="loading || bankerData.pending <= 0" style="padding: 6px 12px; min-height: 32px;">
                                <span>{{ loading ? t('banker.processing') : t('banker.harvest') }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 3.2 Interactions (Tabs) -->
        <div class="row justify-content-center mb-3">
            <div class="col-lg-8 col-md-10">
                <div class="glass-card">
                    <!-- Tabs Header -->
                    <div class="d-flex border-bottom border-white-10 mb-4">
                        <button 
                            class="tab-btn flex-fill pb-3 font-2 fs-medium" 
                            :class="{ active: activeTab === 'deposit' }"
                            @click="activeTab = 'deposit'"
                        >
                            {{ t('banker.depositTitle') }}
                        </button>
                        <button 
                            class="tab-btn flex-fill pb-3 font-2 fs-medium" 
                            :class="{ active: activeTab === 'withdraw' }"
                            @click="activeTab = 'withdraw'"
                        >
                            {{ t('banker.withdrawTitle') }}
                        </button>
                    </div>

                    <!-- Deposit Content -->
                    <div v-if="activeTab === 'deposit'">
                        <p class="text-white-50 mb-4 fs-small text-center">
                            {{ t('banker.depositDesc') }}
                            <br>
                            <small class="text-warning d-block mt-2">{{ t('banker.lockWarning', { duration: formatDuration(bankerData.lockPeriod) }) }}</small>
                        </p>
                        
                        <div class="form-group mb-4">
                            <label class="label mb-2 fs-small">{{ t('banker.amountLabel') }}</label>
                            <div class="input-container d-flex align-items-center">
                                <input type="number" v-model="depositAmount" class="form-control custom-input" placeholder="0.0" @input="(e) => handleInput(e, 'deposit')">
                                <button class="max-btn" type="button" @click="setMaxDeposit">MAX</button>
                            </div>
                            <small class="fs-extra-small mt-1 d-block" :class="isInsufficientBalance ? 'text-danger' : 'text-white-50'">{{ t('banker.balanceLabel', { amount: formatNumber(athpBalance) }) }}</small>
                        </div>

                        <div class="d-flex gap-3">
                            <button v-if="!isApproved" class="btn-liquid w-100" @click="handleApprove" :disabled="loading">
                                <span>{{ loading ? t('banker.approving') : t('banker.approve') }}</span>
                            </button>
                            <button v-else class="btn-liquid w-100" @click="handleDeposit" :disabled="loading || !depositAmount">
                                <span>{{ loading ? t('banker.depositing') : t('banker.deposit') }}</span>
                            </button>
                        </div>
                    </div>

                    <!-- Withdraw Content -->
                    <div v-if="activeTab === 'withdraw'">
                        <p class="text-white-50 mb-4 fs-small text-center" style="margin-bottom: 10px !important;">
                            {{ t('banker.withdrawDesc') }}
                        </p>
                        
                        <div v-if="isLocked" class="alert alert-warning mb-3 fs-small">
                            <i class="icon icon-Lock"></i> {{ t('banker.lockedStatus', { time: lockCountdown }) }}
                        </div>

                        <div class="form-group mb-4">
                            <label class="label mb-2 fs-small">{{ t('banker.withdrawSharesLabel') }}</label>
                            <div class="input-container d-flex align-items-center">
                                <input type="number" v-model="withdrawShares" class="form-control custom-input" placeholder="0.0" @input="(e) => handleInput(e, 'withdraw')">
                                <button class="max-btn" type="button" @click="setMaxWithdraw">MAX</button>
                            </div>
                            <small class="fs-extra-small mt-1 d-block" :class="isInsufficientShares ? 'text-danger' : 'text-white-50'">{{ t('banker.availableShares', { amount: formatNumber(bankerData.shares) }) }}</small>
                        </div>

                        <button class="btn-liquid w-100" @click="handleWithdraw" :disabled="loading || isLocked || !withdrawShares">
                            <span>{{ loading ? t('banker.withdrawing') : t('banker.withdraw') }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- FAQ -->
         <div class="row mt-5">
            <div class="col-12">
                <h4 class="page-title h4 mb-4 text-center" style="font-size: 1.8rem;">{{ t('banker.faqTitle') }}</h4>
                 <div class="accordion glass-card p-0" id="bankerFaq" style="background: transparent; box-shadow: none;">
                    <div class="card bg-transparent border-white-10 mb-3 glass-panel" style="border-radius: 16px; overflow: hidden;">
                        <div class="card-header" id="headingOne" style="background: rgba(255,255,255,0.05);">
                            <h5 class="mb-0 w-100">
                                <button class="btn btn-link text-white text-decoration-none w-100 text-start d-flex justify-content-between align-items-center" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                                    {{ t('banker.faq1Question') }}
                                    <i class="icon icon-ArrowDown"></i>
                                </button>
                            </h5>
                        </div>
                        <div id="collapseOne" class="collapse show" data-bs-parent="#bankerFaq">
                            <div class="card-body text-white-50">
                                {{ t('banker.faq1Answer') }}
                            </div>
                        </div>
                    </div>
                    <div class="card bg-transparent border-white-10 glass-panel" style="border-radius: 16px; overflow: hidden;">
                        <div class="card-header" id="headingTwo" style="background: rgba(255,255,255,0.05);">
                            <h5 class="mb-0 w-100">
                                <button class="btn btn-link text-white text-decoration-none w-100 text-start d-flex justify-content-between align-items-center collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                                    {{ t('banker.faq2Question') }}
                                    <i class="icon icon-ArrowDown"></i>
                                </button>
                            </h5>
                        </div>
                        <div id="collapseTwo" class="collapse" data-bs-parent="#bankerFaq">
                            <div class="card-body text-white-50">
                                {{ t('banker.faq2Answer') }}
                            </div>
                        </div>
                    </div>
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
</template>

<script>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import HomeRightSidebar from '../components/HomeRightSidebar.vue';
import { walletState } from '../services/wallet';
import { 
    getBankerData, 
    approveAthpForBanker, 
    getAthpAllowanceForBanker, 
    depositBanker, 
    withdrawBanker, 
    harvestBanker 
} from '../services/banker';
import { contractAddresses } from '../services/contracts'; // Use generic ath balance from somewhere or fetch it specifically
import { athpContract } from '../services/contracts';
import { ethers } from 'ethers';
import { t } from '../i18n';

export default {
  name: 'ShareholderView',
  components: {
    HomeRightSidebar
  },
  setup() {
    const loading = ref(false);
    const bankerData = ref({
        invested: 0,
        shares: 0,
        sharePrice: 1,
        pending: 0,
        tvl: 0,
        value: 0,
        pnl: 0,
        lockPeriod: 0,
        lastDepositTime: 0
    });
    const athpBalance = ref('0');
    const depositAmount = ref('');
    const withdrawShares = ref('');
    const allowance = ref('0');
    
    // Sidebar State
    const isSidebarOpen = ref(false);
    
    const openSidebar = () => {
        isSidebarOpen.value = true;
    };
    
    const closeSidebar = () => {
        isSidebarOpen.value = false;
    };

    // Countdown logic
    const now = ref(Math.floor(Date.now() / 1000));
    let timer = null;

    const isLocked = computed(() => {
        const unlockTime = bankerData.value.lastDepositTime + bankerData.value.lockPeriod;
        return now.value < unlockTime;
    });

    const lockCountdown = computed(() => {
        const unlockTime = bankerData.value.lastDepositTime + bankerData.value.lockPeriod;
        const diff = unlockTime - now.value;
        if (diff <= 0) return '0日0时0分0秒';
        
        const d = Math.floor(diff / 86400);
        const h = Math.floor((diff % 86400) / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        return `${d}日${h}时${m}分${s}秒`;
    });
    
    const isApproved = computed(() => {
        if (!depositAmount.value) return parseFloat(allowance.value) > 0;
        return parseFloat(allowance.value) >= parseFloat(depositAmount.value);
    });

    const activeTab = ref('deposit');

    const loadData = async () => {
        console.log('[ShareholderView] loadData called. isConnected:', walletState.isConnected);
        if (!walletState.isConnected) return;
        
        const data = await getBankerData();
        if (data) bankerData.value = data;
        
        allowance.value = await getAthpAllowanceForBanker();
        
        if (athpContract && walletState.address) {
            const bal = await athpContract.balanceOf(walletState.address);
            athpBalance.value = ethers.formatUnits(bal, 18);
        }
    };

    // Watch for wallet connection status changes
    watch(() => walletState.isConnected, (newVal) => {
        if (newVal) {
            loadData();
        } else {
             // Reset data if disconnected
             bankerData.value = {
                invested: 0,
                shares: 0,
                sharePrice: 1,
                pending: 0,
                tvl: 0,
                value: 0,
                pnl: 0,
                lockPeriod: 0,
                lastDepositTime: 0
            };
            athpBalance.value = '0';
            depositAmount.value = '';
            withdrawShares.value = '';
            allowance.value = '0';
        }
    });

    onMounted(() => {
        loadData();
        timer = setInterval(() => {
            now.value = Math.floor(Date.now() / 1000);
        }, 1000);
    });

    onUnmounted(() => {
        if (timer) clearInterval(timer);
    });

    const handleApprove = async () => {
        loading.value = true;
        const success = await approveAthpForBanker();
        if (success) await loadData();
        loading.value = false;
    };

    const handleDeposit = async () => {
        loading.value = true;
        const success = await depositBanker(depositAmount.value);
        if (success) {
            depositAmount.value = '';
            await loadData();
        }
        loading.value = false;
    };

    const handleWithdraw = async () => {
        loading.value = true;
        const success = await withdrawBanker(withdrawShares.value);
        if (success) {
            withdrawShares.value = '';
            await loadData();
        }
        loading.value = false;
    };

    const handleHarvest = async () => {
        loading.value = true;
        const success = await harvestBanker();
        if (success) await loadData();
        loading.value = false;
    };

    const setMaxDeposit = () => {
        depositAmount.value = formatNumber(athpBalance.value);
    };

    const setMaxWithdraw = () => {
        withdrawShares.value = formatNumber(bankerData.value.shares);
    };
    
    const handleInput = (e, type) => {
        let val = e.target.value;
        if (val && val.includes('.')) {
            const parts = val.split('.');
            if (parts[1] && parts[1].length > 4) {
                val = parts[0] + '.' + parts[1].substring(0, 4);
                e.target.value = val;
                if (type === 'deposit') depositAmount.value = val;
                else withdrawShares.value = val;
            }
        }
    };

    const isInsufficientBalance = computed(() => {
        const inputVal = parseFloat(depositAmount.value || 0);
        const maxVal = parseFloat(formatNumber(athpBalance.value));
        return inputVal > maxVal;
    });

    const isInsufficientShares = computed(() => {
        const inputVal = parseFloat(withdrawShares.value || 0);
        const maxVal = parseFloat(formatNumber(bankerData.value.shares));
        return inputVal > maxVal;
    });

    const formatNumber = (val) => {
        if (val === undefined || val === null || val === '') return '0.0000';
        let str = val.toString();
        
        // Check for valid number
        if (isNaN(parseFloat(str))) return '0.0000';
        
        // Handle scientific notation
        if (str.includes('e') || str.includes('E')) {
            str = parseFloat(val).toFixed(20);
        }

        const parts = str.split('.');
        if (parts.length === 1) {
             return parts[0] + '.0000';
        }
        
        return parts[0] + '.' + parts[1].substring(0, 4).padEnd(4, '0');
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '0日0时0分0秒';
        const d = Math.floor(seconds / 86400);
        const h = Math.floor((seconds % 86400) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${d}日${h}时${m}分${s}秒`;
    };

    return {
        bankerData,
        athpBalance,
        depositAmount,
        withdrawShares,
        isApproved,
        loading,
        isLocked,
        lockCountdown,
        handleApprove,
        handleDeposit,
        handleWithdraw,
        handleHarvest,
        setMaxDeposit,
        setMaxWithdraw,
        formatNumber,
        formatDuration,
        activeTab,
        t,
        isSidebarOpen,
        openSidebar,
        closeSidebar,
        isInsufficientBalance,
        isInsufficientShares,
        handleInput
    };
  }
};
</script>

<style scoped>
.shareholder-page {
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
    mix-blend-mode: screen;
    filter: blur(80px);
    opacity: 0.8;
}

.aurora-item:nth-child(1) {
    top: -10%;
    left: -10%;
    width: 80%;
    height: 60%;
    background: radial-gradient(circle, rgba(60, 50, 255, 0.5), transparent 70%);
    animation: aurora-1 15s infinite alternate;
}

.aurora-item:nth-child(2) {
    top: 20%;
    right: -10%;
    width: 70%;
    height: 60%;
    background: radial-gradient(circle, rgba(140, 30, 255, 0.45), transparent 70%);
    animation: aurora-2 20s infinite alternate;
}

.aurora-item:nth-child(3) {
    bottom: -20%;
    left: 20%;
    width: 80%;
    height: 50%;
    background: radial-gradient(circle, rgba(100, 100, 255, 0.4), transparent 70%);
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
  max-width: 1100px; /* Wider for dashboard */
  width: 95%;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  padding-bottom: 60px;
}

.page-header {
  padding: 20px 0 20px;
  text-align: left;
}

.page-title {
  font-size: 1.8rem;
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

/* Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 
      0 6px 12px rgba(0, 0, 0, 0.25), 
      0 0 40px rgba(255, 255, 255, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.glass-card::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
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
    z-index: 2;
    opacity: 0.6;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.amount-value {
  color: #fff;
}

.text-gradient {
    background: linear-gradient(90deg, #00C8FF, #0080FF);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.border-white-10 {
    border-color: rgba(255, 255, 255, 0.1) !important;
}

/* Liquid Button */
.btn-liquid {
  position: relative;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 12px 30px;
  border-radius: 100px;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-liquid:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 210, 255, 0.4);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-liquid:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Input Styles */
.input-container {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 4px 16px;
    transition: border-color 0.3s ease;
}

.input-container:focus-within {
    border-color: rgba(255, 255, 255, 0.3);
}

.custom-input {
    background: transparent !important;
    border: none !important;
    color: var(--white) !important;
    padding: 12px 0;
    box-shadow: none !important;
    width: 100%;
    font-size: 1.1rem;
}

.custom-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
}

.max-btn {
    background: rgba(255, 255, 255, 0.1);
    color: var(--white);
    border: none;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-left: 8px;
}

.max-btn:hover {
    background: var(--white);
    color: var(--black);
}

.tab-btn {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.3s ease;
    border-bottom: 2px solid transparent;
}

.tab-btn:hover {
    color: var(--white);
}

.tab-btn.active {
    color: var(--white);
    border-bottom-color: var(--white);
}

.text-success { color: #22c55e !important; }
.text-danger { color: #ef4444 !important; }

/* Font size adjustments */
.fs-small { font-size: 14px; }
.fs-medium { font-size: 20px; font-weight: 700; }
.fs-extra-small { font-size: 12px; }

@media (max-width: 576px) {
    .fs-small { font-size: 12px; }
    .fs-medium { font-size: 16px; }
}

/* Sidebar Trigger Button Styling */
.btn-sidebar-mb {
  position: fixed;
  bottom: 90px;
  right: 20px;
  top: auto;
  transform: none;
  z-index: 9990;
}

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
    flex: unset;
    padding: 0;
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

@media (min-width: 768px) {
    .border-end-md {
        border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
}
</style>