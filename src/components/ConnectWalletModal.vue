<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <!-- Glow Effects -->
      <div class="glow-effect-top-left"></div>
      <div class="glow-effect-bottom"></div>
      
      <div class="modal-body">

        <!-- Not Connected View -->
        <div v-if="!walletState.isConnected">
          <div class="title_holder">
            <h3>{{ t('wallet.connectTitle') }}</h3>
            <p class="connect-text-1">{{ t('wallet.connectSubtitle') }}</p>
          </div>
          <div class="wallet-list" v-if="availableWallets.length > 0">
            <ul>
              <li v-for="wallet in availableWallets" :key="wallet.id">
                <a href="#" @click.prevent="handleConnect(wallet.id)">
                  <div class="wallet-icon-wrapper">
                    <img :src="getWalletIcon(wallet.id)" :alt="wallet.name" class="wallet-icon" :class="`${wallet.id}-icon`">
                  </div>
                  <span class="wallet-name">{{ wallet.name }}</span>
                  <div class="arrow-icon">
                    <i class="icon icon-arrow-right"></i>
                  </div>
                </a>
              </li>
            </ul>
          </div>
          <div v-else class="no-wallet-view">
            <p>{{ t('wallet.noWalletDetected') }}</p>
            <p>{{ t('wallet.installWallet') }}</p>
          </div>
        </div>

        <!-- Connected View -->
        <div v-else class="connected-view">
          <div class="title_holder">
            <h3>{{ t('wallet.connectedTitle') }}</h3>
          </div>
          <div class="info-group">
              <div class="info-card">
                <h4 class="info-title">{{ t('wallet.address') }}</h4>
                <p class="info-content">{{ formattedAddress }}</p>
              </div>
              <div class="info-card">
                <h4 class="info-title">{{ t('wallet.network') }}</h4>
                <p class="info-content">{{ uppercaseNetwork }}</p>
              </div>
          </div>
          <a href="#" @click.prevent="handleDisconnect" class="disconnect-btn">
              {{ t('wallet.disconnect') }}
          </a>
        </div>

      </div>
      <button @click="close" class="close-button">
        <i class="icon icon-close"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { reactive, onMounted, ref, computed } from 'vue';
import { walletState, connectWallet, disconnectWallet, detectWallets } from '@/services/wallet.js';
import { t } from '@/i18n';

export default {
  name: 'ConnectWalletModal',
  setup(props, { emit }) {
    const availableWallets = ref([]);

    const getWalletIcon = (walletId) => {
        const icons = {
            metamask: '/asset/images/wallet/MetaMask-icon-fox-with-margins.svg',
            tokenpocket: '/asset/images/wallet/tp-logo.png',
            okx: '/asset/images/wallet/okx-logo.png',
            binance: '/asset/images/wallet/binance-logo.png',
        };
        return icons[walletId] || '/asset/images/wallet/default-icon.png';
    };

    const close = () => {
      emit('close');
    };

    const handleConnect = async (walletType) => {
      const success = await connectWallet(walletType);
      if (success) {
        close();
      }
    };

    const handleDisconnect = () => {
      disconnectWallet();
      close();
    };
    
    onMounted(() => {
      availableWallets.value = detectWallets();
    });

    return {
      walletState,
      availableWallets,
      getWalletIcon,
      handleConnect,
      handleDisconnect,
      close,
      t,
    };
  },
  computed: {
    formattedAddress() {
      if (!this.walletState.address) return '';
      return `${this.walletState.address.substring(0, 6)}...${this.walletState.address.substring(this.walletState.address.length - 4)}`;
    },
    uppercaseNetwork() {
      return this.walletState.network ? this.walletState.network.toUpperCase() : '';
    }
  },
  methods: {
    // You can keep methods here if you have logic not suitable for setup,
    // but for this component, everything is moved to setup.
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
  max-width: 400px;
  padding: 32px;
  border-radius: 32px;
  background: #0f0f11; /* Deep dark background */
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  overflow: hidden; /* Contain the glow */
}

/* Glow Effects */
.glow-effect-bottom {
  position: absolute;
  bottom: -25px; /* Positioned to show the bright core at the very bottom edge */
  left: 50%;
  transform: translateX(-50%);
  width: 120%; /* Wider to cover the bottom fully */
  height: 120px; /* Compressed height for "parallel" look */
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
  z-index: 0;
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
  z-index: 0;
  mix-blend-mode: screen;
}

.modal-body {
  width: 100%;
  height: 100%;
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
  z-index: 2;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.title_holder {
  text-align: center;
  margin-bottom: 32px;
}

.title_holder h3 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.title_holder p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.connect-text-1 {
  margin-top: 8px;
}

.wallet-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wallet-list a {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  text-decoration: none;
  color: var(--white);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background: rgba(255, 255, 255, 0.03);
  position: relative;
  overflow: hidden;
}

/* Button top-left glow */
.wallet-list a::before {
  content: '';
  position: absolute;
  top: -20px;
  left: -20px;
  width: 60px;
  height: 60px;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(var(--primary-rgb, 59, 130, 246), 0.6) 30%,
    transparent 70%
  );
  filter: blur(10px);
  opacity: 0.6;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.wallet-list a:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.wallet-list a:hover::before {
  opacity: 0.8;
}

.wallet-icon-wrapper {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.wallet-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
}

.wallet-name {
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  flex-grow: 1;
}

.arrow-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  transition: color 0.3s ease;
}

.wallet-list a:hover .arrow-icon {
  color: #fff;
}

/* Connected View Styles */
.connected-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.info-group {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 32px;
}

.info-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px;
  border-radius: 16px;
  text-align: center;
}

.info-title {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-content {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
  word-break: break-all;
}

.disconnect-btn {
  width: 100%;
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 59, 48, 0.05);
  color: #ff3b30;
  border: 1px solid rgba(255, 59, 48, 0.2);
  text-align: center;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Red glow for disconnect button */
.disconnect-btn::before {
  content: '';
  position: absolute;
  top: -20px;
  left: -20px;
  width: 60px;
  height: 60px;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 59, 48, 0.6) 30%,
    transparent 70%
  );
  filter: blur(10px);
  opacity: 0.4;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.disconnect-btn:hover {
  background: rgba(255, 59, 48, 0.15);
  border-color: rgba(255, 59, 48, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(255, 59, 48, 0.15);
}

.disconnect-btn:hover::before {
  opacity: 0.8;
}

.no-wallet-view {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.no-wallet-view p {
  margin-bottom: 10px;
}

.no-wallet-view a {
  color: #fff;
  text-decoration: underline;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.4s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: translateY(20px) scale(0.95);
  opacity: 0;
}
</style>
