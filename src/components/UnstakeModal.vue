<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <!-- Starry background effect -->
      <div class="stars-bg">
        <div class="stars"></div>
        <div class="stars2"></div>
        <div class="stars3"></div>
      </div>

      <div class="modal-body-custom">
        <div class="title_holder">
          <h3>{{ t('unstake.title') }}</h3>
        </div>

        <div class="options-container">
          <!-- Option 1: Reinvest (exitType 2) -->
          <!-- Placed prominently at top as requested -->
          <div 
            class="option-card highlight" 
            @click="selectExitType(2)"
            :class="{ 'disabled': processing }"
          >
            <div class="option-content">
              <div class="header-with-badge">
                  <h4>{{ t('unstake.reinvestTitle') }}</h4>
                  <span class="badge-recommend">{{ t('common.recommend') }}</span>
              </div>
              <p>{{ t('unstake.reinvestDesc') }}</p>
            </div>
          </div>

          <!-- Option 2: Redeem Principal (exitType 1) -->
          <div 
            class="option-card compact" 
            @click="selectExitType(1)"
            :class="{ 'disabled': processing || isLimitReached }"
          >
            <div class="option-content">
              <h4>{{ t('unstake.redeemTitle') }}</h4>
              <p class="warning-desc">
                <i class="icon icon-WarningCircle"></i>
                {{ t('unstake.redeemDesc') }}
              </p>
              
              <!-- Daily Limit Info -->
              <div class="limit-info">
                <span>{{ t('unstake.dailyLimit') }}: {{ parseFloat(maxUnstakeAmount).toFixed(2) }} USDT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button @click="$emit('close')" class="close-button" :disabled="processing">
        <i class="icon icon-close"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { t } from '@/i18n';
import { ref, onMounted, computed } from 'vue';
import { getMaxUnstakeAmount } from '../services/contracts';
import { showToast } from '../services/notification';

const props = defineProps({
  processing: {
    type: Boolean,
    default: false
  },
  principal: {
    type: [Number, String],
    required: true,
    default: 0
  },
  interest: {
    type: [Number, String],
    default: 0
  },
  stakeIndex: {
    type: Number,
    default: 0
  },
  id: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['close', 'confirm']);
const maxUnstakeAmount = ref('0');

onMounted(async () => {
  maxUnstakeAmount.value = await getMaxUnstakeAmount();
  
  console.log('[赎回弹窗] 当前选中的订单详情:', {
    '订单编号 (ID)': props.id,
    '质押类型/时长索引 (StakeIndex)': props.stakeIndex,
    '本金 (Principal)': props.principal,
    '利息 (Interest)': props.interest,
    '当前系统赎回限额 (MaxUnstakeAmount)': maxUnstakeAmount.value
  });
});

const isLimitReached = computed(() => {
  return parseFloat(props.principal) > parseFloat(maxUnstakeAmount.value);
});

const selectExitType = (type) => {
  if (props.processing) return;

  if (type === 1) {
    if (isLimitReached.value) {
      showToast(t('toast.dailyLimitReached'));
      return;
    }
  }

  emit('confirm', type);
};
</script>

<style scoped>
/* Reuse styles from other modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.close-button {
  position: absolute;
  top: 30px;
  right: 20px;
  background: transparent;
  border: none;
  color: var(--white);
  font-size: 24px;
  cursor: pointer;
  z-index: 20;
}

.modal-content {
  background: rgba(20, 20, 21, 0.75);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
}

.modal-body-custom {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.title_holder {
  text-align: center;
  margin-bottom: 10px;
  color: #fff;
}

.title_holder h3 {
    font-size: 24px;
    font-weight: 600;
    font-family: 'ChillRoundF', sans-serif;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.option-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.option-card.compact {
  padding: 10px 15px; /* Reduced padding */
  border: 1px solid rgba(255, 255, 255, 0.05); /* Lighter border */
}

