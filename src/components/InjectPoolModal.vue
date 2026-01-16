<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <!-- Starry Background Effect -->
      <div class="stars-bg">
          <div class="stars"></div>
          <div class="stars2"></div>
          <div class="stars3"></div>
      </div>
      <div class="modal-body">
        <div class="title_holder">
          <h3>{{ t('inject.title') }}</h3>
        </div>

        <!-- Amount Input Group -->
        <div class="form-group">
          <label class="form-label">{{ t('inject.amountLabel') }}</label>
          <div class="amount-input-group">
            <div class="input-wrapper">
              <input 
                type="text" 
                inputmode="decimal"
                :value="amount"
                @input="handleAmountInput"
                :placeholder="t('inject.amountPlaceholder')" 
                class="form-input"
                :class="{ 'input-error': isAmountInvalid }"
              >
            </div>
            <div class="balance-info">
              <a href="#" @click.prevent="fillMax" class="btn-ip ip-modern text-body-3 balance-btn">
              {{ t('inject.maxAmount', { amount: formattedUsdtBalance }) }}
              </a>
            </div>
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
          <a href="#" @click.prevent="close" class="btn-ip ip-modern text-body-3 btn-cancel">
            {{ t('inject.cancel') }}
          </a>
          <a href="#" @click.prevent="handleMainAction" class="btn-ip ip-modern text-body-3 btn-confirm">
            {{ mainButtonState.text }}
          </a>
        </div>

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
/* Reusing styles from ConnectWalletModal and adding new ones */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
  background-color: rgba(12, 12, 14, 0.8);
  display: flex; justify-content: center; align-items: center; z-index: 1050;
}
.modal-content {
  position: relative; width: 90%; max-width: 380px; padding: 20px;
  border: 1px solid var(--line); backdrop-filter: blur(16px);
  border-radius: 28px; background: var(--bg-2);
}
.modal-body { width: 100%; }
.close-button {
  position: absolute; top: 20px; right: 20px; background: transparent;
  border: none; color: var(--white); font-size: 24px; cursor: pointer;
}
.title_holder { text-align: center; margin-bottom: 30px; }
.title_holder h3 { font-size: 24px; color: #ffffff; }

.form-group {
  margin: 20px 0 30px 0;
}
.form-label {
  display: block;
  text-align: left;
  color: var(--text-2);
  margin-bottom: 10px;
  font-size: 14px;
  padding-left: 5px; /* Align with balance button */
}
.input-wrapper {
  position: relative;
}
.form-input, .form-select {
  width: 100%;
  padding: 15px 20px;
  background-color: #0c0c0e;
  border: 1px solid var(--line);
  border-radius: 12px;
  color: var(--white);
  font-size: 16px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
.form-input:focus, .form-select:focus {
  outline: none;
  border-color: var(--primary);
}
.form-select {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23888' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
}

.balance-info {
  margin-top: 8px;
  text-align: left;
}
.balance-btn {
  background: none;
  border: none;
  color: var(--text-2);
  cursor: pointer;
  padding: 5px;
  font-size: 14px;
  text-decoration: underline;
}
.balance-btn:hover {
  color: var(--primary);
}

.amount-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.amount-input-group .input-wrapper {
  flex-grow: 1;
}
.amount-input-group .balance-info {
  flex-shrink: 0;
}
.balance-btn {
  padding: 8px 12px; /* Adjust padding to fit the text */
  white-space: nowrap; /* Prevent text from wrapping */
  font-size: 12px;
}

.duration-button-group {
  display: flex;
  gap: 10px;
  width: 100%;
}

.duration-btn {
  flex: 1;
  padding: 10px 8px;
  background: linear-gradient(0deg, rgba(20, 20, 21, 0.82), rgba(20, 20, 21, 0.82)),
      linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 100%);
  border: 1px solid var(--line);
  border-radius: 12px;
  color: var(--text-2);
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
.btn-ip {
    flex: 1; /* Make buttons take equal width */
    text-align: center;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: linear-gradient(0deg, rgba(20, 20, 21, 0.82), rgba(20, 20, 21, 0.82)),
        linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 100%);
    border: 1px solid var(--line);
    box-shadow: 0px 1px 1px 0px #FFFFFF2E inset, 0px 0px 4px 0px #FFFFFF0F inset, 0px 0px 8px 0px #FFFFFF14 inset, 0px 0px 16px 0px #FFFFFF1F inset;
    padding: 12px;
    border-radius: 999px;
    transition: all .3s ease;
    color: var(--text-2);
    text-decoration: none;
}
.btn-ip:hover {
    color: var(--primary);
    border-color: var(--primary);
}
.btn-confirm {
    color: var(--white);
    background: var(--primary);
    border-color: var(--primary);
}
.btn-confirm:hover {
    color: var(--white);
    filter: brightness(1.1);
}

/* Starry background effect from HowToUseSection */
.stars-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  border-radius: 28px; /* Match modal content's border-radius */
  overflow: hidden; /* Ensure stars don't leak outside rounded corners */
}
.modal-body {
    position: relative;
    z-index: 1; /* Ensure modal content is on top of the background */
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

.form-input.input-error {
  color: #b60e0e; /* A clear red color for error state */
}
</style>
