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
            <h3>{{ t('referrer.title') }}</h3>
          </div>
          
          <div class="form-group">
            <label class="form-label">{{ t('referrer.addressLabel') }}</label>
            <div class="address-box">
              <span v-if="isLoading">{{ t('referrer.loading') }}</span>
              <span v-else>{{ formattedReferrerAddress }}</span>
            </div>
          </div>

          <div class="button-group">
            <button class="btn-liquid btn-cancel" style="font-size: 14px !important;" @click="$emit('close')">{{ t('referrer.cancel') }}</button>
            <button class="btn-liquid btn-confirm" style="font-size: 14px !important;" @click="handleConfirm" :disabled="isLoading || !pendingReferrer">{{ t('referrer.confirm') }}</button>
          </div>
        </div>
        
        <button @click="$emit('close')" class="close-button">
          <i class="icon icon-close"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getRootReferrer
} from '../services/contracts';
import {
  formatAddress
} from '../services/wallet';
import { t } from '@/i18n';

export default {
  name: 'ConfirmReferrerModal',
  props: {
    // referrerAddress prop is no longer needed as the component will fetch it.
  },
  emits: ['close', 'confirm'],
  setup() {
    return {
      t,
    };
  },
  data() {
    return {
      pendingReferrer: null,
      isLoading: true,
    };
  },
  computed: {
    formattedReferrerAddress() {
      if (!this.pendingReferrer) {
        return 'N/A';
      }
      return formatAddress(this.pendingReferrer);
    }
  },
  methods: {
    async fetchReferrer() {
      this.isLoading = true;
      // 1. Check URL for ?ref= parameter first
      const urlParams = new URLSearchParams(window.location.search);
      const refFromUrl = urlParams.get('ref');

      if (refFromUrl && refFromUrl.startsWith('0x') && refFromUrl.length === 42) {
        console.log(`[确认推荐人弹窗] 成功从URL中解析到推荐人地址: ${refFromUrl}`);
        this.pendingReferrer = refFromUrl;
      } else {
        // 2. If no valid ref in URL, get the root referrer from the contract
        console.log("[确认推荐人弹窗] URL中无推荐人, 开始从合约获取根推荐人...");
        this.pendingReferrer = await getRootReferrer();
        console.log(`[确认推荐人弹窗] 成功从合约获取到根推荐人地址: ${this.pendingReferrer}`);
      }
      this.isLoading = false;
    },
    handleConfirm() {
      // Pass the determined referrer address back to the parent
      if (this.pendingReferrer) {
        console.log(`[确认推荐人弹窗] 用户已确认推荐人地址: ${this.pendingReferrer}, 进入最终质押流程`);
        this.$emit('confirm', this.pendingReferrer);
      }
    }
  },
  mounted() {
    this.fetchReferrer();
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
  /* Glass Card Base */
  --primary: #00d2ff;
  --primary-rgb: 0, 210, 255;
  
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
  width: 100%; 
  position: relative;
  z-index: 1;
}

.title_holder { text-align: center; margin-bottom: 30px; }
.title_holder h3 { 
    font-size: 24px; 
    color: #ffffff; 
    font-weight: 600; 
    letter-spacing: -0.5px;
}

.form-group {
  margin: 20px 0 30px 0;
}

.form-label {
  display: block;
  text-align: left;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 10px;
  font-size: 14px;
  padding-left: 5px;
}

.address-box {
  width: 100%;
  padding: 15px 20px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: var(--white);
  font-size: 14px;
  font-family: 'Courier New', Courier, monospace;
  text-align: center;
  word-wrap: break-word;
  box-sizing: border-box;
}

.button-group {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 30px;
}

.btn-liquid {
    flex: 1;
    text-align: center;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 
        0 4px 6px rgba(0,0,0,0.1), 
        inset 0 1px 0 rgba(255,255,255,0.2);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 12px;
    border-radius: 100px;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    color: var(--text-2);
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
}

.btn-liquid:hover {
    transform: translateY(-2px) scale(1.02);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 
        0 8px 15px rgba(0,0,0,0.2), 
        inset 0 1px 0 rgba(255,255,255,0.3),
        0 0 20px rgba(0, 210, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.3);
}

.btn-cancel {
  color: rgba(255, 255, 255, 0.7);
}
.btn-cancel:hover {
    color: #fff;
}

.btn-confirm {
    color: var(--white);
    /* Make the confirm button stand out a bit more with a slight tint or just white text */
}
.btn-confirm:hover {
    color: var(--white);
    background: rgba(0, 210, 255, 0.2); /* Slight blue tint on hover */
    border-color: rgba(0, 210, 255, 0.4);
}

.btn-confirm:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
</style>
