<template>
    <section class="section-how-to" id="howToUse">
        <!-- == Head Section -->
        <!-- <div class="sect-header">
            <div class="container">
                <div class="s-meta text-caption font-2">
                    <p class="s-number_order wg-counter">
                        [ <span class="text-white">02</span> / 04 ]
                    </p>
                    <p class="s-label">[ <span class="text-white hacker-text_transform">{{ t('howToUse.governFuture') }}</span> ]</p>
                </div>
            </div>
        </div>
        <span class="br-line"></span> -->
        <!-- == Tagline Section -->
        <!-- <div class="sect-tagline">
            <div class="container">
                <div class="sect-tagline_inner">
                    <span class="hafl-plus pst-left_bot wow bounceInScale"></span>
                    <span class="hafl-plus pst-right_bot wow bounceInScale"></span>
                    <p class="s-name text-caption font-2">
                        <span class="bar-group type-left">
                            <span class="bar_center"></span>
                        </span>
                        <span class="hacker-text_transform no-delay">
                            {{ t('howToUse.ruleOverAll') }}
                        </span>
                        <span class="bar-group type-right">
                            <span class="bar_center"></span>
                        </span>
                    </p>
                </div>
            </div>
        </div>
        <span class="br-line"></span> -->
        <!-- == Main Section -->
        <div class="sect-main flat-animate-tab img-position">
            <!-- <div class="visual-object">
                <div class="object_img wow bounceInScale">
                    <div class="image">
                        <img src="/asset/images/artora-img/anime-2.gif" alt="Image" class="benefit-gif-2 gif-place-2">
                    </div>
                </div>
            </div> -->
            <div class="s-img_item wow bounceInScale">
                <div class="aurora-bg">
                    <div class="aurora-item"></div>
                    <div class="aurora-item"></div>
                    <div class="aurora-item"></div>
                </div>
            </div>
            <div class="container">
                <div class="sect-title wow fadeInUp title-position">
                    <h2 class="s-title font-3 m-0" style="color: #fff;">
                        {{ t('howToUse.controlWealth') }}
                    </h2>
                    <p class="s-sub_title" style="margin-top: 14px; color: #fff;">
                        {{ t('howToUse.controlWealthDesc') }}
                    </p>
                </div>
                <div class="row">
                    <div class="col-md-6 col-lg-6 offset-lg-3 order-list">

                        <div class="tabs-container">
                            <button class="toggle-button" @click="toggleTab">
                                <span class="tab-text" :class="{ active: activeTab === 'investment' }">{{ t('howToUse.investmentList') }}</span>
                                <span class="tab-divider"></span>
                                <span class="tab-text" :class="{ active: activeTab === 'redemption' }">{{ t('howToUse.redemptionList') }}</span>
                            </button>
                        </div>

                        <div v-if="isLoading" class="loading-state" :class="`list-${listMode}`">
                            <div class="stars-bg stars-bg-1">
                                <div class="stars"></div>
                                <div class="stars2"></div>
                                <div class="stars3"></div>
                            </div>
                            <p>{{ t('howToUse.loadingStakingData') }}</p>
                        </div>
                        <div v-else-if="!walletState.isAuthenticated" class="empty-state" :class="`list-${listMode}`">
                            <div class="stars-bg stars-bg-1">
                                <div class="stars"></div>
                                <div class="stars2"></div>
                                <div class="stars3"></div>
                            </div>
                            <p>{{ t('howToUse.connectWalletFirst') }}</p>
                        </div>
                        <div v-else-if="!walletState.contractsInitialized" class="empty-state" :class="`list-${listMode}`">
                            <div class="stars-bg stars-bg-1">
                                <div class="stars"></div>
                                <div class="stars2"></div>
                                <div class="stars3"></div>
                            </div>
                            <p>{{ t('howToUse.contractInitFailed') }}</p>
                        </div>
                        <div v-else-if="stakingItems.length === 0" class="empty-state" :class="`list-${listMode}`">
                            <div class="stars-bg stars-bg-1">
                                <div class="stars"></div>
                                <div class="stars2"></div>
                                <div class="stars3"></div>
                            </div>
                            <p v-if="activeTab === 'investment'">{{ t('howToUse.noInvestmentOrders') }}</p>
                            <p v-else>{{ t('howToUse.noRedemptionOrders') }}</p>
                        </div>
                        <template v-else>
                            <ul class="tab-how_to position-relative mx-1 wow fadeInUp" role="tablist" :class="`list-${listMode}`">
                                <li v-for="item in stakingItems" :key="item.id" class="nav-tab-item" role="presentation">
                                    <div data-bs-toggle="tab" class="btn_tab" aria-selected="true" role="tab">
                                        <div class="bottom-glow-line"></div>
                                        <div class="card-content">
                                            <div class="card-header-row">
                                                <div class="id-number-box">
                                                    {{ String(item.id + 1).padStart(2, '0') }}
                                                </div>
                                                <div class="date-text">{{ item.stakeDate }}</div>
                                            </div>

                                            <div class="card-data-stack">
                                                <div class="data-row-item">
                                                    <span class="label">{{ t('howToUse.principal') }}</span>
                                                    <span class="value">$ {{ parseFloat(item.principal).toFixed(4) }}</span>
                                                </div>
                                                <div class="data-row-item">
                                                    <span class="label">{{ t('howToUse.interest') }}</span>
                                                    <span class="value highlight">$ <AnimatedNumber :value="parseFloat(item.principal) + parseFloat(item.interest)" :decimals="4" /></span>
                                                </div>
                                            </div>

                                            <div class="status-box">
                                                <div v-if="activeTab === 'investment' && item.displayStatus === 'waiting'" class="countdown-wrapper">
                                                     <CountdownTimer :target-timestamp="item.expiryTimestamp" />
                                                </div>
                                                
                                                <div v-if="item.displayStatus === 'redeemable' || item.displayStatus === 'redeemed'" class="status-box-button w-100">
                                                    <button v-if="item.displayStatus === 'redeemable'" 
                                                            class="tf-btn text-body-3 style-2 btn-liquid animate-btn animate-dark full-width-btn" 
                                                            :disabled="unstackingStates[item.id]"
                                                            @click.prevent="handleUnstake(item.id)">
                                                        <span>
                                                            {{ unstackingStates[item.id] ? t('howToUse.redeeming') : t('howToUse.redeem') }}
                                                        </span>
                                                    </button>
                                                    <button v-else-if="item.displayStatus === 'redeemed'" class="tf-btn text-body-3 style-2 btn-liquid animate-btn animate-dark full-width-btn" disabled>{{ t('howToUse.redeemed') }}</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <div v-if="totalPages > 1" class="pagination-list">
                                <a href="#" class="pagination-item glass-btn" @click.prevent="prevPage" :class="{ 'disabled': currentPage === 1 }">
                                    <div class="glass-filter"></div>
                                    <div class="glass-specular"></div>
                                    <div class="btn-content">
                                        <span class="icon icon-CaretDoubleRight fs-20" style="transform: rotate(180deg);"></span>
                                    </div>
                                </a>
                                <a v-for="page in displayedPages" :key="page" href="#" class="pagination-item glass-btn" :class="{ 'active': currentPage === page }" @click.prevent="goToPage(page)">
                                    <div class="glass-filter"></div>
                                    <div class="glass-specular"></div>
                                    <div class="btn-content">
                                        <span>{{ page }}</span>
                                    </div>
                                </a>
                                <a href="#" class="pagination-item glass-btn" @click.prevent="nextPage" :class="{ 'disabled': currentPage === totalPages }">
                                    <div class="glass-filter"></div>
                                    <div class="glass-specular"></div>
                                    <div class="btn-content">
                                        <span class="icon icon-CaretDoubleRight fs-20"></span>
                                    </div>
                                </a>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
        <!-- <span class="br-line"></span> -->
        <!-- == Bottom Section -->
        <!-- <div class="sect-bottom">
            <div class="container">
                <div class="box-hacker has-overlay_linear mx-1">
                    <p class="hacker-text text-caption font-2 text-uppercase hackerText">
                        qW8bL2nRM4ZpYk5gJfXvCt1uHdEo93NTaVxBYmOe7rPQnKDlcUs0AjzhFiGSwLXtRpUo6NMJvqa7bT2EfyCdx9KWZhgL1nFMR3YUJ5toepXAGvqBzNcdwskLm4iT7OPuVHxayJZErm5QbgCnX1UL2D9ptYfOEK0sWhRAgJmzliNu67BXFoQYPCHtvnwMJeaZKRxdo3TfLUGqc48sbE9NYpJAgmWTVrhXxLFo517zkidC3
                    </p>
                </div>
            </div>
        </div>
        <span class="br-line"></span> -->
        <UnstakeModal 
            v-if="showUnstakeModal" 
            :processing="unstackingStates[selectedStakingId]" 
            :principal="selectedStakingPrincipal"
            :interest="selectedStakingInterest"
            :stakeIndex="selectedStakingIndex"
            :id="selectedStakingId"
            @close="showUnstakeModal = false" 
            @confirm="confirmUnstake" 
        />
    </section>
