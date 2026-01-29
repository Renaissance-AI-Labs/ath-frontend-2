<template>
    <section class="section-hero">
        <!-- == Head Section -->
        <!-- <div class="sect-header">
            <div class="container">
                <div class="s-meta text-caption font-2">
                    <p class="s-number_order wg-counter">
                        [ <span class="text-white">BACK</span> TO ]
                    </p>
                    <p class="s-label">[ <span class="text-white hacker-text_transform">FUTURE</span> ]</p>
                </div>
            </div>
        </div> -->
        <!-- <span class="br-line"></span> -->
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
                            THE ULTIMATE DECENTRALIZED AUTONOMOUS ECOSYSTEM
                        </span>
                        <span class="bar-group type-right">
                            <span class="bar_center"></span>
                        </span>
                    </p>
                </div>
            </div>
        </div> -->
        <!-- <span class="br-line"></span> -->
        <!-- == Main Section -->
        <div class="sect-main">
            <div class="container">
                <div class="sect-title wow fadeInUp">
                    <div class="title-container">
                        <span class="protocol-version-bg">X</span>
                        <h1 class="s-title font-3 title-big">
                            Athena Protocol<br>
                            <!-- <span class="text-change_wrap">
                                <span class="text-change_rotating">这里没有<span class="icon icon-gemini"></span>CEO
                                </span>
                                <span class="text-change_rotating">这里没有<span
                                        class="icon icon-gemini"></span>营销团队
                                </span>
                                <span class="text-change_rotating">Built on<span class="icon icon-cloud"></span>Claude.
                                </span>
                            </span> -->
                        </h1>
                    </div>
                    <p class="s-sub_title" style="color: #fff; margin-top: 20px; flex-direction: column;">
                        <span class="d-block">{{ t('hero.subtitle_line1') || '纯粹的算法逻辑与数学法则' }}</span>
                        <span class="d-block">{{ t('hero.subtitle_line2') || '驱动 AI 自主运行的永续价值引擎' }}</span>
                    </p>
                </div>
            </div>
            <!-- <span class="br-line"></span> -->
            <div class="container"> 
                <div class="leave-somthing"> 
                    <!-- ----- 保留节目 ---- -->
                </div>
            </div>
            <!-- <div class="tf-brand assets-title">
                <div class="container">
                    <h5 class="title text-caption font-2 letter-space-0 fw-normal wg-counter wow fadeInUp assets-title-content">您的资产在此处安睡 </h5>
                </div>
            </div> -->
            <div class="container">
                <div class="sect-content position-relative" style="padding: 0 10px;">
                    <div class="box-ask-wrap">
                        <div class="box-ask glass-card">
                            <div class="glass-filter"></div>
                            <div class="glass-overlay"></div>
                            <div class="glass-specular"></div>
                            <div class="glass-content">
                                <form class="form-ask wow fadeInUp form-ask-bg">
                                    <div class="box-ask-inner">
                                        <!-- S5~S7 Level Watermark -->
                                        <div v-if="userLevel && ['S5', 'S6', 'S7'].includes(userLevel)" 
                                             class="level-watermark"
                                             :class="`level-${userLevel.toLowerCase()}`">
                                            {{ userLevel }}
                                        </div>
                                        <div class="form-content" style="margin-bottom: 20px;">
                                            
                                            <!-- Dashboard Grid Layout -->
                                            <div class="dashboard-grid compact-grid">
                                                <!-- 1. Assets Staked (Primary) -->
                                                <div class="dashboard-item primary-item">
                                                    <h5 class="item-label label-large">{{ t('hero.assetsTitle') }}</h5>
                                                    <p class="item-value value-large">
                                                        <span v-if="isLoading">{{ t('common.loading') }}</span>
                                                        <span v-else>
                                                            <AnimatedNumber :value="stakedBalance" :decimals="6" /> 
                                                            <span class="unit">{{ t('common.token') }}</span>
                                                        </span>
                                                    </p>
                                                </div>

                                                <!-- 2. Total Investment -->
                                                <div class="dashboard-item">
                                                    <h5 class="item-label">{{ t('hero.totalInvestment') }}</h5>
                                                    <p class="item-value">
                                                        <span v-if="isLoading">{{ t('common.loading') }}</span>
                                                        <span v-else>
                                                            <AnimatedNumber :value="totalInvestmentValue" :decimals="6" /> 
                                                            <span class="unit">{{ t('common.token') }}</span>
                                                        </span>
                                                    </p>
                                                </div>

                                                <!-- 3. Friends Boost & Badge -->
                                                <div class="dashboard-item">
                                                    <h5 class="item-label">{{ t('hero.friendsBoost') }}</h5>
                                                    <div class="value-badge-group row-layout">
                                                        <p class="item-value">
                                                            <span v-if="isLoading">{{ t('common.loading') }}</span>
                                                            <span v-else>
                                                                <AnimatedNumber :value="friendsBoost" :decimals="6" /> 
                                                                <span class="unit">{{ t('common.token') }}</span>
                                                            </span>
                                                        </p>
                                                        <!-- Liquid Glass Badge -->
                                                        <div v-if="userLevel" class="liquid-badge-container">
                                                            <span class="liquid-badge" :class="`badge-${userLevel.toLowerCase()}`">
                                                                {{ userLevel }}
                                                                <span class="glare"></span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Action Buttons (No Icons, Single Line) -->
                                            <div class="button-group-liquid nowrap-group">
                                                <a href="#" @click.prevent="handleInjectPoolClick" class="btn-liquid compact-btn">
                                                    {{ t('hero.injectPool') }}
                                                </a>
                                                <a href="#" @click.prevent="shareFriendLink" class="btn-liquid compact-btn">
                                                    {{ t('hero.shareFriend') }}
                                                </a>
                                                <div class="reward-button-wrapper" v-if="isAuthenticated">
                                                    <a href="#" @click.prevent="handleClaimLevelReward" class="btn-liquid compact-btn">
                                                        {{ t('hero.achievementReward') }}
                                                    </a>
                                                    <div v-if="walletState.hasClaimableRewards" class="red-dot-liquid"></div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                       </div>

                </div>
            </div>
            <div class="sect-bottom">
            </div>
        </div>
        
        <svg style="display: none">
            <filter id="liquid-lens" x="-50%" y="-50%" width="200%" height="200%">
            <feImage x="0" y="0" result="normalMap" xlink:href="data:image/svg+xml;utf8,
                    <svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>
                        <radialGradient id='nmap' cx='50%' cy='50%' r='50%'>
                        <stop offset='0%' stop-color='rgb(128,128,255)'/>
                        <stop offset='100%' stop-color='rgb(255,255,255)'/>
                        </radialGradient>
                        <rect width='100%' height='100%' fill='url(#nmap)'/>
                    </svg>" />
            <feDisplacementMap in="SourceGraphic" in2="normalMap" scale="60" xChannelSelector="R" yChannelSelector="G"
                result="displaced" />
            <feMerge>
                <feMergeNode in="displaced" />
            </feMerge>
            </filter>
        </svg>
    </section>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted
} from 'vue';
import {
  walletState
} from '../services/wallet';
import {
  getUserStakedBalance,
  getFriendsBoost,
  checkIfUserHasReferrer,
  getReferrer,
  getTeamKpiBigNumber,
  S1_THRESHOLD,
  S2_THRESHOLD,
  S3_THRESHOLD,
  S4_THRESHOLD,
  S5_THRESHOLD,
  S6_THRESHOLD,
  S7_THRESHOLD,
  getUserPrincipalBalance
} from '../services/contracts';
import {
  showToast
} from '../services/notification';
import AnimatedNumber from './AnimatedNumber.vue'; // Import the new component
import { t } from '@/i18n';
import { ethers } from 'ethers';