.option-card.compact h4 {
  font-size: 14px; /* Smaller title */
  margin-bottom: 2px;
  color: rgba(255, 255, 255, 0.8);
}

.option-card.compact .warning-desc {
  font-size: 12px; /* Smaller warning text */
}

.option-card.compact .limit-info {
  margin-top: 5px;
  padding-top: 5px;
  font-size: 11px;
}

.option-card:hover {
  background: rgba(255, 255, 255, 0);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.option-card.highlight {
  background: rgba(200, 255, 0, 0); /* Approximate primary color tint */
  border-color: var(--primary);
  box-shadow: 0 0 15px rgba(200, 255, 0, 0.1);
  min-height: 140px; /* Taller height for emphasis */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.option-card h4 {
  color: #fff;
  font-size: 18px;
  margin-bottom: 8px;
  font-family: 'ChillRoundF', sans-serif;
}

.option-card.highlight h4 {
  color: var(--primary);
  font-size: 20px; /* Slightly larger title for emphasis */
  margin-bottom: 0;
}

.header-with-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
}

.badge-recommend {
    background: var(--primary);
    color: #000;
    font-size: 12px;
    font-weight: bold;
    padding: 2px 8px;
    border-radius: 4px;
    font-family: 'ChillRoundF', sans-serif;
    box-shadow: 0 0 10px rgba(var(--primary-rgb), 0.4);
    animation: pulse-badge 2s infinite;
}

@keyframes pulse-badge {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

.option-card p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
}

.warning-desc {
  color: #b60e0e !important; /* Warning red color */
  font-weight: 500;
  display: flex;
  align-items: center;
}

.limit-info {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5); 
}

/* Change color based on if limit is reached or not if needed, 
   but here we use a distinct color to make it visible */
.option-card:not(.disabled) .limit-info {
    color: var(--primary); /* Green/Yellow if active */
}

.option-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  /* pointer-events: none; REMOVED so we can click to see toast */
}

/* Starry background effect */
.stars-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
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
  animation: animStar 50s linear infinite;
  box-shadow: 123px 45px #FFF, 255px 189px #FFF, 345px 8px #FFF, 99px 345px #FFF, 487px 233px #FFF, 321px 487px #FFF, 499px 10px #FFF, 23px 187px #FFF, 176px 455px #FFF, 433px 321px #FFF, 45px 23px #FFF, 231px 480px #FFF, 467px 98px #FFF, 33px 256px #FFF, 198px 321px #FFF, 349px 465px #FFF, 480px 12px #FFF, 12px 190px #FFF, 256px 432px #FFF, 490px 211px #FFF, 54px 49px #FFF, 289px 344px #FFF, 411px 189px #FFF, 76px 287px #FFF, 201px 477px #FFF, 389px 23px #FFF, 477px 376px #FFF, 156px 143px #FFF, 301px 499px #FFF, 432px 65px #FFF;
}

.stars2 {
  width: 2px;
  height: 2px;
  animation: animStar 100s linear infinite;
  box-shadow: 234px 123px #FFF, 456px 345px #FFF, 12px 487px #FFF, 498px 65px #FFF, 213px 289px #FFF, 45px 456px #FFF, 345px 98px #FFF, 187px 399px #FFF, 432px 187px #FFF, 88px 88px #FFF, 287px 465px #FFF, 478px 243px #FFF, 143px 32px #FFF, 365px 398px #FFF, 499px 488px #FFF;
}

.stars3 {
  width: 3px;
  height: 3px;
  animation: animStar 150s linear infinite;
  box-shadow: 87px 345px #FFF, 465px 87px #FFF, 234px 487px #FFF, 487px 234px #FFF, 156px 156px #FFF, 387px 432px #FFF, 432px 32px #FFF;
}

@keyframes animStar {
  from { transform: translateY(0px); }
  to { transform: translateY(-500px); }
}
</style>