</template>
<script setup>
import {
  ref,
  computed,
  watch,
  onUnmounted,
  reactive
} from 'vue';
import {
  walletState
} from '../services/wallet';
import {
  unstake,
  getUsdtDecimals,
  stakingContract,
  rewardOfSlot // Import the new function
} from '../services/contracts';
import CountdownTimer from './CountdownTimer.vue';
import AnimatedNumber from './AnimatedNumber.vue';
import UnstakeModal from './UnstakeModal.vue';
import {
  ethers
} from 'ethers';
import { t } from '@/i18n';
import { APP_ENV } from '../services/environment';

const stakingItems = ref([]); // Renamed from allStakingItems, now holds only current page data
const totalItems = ref(0); // New state for total records from contract
const isLoading = ref(true);
const activeTab = ref('investment'); // 'investment' or 'redemption'
const currentPage = ref(1);
const itemsPerPage = ref(8);
const listMode = ref('show');
let pollingInterval = null;
const unstackingStates = reactive({});

const fetchStakingData = async () => {
    if (!walletState.isAuthenticated || !walletState.contractsInitialized || !stakingContract) {
        stakingItems.value = [];
        totalItems.value = 0;
        isLoading.value = false; // Ensure loading is off if prerequisites aren't met
        return;
    }

    try {
        const status = activeTab.value === 'investment' ? 0 : 1;
        const offset = (currentPage.value - 1) * itemsPerPage.value;

        // console.log(`[订单列表] 正在请求数据... offset=${offset}, limit=${itemsPerPage.value}, status=${status}`);

        const [pageRecords, total] = await stakingContract.getUserRecords(
            walletState.address,
            offset,
            itemsPerPage.value,
            status
        );

        // console.log(`[订单列表] 从合约获取到原始数据: total=${total.toString()}, records=`, pageRecords);

        totalItems.value = Number(total);

        const decimals = getUsdtDecimals();
        const isProd = APP_ENV === 'PROD';
        const stakeDurations = isProd 
          ? [86400, 1296000, 2592000] // 1 day, 15 days, 30 days
          : [60, 900, 1800];          // 1 min, 15 min, 30 min

        // --- Conditional Interest Fetching ---
        let liveRewards = [];
        if (status === 0 && pageRecords.length > 0) { // Only for "investment" (in-progress) list
            const rewardPromises = pageRecords.map(record => {
                // Now we use the permanent record.id
                return rewardOfSlot(Number(record.id));
            });
            liveRewards = await Promise.all(rewardPromises);
            // console.log('[订单列表] 获取到进行中列表的实时奖励数据:', liveRewards);
        }

        stakingItems.value = pageRecords.map((record, index) => {
            const id = Number(record.id);

            let interest;
            if (status === 0) { // In-progress
                const totalValue = liveRewards[index] ? BigInt(liveRewards[index].toString()) : 0n;
                interest = totalValue > record.amount ? totalValue - record.amount : 0n;
            } else { // Redeemed
                interest = record.finalReward > 0 ? record.finalReward - record.amount : 0n;
            }

            const stakeTimeInSeconds = Number(record.stakeTime);
            const stakeDurationInSeconds = stakeDurations[Number(record.stakeIndex)];
            const expiryTimestamp = (stakeTimeInSeconds + stakeDurationInSeconds) * 1000;

            let displayStatus = 'waiting';
            if (record.status === true) {
                displayStatus = 'redeemed';
            } else if (expiryTimestamp <= Date.now()) {
                displayStatus = 'redeemable';
            }

            return {
                principal: ethers.formatUnits(record.amount, decimals),
                interest: ethers.formatUnits(interest, decimals),
                stakeDate: new Date(stakeTimeInSeconds * 1000).toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }).replace(/\//g, '-'),
                expiryTimestamp: expiryTimestamp,
                displayStatus: displayStatus,
                id: id,
                stakeIndex: Number(record.stakeIndex),
            };
        });

        // console.log('[订单列表] 数据处理完成, 最终用于渲染的数据:', stakingItems.value);
        // --- End of New Logic ---

    } catch (error) {
        console.error("[订单列表] 获取新版质押数据时发生错误:", error);
        stakingItems.value = [];
        totalItems.value = 0;
    } finally {
        isLoading.value = false; // Always turn off loading after a fetch attempt
    }
};