const emits = defineEmits(['open-inject-modal', 'open-claim-reward-modal', 'open-share-friend-modal']);

const stakedBalance = ref(0); // Use number type
const friendsBoost = ref(0); // Use number type
const userLevel = ref(''); // User's S level (e.g., 'S5', 'S6', 'S7')
const totalInvestmentValue = ref(0); // New property for total investment value
let fetchInterval = null;
const isInitialFetch = ref(true); // Flag for the first fetch

const isAuthenticated = computed(() => walletState.isAuthenticated);
const isLoading = computed(() => isAuthenticated.value && isInitialFetch.value);


const fetchHeroData = async () => {
  if (!isAuthenticated.value || !walletState.contractsInitialized) {
    console.log('[HeroSection] 跳过数据获取 - 未认证或合约未初始化');
    return;
  }

  if (isInitialFetch.value) {
    console.log("[HeroSection] 正在首次加载数据...");
  } else {
    // console.log("每6秒刷新数据...");
  }

  try {
    // Optimize: Only call getTeamKpiBigNumber once, use it for both friendsBoost and level calculation
    const [newStakedBalance, kpi, principalBalance] = await Promise.all([
      getUserStakedBalance(),
      getTeamKpiBigNumber(),
      getUserPrincipalBalance()
    ]);
    
    // Convert string from contract to number for the component
    stakedBalance.value = parseFloat(newStakedBalance) || 0;
    
    // Convert KPI BigInt to formatted number for friendsBoost display
    friendsBoost.value = parseFloat(ethers.formatUnits(kpi, 18)) || 0;

    // The principalBalance is already a formatted string, just parse it.
    totalInvestmentValue.value = parseFloat(principalBalance) || 0;
    
    // Calculate user level based on KPI
    if (kpi >= S7_THRESHOLD) {
      userLevel.value = 'S7';
    } else if (kpi >= S6_THRESHOLD) {
      userLevel.value = 'S6';
    } else if (kpi >= S5_THRESHOLD) {
      userLevel.value = 'S5';
    } else if (kpi >= S4_THRESHOLD) {
      userLevel.value = 'S4';
    } else if (kpi >= S3_THRESHOLD) {
      userLevel.value = 'S3';
    } else if (kpi >= S2_THRESHOLD) {
      userLevel.value = 'S2';
    } else if (kpi >= S1_THRESHOLD) {
      userLevel.value = 'S1';
    } else {
      userLevel.value = ''; // No level if below S1 threshold
    }
  } catch (error) {
    console.error("刷新数据失败:", error);
  } finally {
    // This logic ensures the initial "Loading..." state is cleared
    if (isInitialFetch.value) {
      isInitialFetch.value = false;
    }
  }
};

