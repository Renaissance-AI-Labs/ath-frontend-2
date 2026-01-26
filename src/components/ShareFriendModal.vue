<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content glass-card">
      <div class="glass-filter"></div>
      <div class="glass-overlay"></div>
      <div class="glass-specular"></div>
      
      <div class="glass-content">
        <!-- Glow Effects -->
        <div class="glow-effect-top-left"></div>
        <div class="glow-effect-bottom"></div>

        <div class="modal-body">
          <div class="title_holder">
            <h3>{{ t('share.title') }}</h3>
          </div>
          
          <div class="share-content" style="margin-top: 30px;">
            <div class="input-wrapper">
              <label class="share-link-label">{{ t('share.linkLabel') }}</label>
              <textarea :value="referralLink" readonly class="share-link-input" @focus="$event.target.select()"></textarea>
            </div>
            <p class="share-hint">{{ t('share.hint') }}</p>
            
            <a href="#" @click.prevent="copyLink" class="glass-btn copy-btn">
               <div class="glass-filter"></div>
               <div class="glass-specular"></div>
               <div class="btn-content">
                  {{ t('share.button') }}
               </div>
            </a>

            <div class="divider" v-if="teamId"></div>
            <div class="team-id-section" v-if="teamId">
              <div class="referral-label-container">
                <span class="referral-label-text">{{ t('share.teamId') }}</span>
                <span class="referral-label-count team-id-value-inline">{{ teamId }}</span>
              </div>
            </div>

            <div class="team-id-section">
              <div class="referral-label-container">
                <span class="referral-label-text">{{ t('share.rewardsFromFriends') }}</span>
                <span class="referral-label-count team-id-value-inline">{{ formattedEstimatedRewards }}</span>
              </div>
              <div class="rewards-disclaimer">
                <span class="icon-info">i</span>
                <p>{{ t('share.rewardsDisclaimer') }}</p>
              </div>
            </div>
            
            <!-- New Referral Info Section -->
            <div class="team-id-section">
              <div class="referral-label-container">
                <span class="referral-label-text">{{ t('share.myReferralsLabel') }}</span>
                <span class="referral-label-count">{{ formattedReferralCount }}</span>
              </div>
              
              <!-- Loading State -->
              <div v-if="isLoadingReferrals" class="loading-message">
                <p>{{ t('share.loadingReferrals') }}</p>
              </div>
              
              <!-- Data/Empty States -->
              <div v-else>
                <div v-if="referralCount > 0">
                  <div class="referral-switcher">
                    <a href="#" @click.prevent="showPrevious" style="margin-top: 28px;" class="pagination-item" :class="{ 'disabled': currentIndex === 0 }">
                      <span class="icon icon-CaretDoubleRight" style="transform: rotate(180deg);"></span>
                    </a>
                    <div class="switcher-content">
                      <div>
                        <p class="switcher-address">{{ currentReferralAddress }}</p>
                        <div class="info-container">
                          <div class="info-row asset-row">
                            <span class="info-label">{{ t('share.assetsLabel') }}</span>
                            <span class="info-value">{{ formattedBalance }}</span>
                          </div>
                          <div class="info-row kpi-row">
                            <span class="info-label">{{ t('share.kpiLabel') }}</span>
                            <span class="info-value">{{ formattedKpi }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <a href="#" @click.prevent="showNext" style="margin-top: 28px;" class="pagination-item" :class="{ 'disabled': currentIndex >= referralCount - 1 }">
                      <span class="icon icon-CaretDoubleRight"></span>
                    </a>
                  </div>
                  <p class="referral-counter">{{ currentIndex + 1 }} / {{ referralCount }}</p>
                </div>
                
                <div v-else class="no-referrals-message">
                  <p>{{ t('share.noReferrals') }}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
        <button @click="close" class="close-button">
          <i class="icon icon-close"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted, computed, ref, watch } from 'vue';
import { showToast } from '@/services/notification';
import { t } from '@/i18n';
import { getReferralsFromSubgraph } from '@/services/subgraph';
import { walletState } from '@/services/wallet';
import { getTeamKpiByAddress, getUserStakedBalanceByAddress } from '@/services/contracts';
import { ethers } from 'ethers';