const showUnstakeModal = ref(false);
const selectedStakingId = ref(null);
const selectedStakingPrincipal = ref(0);
const selectedStakingInterest = ref(0);
const selectedStakingIndex = ref(0);

const handleUnstake = (id) => {
    selectedStakingId.value = id;
    const item = stakingItems.value.find(i => i.id === id);
    if (item) {
        selectedStakingPrincipal.value = item.principal;
        selectedStakingInterest.value = item.interest;
        selectedStakingIndex.value = item.stakeIndex;
    } else {
        selectedStakingPrincipal.value = 0;
        selectedStakingInterest.value = 0;
        selectedStakingIndex.value = 0;
    }
    showUnstakeModal.value = true;
};

const confirmUnstake = async (exitType) => {
    const id = selectedStakingId.value;
    if (id === null) return;
    
    unstackingStates[id] = true;
    try {
        const success = await unstake(id, exitType);
        if (success) {
            // Refresh the entire list to get the latest state from the blockchain
            await fetchStakingData();
            showUnstakeModal.value = false;
        }
    } finally {
        unstackingStates[id] = false;
    }
};

const startPolling = () => {
  stopPolling(); // Ensure no multiple intervals are running
  // console.log('[订单列表] 启动轮询，每15秒刷新一次数据...');
  pollingInterval = setInterval(fetchStakingData, 15000);
};