const resetData = () => {
  stakedBalance.value = 0;
  friendsBoost.value = 0;
  userLevel.value = '';
  totalInvestmentValue.value = 0; // Reset total investment value
  isInitialFetch.value = true; // Reset flag on disconnect
};

const startFetching = () => {
  stopFetching(); // Ensure no multiple intervals are running
  fetchHeroData(); // Fetch immediately
  fetchInterval = setInterval(fetchHeroData, 6000);
};

const stopFetching = () => {
  if (fetchInterval) {
    clearInterval(fetchInterval);
    fetchInterval = null;
  }
};

const handleInjectPoolClick = () => {
  if (!isAuthenticated.value) {
    showToast(t('toast.connectWalletFirst'));
    return;
  }
  emits('open-inject-modal');
};

const shareFriendLink = async () => {
  if (!isAuthenticated.value) {
    showToast(t('toast.connectWalletFirst'));
    return;
  }
  const isEligible = await checkIfUserHasReferrer();
  if (!isEligible) {
    showToast(t('toast.stakeAndBindFirst'));
    return;
  }
  const referralLink = `${window.location.origin}?ref=${walletState.address}`;
  const referrerAddress = await getReferrer();
  emits('open-share-friend-modal', { referralLink, referrerAddress });
};

const handleClaimLevelReward = () => {
  emits('open-claim-reward-modal');
};

watch(() => [isAuthenticated.value, walletState.contractsInitialized], ([isAuth, contractsReady]) => {
  console.log(`[HeroSection] 状态变化 - isAuth: ${isAuth}, contractsReady: ${contractsReady}`);
  if (isAuth && contractsReady) {
    startFetching();
  } else {
    stopFetching();
    if (!isAuth) {
      resetData();
    }
  }
}, { immediate: true });


onUnmounted(() => {
  stopFetching();
});
</script>

<style scoped>

.sect-title {
    text-align: center;
}

.text-change_wrap {
    margin-top: 50px;
    font-size: 18px;
}

.title-big {
    font-size: 64px;
    line-height: 1.1;
    font-weight: 800;
    /* Clean White with subtle glass gradient */
    background: linear-gradient(180deg, #FFFFFF 40%, #E0EFFF 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: #fff; /* Fallback */
    position: relative;
    z-index: 2;
    /* Soft glowing shadow */
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
    letter-spacing: -1px;
}

.title-container {
    position: relative;
    display: inline-block;
}

.protocol-version-bg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -55%);
    font-size: 240px; /* Massive Glass X */
    line-height: 1;
    font-weight: 900;
    font-family: 'Geist', serif;
    
    /* Liquid Glass Aesthetics */
    color: transparent;
    -webkit-text-stroke: 3px rgba(255, 255, 255, 0.2); /* Frosted glass edge */
    
    /* Dynamic Liquid Sheen */
    background: linear-gradient(
        110deg, 
        rgba(255, 255, 255, 0) 30%, 
        rgba(255, 255, 255, 0.6) 50%, 
        rgba(255, 255, 255, 0) 70%
    );
    background-size: 200% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    
    z-index: 0;
    pointer-events: none;
    user-select: none;
    
    /* Blend smoothly with background */
    mix-blend-mode: overlay;
    filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.2));
    
    animation: glassSheen 5s linear infinite;
}

