<template>
    <header id="header" class="tf-header">
        <div class="container">
            <div class="row d-flex align-items-center">
                <div class="col-5 col-lg-3">
                    <div class="header-left">
                        <router-link to="/" class="logo-site">
                            <img src="/asset/images/logo/athenax-07.png" alt="LOGO">
                        </router-link>
                    </div>
                </div>
                <div class="col-6 d-none d-lg-block">
                    <nav class="box-navigation" style="display: none;">
                        <ul class="box-nav-menu main-nav_menu">
                            <li class="menu-item">
                                <router-link to="/" class="item-link tf-btn style-transparent text-body-3 animate-btn">
                                    Home
                                </router-link>
                            </li>
                            <li class="menu-item">
                                <router-link to="/blog" class="item-link tf-btn style-transparent text-body-3 animate-btn">
                                    Blog
                                </router-link>
                            </li>
                            <li class="menu-item">
                                <a href="javascript:void(0)" class="item-link tf-btn style-transparent text-body-3 animate-btn">
                                    Page
                                    <i class="icon icon-arrow-caret-down fs-7"></i>
                                </a>
                                <div class="sub-menu">
                                    <ul class="sub-menu_list">
                                        <li><router-link to="/about-us" class="sub-menu_link">About Us</router-link></li>
                                        <li><router-link to="/faq" class="sub-menu_link">FAQs</router-link></li>
                                        <li><router-link to="/pricing" class="sub-menu_link">Pricing</router-link></li>
                                        <li><router-link to="/use-case" class="sub-menu_link">Use Case</router-link></li>
                                        <li><router-link to="/use-case-detail" class="sub-menu_link">Use Case Detail</router-link></li>
                                        <li><router-link to="/404" class="sub-menu_link">404</router-link></li>
                                    </ul>
                                </div>
                            </li>
                            <li class="menu-item">
                                <router-link to="/contact-us" class="item-link tf-btn style-transparent text-body-3 animate-btn">
                                    Contact Us
                                </router-link>
                            </li>
                        </ul>
                    </nav>
                </div>
                <div class="col-7 col-lg-3">
                    <div class="header-right">
                        <div class="btn_group">
                            <!-- <a href="#" class="tf-btn text-body-3 animate-btn d-none d-sm-flex">
                                Log in
                            </a> -->
                            <!-- Global icon for future internationalization -->
                            <img src="/asset/icon/custom/global.png" alt="Global" class="global-icon" style="width: 20px; height: 20px; margin-right: 2px; cursor: pointer; opacity: 0.8;" @click="openLanguageModal">
                            <a v-if="!walletState.isConnected" href="#" @click.prevent="openModal" class="tf-btn text-body-3 style-2 animate-btn animate-dark glass-btn">
                                {{ t('header.connectWallet') }}
                            </a>
                            <a v-else href="#" @click.prevent="openModal" class="wallet-address tf-btn text-body-3 style-2 animate-btn animate-dark glass-btn">
                                {{ formattedAddress }}
                            </a>
                            <a href="#mobileMenu" class="btn-menu_mobile d-none" data-bs-toggle="offcanvas">
                                <i class="icon icon-menu"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>
    
    <!-- Include the filter locally in Header if not globally available, or to ensure it works -->
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
        <feDisplacementMap in="SourceGraphic" in2="normalMap" scale="30" xChannelSelector="R" yChannelSelector="G"
          result="displaced" />
        <feMerge>
          <feMergeNode in="displaced" />
        </feMerge>
      </filter>
    </svg>
</template>

<script>
import { walletState, formatAddress } from '@/services/wallet.js';
import { computed } from 'vue';
import { t } from '@/i18n';

export default {
  name: 'Header',
  setup() {
    const formattedAddress = computed(() => formatAddress(walletState.address));

    return {
      walletState,
      formattedAddress,
      t,
    };
  },
  methods: {
    openModal() {
      this.$emit('open-get-started-modal');
    },
    openLanguageModal() {
      this.$emit('open-language-modal');
    }
  }
}
</script>

<style scoped>
/* Glass Button Effect */
.glass-btn {
  /* Override default button backgrounds but keep layout properties */
  background: transparent !important;
  border: none !important;
  position: relative;
  /* overflow: hidden; */ /* Keep overflow visible if needed, but liquid effect usually needs it hidden on pseudoelements. Using border-radius inherit on pseudo elements */
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 0 15px rgba(255, 255, 255, 0.05);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 1;
  /* Ensure text color is readable */
  color: #fff !important;
  /* Maintain original padding/sizing from .tf-btn if possible, or force if broken */
}

.glass-btn:hover {
  transform: scale(1.05);
  box-shadow: 
    0 6px 12px rgba(0, 0, 0, 0.2),
    0 0 20px rgba(255, 255, 255, 0.1);
}

.glass-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  /* Use the liquid lens filter defined globally in App.vue or re-define if scoped issues arise. 
     Assuming #liquid-lens is available globally or needs to be included in Header if not. 
     If SVG is only in HeroSection, it might not work here unless moved to App.vue or duplicated. 
     Let's assume it's global or we might need to add the SVG here too. */
  filter: url(#liquid-lens); 
  border-radius: inherit; /* Matches button border-radius */
  background: rgba(255, 255, 255, 0.1); /* Subtle background tint */
}

.glass-btn::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 0 5px rgba(255, 255, 255, 0.4);
  border-radius: inherit;
  pointer-events: none;
}
</style>