const stopPolling = () => {
  if (pollingInterval) {
    // console.log('[订单列表] 停止轮询。');
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};


watch(() => [walletState.isAuthenticated, walletState.address, walletState.contractsInitialized], ([isAuth, address, contractsReady]) => {
  // console.log(`[订单列表-检查] 监听到状态变化 -> isAuth: ${isAuth}, address: ${address}, contractsReady: ${contractsReady}`);
  // Only fetch data when both authenticated and contracts are ready
  if (isAuth && contractsReady) {
    // Set loading to true only for the initial fetch after connection, not for polling.
    if (stakingItems.value.length === 0 && totalItems.value === 0) {
      isLoading.value = true;
    }
    fetchStakingData();
    startPolling();
  } else {
    stopPolling();
    stakingItems.value = [];
    totalItems.value = 0;
    isLoading.value = false; // Correctly set loading to false on disconnect
    activeTab.value = 'investment';
    currentPage.value = 1;
  }
}, {
  immediate: true
});

onUnmounted(() => {
  stopPolling();
});


const toggleTab = () => {
  listMode.value = 'hide'; // Start fade out animation
  setTimeout(() => {
    activeTab.value = activeTab.value === 'investment' ? 'redemption' : 'investment';
    currentPage.value = 1; // Reset to first page on tab switch
    fetchStakingData(); // Refetch data when tab changes
    listMode.value = 'show'; // Start fade in animation
  }, 150); // This duration should match the CSS transition duration
};


const totalPages = computed(() => {
    if (totalItems.value === 0) return 1; // Prevent division by zero
    return Math.ceil(totalItems.value / itemsPerPage.value);
});

// This computed property is no longer needed as the contract returns paginated data directly.
// const paginatedItems = computed(() => { ... });

// Methods to change the page
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchStakingData(); // Refetch data for the new page
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchStakingData(); // Refetch data for the new page
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchStakingData(); // Refetch data for the new page
  }
};

const displayedPages = computed(() => {
  const maxDisplayed = 5;
  const pages = [];

  if (totalPages.value <= maxDisplayed) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    let startPage;
    let endPage;

    if (currentPage.value <= 3) {
      // At the beginning
      startPage = 1;
      endPage = maxDisplayed;
    } else if (currentPage.value >= totalPages.value - 2) {
      // At the end
      startPage = totalPages.value - maxDisplayed + 1;
      endPage = totalPages.value;
    } else {
      // In the middle
      startPage = currentPage.value - 2;
      endPage = currentPage.value + 2;
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
  }
  return pages;
});
</script>
<style scoped>

.section-how-to {
    --primary: #00d2ff; /* 湖蓝色主题 */
    --primary-rgb: 0, 210, 255;
    --primary-gradient: linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%);
}

.tab-how_to,
.empty-state,
.loading-state {
  transition: opacity 0.15s ease-in-out;
}
.list-hide {
  opacity: 0;
}
.list-show {
  opacity: 1;
}

.tabs-container {
    display: flex;
    margin-bottom: 20px;
    justify-content: center; /* Center the button */
}

