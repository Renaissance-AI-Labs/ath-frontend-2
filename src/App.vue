<template>
  <div>
    <ToastNotification />
    <GoTop />
    <div id="wrapper">
      <span class="line_page"></span>
      <div class="overlay_body"></div>
      <div class="texture_page">
          <div class="bg-texture"></div>
          <div class="temp"></div>
          <div class="bg-texture"></div>
      </div>
      <div class="hero-video" v-if="$route.path === '/'">
          <div class="video-container dynamic-glass-bg">
              <div class="video-fade-overlay"></div>
          </div>
      </div>
      <Header v-if="$route.path !== '/xbrokers-event'" @open-get-started-modal="openModal" @open-language-modal="openLanguageModal" />
      <router-view />
      <Footer v-if="$route.path !== '/xbrokers-event'" />
    </div>
    <MobileMenu @open-get-started-modal="openModal" />
    <transition name="modal">
      <ConnectWalletModal v-if="isModalVisible" @close="closeModal" />
    </transition>
    <transition name="modal">
      <LanguageModal v-if="isLanguageModalVisible" @close="closeLanguageModal" />
    </transition>
    
    <!-- SVG Filter for Glassmorphism -->
    <svg style="display: none">
      <filter id="liquid-lens" x="-50%" y="-50%" width="200%" height="200%">
        <feImage x="0" y="0" result="normalMap" xlink:href="data:image/svg+xml;utf8,
                <svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>
                  <radialGradient id='nmap' cx='50%' cy='50%' r='50%'>
                    <stop offset='0%' stop-color='rgb(128,128,255)'/>
                    <stop offset='100%' stop-color='rgb(255,255,255)'/>
                  </radialGradient>
                  <rect width='100%' height='100%' fill='url(#nmap)'/>
                </svg>" />
        <feDisplacementMap in="SourceGraphic" in2="normalMap" scale="60" xChannelSelector="R" yChannelSelector="G"
          result="displaced" />
        <feMerge>
          <feMergeNode in="displaced" />
        </feMerge>
      </filter>
    </svg>
  </div>
</template>

<script>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import GoTop from './components/GoTop.vue';
import MobileMenu from './components/MobileMenu.vue';
import ConnectWalletModal from './components/ConnectWalletModal.vue';
import LanguageModal from './components/LanguageModal.vue';
import { autoConnectWallet } from './services/wallet.js';
import ToastNotification from './components/ToastNotification.vue';
import { initializeLanguage } from './i18n';
// import AuroraBackground from './components/AuroraBackground.vue';

export default {
  name: 'App',
  components: {
    Header,
    Footer,
    GoTop,
    MobileMenu,
    ConnectWalletModal,
    LanguageModal,
    ToastNotification,
    // AuroraBackground
  },
  data() {
    return {
      isModalVisible: false,
      isLanguageModalVisible: false,
    };
  },
  methods: {
    openModal() {
      this.isModalVisible = true;
    },
    closeModal() {
      this.isModalVisible = false;
    },
    openLanguageModal() {
      this.isLanguageModalVisible = true;
    },
    closeLanguageModal() {
      this.isLanguageModalVisible = false;
    }
  },
  mounted() {
    initializeLanguage();
    autoConnectWallet();

    // Listen for custom event to open wallet modal
    document.addEventListener('open-wallet-modal', this.openModal);

    // Check for referral code in URL
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const refAddress = urlParams.get('ref');
      if (refAddress && refAddress.startsWith('0x')) { // Basic validation
        console.log(`检测到推荐人地址: ${refAddress}`);
        // Store it for later use when staking
        localStorage.setItem('ath_referrerAddress', refAddress);
      }
    } catch (error) {
      console.error("Error processing URL parameters:", error);
    }

    this.$nextTick(() => {
      const loadScript = (src, callback) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = callback;
        document.body.appendChild(script);
      };
      loadScript('/asset/js/jquery.min.js', () => {
        loadScript('/asset/js/bootstrap.min.js', () => {
          loadScript('/asset/js/lazysize.min.js', () => {
            loadScript('/asset/js/infinityslide.js', () => {
              loadScript('/asset/js/gsap.min.js', () => {
                loadScript('/asset/js/wow.min.js', () => {
                  loadScript('/asset/js/ScrollTrigger.min.js', () => {
                    loadScript('/asset/js/ScrollSmooth.js', () => {
                      loadScript('/asset/js/odometer.min.js', () => {
                        loadScript('/asset/js/main.js', () => {
                          // All scripts are loaded, now we can safely assume jQuery and plugins are available.
                          // We might need to manually re-initialize plugins if they don't auto-init on load.
                          // For now, let's hope sequential loading is enough.
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  },
  beforeUnmount() {
    document.removeEventListener('open-wallet-modal', this.openModal);
  }
}
</script>

<style scoped>
.hero-video {
  height: 700px;
  width: 100% !important; /* Override global width: 100% */
  left: 50% !important; /* Center horizontally */
  transform: translateX(-50%);
  top: 30px;
  max-width: none !important;
  /* opacity: 0.6 !important; Remove opacity to let the new background shine */
}

.dynamic-glass-bg {
  width: 100%;
  height: 100%;
  background-image: url("https://raw.githubusercontent.com/maxuiux/codepen/refs/heads/main/images/macbook/macOS-Tahoe-26-Light.png");
  /* background-color: rgba(0, 255, 128, 0.4); */
  background-blend-mode: overlay;
  background-size: 110%;
  background-repeat: repeat-x;
  animation: moveBackground 40s ease-in-out infinite alternate, colorCycle 30s linear infinite;
  position: absolute;
  top: 0;
  left: 0;
}

@keyframes colorCycle {
  0% { background-color: rgba(137, 43, 226, 0.378); }   /* Purple */
  25% { background-color: rgba(132, 0, 255, 0.4); }   /* Gold */
  45% { background-color: rgba(255, 251, 0, 0.404); }   /* Gold */
  70% { background-color: rgba(0, 255, 128, 0.75); }   /* Green */
  85% { background-color: rgba(0, 208, 255, 0.798); }   /* Blue */
  100% { background-color: rgba(137, 43, 226, 0.432); } /* Purple */
}

@media(max-width:1110px) {
  .dynamic-glass-bg {
    background-size: cover;
  }
}

@keyframes moveBackground {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 100% 0;
  }
}

.video-width {
  width: 100%; /* Fill the container */
  height: 100%;
}

.video-container {
  position: relative;
  line-height: 0;
  width: 100%;
  height: 100%;
}

.video-fade-overlay {
  content: '';
  position: absolute;
  top: -2px;
  left: 0;
  width: 100%;
  height: 102%;
  pointer-events: none; /* Allows clicks to go through to video if needed */
  background: radial-gradient(ellipse 85% 65% at center, 
    rgba(12, 12, 14, 0) 25%, 
    rgba(12, 12, 14, 1) 75%);
}

.video-effect {
  filter: hue-rotate(193deg) saturate(1.13) brightness(1.0);
}

/* 全局隐藏装饰性骨骼线 */
.br-line,
.line_page,
.line_section,
.br-line.has-dot::after, 
.br-line.has-dot::before,
.br-line.type-hor::before,
.br-line.type-hor::after {
    display: none !important;
    opacity: 0 !important;
    border: none !important;
}

/* 隐藏 Header 区域的所有边框和装饰线 */
#header .br-line,
#header .line_page,
#header .line_section,
#header .menu-indicator {
    display: none !important;
    border: none !important;
    box-shadow: none !important;
}

/* 隐藏导航菜单的背景边框 */
.box-navigation {
    border: none !important;
    background: transparent !important;
}
</style>