export default {
  name: 'ShareFriendModal',
  props: {
    referralLink: {
      type: String,
      required: true,
    },
    referrerAddress: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    const referralCount = ref(0);
    const referrals = ref([]);
    const currentIndex = ref(0);
    const currentReferralKpiRaw = ref(null);
    const currentReferralBalanceRaw = ref(null);
    const isLoadingReferrals = ref(true);
    const estimatedRewards = ref('0');

    const close = () => {
      emit('close');
    };

    const copyLink = () => {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = props.referralLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast(t('toast.copySuccess'));
      } catch (err) {
        console.error('无法复制链接: ', err);
        showToast(t('toast.copyFailed'));
      }
    };

    const teamId = computed(() => {
      if (!props.referrerAddress || props.referrerAddress.length < 10) {
        return '';
      }
      // Format: 0x + first 4 chars + ... + last 4 chars
      const prefix = props.referrerAddress.slice(0, 6); // 0x + first 4 chars
      const suffix = props.referrerAddress.slice(-4); // last 4 chars
      return `${prefix}...${suffix}`;
    });

    const formattedEstimatedRewards = computed(() => {
      if (estimatedRewards.value === null) return '--';
      try {
        const rewardsInWei = estimatedRewards.value.split('.')[0];
        const rewardsInEth = ethers.formatUnits(rewardsInWei, 18);
        return parseFloat(rewardsInEth).toFixed(2);
      } catch (e) {
        console.error("Error formatting estimated rewards:", e);
        return '0.00';
      }
    });

    const formattedKpi = computed(() => {
      if (currentReferralKpiRaw.value === null) return '--';
      return parseFloat(currentReferralKpiRaw.value).toFixed(2);
    });

    const formattedBalance = computed(() => {
      if (currentReferralBalanceRaw.value === null) return '--';
      return parseFloat(currentReferralBalanceRaw.value).toFixed(2);
    });

    const formattedReferralCount = computed(() => {
      const unit = t('share.referralsUnit');
      return unit ? `${referralCount.value} ${unit}` : referralCount.value;
    });

    const currentReferralAddress = computed(() => {
      if (referrals.value.length === 0) {
        return '';
      }
      const address = referrals.value[currentIndex.value];
      const prefix = address.slice(0, 6);
      const suffix = address.slice(-4);
      return `${prefix}...${suffix}`;
    });

    const showNext = () => {
      if (currentIndex.value < referralCount.value - 1) {
        currentIndex.value++;
      }
    };

    const showPrevious = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--;
      }
    };
    
    const fetchReferralData = async () => {
      isLoadingReferrals.value = true;
      const userAddress = walletState.address;
      if (!userAddress) {
        console.error("User address not found");
        isLoadingReferrals.value = false;
        return;
      }
      const data = await getReferralsFromSubgraph(userAddress);
      referralCount.value = data.referralCount;
      referrals.value = data.referrals;
      estimatedRewards.value = data.estimatedDynamicRewards;
      isLoadingReferrals.value = false;
    };

    const fetchDataForCurrentReferral = async () => {
      if (referrals.value.length === 0) return;
      
      try {
        const address = referrals.value[currentIndex.value];
        
        // Fetch KPI and Balance in parallel
        const [kpi, balance] = await Promise.all([
          getTeamKpiByAddress(address),
          getUserStakedBalanceByAddress(address)
        ]);

        currentReferralKpiRaw.value = kpi;
        currentReferralBalanceRaw.value = balance;

      } catch (error) {
        console.error("Failed to fetch referral data:", error);
        currentReferralKpiRaw.value = null;
        currentReferralBalanceRaw.value = null;
      }
    };

    watch(currentIndex, fetchDataForCurrentReferral);

    onMounted(async () => {
      document.body.style.overflow = 'hidden';
      await fetchReferralData();
      if (referralCount.value > 0) {
        await fetchDataForCurrentReferral();
      }
    });

    onUnmounted(() => {
      document.body.style.overflow = '';
    });

    return {
      close,
      copyLink,
      teamId,
      t,
      referralCount,
      currentIndex,
      currentReferralAddress,
      formattedKpi,
      formattedBalance,
      isLoadingReferrals,
      showNext,
      showPrevious,
      formattedReferralCount,
      formattedEstimatedRewards,
    };
  },
};
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
  z-index: 1050;
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 380px;
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

.modal-body {
  width: 100%;
  position: relative;
  z-index: 1;
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
  z-index: 10;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.title_holder {
  text-align: center;
  margin-bottom: 20px;
}

.title_holder h3 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.share-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 15%,
    rgba(255, 255, 255, 0.3) 85%,
    transparent 100%
  );
  margin: 30px 0 30px 0;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.1);
}

.team-id-section {
  width: 100%;
  text-align: left;
  margin-bottom: 20px;
}

.referral-label-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 8px;
}

.referral-label-text,
.referral-label-count {
  color: var(--white);
  font-size: 14px;
  font-weight: 500;
}

.referral-label-count {
  font-family: 'monospace', 'BlinkMacSystemFont', sans-serif;
}

.referral-switcher, .no-referrals-message, .loading-message {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 15px;
  min-height: 80px;
}

.no-referrals-message, .loading-message {
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  min-height: 110px;
}
.no-referrals-message p, .loading-message p {
  margin: 0;
}

.pagination-item {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 36px;
    height: 36px;
    line-height: 36px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: transparent;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 600;
    transition: all .3s ease;
    text-decoration: none;
}

.pagination-item:hover {
    color: var(--white);
    border-color: var(--primary);
}

.pagination-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.switcher-content {
  text-align: left;
  flex-grow: 1;
  padding: 0 10px;
}

.switcher-address, .info-label, .info-value {
  color: var(--white);
  font-size: 14px;
  font-family: 'monospace', 'BlinkMacSystemFont', sans-serif;
}

.switcher-address {
  text-align: center;
  margin-bottom: 8px;
}

.info-container {
  width: 100%;
  padding: 0 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.asset-row .info-label,
.asset-row .info-value {
  font-weight: bold;
}

.referral-counter {
  margin-top: 15px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  width: 100%;
  text-align: center;
}

.rewards-disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 8px;
  text-align: left;
}

.rewards-disclaimer p {
  margin: 0;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.5);
}

.icon-info {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
  font-size: 10px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
  margin-top: 1px;
}

.team-id-value-inline {
  color: var(--white);
  font-size: 14px;
  font-family: 'monospace', 'BlinkMacSystemFont', sans-serif;
  font-weight: 500;
}

.share-hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  margin-bottom: 4px;
  text-align: center;
}

.input-wrapper {
  width: 100%;
  margin-bottom: 10px;
}

.share-link-label {
  display: block;
  color: var(--white);
  font-size: 14px;
  margin-bottom: 8px;
  text-align: left;
  font-weight: 500;
}

.share-link-input {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--white);
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  overflow-x: auto;
  resize: none;
  word-break: break-all;
}

.share-link-input:focus {
  outline: none;
  border-color: var(--primary);
}

/* Glass Button Styles */
.glass-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
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
</style>