/* Remove old pseudo-elements to clean up */
.protocol-version-bg::before,
.protocol-version-bg::after {
    content: none;
    display: none;
}

@keyframes glassSheen {
    0% { background-position: 150% 0; }
    100% { background-position: -50% 0; }
}

@keyframes liquidGoldFlow {
    /* Kept for safety if referenced elsewhere, but effectively unused by X now */
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

@keyframes cinemaGlow {
    /* Deprecated - kept for compatibility if needed elsewhere */
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
}

.coins-title {
    font-size: 26px;
    font-family: 'monospace', 'BlinkMacSystemFont', sans-serif;
    
    /* Shimmer Effect on Text */
    background: linear-gradient(90deg, #f6faff 20%, #b3e8ff 40%, #fafbff 60%);
    background-size: 200% auto;
    color: #fff;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
    to {
        background-position: -200% center;
    }
}

.button-add-pool {
    justify-content: center !important;
}

.assets-title {
    margin-top: 24px;
    /* margin-bottom: 10px !important; */
}

.assets-title-content {
    font-size: 20px !important;
    color: #fff;
    margin-bottom: 0px !important;
    font-weight: bold !important;
}

.form-ask-bg {
    background-color: transparent; /* Changed from #11111300 but effectively same */
    border: none !important;
    backdrop-filter: none !important;
    box-shadow: none !important;
}

.level-watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 160px;
    font-weight: 900;
    z-index: 0;
    pointer-events: none;
    user-select: none;
    letter-spacing: 12px;
}

/* S5 - Light Blue (浅蓝色) */
.level-s5 {
    color: rgba(147, 197, 253, 0.12);
    text-shadow: 
        0 0 60px rgba(147, 197, 253, 0.28),
        0 0 100px rgba(186, 230, 253, 0.2),
        0 0 140px rgba(224, 242, 254, 0.15);
    animation: glowLightBlueS5 6s ease-in-out infinite;
}

@keyframes glowLightBlueS5 {
    0%, 100% {
        text-shadow: 
            0 0 60px rgba(147, 197, 253, 0.28),
            0 0 100px rgba(186, 230, 253, 0.2),
            0 0 140px rgba(224, 242, 254, 0.15);
        opacity: 0.6;
    }
    50% {
        text-shadow: 
            0 0 80px rgba(147, 197, 253, 0.4),
            0 0 120px rgba(186, 230, 253, 0.3),
            0 0 160px rgba(224, 242, 254, 0.22);
        opacity: 0.8;
    }
}

/* S6 - Lighter Blue (更浅蓝色) */
.level-s6 {
    color: rgba(186, 230, 253, 0.12);
    text-shadow: 
        0 0 60px rgba(186, 230, 253, 0.25),
        0 0 100px rgba(224, 242, 254, 0.18),
        0 0 140px rgba(240, 249, 255, 0.12);
    animation: glowLighterBlue 6s ease-in-out infinite;
}

@keyframes glowLighterBlue {
    0%, 100% {
        text-shadow: 
            0 0 60px rgba(186, 230, 253, 0.25),
            0 0 100px rgba(224, 242, 254, 0.18),
            0 0 140px rgba(240, 249, 255, 0.12);
        opacity: 0.6;
    }
    50% {
        text-shadow: 
            0 0 80px rgba(186, 230, 253, 0.38),
            0 0 120px rgba(224, 242, 254, 0.28),
            0 0 160px rgba(240, 249, 255, 0.2);
        opacity: 0.8;
    }
}

/* S7 - Silver White (银白色) */
.level-s7 {
    color: rgba(229, 228, 226, 0.12);
    text-shadow: 
        0 0 60px rgba(229, 228, 226, 0.35),
        0 0 100px rgba(241, 245, 249, 0.25),
        0 0 140px rgba(248, 250, 252, 0.18);
    animation: glowSilverWhite 6s ease-in-out infinite;
}

@keyframes glowSilverWhite {
    0%, 100% {
        text-shadow: 
            0 0 60px rgba(229, 228, 226, 0.35),
            0 0 100px rgba(241, 245, 249, 0.25),
            0 0 140px rgba(248, 250, 252, 0.18);
        opacity: 0.6;
    }
    50% {
        text-shadow: 
            0 0 80px rgba(229, 228, 226, 0.5),
            0 0 120px rgba(241, 245, 249, 0.38),
            0 0 160px rgba(248, 250, 252, 0.28);
        opacity: 0.8;
    }
}

.box-ask-inner {
    position: relative;
}

.form-content {
    position: relative;
    z-index: 1;
}

.user-level-badge {
    margin-left: 8px;
    padding: 2px 8px;
    background: linear-gradient(135deg, #e2e5eb 0%, #4b79a2 100%);
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 1px 1px rgb(0 0 0 / 64%);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
    display: inline-block;
    vertical-align: middle;
    animation: glow 4s ease-in-out infinite;
}

/* @keyframes glow {
    0%, 100% {
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
    }
    50% {
        box-shadow: 0 2px 12px rgba(102, 164, 234, 0.8);
    }
} */

.reward-button-wrapper {
    position: relative;
    display: inline-block;
}

.red-dot {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 10px;
  height: 10px;
  background-color: #101e2e;
  border-radius: 50%;
  border: 1px solid white;
}

/* Glassmorphism Styles */
.glass-card {
  --lg-bg-color: rgba(255, 255, 255, 0.15);
  --lg-highlight: rgba(255, 255, 255, 0.75);
  --lg-text: #ffffff;
  
  position: relative;
  /* Match previous box-ask sizing or allow it to size by content */
  /* width: 320px;  REMOVE fixed width */
  /* height: 220px; REMOVE fixed height */
  border-radius: 34px;
  overflow: hidden;
  box-shadow:
    0 6px 12px rgba(0, 0, 0, 0.25),
    0 0 40px rgba(255, 255, 255, 0.05);
  background: transparent;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.glass-card:hover {
  transform: scale(1.02); /* Slight scale on hover, less aggressive than 1.2 */
}

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
  height: 100%;
  /* display: flex; align-items: center; justify-content: center; */
  /* Remove flex centering to keep original layout flow */
  color: var(--lg-text);
  /* font-size: 1.4rem; */
  /* font-weight: 600; */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  padding: 10px 10px 0 10px; /* Add some padding if needed, or rely on inner padding */
}

/* Apply Liquid Button Style to .btn-ip */
.btn-ip {
  position: relative;
  /* overflow: hidden; */ /* Conflict with red-dot if overflow hidden? red-dot is outside? */
  /* .reward-button-wrapper contains btn-ip and red-dot, so btn-ip overflow hidden is fine */
  /* Wait, btn-ip itself needs overflow hidden for the liquid effect to be contained? */
  /* The reference uses overflow: hidden on the button */
  
  /* Reset existing styles if needed, but keeping layout */
  background: transparent !important; /* Override existing bg */
  border: none !important;
  box-shadow:
    0 6px 12px rgba(0, 0, 0, 0.25),
    0 0 40px rgba(255, 255, 255, 0.05);
  z-index: 1; /* Ensure z-index context */
  border-radius: 100px; /* Match existing or desired radius */
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-ip:hover {
  transform: scale(1.05);
}

.btn-ip::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  filter: url(#liquid-lens);
  border-radius: inherit;
}

.btn-ip::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  box-shadow:
    inset 1px 1px 0 var(--lg-highlight),
    inset 0 0 5px var(--lg-highlight);
  border-radius: inherit;
}

/* Fix for icons and text inside button to be visible and on top */
.btn-ip i, .btn-ip span {
  position: relative;
  z-index: 2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

/* --- New Dashboard Styles --- */

.dashboard-grid.compact-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 15px; /* Reduced gap */
    margin-bottom: 40px; /* Reduced bottom margin */
    margin-top: 5px;
}

@media (min-width: 768px) {
    .dashboard-grid.compact-grid {
        grid-template-columns: repeat(3, 1fr);
        align-items: start; /* Top align */
        text-align: center;
        gap: 10px; /* Tighter gap on desktop */
    }
}

.dashboard-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.item-label {
    font-size: 13px; /* Smaller default label */
    text-transform: uppercase;
    letter-spacing: 1px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 4px !important; /* Reduced margin */
    font-weight: 500 !important;
}

/* Primary Item ("Assets Staked") Styling */
.dashboard-item.primary-item .item-label.label-large {
    font-size: 16px; /* Larger font size */
    color: #fff; /* Brighter color */
    font-weight: 700 !important;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.item-value {
    font-family: 'monospace', sans-serif;
    font-size: 18px; /* Slightly smaller default value */
    font-weight: 700;
    margin: 0 !important;
    background: linear-gradient(180deg, #FFFFFF 0%, #B0C4DE 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.dashboard-item.primary-item .item-value.value-large {
    font-size: 22px; /* Larger value for primary item */
}

.item-value .unit {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    -webkit-text-fill-color: rgba(255, 255, 255, 0.5);
}

/* Row Layout for Value + Badge */
.value-badge-group.row-layout {
    display: flex;
    flex-direction: row; /* Horizontal alignment */
    align-items: center;
    justify-content: center;
    gap: 8px; /* Gap between value and badge */
}

/* Liquid Buttons Compact */
.button-group-liquid.nowrap-group {
    display: flex;
    justify-content: center;
    gap: 8px; /* Tighter gap */
    flex-wrap: nowrap; /* No wrapping */
    margin-top: 5px;
    width: 100%;
}

.btn-liquid.compact-btn {
    padding: 0 5px; /* Reduced horizontal padding */
    height: 36px; /* Fixed height for consistency */
    line-height: 34px; /* Vertically center text (height - border*2) */
    font-size: 12px; /* Smaller font */
    border-radius: 50px;
    white-space: nowrap;
    flex: 1 1 0px; /* Ensure equal distribution */
    width: 0; /* Force equal width */
    min-width: 0; /* Allow shrinking */
    text-align: center;
    display: inline-flex; /* Use flex for centering */
    align-items: center; /* Vertical center */
    justify-content: center; /* Horizontal center */
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Specific fix for reward button wrapper to match height */
.reward-button-wrapper {
    position: relative;
    display: flex; /* Ensure wrapper behaves like a flex item */
    flex: 1;
}

.reward-button-wrapper .btn-liquid {
    width: 100%; /* Fill wrapper */
}

.btn-liquid {
    position: relative;
    /* padding: 10px 20px; REMOVED - using compact-btn */ 
    font-weight: 600;
    color: #fff !important;
    text-decoration: none;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 
        0 4px 6px rgba(0,0,0,0.1), 
        inset 0 1px 0 rgba(255,255,255,0.2);
    transition: all 0.3s ease;
    overflow: hidden;
    z-index: 1;
}

.btn-liquid:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 
        0 8px 15px rgba(0,0,0,0.2), 
        inset 0 1px 0 rgba(255,255,255,0.3),
        0 0 20px rgba(255, 255, 255, 0.1); /* Glow */
}

/* Red Dot on Button */
.red-dot-liquid {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background-color: #ff4d4f;
  border-radius: 50%;
  box-shadow: 0 0 5px #ff4d4f;
  pointer-events: none;
  z-index: 2;
}

/* Liquid Badge Styles */
.liquid-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 800;
    color: #fff;
    text-shadow: 0 1px 1px rgba(0,0,0,0.5);
    position: relative;
    border: 1px solid rgba(255,255,255,0.3);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: inset 0 0 10px rgba(255,255,255,0.1);
    backdrop-filter: blur(4px);
}

.liquid-badge .glare {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to bottom, rgba(255,255,255,0.4), transparent);
    border-radius: 12px 12px 60% 60%;
    opacity: 0.6;
    pointer-events: none;
}

/* Badge Colors */
.badge-s1, .badge-s2, .badge-s3 {
    background: linear-gradient(135deg, rgba(205, 127, 50, 0.3), rgba(160, 82, 45, 0.5));
    border-color: rgba(205, 127, 50, 0.6);
}

.badge-s4, .badge-s5 {
    background: linear-gradient(135deg, rgba(70, 130, 180, 0.3), rgba(0, 191, 255, 0.5));
    border-color: rgba(135, 206, 250, 0.6);
    box-shadow: 0 0 8px rgba(0, 191, 255, 0.4);
}

.badge-s6, .badge-s7 {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 140, 0, 0.5));
    border-color: rgba(255, 215, 0, 0.8);
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
    animation: badgePulse 2s infinite alternate;
}

@keyframes badgePulse {
    from { box-shadow: 0 0 8px rgba(255, 215, 0, 0.4); }
    to { box-shadow: 0 0 16px rgba(255, 215, 0, 0.8); }
}
</style>