.toggle-button {
    /* Glass container similar to HeroSection */
    background: rgba(255, 255, 255, 0.05);
    /* border: 1px solid rgba(255, 255, 255, 0.1); */
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 100px; /* Pill shape */
    padding: 6px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 300px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    box-shadow: 
        0 4px 10px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.toggle-button:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 
        0 6px 15px rgba(0, 0, 0, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.toggle-button .tab-text {
    flex: 1;
    text-align: center;
    z-index: 2;
    padding: 8px 0;
    border-radius: 100px;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
}

.toggle-button .tab-text.active {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.tab-divider {
    display: none; /* Hide divider for pill style */
}

.toggle-button:hover .tab-text {
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
}

.tab-text {
    flex-grow: 1;
    text-align: center;
    color: rgba(255, 255, 255, 0.9); /* Dim inactive tabs - 调亮 */
    transition: all 0.3s ease;
}

.tab-text.active {
    color: #fff;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
    font-weight: 600;
}

.tab-divider {
    width: 1px;
    height: 20px; /* Adjust height as needed */
    background: linear-gradient(to bottom, transparent, #fff, transparent);
    opacity: 0.8; /* 调亮 */
}


.empty-state,
.loading-state {
  /* Replicating the style of .btn_tab for consistency */
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 50px 20px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  text-align: center;
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25), 0 0 40px rgba(255, 255, 255, 0.05);
}

.empty-state p,
.loading-state p {
    position: relative;
    z-index: 2;
}


.order-list {
    margin-top: 30px; 
    color: #fff;
}

.status-box {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

/* 新增 Button Liquid 样式 (参考 HeroSection) */
.btn-liquid {
    position: relative;
    font-weight: 600;
    color: #fff !important;
    text-decoration: none;
    background: rgba(255, 255, 255, 0.05) !important;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    box-shadow: 
        0 4px 6px rgba(0,0,0,0.1), 
        inset 0 1px 0 rgba(255,255,255,0.2) !important;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
    z-index: 1;
    border-radius: 100px !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.btn-liquid:hover {
    transform: translateY(-2px) scale(1.05);
    background: rgba(255, 255, 255, 0.15) !important;
    box-shadow: 
        0 8px 15px rgba(0,0,0,0.2), 
        inset 0 1px 0 rgba(255,255,255,0.3),
        0 0 20px rgba(0, 210, 255, 0.3) !important; /* 使用主题色光晕 */
    border-color: rgba(255, 255, 255, 0.3) !important;
}

.btn-liquid:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none !important;
}

.tf-btn.style-2 {
    /* background-color: #161c416b; Removed */
    width: 120px; /* Slightly wider */
}

.tf-btn[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
    background: transparent;
    transition: all 0.3s ease;
}

.pagination-item:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: rgba(0, 210, 255, 0.1);
}

.pagination-item.active {
    background-color: rgba(0, 210, 255, 0.2); /* 通透的主题色 */
    border-color: var(--primary);
    color: #fff;
    box-shadow: 0 0 15px rgba(0, 210, 255, 0.3);
}

.pagination-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* 极光背景容器 */
.s-img_item {
    position: absolute; /* 改为绝对定位，以便重叠 */
    top: 50px; /* 向上调整位置，覆盖标题区域 */
    left: 0%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 1000px;
    height: 1000px;
    margin: 0 auto;
    overflow: hidden;
    z-index: 0; /* 放在底层 */
    pointer-events: none;
}

/* 确保父容器相对定位 */
.sect-main {
    position: relative;
}

/* 确保内容在极光之上 */
.container {
    position: relative;
    z-index: 2;
}

/* 极光背景基础 */
.aurora-bg {
    position: absolute;
    top: 50px;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    /* filter: blur(40px); */ /* 移除整体模糊，单独控制 */
}

/* 极光光斑单元 - 改为曲线光带 */
.aurora-item {
    position: absolute;
    border-radius: 50%;
    mix-blend-mode: screen;
    filter: blur(40px);
    opacity: 0.7;
}

/* 光带 1：主曲线 - 深湖蓝 */
.aurora-item:nth-child(1) {
    top: 5%;
    left: -15%;
    width: 130%;
    height: 65%;
    background: transparent;
    border-top: 20px solid rgba(0, 210, 255, 0.5); /* 湖蓝色 */
    border-radius: 50%;
    box-shadow: 0 -20px 100px rgb(109 115 210), inset 0 20px 100px rgba(0, 210, 255, 0.3);
    transform: rotate(-8deg);
    animation: aurora-wave 14s infinite alternate ease-in-out;
}

/* 光带 2：辅助辉光 - 青色 */
.aurora-item:nth-child(2) {
    top: 25%;
    left: 5%;
    width: 90%;
    height: 55%;
    background: radial-gradient(ellipse at center, rgb(98 159 179), #1f1111 60%);
    transform: rotate(2deg);
    filter: blur(50px);
    animation: aurora-pulse 10s infinite alternate ease-in-out;
}

/* 光带 3：反向曲线 - 蓝紫色层次 */
.aurora-item:nth-child(3) {
    top: 10%;
    left: -5%;
    width: 110%;
    height: 70%;
    background: transparent;
    border-top: 15px solid rgba(0, 198, 255, 0.4); /* 亮湖蓝 */
    border-radius: 50%;
    box-shadow: 0 -15px 80px rgb(49 199 193);
    transform: rotate(4deg);
    animation: aurora-wave-reverse 18s infinite alternate ease-in-out;
}

/* 光带 4：底层深邃感 (New Layer) */
.aurora-item:nth-child(3)::after {
    content: '';
    position: absolute;
    top: 20%;
    left: 10%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 50% 50%, rgba(0, 100, 255, 0.2), transparent 70%);
    filter: blur(60px);
    z-index: -1;
}

/* 极光波动动画 */
@keyframes aurora-wave {
    0% { transform: rotate(-5deg) translateY(0) scaleX(1); opacity: 0.6; }
    50% { transform: rotate(-3deg) translateY(-10px) scaleX(1.05); opacity: 0.8; }
    100% { transform: rotate(-7deg) translateY(10px) scaleX(0.95); opacity: 0.6; }
}

@keyframes aurora-wave-reverse {
    0% { transform: rotate(3deg) translateY(0) scaleX(1); opacity: 0.5; }
    100% { transform: rotate(6deg) translateY(15px) scaleX(1.1); opacity: 0.7; }
}

@keyframes aurora-pulse {
    0% { transform: scale(1); opacity: 0.4; }
    100% { transform: scale(1.2); opacity: 0.6; }
}

.title-position {
    padding-top: 0px;
    margin-top: 100px;
}

.pagination-list {
    margin-top: 50px;
    display: flex;
    justify-content: center; /* Align to the center */
    align-items: center; /* Vertically align items */
}

.benefit-gif-2 {
    transform: scale(1.5);
}

.gif-place-2 {
    padding-top: 0px !important;
    margin-bottom: 30px !important;
}

.tab-how_to .nav-tab-item .btn_tab {
    /* HeroSection Glass Card Style */
    background: rgba(255, 255, 255, 0.05); /* Lighter glass */
    /* border: 1px solid rgba(255, 255, 255, 0.1); */
    border-radius: 24px; /* More rounded like Hero glass cards */
    padding: 20px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition: all .3s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    overflow: hidden;
    /* Hero shadows */
    box-shadow: 
        0 6px 12px rgba(0, 0, 0, 0.25), 
        0 0 40px rgba(255, 255, 255, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.1); /* Specular highlight simulation */
}

/* Specular simulation via pseudo-element to match .glass-specular */
.tab-how_to .nav-tab-item .btn_tab::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 24px;
    padding: 1px;
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.4) 0%,
        rgba(255, 255, 255, 0.1) 40%,
        rgba(255, 255, 255, 0.05) 100%
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 2;
    opacity: 0.6;
}

.tab-how_to .nav-tab-item .btn_tab:hover {
    transform: scale(1.02);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 
        0 8px 20px rgba(0, 0, 0, 0.3), 
        0 0 50px rgba(255, 255, 255, 0.1);
}

/* Remove old styles */
.tab-how_to .nav-tab-item .btn_tab::after {
    display: none;
}

.tab-how_to .nav-tab-item .btn_tab .bottom-glow-line {
    display: none;
}

/* .tab-how_to .nav-tab-item .btn_tab:hover {
    border-color: #1d2d97a8;
    transform: translateY(-5px);
} */

.tab-how_to .nav-tab-item .btn_tab .number-step {
    margin-bottom: 8px;
}

.tab-how_to .nav-tab-item .btn_tab .name {
    margin-bottom: 16px;
}

.tab-how_to .nav-tab-item .btn_tab .desc {
    margin-bottom: 6px;
}

.tab-how_to .nav-tab-item .btn_tab .desc:last-of-type {
    margin-bottom: 0;
}

.tab-how_to .nav-tab-item .btn_tab .status-box {
    /* margin-top: 12px; */
    /* padding-top: 12px; */
    /* border-top: 1px solid #ffffff2d; */
}

.li-style {
    margin-bottom: 20px !important;
}

.h5-list-style {
    margin-bottom: 0px !important;
    font-size: 12px;
}

.tab-how_to .btn_tab {
    gap: 0px !important;
}

.p-list-style {
    font-size: 16px;
}

/* Starry background effect */
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
  /* animation: animStar 20s linear infinite; */
  box-shadow: 123px 45px rgba(0, 210, 255, 0.6), 255px 189px rgba(0, 210, 255, 0.6), 345px 8px rgba(0, 210, 255, 0.6), 99px 345px rgba(0, 210, 255, 0.6), 487px 233px rgba(0, 210, 255, 0.6), 321px 487px rgba(0, 210, 255, 0.6), 499px 10px rgba(0, 210, 255, 0.6), 23px 187px rgba(0, 210, 255, 0.6), 176px 455px rgba(0, 210, 255, 0.6), 433px 321px rgba(0, 210, 255, 0.6), 45px 23px rgba(0, 210, 255, 0.6), 231px 480px rgba(0, 210, 255, 0.6), 467px 98px rgba(0, 210, 255, 0.6), 33px 256px rgba(0, 210, 255, 0.6), 198px 321px rgba(0, 210, 255, 0.6), 349px 465px rgba(0, 210, 255, 0.6), 480px 12px rgba(0, 210, 255, 0.6), 12px 190px rgba(0, 210, 255, 0.6), 256px 432px rgba(0, 210, 255, 0.6), 490px 211px rgba(0, 210, 255, 0.6), 54px 49px rgba(0, 210, 255, 0.6), 289px 344px rgba(0, 210, 255, 0.6), 411px 189px rgba(0, 210, 255, 0.6), 76px 287px rgba(0, 210, 255, 0.6), 201px 477px rgba(0, 210, 255, 0.6), 389px 23px rgba(0, 210, 255, 0.6), 477px 376px rgba(0, 210, 255, 0.6), 156px 143px rgba(0, 210, 255, 0.6), 301px 499px rgba(0, 210, 255, 0.6), 432px 65px rgba(0, 210, 255, 0.6);
}

