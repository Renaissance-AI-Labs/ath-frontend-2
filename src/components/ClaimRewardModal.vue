<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content glass-card">
      <div class="glass-filter"></div>
      <div class="glass-overlay"></div>
      <div class="glass-specular"></div>
      
      <div class="glass-content">
        <!-- Glow Effects -->
        <div class="glow-effect-top-left"></div>
        <div class="glow-effect-bottom"></div>

        <div class="modal-body-custom">
          <!-- Header -->
          <div class="title_holder">
            <h3>{{ t('claim.title') }}</h3>
          </div>

          <!-- Authenticated View -->
          <div v-if="walletState.isAuthenticated" class="reward-content">
              <div v-if="isLoading" class="loading-state-rewards">
                  <p>{{ t('claim.loading') }}</p>
              </div>
              <div v-else>
                  <div class="level-reward-section">
                      <div class="level-reward-title">{{ t('claim.levelRewardTitle') }}</div>
                      <div class="hexagon-container">
                          <div class="hexagon-wrapper">
                              <div class="shape-box">
                                  <div class="apple-shape" :class="{ 'is-unlocked': s5_kpiMet }"></div>
                                  <span class="level-text level-s5">S5</span>
                              </div>
                              <div class="reward-display">
                                  <span>{{ parseFloat(s5_rewards) > 0 ? parseFloat(s5_rewards).toFixed(2) + ' ' + t('common.ath') : t('claim.noReward') }}</span>
                              </div>
                              <button @click="claim(5)" :disabled="parseFloat(s5_rewards) <= 0 || isClaiming[5]" class="glass-btn btn-claim">
                                  <div class="glass-filter"></div>
                                  <div class="glass-specular"></div>
                                  <div class="btn-content">
                                      {{ isClaiming[5] ? t('claim.claiming') : t('claim.claim') }}
                                  </div>
                              </button>
                          </div>
                          <div class="hexagon-wrapper">
                              <div class="shape-box">
                                  <div class="apple-shape" :class="{ 'is-unlocked': s6_kpiMet }"></div>
                                  <span class="level-text level-s6">S6</span>
                              </div>
                              <div class="reward-display">
                                  <span>{{ parseFloat(s6_rewards) > 0 ? parseFloat(s6_rewards).toFixed(2) + ' ' + t('common.ath') : t('claim.noReward') }}</span>
                              </div>
                              <button @click="claim(6)" :disabled="parseFloat(s6_rewards) <= 0 || isClaiming[6]" class="glass-btn btn-claim">
                                  <div class="glass-filter"></div>
                                  <div class="glass-specular"></div>
                                  <div class="btn-content">
                                      {{ isClaiming[6] ? t('claim.claiming') : t('claim.claim') }}
                                  </div>
                              </button>
                          </div>
                          <div class="hexagon-wrapper">
                              <div class="shape-box">
                                  <div class="apple-shape" :class="{ 'is-unlocked': s7_kpiMet }"></div>
                                  <span class="level-text level-s7">S7</span>
                              </div>
                              <div class="reward-display">
                                  <span>{{ parseFloat(s7_rewards) > 0 ? parseFloat(s7_rewards).toFixed(2) + ' ' + t('common.ath') : t('claim.noReward') }}</span>
                              </div>
                              <button @click="claim(7)" :disabled="parseFloat(s7_rewards) <= 0 || isClaiming[7]" class="glass-btn btn-claim">
                                  <div class="glass-filter"></div>
                                  <div class="glass-specular"></div>
                                  <div class="btn-content">
                                      {{ isClaiming[7] ? t('claim.claiming') : t('claim.claim') }}
                                  </div>
                              </button>
                          </div>
                      </div>
                  </div>

                  <!-- Dividend Rewards Section -->
                  <div class="node-reward-section">
                      <div class="node-reward-title">{{ t('claim.dividendRewardTitle') }}</div>
                      <div class="node-reward-content">
                          <span class="reward-amount">{{ truncatedDividendRewards }} USDT</span>
                          <button 
                              @click="claimDividendReward" 
                              :disabled="parseFloat(dividend_rewards) <= 0 || isClaimingDividendReward" 
                              :class="{ 'pseudo-disabled': !isPreacher }"
                              class="glass-btn btn-claim">
                              <div class="glass-filter"></div>
                              <div class="glass-specular"></div>
                              <div class="btn-content">
                                  {{ isClaimingDividendReward ? t('claim.claiming') : t('claim.claim') }}
                              </div>
                          </button>
                      </div>
                  </div>
              </div>
          </div>

          <!-- Unauthenticated View -->
          <div v-else class="unauthenticated-view">
              <p>{{ t('claim.connectWallet') }}</p>
          </div>

        </div>
        <button @click="$emit('close')" class="close-button">
          <i class="icon icon-close"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
    ref,
    onMounted,
    watch,
    computed
} from 'vue';
import {
    walletState
} from '../services/wallet';
import {
    getTeamKpiBigNumber,
    getS5PendingRewards,
    getS6PendingRewards,
    getS7PendingRewards,
    claimS5Rewards,
    claimS6Rewards,
    claimS7Rewards,
    checkIsPreacher,
    getDividendPointRewards,
    claimDividendPointRewards,
    S5_THRESHOLD,
    S6_THRESHOLD,
    S7_THRESHOLD
} from '../services/contracts';
import { t } from '@/i18n';
import { showToast } from '../services/notification';

