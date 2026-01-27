<template>
    <section class="section-testimonial">
        <div class="sect-main">
            <div class="s-img_item" style="bottom: 0; top: 0;">
                <div class="aurora-container">
                    <div class="jumbo bg"></div>
                    <div class="transition-overlay"></div>
                    <div class="transition-overlay-bottom"></div>
                </div>
            </div>
            <div class="container relative z-10 h-full flex-center">
                <div class="sect-title wow fadeInUp">
                    <h2 class="s-title font-3 m-0" style="color: #fff;">
                        {{ t('testimonial.futureJourneyLine1') }} <br>
                        {{ t('testimonial.futureJourneyLine2') }}
                    </h2>
                </div>

                <div class="roadmap-slider-container wow fadeInUp">
                    <div class="glass-card roadmap-card">
                        <div class="glass-filter"></div>
                        <div class="glass-overlay"></div>
                        <div class="glass-specular"></div>
                        
                        <div class="glass-content">
                            <!-- Glow Effects -->
                            <div class="glow-effect-top-left"></div>
                            <div class="glow-effect-bottom"></div>
                            
                            <div class="slider-wrapper">
                                <transition name="slide-fade" mode="out-in">
                                    <div :key="activeStage" class="stage-content">
                                        <div class="stage-header">
                                            <span class="stage-number">0{{ activeStage + 1 }}</span>
                                            <div class="stage-titles">
                                                <h3 class="stage-title">{{ t(stages[activeStage].title) }}</h3>
                                                <p class="stage-subtitle">{{ t(stages[activeStage].subtitle) }}</p>
                                            </div>
                                        </div>
                                        <div class="stage-body">
                                            <p class="stage-desc">{{ t(stages[activeStage].desc) }}</p>
                                        </div>
                                    </div>
                                </transition>
                            </div>

                            <div class="slider-controls">
                                <button @click="prevStage" class="nav-btn glass-btn">
                                    <div class="glass-filter"></div>
                                    <div class="glass-specular"></div>
                                    <div class="btn-content">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                                    </div>
                                </button>
                                
                                <div class="pagination-dots">
                                    <span 
                                        v-for="(stage, index) in stages" 
                                        :key="index"
                                        class="dot"
                                        :class="{ active: index === activeStage }"
                                        @click="activeStage = index"
                                    ></span>
                                </div>

                                <button @click="nextStage" class="nav-btn glass-btn">
                                    <div class="glass-filter"></div>
                                    <div class="glass-specular"></div>
                                    <div class="btn-content">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- <span class="br-line"></span> -->
    </section>
</template>
<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { t } from '@/i18n';

export default {
    name: 'TestimonialSection',
    setup() {
        const activeStage = ref(0);
        const stages = [
            { title: 'testimonial.genesis', subtitle: 'testimonial.genesisEn', desc: 'testimonial.genesisDesc' },
            { title: 'testimonial.expansion', subtitle: 'testimonial.expansionEn', desc: 'testimonial.expansionDesc' },
            { title: 'testimonial.handover', subtitle: 'testimonial.handoverEn', desc: 'testimonial.handoverDesc' },
            { title: 'testimonial.dissolution', subtitle: 'testimonial.dissolutionEn', desc: 'testimonial.dissolutionDesc' },
        ];

        let intervalId = null;

        const nextStage = () => {
            activeStage.value = (activeStage.value + 1) % stages.length;
        };
        const prevStage = () => {
             activeStage.value = (activeStage.value - 1 + stages.length) % stages.length;
        };

        const startAutoPlay = () => {
            stopAutoPlay();
            intervalId = setInterval(nextStage, 5000);
        };

        const stopAutoPlay = () => {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        };

        onMounted(() => {
            startAutoPlay();
        });

        onUnmounted(() => {
            stopAutoPlay();
        });

        return {
            t,
            activeStage,
            stages,
            nextStage: () => {
                nextStage();
                startAutoPlay(); // Reset timer on manual interaction
            },
            prevStage: () => {
                prevStage();
                startAutoPlay(); // Reset timer on manual interaction
            }
        };
    },
}
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital@1&display=swap');

.section-testimonial {
    position: relative;
    overflow: hidden;
}