.stars2 {
  width: 2px;
  height: 2px;
  /* animation: animStar 40s linear infinite; */
  box-shadow: 234px 123px rgba(0, 210, 255, 0.6), 456px 345px rgba(0, 210, 255, 0.6), 12px 487px rgba(0, 210, 255, 0.6), 498px 65px rgba(0, 210, 255, 0.6), 213px 289px rgba(0, 210, 255, 0.6), 45px 456px rgba(0, 210, 255, 0.6), 345px 98px rgba(0, 210, 255, 0.6), 187px 399px rgba(0, 210, 255, 0.6), 432px 187px rgba(0, 210, 255, 0.6), 88px 88px rgba(0, 210, 255, 0.6), 287px 465px rgba(0, 210, 255, 0.6), 478px 243px rgba(0, 210, 255, 0.6), 143px 32px rgba(0, 210, 255, 0.6), 365px 398px rgba(0, 210, 255, 0.6), 499px 488px rgba(0, 210, 255, 0.6);
}

.stars3 {
  width: 3px;
  height: 3px;
  /* animation: animStar 60s linear infinite; */
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

@keyframes animStar {
  from {
    transform: translateY(0px);
  }
  to {
    transform: translateY(-250px);
  }
}

.card-content {
  position: relative;
  z-index: 1;
}

/* Unique animation delays for each card */
.stars-bg-2 .stars { animation-delay: -5s; }
.stars-bg-2 .stars2 { animation-delay: -10s; }
.stars-bg-2 .stars3 { animation-delay: -15s; }

.stars-bg-3 .stars { animation-delay: -10s; }
.stars-bg-3 .stars2 { animation-delay: -20s; }
.stars-bg-3 .stars3 { animation-delay: -30s; }


/* .redeem-glow {
  box-shadow: 0 0 2px rgba(220, 220, 220, 0.5);
  border: 1px solid rgba(220, 220, 220, 0.3);
}

.redeem-text-glow {
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
} */

/* Glass Effect Styles for Pagination */
.glass-btn {
    position: relative;
    overflow: hidden;
    /* border is handled by glass-specular or parent */
}

.glass-filter {
    position: absolute;
    inset: 0;
    z-index: 0;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: inherit;
    transition: all 0.3s ease;
}

.glass-specular {
    position: absolute;
    inset: 0;
    z-index: 2;
    border-radius: inherit;
    /* box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.1), inset 0 0 5px rgba(255, 255, 255, 0.1); */
    pointer-events: none;
    transition: all 0.3s ease;
}

.btn-content {
    position: relative;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

.pagination-list .pagination-item {
    width: 40px; /* Slightly larger for glass effect */
    height: 40px;
    line-height: 40px;
    margin: 0 4px;
    border-radius: 50%; /* Circle shape like roadmap */
    border: 1px solid rgba(255, 255, 255, 0.1); /* Original Border */
    color: rgba(255, 255, 255, 0.6); /* Original Color */
    background: transparent; /* Glass filter handles bg */
    transition: all 0.3s ease;
    display: flex; /* Required for btn-content centering */
    align-items: center;
    justify-content: center;
}

.pagination-list .pagination-item:hover {
    border-color: var(--primary);
    color: var(--primary);
    transform: scale(1.1); /* Slight zoom like roadmap */
}

.pagination-list .pagination-item:hover .glass-filter {
    background: rgba(0, 210, 255, 0.1); /* Hover BG color */
}

.pagination-list .pagination-item.active {
    border-color: var(--primary);
    color: #fff;
    box-shadow: 0 0 15px rgba(0, 210, 255, 0.3);
}

.pagination-list .pagination-item.active .glass-filter {
    background-color: rgba(0, 210, 255, 0.2); /* Active BG color */
}

.pagination-list .pagination-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

/* New Grid Layout for Order List */
.tab-how_to {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    padding: 0;
}

.nav-tab-item {
    width: 100%;
    margin-bottom: 0 !important;
}

.btn_tab {
    height: 100%;
    padding: 20px !important;
    display: flex;
    flex-direction: column;
}

/* Internal Card Layout */
.card-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
}

.card-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.id-number-box {
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 4px 12px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 14px;
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
}

.date-text {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
}

.card-data-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 15px;
}