const emit = defineEmits(['close']);
const isLoading = ref(true);
const s5_kpiMet = ref(false);
const s6_kpiMet = ref(false);
const s7_kpiMet = ref(false);
const s5_rewards = ref('0');
const s6_rewards = ref('0');
const s7_rewards = ref('0');
const dividend_rewards = ref('0');
const showDividendPointSection = ref(false);
const isPreacher = ref(false);
const isClaiming = ref({
    5: false,
    6: false,
    7: false
});
const isClaimingDividendReward = ref(false);

const truncatedDividendRewards = computed(() => {
    const num = parseFloat(dividend_rewards.value);
    if (isNaN(num)) return '0.0000';
    const truncated = Math.floor(num * 10000) / 10000;
    return truncated.toFixed(4);
});

const fetchRewardData = async () => {
    // This check is now slightly redundant due to the watcher, but good for safety.
    if (!walletState.isAuthenticated || !walletState.contractsInitialized) return;

    isLoading.value = true;
    try {
        const [kpi, s5Rewards, s6Rewards, s7Rewards, preacherStatus, dividendRewards] = await Promise.all([
            getTeamKpiBigNumber(),
            getS5PendingRewards(),
            getS6PendingRewards(),
            getS7PendingRewards(),
            checkIsPreacher(),
            getDividendPointRewards()
        ]);

        // --- Exclusive Level Check Logic ---
        // A user can only be at one level at a time.
        const kpiMetS7 = kpi >= S7_THRESHOLD;
        const kpiMetS6 = kpi >= S6_THRESHOLD;
        const kpiMetS5 = kpi >= S5_THRESHOLD;

        s7_kpiMet.value = kpiMetS7;
        s6_kpiMet.value = kpiMetS6 && !kpiMetS7;
        s5_kpiMet.value = kpiMetS5 && !kpiMetS6;

        s5_rewards.value = s5Rewards;
        s6_rewards.value = s6Rewards;
        s7_rewards.value = s7Rewards;
        dividend_rewards.value = dividendRewards;
        isPreacher.value = preacherStatus;

        // --- Conditional Visibility for Dividend Point Section ---
        const dividendRewardsNum = parseFloat(dividendRewards);
        // Show if rewards > 0
        showDividendPointSection.value = Math.floor(dividendRewardsNum * 10000) > 0;

        console.log(`[成就奖励数据] 获取成功:
          - 用户KPI (原始值): ${kpi.toString()}
          - S5门槛: ${S5_THRESHOLD.toString()} -> 是否达到: ${s5_kpiMet.value}
          - S6门槛: ${S6_THRESHOLD.toString()} -> 是否达到: ${s6_kpiMet.value}
          - S7门槛: ${S7_THRESHOLD.toString()} -> 是否达到: ${s7_kpiMet.value}
          - S5待领奖励: ${s5_rewards.value} ATH
          - S6待领奖励: ${s6_rewards.value} ATH
          - S7待领奖励: ${s7_rewards.value} ATH
          - Dividend Point待领奖励: ${dividend_rewards.value} USDT
          - 是否为Preacher: ${isPreacher.value}
        `);

    } catch (error) {
        console.error("Failed to fetch reward data:", error);
    } finally {
        isLoading.value = false;
    }
};

