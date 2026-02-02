<template>
  <div>
    <!-- Backdrop Overlay -->
    <transition name="fade">
      <div v-if="isOpen" class="sidebar-backdrop" @click="$emit('close')"></div>
    </transition>

    <!-- Sidebar Drawer -->
    <transition name="slide-right">
      <div v-if="isOpen" class="home-right-sidebar glass-panel">
        <!-- Glass Effects -->
        <div class="glass-filter"></div>
        <div class="glass-overlay"></div>
        <div class="glass-specular"></div>
        
        <div class="sidebar-content-wrapper">
          <div class="sidebar-header">
            <h5 class="font-3 text-gradient">{{ t('sidebar.ecoMatrix') }}</h5>
            <button class="nav-btn glass-btn" @click="$emit('close')">
                <div class="glass-filter"></div>
                <div class="glass-specular"></div>
                <div class="btn-content">
                  <i class="icon icon-close"></i>
                </div>
            </button>
          </div>
          
          <div class="sidebar-content-scroll">
            <div class="blog-sidebar sidebar-content-wrap">
              <!-- Category -->
              <div class="sidebar-item glass-card-item">
                <h5 class="sb-title font-3 text-gradient">{{ t('sidebar.gameCenter') }}</h5>
                <div class="br-line has-dot"></div>
                <ul class="sb-category">
                  <li>
                    <router-link v-if="isCrashEnabled" to="/crash" class="text-body-1 link-item" @click="$emit('close')">
                      <span class="link-text">{{ t('sidebar.crashGame') }}</span>
                      <i class="icon icon-ArrowUpRight"></i>
                    </router-link>
                    <span v-else class="text-body-1 link-item disabled">
                       <span class="link-text">{{ t('sidebar.crashGameComingSoon') }}</span>
                    </span>
                  </li>
                </ul>
              </div>

              <div class="sidebar-item glass-card-item">
                <h5 class="sb-title font-3 text-gradient">{{ t('sidebar.equityCenter') }}</h5>
                <div class="br-line has-dot"></div>
                <ul class="sb-category">
                  <li>
                    <router-link to="/welfare" class="text-body-1 link-item" @click="$emit('close')">
                      <span class="link-text">{{ t('sidebar.collectPoints') }}</span>
                      <i class="icon icon-ArrowUpRight"></i>
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/personal-center" class="text-body-1 link-item" @click="$emit('close')">
                      <span class="link-text">{{ t('sidebar.personalCenter') }}</span>
                      <i class="icon icon-ArrowUpRight"></i>
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/shareholder" class="text-body-1 link-item" @click="$emit('close')">
                      <span class="link-text">{{ t('sidebar.becomeShareholder') }}</span>
                      <i class="icon icon-ArrowUpRight"></i>
                    </router-link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { t } from '../i18n';
import { APP_ENV, ENABLE_CRASH_GAME } from '../services/environment';

export default {
  name: 'HomeRightSidebar',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup() {
    const isCrashEnabled = APP_ENV !== 'PROD' || ENABLE_CRASH_GAME;
    return { t, isCrashEnabled };
  }
};
</script>

<style scoped>
.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9998;
  backdrop-filter: blur(4px);
}

.home-right-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 85%;
  max-width: 400px;
  height: 100vh;
  z-index: 9999;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* For glass effects */
}

.sidebar-content-wrapper {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Glass Panel Styles (Base Sidebar) */
.glass-panel {
    background: #000000; /* Pure black base as requested */
}

.glass-filter {
    position: absolute;
    inset: 0;
    z-index: 0;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}

.glass-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%);
}

.glass-specular {
    position: absolute;
    inset: 0;
    z-index: 2;
    box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.1);
    pointer-events: none;
}

/* Header */
.sidebar-header {
  padding: 30px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.text-gradient {
    background: linear-gradient(120deg, #fff, #0ef3c5);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: #fff;
    font-weight: 700;
}

/* Close Button (Glass Style) */
.nav-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
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
}

.nav-btn:hover {
    transform: scale(1.1);
}

.glass-btn {
    background: rgba(255, 255, 255, 0.05);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.btn-content {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Content */
.sidebar-content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 30px 24px;
}

/* Item Card Style */
.sidebar-item {
  margin-bottom: 30px;
  padding: 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, background 0.3s ease;
}

.sidebar-item:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
}

.sb-title {
  margin-bottom: 15px;
  font-size: 18px;
}

.br-line {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
  position: relative;
}

.br-line.has-dot::after {
  content: '';
  position: absolute;
  left: 0;
  top: -1px;
  width: 30px;
  height: 3px;
  background: #0ef3c5;
  border-radius: 2px;
}

/* Links */
.sb-category li {
  margin-bottom: 12px;
}

.sb-category li:last-child {
  margin-bottom: 0;
}

.link-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.link-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border-color: rgba(14, 243, 197, 0.3);
  box-shadow: 0 0 15px rgba(14, 243, 197, 0.1);
}

.link-item i {
  font-size: 14px;
  color: #0ef3c5;
  transition: transform 0.3s ease;
}

.link-item:hover i {
  transform: translate(3px, -3px);
}

.link-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: transparent;
}

.link-item.disabled:hover {
  background: transparent;
  box-shadow: none;
  border-color: transparent;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>