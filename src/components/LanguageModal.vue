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
            <h3>{{ t('language.switchTitle') }}</h3>
            <p class="connect-text-1">{{ t('language.selectLanguage') }}</p>
          </div>
          <div class="language-list">
            <ul>
              <li v-for="language in languages" :key="language.code">
                <a href="#" @click.prevent="selectLanguage(language.code)" class="glass-btn">
                  <div class="glass-filter"></div>
                  <div class="glass-specular"></div>
                  <div class="btn-content">
                    <span class="language-name">{{ language.name }}</span>
                    <i class="icon icon-arrow-right"></i>
                  </div>
                </a>
              </li>
            </ul>
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
import { ref } from 'vue';
import { availableLanguages, setLanguage, t } from '@/i18n';

export default {
  name: 'LanguageModal',
  setup(props, { emit }) {
    const close = () => {
      emit('close');
    };

    const selectLanguage = (languageCode) => {
      setLanguage(languageCode);
      close();
    };

    return {
      languages: availableLanguages,
      close,
      selectLanguage,
      t,
    };
  },
};
</script>

<style scoped>
/* Reusing styles from ConnectWalletModal */
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
  margin-bottom: 30px;
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
}

.connect-text-1 {
  margin-top: 40px;
}

.language-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

.language-list li {
  margin-bottom: 15px;
}

/* Glass Button Styles */
.glass-btn {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 20px;
  text-decoration: none;
  color: var(--white);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  border: none;
  background: transparent;
  cursor: pointer;
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
  display: flex;
  align-items: center;
  width: 100%;
}

.glass-btn:hover {
  transform: translateY(-2px);
}

.language-name {
  flex: 1;
  font-size: 16px;
  text-align: center;
  color: #fff;
}

.language-list .icon-arrow-right {
  font-size: 20px;
  color: var(--text-2);
}

.glass-btn:hover .icon-arrow-right {
    color: #fff;
}

/* Transitions */
.modal-enter-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-content {
  transition: transform 0.4s 0.1s ease, opacity 0.4s 0.1s ease;
}

.modal-enter-from {
  opacity: 0;
}

.modal-enter-from .modal-content {
  transform: translateY(20px);
  opacity: 0;
}

.modal-leave-active {
  transition: opacity 0.3s 0.1s ease;
}

.modal-leave-active .modal-content {
  transition: transform 0.4s ease, opacity 0.4s ease;
}

.modal-leave-to {
  opacity: 0;
}

.modal-leave-to .modal-content {
  transform: translateY(20px);
  opacity: 0;
}
</style>