const claim = async (level) => {
    if (isClaiming.value[level]) return; // Prevent double clicks
    isClaiming.value[level] = true;
    console.log(`[领取操作] 开始为 S${level} 领取奖励...`);

    let success = false;
    try {
        switch (level) {
            case 5:
                success = await claimS5Rewards();
                break;
            case 6:
                success = await claimS6Rewards();
                break;
            case 7:
                success = await claimS7Rewards();
                break;
            default:
                console.error("Invalid level for claim:", level);
        }

        if (success) {
            console.log(`[领取操作] S${level} 奖励领取成功, 正在刷新数据...`);
            // The success toast is shown in contracts.js, just refetch data here.
            await fetchRewardData(); // Refetch data to update the UI
        } else {
            console.log(`[领取操作] S${level} 奖励领取失败或用户取消。`);
            // Failure toast is also handled in contracts.js
        }
    } catch (error) {
        console.error(`[领取操作] S${level} 领取过程中发生意外错误:`, error);
    } finally {
        isClaiming.value[level] = false;
    }
};

const claimDividendReward = async () => {
    if (!isPreacher.value) {
        showToast(t('toast.stake200Tokens'));
        return;
    }

    if (isClaimingDividendReward.value || parseFloat(dividend_rewards.value) <= 0) return;
    isClaimingDividendReward.value = true;
    console.log('[领取操作] 开始为 Dividend Point 领取奖励...');

    try {
        const success = await claimDividendPointRewards();
        if (success) {
            console.log('[领取操作] Dividend Point 奖励领取成功!');
            // Success toast is handled in contracts.js
            emit('close');
        } else {
            console.log('[领取操作] Dividend Point 奖励领取失败或用户取消。');
        }
    } catch (error) {
        console.error('[领取操作] Dividend Point 领取过程中发生意外错误:', error);
    } finally {
        isClaimingDividendReward.value = false;
    }
};

// Fetch data when the modal becomes visible and the user is authenticated.
watch(() => walletState.isAuthenticated, (isAuth) => {
    if (isAuth && walletState.contractsInitialized) {
        fetchRewardData();
    } else {
        // Reset data if user disconnects
        isLoading.value = true;
        s5_kpiMet.value = false;
        s6_kpiMet.value = false;
        s7_kpiMet.value = false;
        s5_rewards.value = '0';
        s6_rewards.value = '0';
        s7_rewards.value = '0';
        dividend_rewards.value = '0';
        showDividendPointSection.value = false;
        isPreacher.value = false;
    }
}, {
    immediate: true
});
</script>

<style scoped>
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
  z-index: 1000;
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 500px;
  padding: 0;
  border-radius: 34px;
  background: transparent;
  box-shadow:
    0 6px 12px rgba(0, 0, 0, 0.25),
    0 0 40px rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Glassmorphism Styles */
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
    rgba(var(--primary-rgb, 59, 130, 246), 1) 25%,
    rgba(var(--primary-rgb, 59, 130, 246), 0.8) 50%,
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
    rgba(var(--primary-rgb, 59, 130, 246), 0.8) 30%,
    transparent 70%
  );
  opacity: 0.6;
  filter: blur(40px);
  pointer-events: none;
  z-index: -1;
  mix-blend-mode: screen;
}

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
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.modal-body-custom {
    width: 100%;
    position: relative;
    z-index: 2;
}

.title_holder {
  text-align: center;
  margin-bottom: 25px;
  color: #fff;
}

.title_holder h3 {
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.5px;
}

.reward-content {
    text-align: center;
    color: #ccc;
    min-height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column; /* Ensure vertical stacking */
    margin-bottom: 30px;
    margin: 40px 0;
    width: 100%;
}

.level-reward-section {
    /* Removed border and background to reduce "boxiness" */
    border: none;
    border-radius: 0;
    padding: 0;
    background: transparent;
    width: 100%;
    margin-bottom: 30px;
}

.level-reward-title {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    text-align: left; /* Align left for cleaner look */
    margin-bottom: 20px;
    font-family: 'ChillRoundF', sans-serif;
    padding-left: 10px;
    border-left: 3px solid var(--primary); /* Minimal visual indicator */
    line-height: 1;
}

.node-reward-section {
    /* Removed border, kept subtle background for separation but made it full width style */
    border-radius: 24px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.02);
    margin-top: 10px;
    position: relative;
    overflow: hidden;
    border: none; /* No border */
    width: 100%;
}

