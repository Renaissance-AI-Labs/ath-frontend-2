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
            <h3>{{ t('inject.title') }}</h3>
          </div>

          <!-- Amount Input Group -->
          <div class="form-group">
            <div class="label-row">
              <label class="form-label">{{ t('inject.amountLabel') }}</label>
            </div>
            <div class="input-wrapper">
              <input 
                type="text" 
                inputmode="decimal"
                :value="amount"
                @input="handleAmountInput"
                :placeholder="t('inject.amountPlaceholder')" 
                class="form-input with-suffix-btn"
                :class="{ 'input-error': isAmountInvalid }"
              >
              <button @click.prevent="fillMax" class="max-btn">MAX</button>
            </div>
            <div class="balance-row">
              <span class="balance-text">{{ t('inject.maxAmount', { amount: formattedUsdtBalance }) }}</span>
            </div>
          </div>

          <!-- Duration Button Group -->
          <div class="form-group">
            <label class="form-label">{{ t('inject.durationLabel') }}</label>
            <div class="duration-button-group">
              <button 
                v-for="option in durationOptions" 
                :key="option.value"
                @click="selectedDuration = option.value"
                :class="['duration-btn', { 'active': selectedDuration === option.value }]"
                type="button"
              >
                <span class="duration-days">{{ option.days }}</span>
                <span class="duration-rate">{{ option.rate }}</span>
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="button-group">
            <a href="#" @click.prevent="close" class="glass-btn btn-cancel">
               <div class="glass-filter"></div>
               <div class="glass-specular"></div>
               <div class="btn-content">
                  {{ t('inject.cancel') }}
               </div>
            </a>
            <a href="#" @click.prevent="handleMainAction" class="glass-btn btn-confirm" :class="{ 'disabled': mainButtonState.disabled }">
               <div class="glass-filter"></div>
               <div class="glass-specular"></div>
               <div class="btn-content">
                  {{ mainButtonState.text }}
               </div>
            </a>
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
import {
  walletState
} from '../services/wallet';
import {
  getUsdtBalance,
  getUsdtAllowance,
  approveUsdt,
  getMaxStakeAmount,
  getUserStakedBalance,
} from '../services/contracts';
import { APP_ENV } from '../services/environment';
import {
  showToast
} from '../services/notification';
import { t } from '@/i18n';


