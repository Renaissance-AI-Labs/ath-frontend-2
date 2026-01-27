<template>
  <transition name="toast-fade">
    <div v-if="notification.visible" class="toast-notification">
      {{ notification.message }}
    </div>
  </transition>
</template>

<script>
import { notificationState } from '../services/notification';

export default {
  name: 'ToastNotification',
  setup() {
    return {
      notification: notificationState,
    };
  }
};
</script>

<style scoped>
.toast-notification {
  position: fixed;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 999px; /* Pill shape */
  
  /* New Liquid Glass Style */
  background: rgba(255, 255, 255, 0.05); /* Very transparent base */
  color: var(--white);
  font-size: 16px;
  font-weight: 600;
  z-index: 9999;
  
  /* Glass Border */
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  /* Glass Blur */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  
  /* Shadows and Glow */
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4), /* Deep shadow */
    0 0 15px rgba(0, 210, 255, 0.2), /* Lake blue glow */
    inset 0 1px 0 rgba(255, 255, 255, 0.2); /* Top highlight */
    
  white-space: nowrap;
  
  /* Gradient Text for pop */
  /* background-clip: text; - disabled for simplicity on pill bg, using solid white text */
}

/* Optional: Add a subtle inner shine via pseudo element */
.toast-notification::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 999px;
  padding: 1px;
  background: linear-gradient(
    180deg, 
    rgba(255, 255, 255, 0.2) 0%, 
    rgba(255, 255, 255, 0) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px) scale(0.9);
}
</style>