.data-col {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.data-col.text-end {
    align-items: flex-end;
}

.data-col .label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 1px;
}

.data-col .value {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
}

.data-col .value.highlight {
    color: var(--primary); /* Theme color */
    font-size: 18px;
    text-shadow: 0 0 15px rgba(0, 210, 255, 0.4);
}

.status-box {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 40px; /* Ensure height consistency */
}

.countdown-wrapper {
    white-space: nowrap;
    font-size: 13px;
    color: var(--primary);
    font-weight: 600;
}

.status-box-button {
    margin-left: auto; /* Push to right */
}

.full-width-btn {
    width: auto !important;
    min-width: 100px;
    height: 36px !important;
    font-size: 13px !important;
    padding: 0 15px !important;
}

/* Mobile Adaptation */
@media (max-width: 767px) {
    .tab-how_to {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 12px;
    }
    
    .btn_tab {
        padding: 14px 14px 4px 14px !important;
    }
    
    .id-number-box {
        font-size: 12px;
        padding: 2px 8px;
    }
    
    .date-text {
        font-size: 10px;
        transform: scale(0.9);
        transform-origin: right center;
    }
    
    .data-col .label {
        font-size: 10px;
    }
    
    .data-col .value {
        font-size: 13px;
    }
    
    .data-col .value.highlight {
        font-size: 14px;
    }
    
    .countdown-wrapper {
        font-size: 10px;
    }
    
    .full-width-btn {
        min-width: 70px;
        height: 30px !important;
        font-size: 13px !important;
        padding: 0 10px !important;
    }

    /* Mobile overrides for new stack layout */
    .data-row-item .label {
        font-size: 10px;
    }
    .data-row-item .value {
        font-size: 12px;
    }
    .data-row-item .value.highlight {
        font-size: 13px;
    }
}

/* New Stack Layout Styles */
.card-data-stack {
    display: flex;
    flex-direction: column;
    /* gap: 12px; */
    /* margin-bottom: 15px; */
    /* border-bottom: 1px solid rgba(255, 255, 255, 0.1); */
    /* padding-bottom: 15px; */
}

.data-row-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.data-row-item .label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 1px;
}

.data-row-item .value {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
}

.data-row-item .value.highlight {
    color: #7bcee3;
    font-size: 16px;
    text-shadow: 0 0 15px rgba(0, 210, 255, 0.4);
}

.countdown-wrapper {
    width: 100%;
    text-align: center;
    white-space: nowrap;
    font-size: 14px;
    color: #fff;
    font-weight: 600;
    letter-spacing: 1px;
}

.status-box-button.w-100 {
    width: 100%;
    display: flex;
    justify-content: center;
}

.full-width-btn {
    width: 100% !important;
    justify-content: center;
    display: flex;
}
</style>