/* Subtle shine effect */
.node-reward-section::after {
    /* ... keep shine but make it very subtle ... */
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent);
    transform: translateX(-100%);
    animation: subtle-shine 6s ease-in-out infinite;
    pointer-events: none;
    will-change: transform;
    z-index: 1;
}

@keyframes subtle-shine {
    0%, 20% {
        transform: translateX(-100%);
    }
    50%, 100% {
        transform: translateX(200%);
    }
}

.node-reward-title {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    text-align: left;
    margin-bottom: 20px;
    font-family: 'ChillRoundF', sans-serif;
    padding-left: 10px;
    border-left: 3px solid var(--primary);
    line-height: 1;
}

.node-reward-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.reward-amount {
    color: #fff;
    font-size: 20px; /* Larger font for amount */
    font-weight: 600;
    min-height: 20px;
    font-family: 'ChillRoundF', sans-serif;
    text-shadow: 0 0 10px rgba(var(--primary-rgb, 59, 130, 246), 0.5);
}

.unauthenticated-view {
    margin: 90px 0;
    text-align: center;
    color: rgba(255, 255, 255, 0.8);
    font-size: 16px;
    font-family: 'ChillRoundF', sans-serif;
}

.loading-state-rewards {
    min-height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgba(255, 255, 255, 0.8);
    font-size: 16px;
    font-family: 'ChillRoundF', sans-serif;
}

.hexagon-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}

.hexagon-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.shape-box {
    position: relative;
    width: 90px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.apple-shape {
    position: absolute;
    width: 80px;
    height: 80px;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 22px; /* Apple-style squircle approximation */
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    overflow: hidden;
}

/* Unlocked State */
.apple-shape.is-unlocked {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.8);
    box-shadow: 
        0 0 15px rgba(255, 255, 255, 0.2),
        inset 0 0 10px rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
}

/* Shine effect */
.apple-shape.is-unlocked::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 100%;
    background: linear-gradient(
        105deg, 
        rgba(255, 255, 255, 0) 0%, 
        rgba(255, 255, 255, 0.4) 50%, 
        rgba(255, 255, 255, 0) 100%
    );
    transform: translateX(-150%);
    z-index: 1;
    animation: shine-effect 3s ease-in-out infinite;
    pointer-events: none;
}

/* Staggered animation delay */
.hexagon-wrapper:nth-child(2) .apple-shape.is-unlocked::after {
    animation-delay: 0.3s;
}

.hexagon-wrapper:nth-child(3) .apple-shape.is-unlocked::after {
    animation-delay: 0.6s;
}

@keyframes shine-effect {
    0% {
        transform: translateX(-150%);
    }
    100% {
        transform: translateX(150%);
    }
}

.level-text {
    font-family: 'ChillRoundF', sans-serif;
    font-size: 28px;
    z-index: 5;
    position: relative;
    color: rgba(255, 255, 255, 0.6);
    text-shadow: none;
    transition: all 0.3s ease-in-out;
}

/* --- UNLOCKED TEXT STYLES --- */

.apple-shape.is-unlocked ~ .level-s5 {
    color: #bba89a;
    text-shadow: 0 0 4px #bba89a, 0 0 8px #ffb366;
}

.apple-shape.is-unlocked ~ .level-s6 {
    color: #ccdfe6;
    text-shadow: 0 0 4px #ffffff, 0 0 8px #d7d7d7, 0 0 12px #c0c0c0;
}

.apple-shape.is-unlocked ~ .level-s7 {
    color: #d8d2be;
    text-shadow: 0 0 4px #f0c43c, 0 0 8px #ffd700, 0 0 12px #fff8dc;
}

.reward-display {
    color: #fff;
    font-size: 14px;
    min-height: 20px;
    font-family: 'ChillRoundF', sans-serif;
    text-shadow: 0 0 4px var(--primary);
}

/* Glass Button Styles */
.glass-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 999px;
  text-decoration: none;
  color: var(--white);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: center;
}

.glass-btn .glass-filter {
    filter: url(#liquid-lens);
}

.glass-btn .glass-specular {
    box-shadow:
    inset 1px 1px 0 var(--lg-highlight),
    inset 0 0 5px var(--lg-highlight);
}

.btn-content {
  position: relative;
  z-index: 3;
  width: 100%;
}

.glass-btn:hover {
  transform: translateY(-2px);
}

.btn-claim {
    font-size: 14px;
    min-width: 90px;
}

.btn-claim[disabled],
.pseudo-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}
</style>