.sect-main {
    position: relative;
    /* min-height: 100vh; */
    display: flex;
    align-items: center;
    padding: 80px 0;
}

.container {
    position: relative;
    z-index: 10;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
}

.aurora-container {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: #172347;
    overflow: hidden;
}

.transition-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 150px;
    background: linear-gradient(to bottom, #000 0%, transparent 100%);
    z-index: 2;
    pointer-events: none;
}

.transition-overlay-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 150px;
    background: linear-gradient(to top, #000 0%, transparent 100%);
    z-index: 2;
    pointer-events: none;
}

.bg {
    position: absolute;
    inset: -10px;
    width: 100%;
    height: 100%;
}

/* Roadmap Slider Styles */
.roadmap-slider-container {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
}

.roadmap-card {
    min-height: 350px;
    border-radius: 34px;
    position: relative;
    background: rgba(0, 0, 0, 0.2);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25), 0 0 40px rgba(255, 255, 255, 0.05);
}

.glass-filter {
    position: absolute;
    inset: 0;
    z-index: 0;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: inherit;
}

.glass-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: rgba(255, 255, 255, 0.02);
    border-radius: inherit;
}

.glass-specular {
    position: absolute;
    inset: 0;
    z-index: 2;
    border-radius: inherit;
    box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.1), inset 0 0 5px rgba(255, 255, 255, 0.1);
    pointer-events: none;
}

.glass-content {
    position: relative;
    z-index: 3;
    padding: 40px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

/* Glow Effects */
.glow-effect-bottom {
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    width: 120%;
    height: 120px;
    background: radial-gradient(ellipse at center bottom, rgba(255, 255, 255, 0.1) 0%, rgba(35, 101, 255, 0.2) 25%, transparent 80%);
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
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, rgba(14, 243, 197, 0.15) 30%, transparent 70%);
    opacity: 0.6;
    filter: blur(40px);
    pointer-events: none;
    z-index: -1;
    mix-blend-mode: screen;
}

.stage-content {
    text-align: center;
    color: #fff;
    margin-bottom: 30px;
}

.stage-header {
    margin-bottom: 24px;
}

.stage-number {
    display: block;
    font-size: 64px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.1);
    line-height: 1;
    margin-bottom: -20px;
    font-family: 'Playfair Display', serif;
}

.stage-title {
    font-size: 32px;
    margin-bottom: 8px;
    background: linear-gradient(120deg, #fff, #0ef3c5);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
}

.stage-subtitle {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 2px;
}

.stage-desc {
    font-size: 16px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.9);
    max-width: 90%;
    margin: 0 auto;
}

.slider-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 20px;
}

.nav-btn {
    width: 48px;
    height: 48px;
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

.pagination-dots {
    display: flex;
    gap: 8px;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    cursor: pointer;
    transition: all 0.3s;
}

.dot.active {
    background: #0ef3c5;
    transform: scale(1.2);
    box-shadow: 0 0 10px rgba(14, 243, 197, 0.5);
}

/* Transition Effects */
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.3s ease;
}

.slide-fade-enter-from {
    opacity: 0;
    transform: translateX(20px);
}

.slide-fade-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}

@keyframes jumbo {
    from {
        background-position: 50% 50%, 50% 50%;
    }
    to {
        background-position: 350% 50%, 350% 50%;
    }
}

.jumbo {
    --stripes: repeating-linear-gradient(
        60deg,
        #000 0%,
        #000 7%,
        transparent 10%,
        transparent 12%,
        #000 16%
    );
    --rainbow: repeating-linear-gradient(
        120deg,
        #025385 10%,
        #0ef3c5 15%,
        #04e2b7 20%,
        #038298 25%,
        #015268 30%
    );
    background-image: var(--stripes), var(--rainbow);
    background-size: 300%, 200%;
    background-position: 50% 50%, 50% 50%;

    filter: blur(10px) opacity(50%) saturate(200%);

    mask-image: radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%);
    pointer-events: none;
    width: 100%;
    height: 100%;
    position: absolute;
}

.jumbo::after {
    content: "";
    position: absolute;
    inset: 0;
    background-image: var(--stripes), var(--rainbow);
    background-size: 200%, 100%;
    animation: jumbo 60s linear infinite;
    background-attachment: fixed;
    mix-blend-mode: difference;
}
</style>