export default {
  name: 'InjectPoolModal',
  setup() {
    return {
      t,
    };
  },
  data() {
    return {
      amount: '',
      selectedDuration: 2, // Default to 30 days (index 2)
      usdtBalance: '0',
      usdtAllowance: '0',
      userStakedBalance: '0', // User's current staked balance
      isApproving: false,
      isLoading: true, // Start with loading true to fetch allowance
      walletState: walletState,
      maxStakeAmount: '0',
    };
  },
  computed: {
    durationOptions() {
      const isTest = APP_ENV !== 'PROD';
      return [
        {
          value: 0,
          days: isTest ? this.t('inject.min1') : this.t('inject.days1'),
          rate: this.t('inject.rate1')
        },
        {
          value: 1,
          days: isTest ? this.t('inject.min15') : this.t('inject.days15'),
          rate: this.t('inject.rate15')
        },
        {
          value: 2,
          days: isTest ? this.t('inject.min30') : this.t('inject.days30'),
          rate: this.t('inject.rate30')
        }
      ];
    },
    walletAddress() {
      return this.walletState.address;
    },
    // Calculate the effective maximum stake amount
    effectiveMaxStakeAmount() {
      // User request: Only use the maxStakeAmount from the contract
      // Removed: ENABLE_TEMPORARY_STAKE_LIMIT, ENABLE_SINGLE_PURCHASE_LIMIT, Global Limit checks
      return parseFloat(this.maxStakeAmount);
    },
    isAmountInvalid() {
      return parseFloat(this.amount) > this.effectiveMaxStakeAmount;
    },
    mainButtonState() {
      const amountNum = parseFloat(this.amount);
      const allowanceNum = parseFloat(this.usdtAllowance);

      if (this.isApproving) {
        return { text: this.t('inject.approving'), action: 'approving', disabled: true };
      }
      
      if (!this.amount || amountNum <= 0) {
        // Default state when no amount is entered
        return { text: this.t('inject.enterAmount'), action: 'idle', disabled: true };
      }

      if (allowanceNum < amountNum) {
        return { text: this.t('inject.approveUsdt'), action: 'approve', disabled: false };
      }

      if (this.walletState.isNewUser) {
        return { text: this.t('inject.nextStep'), action: 'next_step', disabled: false };
      } else {
        return { text: this.t('inject.confirmStake'), action: 'stake', disabled: false };
      }
    },
    formattedUsdtBalance() {
      const displayValue = this.effectiveMaxStakeAmount;
      
      console.log(`[MaxStake] Final Display Value: ${displayValue}`);

      if (isNaN(displayValue)) {
           return '0.00';
      }
      return displayValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  },
  watch: {
    walletAddress(newAddress) {
      if (newAddress) {
        this.fetchInitialData();
      } else {
        this.resetBalance();
        this.usdtAllowance = '0';
        this.maxStakeAmount = '0';
        this.userStakedBalance = '0';
      }
    }
  },
  methods: {
    async fetchInitialData() {
      if (!this.walletState.address) return;
      this.isLoading = true;
      await Promise.all([
        this.fetchUsdtBalance(),
        this.fetchUsdtAllowance(),
        this.fetchMaxStakeAmount(),
        this.fetchUserStakedBalance(),
      ]);
      
      console.log(`[InjectPoolModal] Initial Data Loaded:
        User USDT Balance: ${this.usdtBalance}
        User USDT Allowance: ${this.usdtAllowance}
        Max Stake Amount (Contract): ${this.maxStakeAmount}
        User Staked Balance: ${this.userStakedBalance}
      `);

      this.isLoading = false;
    },
    async fetchUsdtBalance() {
      const rawBalance = await getUsdtBalance();
      // console.log(`[Balance Log] Raw USDT Balance: ${rawBalance}`);
      this.usdtBalance = rawBalance;
    },
    async fetchUsdtAllowance() {
      this.usdtAllowance = await getUsdtAllowance();
    },
    async fetchMaxStakeAmount() {
      this.maxStakeAmount = await getMaxStakeAmount();
    },
    async fetchUserStakedBalance() {
      this.userStakedBalance = await getUserStakedBalance();
    },
    resetBalance() {
      this.usdtBalance = '0';
    },
    close() {
      this.$emit('close');
    },
    handleAmountInput(event) {
      let value = event.target.value;
      value = value.replace(/[^0-9.]/g, '');
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }
      this.amount = value;
    },
    fillMax() {
      this.amount = this.effectiveMaxStakeAmount.toString();
    },
    async handleMainAction() {
      if (this.mainButtonState.disabled) {
        // If the button is logically disabled, check why and show appropriate toast.
        // Potentially other disabled reasons can be checked here in the future.
        return;
      }
      
      // --- Validation Logic ---
      const inputAmount = parseFloat(this.amount);
      const userBalance = parseFloat(this.usdtBalance);
      const maxAllowed = this.effectiveMaxStakeAmount;

      if (inputAmount > userBalance) {
          showToast(this.t('inject.insufficientBalance'));
          return;
      }
      if (inputAmount > maxAllowed) {
          showToast(this.t('inject.maxAmountExceeded', { amount: maxAllowed.toFixed(2) }));
          return;
      }
      // --- End Validation Logic ---
      
      console.log(`[InjectPoolModal] Main Action Triggered: '${this.mainButtonState.action}'`);

      const action = this.mainButtonState.action;

      switch (action) {
        case 'approve':
          console.log("[注入资产弹窗] 执行操作: 请求USDT授权");
          this.isApproving = true;
          const success = await approveUsdt();
          if (success) {
            showToast(this.t('inject.approveSuccess'));
            await this.fetchUsdtAllowance();
          } else {
            showToast(this.t('inject.approveFailed'));
          }
          this.isApproving = false;
          break;
        case 'next_step':
          console.log("[注入资产弹窗] 执行操作: 进入下一步 -> 确认推荐人");
          this.$emit('confirm', {
            amount: this.amount,
            duration: this.selectedDuration
          });
          break;
        case 'stake':
          console.log("[注入资产弹窗] 执行操作: 直接进入质押流程");
          this.$emit('confirm', {
            amount: this.amount,
            duration: this.selectedDuration
          });
          break;
      }
    },
  },
  mounted() {
    if (this.walletAddress) {
      this.fetchInitialData();
    } else {
      this.isLoading = false;
    }
  }
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

.title_holder { text-align: center; margin-bottom: 30px; }
.title_holder h3 { font-size: 24px; color: #ffffff; font-weight: 600; letter-spacing: -0.5px; }

.form-group {
  margin: 20px 0 30px 0;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* margin-bottom: 10px; */
  padding: 0 5px;
}

.form-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.balance-row {
  margin-top: 8px;
  text-align: left;
}

.balance-text {
  color: rgba(255, 255, 255, 0.5); /* Muted color for balance under input */
  font-size: 12px;
  font-weight: 400;
  cursor: default;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.form-input {
  width: 100%;
  padding: 15px 20px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: var(--white);
  font-size: 16px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  transition: border-color 0.3s;
}

.form-input.with-suffix-btn {
  padding-right: 70px;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
}

.max-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(var(--primary-rgb, 59, 130, 246), 0.2);
  border: 1px solid rgba(var(--primary-rgb, 59, 130, 246), 0.4);
  color: var(--primary);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.max-btn:hover {
  background: rgba(var(--primary-rgb, 59, 130, 246), 0.4);
  color: #fff;
}

.duration-button-group {
  display: flex;
  gap: 10px;
  width: 100%;
}

.duration-btn {
  flex: 1;
  padding: 10px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
  align-items: center;
}

.duration-btn .duration-days {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.2;
}

.duration-btn .duration-rate {
  font-size: 11px;
  opacity: 0.8;
  line-height: 1.2;
}

.duration-btn:hover {
  color: var(--white);
  border-color: var(--primary);
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
}

.duration-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--white);
}

.duration-btn.active .duration-days {
  font-weight: 600;
}

.duration-btn.active .duration-rate {
  opacity: 1;
}

.button-group {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 30px;
}

/* Glass Button Styles */
.glass-btn {
  flex: 1;
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

.btn-confirm {
  font-weight: 600;
}

.btn-confirm.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

.btn-cancel {
  color: rgba(255, 255, 255, 0.7);
}
.btn-cancel:hover {
    color: #fff;
}

.form-input.input-error {
  color: #b60e0e; /* A clear red color for error state */
}
</style>
