<template>
  <div class="personal-page">
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
            {{ t('personal.title') }}
          </h1>
        </div>
      </div>

      <!-- Content -->
      <div class="content-wrapper wow fadeInUp" data-wow-delay="0.1s" style="margin-top: 40px;">
        <div class="row">
          <div class="col-lg-10 col-xl-8 mx-auto">
            
            <!-- User Stats Section -->
            <div class="glass-card mb-3" style="padding: 20px;">
              <div class="row align-items-center">
                <div class="col-6 border-end-md">
                  <div class="p-1">
                    <div class="label text-white-50 fs-extra-small mb-1">{{ t('personal.currentLevel') }}</div>
                    <div class="amount-value fs-4 fw-bold">Lv {{ userLevel }}</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="p-1">
                    <div class="label text-white-50 fs-extra-small mb-1">{{ t('personal.teamTotalBet') }}</div>
                    <div class="d-flex align-items-baseline">
                        <span class="amount-value fs-5 fw-bold text-gradient me-1">{{ formatAmount(totalWin) }}</span>
                        <span class="text-white-50 fs-extra-small">{{ t('common.ath') }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Level Up Progress Section -->
            <div class="glass-card mb-3" style="padding: 20px;">
                  <div class="mb-2 d-flex justify-content-between align-items-center">
                     <span class="text-white h6 mb-0 font-weight-bold" style="font-size: 0.9rem;">
                       {{ isMaxLevel ? t('personal.maxLevelReached') : t('personal.nextLevelProgress') }}
                     </span>
                     <span v-if="!isMaxLevel" class="fs-extra-small text-white-50">
                        {{ t('personal.need') }} <span class="text-white fw-bold">{{ formatAmount(remainingToNextLevel) }}</span>
                     </span>
                  </div>
                   
                   <div v-if="!isMaxLevel" class="level-progress-container">
                     <div class="progress-track">
                        <div class="progress-fill" :style="{ width: progressPercent + '%' }">
                          <div class="progress-glow"></div>
                        </div>
                     </div>
                     
                     <div class="d-flex justify-content-between mt-2 fs-extra-small text-white-50">
                        <span>{{ t('personal.current') }}: {{ formatAmount(totalWin) }}</span>
                        <span>{{ t('personal.target') }}: {{ formatAmount(nextLevelTarget) }}</span>
                     </div>
                   </div>
                   
                   <div v-else class="text-center py-3">
                     <p class="text-gradient h5 mb-0">{{ t('personal.maxLevelDesc') }}</p>
                   </div>
            </div>

            <!-- Loading/Connect Hint -->
            <div v-if="!walletState.isConnected" class="glass-card mb-3 empty-state">
               <div class="stars-bg">
                   <div class="stars"></div>
                   <div class="stars2"></div>
                   <div class="stars3"></div>
               </div>
               <p class="text-white mb-0" style="position: relative; z-index: 2;">{{ t('personal.connectWalletHint') }}</p>
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
import { ref, onMounted, watch, computed } from 'vue';
import HomeRightSidebar from '../components/HomeRightSidebar.vue';
import { walletState } from '../services/wallet';
import { getPersonalCenterData } from '../services/gameLevel';
import { t } from '../i18n';

export default {
  name: 'PersonalCenterView',
  components: {
    HomeRightSidebar
  },
  setup() {
    const userLevel = ref(0);
    const totalWin = ref("0");
    const levelConfigs = ref([]);
    const isLoading = ref(false);
    
    // New refs for progress
    const nextLevelTarget = ref("0");
    const isMaxLevel = ref(false);

    // Sidebar State
    const isSidebarOpen = ref(false);
    
    const openSidebar = () => {
        isSidebarOpen.value = true;
    };
    
    const closeSidebar = () => {
        isSidebarOpen.value = false;
    };

    const loadData = async () => {
      if (!walletState.isConnected) return;
      
      isLoading.value = true;
      try {
        const data = await getPersonalCenterData();
        userLevel.value = data.level;
        totalWin.value = data.totalWin;
        levelConfigs.value = data.configs;
        
        // Calculate progress
        const sortedConfigs = data.configs.sort((a, b) => a.level - b.level);
        const nextConfig = sortedConfigs.find(c => c.level > userLevel.value);
        
        if (nextConfig) {
             nextLevelTarget.value = nextConfig.minWinAmount;
             isMaxLevel.value = false;
        } else {
             // If no next config, user is at max level or logic is different
             // Check if userLevel is indeed the highest in configs
             if (sortedConfigs.length > 0 && userLevel.value >= sortedConfigs[sortedConfigs.length - 1].level) {
                 isMaxLevel.value = true;
             } else if (sortedConfigs.length === 0) {
                 // No configs loaded
                 isMaxLevel.value = false; 
             } else {
                 // Fallback
                 isMaxLevel.value = true;
             }
        }

      } catch (e) {
        console.error("Failed to load personal center data", e);
      } finally {
        isLoading.value = false;
      }
    };
    
    const progressPercent = computed(() => {
        if (isMaxLevel.value) return 100;
        const current = parseFloat(totalWin.value);
        const target = parseFloat(nextLevelTarget.value);
        if (target <= 0) return 0;
        const p = (current / target) * 100;
        return Math.min(Math.max(p, 0), 100);
    });
    
    const remainingToNextLevel = computed(() => {
        if (isMaxLevel.value) return "0";
        const current = parseFloat(totalWin.value);
        const target = parseFloat(nextLevelTarget.value);
        const diff = target - current;
        return diff > 0 ? diff.toString() : "0";
    });

    onMounted(() => {
      if (walletState.isConnected) {
        loadData();
      }
    });

    watch(() => walletState.isConnected, (newVal) => {
      if (newVal) {
        loadData();
      } else {
        userLevel.value = 0;
        totalWin.value = "0";
        isMaxLevel.value = false;
      }
    });

    // Helper to format large numbers
    const formatAmount = (val) => {
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

    const connectWallet = () => {
        document.dispatchEvent(new CustomEvent('open-wallet-modal'));
    }

    return {
      walletState,
      userLevel,
      totalWin,
      levelConfigs,
      isLoading,
      formatAmount,
      connectWallet,
      nextLevelTarget,
      isMaxLevel,
      progressPercent,
      remainingToNextLevel,
      isSidebarOpen,
      openSidebar,
      closeSidebar,
      t
    };
  }
};
</script>

<style scoped>
.personal-page {
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
  max-width: 900px;
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
  padding: 30px;
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

.label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.amount-value {
  color: #fff;
}

.amount-unit {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 5px;
}

.text-gradient {
    background: linear-gradient(90deg, #00C8FF, #0080FF);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* Progress Bar Styles */
.level-progress-container {
    width: 100%;
}

.progress-track {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #00C8FF, #0080FF, #8A2BE2);
    background-size: 200% 100%;
    border-radius: 4px;
    transition: width 0.6s ease-out;
    position: relative;
    animation: gradientMove 3s linear infinite;
    box-shadow: 0 0 15px rgba(0, 200, 255, 0.4);
}

.progress-glow {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 20px;
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 20px rgba(255, 255, 255, 1);
    filter: blur(4px);
    opacity: 0.5;
}

@keyframes gradientMove {
    0% { background-position: 100% 0; }
    100% { background-position: 0 0; }
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

.btn-liquid:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 210, 255, 0.4);
  border-color: rgba(255, 255, 255, 0.3);
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

.nav-btn.sidebar-trigger .glass-specular {
    position: absolute;
    inset: 0;
    z-index: 2;
    border-radius: inherit;
    box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.1), inset 0 0 5px rgba(255, 255, 255, 0.1);
    pointer-events: none;
}

@media (min-width: 768px) {
    .border-end-md {
        border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
}

.fs-extra-small {
    font-size: 12px;
}

.border-white-10 {
    border-color: rgba(255, 255, 255, 0.1) !important;
}

/* Empty State Styles */
.empty-state {
  position: relative;
  text-align: center;
  padding: 50px 20px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
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
</style>