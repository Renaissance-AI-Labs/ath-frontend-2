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
          <div class="title_holder">
            <h3>{{ t('unstake.title') }}</h3>
          </div>

          <div class="options-container">
            <!-- Option 1: Reinvest (exitType 2) -->
            <!-- Placed prominently at top as requested -->
            <div 
              class="option-card glass-panel" 
              @click="selectExitType(2)"
              :class="{ 'disabled': processing }"
            >
              <div class="option-content">
                <div class="header-with-badge">
                    <h4>{{ t('unstake.reinvestTitle') }}</h4>
                    <span class="badge-recommend">{{ t('common.recommend') }}</span>
                </div>
                <div class="separator"></div>
                <p>{{ t('unstake.reinvestDesc') }}</p>
              </div>
            </div>

            <!-- Option 2: Redeem Principal (exitType 1) -->
            <div 
              class="option-card glass-panel" 
              @click="selectExitType(1)"
              :class="{ 'disabled': processing }"
            >
              <div class="option-content">
                <h4>{{ t('unstake.redeemTitle') }}</h4>
                <div class="separator"></div>
                <p class="warning-desc">
                  <i class="icon icon-WarningCircle"></i>
                  {{ t('unstake.redeemDesc') }}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <button @click="$emit('close')" class="close-button" :disabled="processing">
          <i class="icon icon-close"></i>
        </button>
      </div>
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
  /* Glass Card Base */
  --primary: #00d2ff;
  --primary-rgb: 0, 210, 255;
  
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
  background: rgba(255, 255, 255, 0.05);
}

.glass-specular {
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: inherit;
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 0 5px rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

.glass-content {
  position: relative;
  z-index: 3;
  width: 100%;
  height: 100%;
  padding: 40px;
  display: flex;
  flex-direction: column;
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
    rgba(255, 255, 255, 0.2) 0%,
    rgba(0, 210, 255, 0.2) 25%,
    transparent 80%
  );
  opacity: 0.8;
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
    rgba(255, 255, 255, 0.1) 0%,
    rgba(0, 210, 255, 0.15) 30%,
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
  z-index: 10;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.modal-body-custom {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 30px;
    width: 100%;
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
    letter-spacing: -0.5px;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.option-card {
  /* Glass Panel Style */
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  min-height: 110px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.option-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 210, 255, 0.3);
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2), 0 0 20px rgba(0, 210, 255, 0.1);
}

.option-card h4 {
  color: #fff;
  font-size: 18px;
  margin-bottom: 0;
  font-family: 'ChillRoundF', sans-serif;
  font-weight: 600;
}

.header-with-badge {
    display: flex;
    align-items: center;
    gap: 10px;
}

.separator {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    width: 100%;
    margin: 12px 0;
}

.badge-recommend {
    background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);
    color: #fff;
    font-size: 12px;
    font-weight: bold;
    padding: 4px 10px;
    border-radius: 100px;
    font-family: 'ChillRoundF', sans-serif;
    box-shadow: 0 0 10px rgba(0, 210, 255, 0.4);
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.option-card p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.warning-desc {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  display: flex;
  align-items: center;
}

.option-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(1);
}
</style>
