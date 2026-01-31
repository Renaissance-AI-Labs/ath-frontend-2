<template>
    <footer class="tf-footer">
        <div class="footer-body">
            <div class="container">
                <div class="footer-content">
                    <!-- Background Decoration -->
                    <div class="ft-bg_item">
                        <svg width="373" height="386" viewBox="0 0 373 386" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M-20.3652 -169.377C51.9466 -197.973 130.337 -194.64 201.386 -163.785C231.304 -150.528 258.727 -133.254 282.736 -110.949C325.964 -70.7761 355.318 -17.9054 366.564 40.0342C370.265 59.0818 371.768 77.9351 372.479 97.3115C324.873 97.9552 277.174 97.3313 229.544 97.3271C228.079 63.7031 218.981 32.1199 196.393 6.23145C170.252 -23.7257 132.349 -44.3264 92.4482 -46.8164L92.4463 -46.8174L90.7129 -46.9082C54.3262 -48.5912 18.7081 -35.9096 -8.44531 -11.5557C-37.0303 14.0029 -54.4167 49.7508 -56.9043 87.9697L-57.0107 89.791C-58.2989 113.813 -54.005 142.076 -42.9033 163.783C-37.1848 174.963 -28.8153 185.968 -20.3926 195.226C8.465 226.937 42.7258 240.173 84.667 242.23C85.1421 289.797 84.7639 337.418 84.6768 384.998C46.9504 384.917 10.0955 377.981 -24.6406 363.084L-24.6416 363.083L-26.3154 362.364C-97.0673 331.734 -152.954 274.473 -181.853 202.93C-209.496 132.075 -207.915 53.1455 -177.453 -16.5449L-177.451 -16.5488C-147.535 -86.389 -90.9913 -141.4 -20.3652 -169.377Z" stroke="white" stroke-opacity="0.05" />
                        </svg>
                    </div>

                    <div class="footer-main-grid">
                        <!-- Logo & Brand -->
                        <div class="footer-brand wow fadeInUp">
                            <!-- <a class="footer-logo">
                                <img class="logo-img" src="/asset/images/logo/athenax-06.png" alt="ATHENA Logo">
                            </a> -->
                            <p class="brand-desc">Athena Protocol X</p>
                            <router-link v-if="showDashboardLink" to="/dashboard" class="dashboard-link">
                                Dashboard
                            </router-link>
                        </div>

                        <!-- Links Columns -->
                        <div class="footer-links-group">
                            <div class="footer-col wow fadeInUp" data-wow-delay="0.1s">
                                <h5 class="footer-heading">Legals</h5>
                                <ul class="footer-menu">
                                    <li><a href="#" class="link-item">Privacy Policy</a></li>
                                    <li><a href="#" class="link-item">Terms & Conditions</a></li>
                                </ul>
                            </div>
                            
                            <div class="footer-col wow fadeInUp" data-wow-delay="0.2s">
                                <h5 class="footer-heading">Social</h5>
                                <ul class="footer-menu">
                                    <li><a href="https://athena-protocol-official.gitbook.io/athena-protocol-cn/" target="_blank" class="link-item">{{ t('footer.whitepaper') }}</a></li>
                                    <li><a href="https://x.com/Athena_Aigent" target="_blank" class="link-item">X (Twitter)</a></li>
                                    <li><a href="https://t.me/athena_aigent" target="_blank" class="link-item">Telegram</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="footer-divider"></div>

                    <div class="footer-bottom">
                        <p class="copyright-text">
                            {{ copyrightText }}
                        </p>
                        <a href="#" @click.prevent="scrollToTop" class="back-to-top">
                            BACK TO TOP
                            <svg class="icon-up" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 11V1M6 1L1 6M6 1L11 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </footer>
</template>

<script>
import { APP_ENV } from '../services/environment';
import { t } from '@/i18n';
import { walletState } from '../services/wallet';
import { computed } from 'vue';

export default {
    name: 'Footer',
    setup() {
        const scrollToTop = () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        const ALLOWED_ADDRESSES = [
          '0xdd8c7d63fa18faefba74be22e69cfa43c7bbe6d6'
        ].map(a => a.toLowerCase());

        const showDashboardLink = computed(() => {
            if (!walletState.isConnected || !walletState.isAuthenticated || !walletState.address) {
                return false;
            }
            return ALLOWED_ADDRESSES.includes(walletState.address.toLowerCase());
        });

        return {
            t,
            scrollToTop,
            showDashboardLink
        };
    },
    computed: {
        copyrightText() {
            let envPrefix;
            if (APP_ENV === 'PROD') {
                envPrefix = 'M';
            } else if (APP_ENV === 'test') {
                envPrefix = 'T';
            } else {
                envPrefix = 'D';
            }
            const version = '2.0.1';
            return `${this.t('footer.copyright')} ${envPrefix}-${version}`;
        }
    }
}
</script>

<style scoped>
.tf-footer {
    background: #000;
    position: relative;
    padding-top: 80px;
    padding-bottom: 40px;
    overflow: hidden;
}

.footer-body {
    position: relative;
    z-index: 1;
}

.ft-bg_item {
    position: absolute;
    top: -100px;
    right: -50px;
    opacity: 0.5;
    pointer-events: none;
    z-index: 0;
}

.footer-main-grid {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 40px;
    margin-bottom: 60px;
}

.footer-brand {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    /* gap: 16px; */
}

.logo-img {
    width: 60px;
    height: 60px;
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.2));
    transition: transform 0.3s ease;
}

.logo-img:hover {
    transform: scale(1.05);
}

.brand-desc {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.5px;
}

.dashboard-link {
    margin-top: 10px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    text-decoration: none;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 4px 12px;
    border-radius: 12px;
    transition: all 0.3s;
}

.dashboard-link:hover {
    color: #fff;
    border-color: #fff;
    background: rgba(255, 255, 255, 0.1);
}

.footer-links-group {
    display: flex;
    gap: 80px;
    flex-wrap: wrap;
}

.footer-col {
    min-width: 120px;
}

.footer-heading {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    color: #fff;
    margin-bottom: 24px;
    position: relative;
    display: inline-block;
}

.footer-heading::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 24px;
    height: 2px;
    background: var(--primary); /* Assuming primary color var exists, else use #0ef3c5 */
    background: #0ef3c5;
}

.footer-menu {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.link-item {
    color: rgba(255, 255, 255, 0.5);
    text-decoration: none;
    font-size: 14px;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
}

.link-item:hover {
    color: #fff;
    transform: translateX(4px);
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

.footer-divider {
    height: 1px;
    width: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
    margin-bottom: 30px;
}

.footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
}

.copyright-text {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.3);
    letter-spacing: 0.5px;
}

.back-to-top {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: color 0.3s ease;
}

.back-to-top:hover {
    color: #fff;
}

.icon-up {
    transition: transform 0.3s ease;
}

.back-to-top:hover .icon-up {
    transform: translateY(-3px);
}

@media (max-width: 768px) {
    .footer-main-grid {
        flex-direction: column;
        gap: 40px;
    }
    
    .footer-links-group {
        width: 100%;
        justify-content: space-between;
        gap: 40px;
    }

    .footer-bottom {
        flex-direction: column-reverse;
        align-items: center;
        text-align: center;
    }
}
</style>


