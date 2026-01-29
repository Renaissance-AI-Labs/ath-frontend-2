<template>
  <div ref="wrap" class="aurora-wrap"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { SimplexNoise } from '../utils/simplex-noise.js';

const wrap = ref(null);
let animationFrameId = null;
let resizeHandler = null;

onMounted(() => {
  if (!wrap.value) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const offscreencanvas = document.createElement('canvas');
  const offscreenctx = offscreencanvas.getContext('2d');
  const rayArray = [];
  const rayArrayLength = 200;
  const amplitude = .4;
  const simplex = new SimplexNoise();
  const xOff = 0.0015;
  const yOff = 0.0015;
  const zOff = 0.0015;
  let time = 0;
  let width, height, offscreenwidth, offscreenheight;

  wrap.value.appendChild(offscreencanvas);
  
  // Set initial styles for offscreen canvas to make it visible as the main display
  offscreencanvas.style.width = '100%';
  offscreencanvas.style.height = '100%';
  offscreencanvas.style.display = 'block';

  function resize() {
    if (!wrap.value) return;
    width = canvas.width = wrap.value.clientWidth;
    height = canvas.height = wrap.value.clientHeight;
    // We don't need to draw image on resize here for the setup, just dimension update
    
    offscreenwidth = offscreencanvas.width = wrap.value.clientWidth;
    offscreenheight = offscreencanvas.height = wrap.value.clientHeight;
  }

  function offscreenCanvasDraw() {
    offscreenctx.save();
    offscreenctx.filter = 'blur(1px)';
    offscreenctx.globalCompositeOperation = 'lighter';
    offscreenctx.drawImage(canvas, 0, 0, offscreenwidth, offscreenheight);
    offscreenctx.restore();
  }

  function randomRangeInt(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  }

  class Ray {
    constructor(ctx, x, y1, y2, xincrement, yincrement, lineWidthRange, random) {
      this.ctx = ctx;
      this.x = x;
      this.y1 = y1;
      this.y2 = y2;
      this.xincrement = xincrement;
      this.yincrement = yincrement;
      this.lineWidthRange = lineWidthRange;
      this.random = random;
      this.r = 0;
    }
    draw() {
      this.r += .2;
      // Blue aurora colors: hue around 200-240
      // The original code used 200 * sin(...), which varies hue widely.
      // User asked for "blue strip aurora". 
      // Let's adjust hsla to be more consistently blue/cyan.
      // 200 is cyan-blue. 
      // Let's try to keep it in blue range.
      
      // Original: `hsla(${200 * Math.sin(this.r * .005)},100%,65%,0)`
      // This oscillates hue between -200 and 200. 
      // We want blue (around 200-240).
      
      const baseHue = 220; // Blue
      const hueVariation = 40 * Math.sin(this.r * .005);
      const hue = baseHue + hueVariation;

      this.gradient = this.ctx.createLinearGradient(this.x, this.y1, this.x, this.y2);
      this.gradient.addColorStop(0, `hsla(${hue},100%,65%,0)`);
      this.gradient.addColorStop(0.5, `hsla(${hue},100%,65%,${Math.sin(this.r * this.random / 100)})`);
      this.gradient.addColorStop(1, `hsla(${hue},100%,65%,0)`);
      
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(this.x, this.y1);
      this.ctx.lineTo(this.x, this.y2);
      this.ctx.globalAlpha = .4;
      this.ctx.lineWidth = this.lineWidthRange;
      this.ctx.strokeStyle = this.gradient;
      this.ctx.stroke();
      this.ctx.closePath();
      this.ctx.restore();
    }
    update(height) {
      this.x += this.xincrement;
      this.y1 += this.yincrement;
      this.y2 += this.yincrement;

      // Boundary check to wrap around rays that move off screen
      const minY = Math.min(this.y1, this.y2);
      const maxY = Math.max(this.y1, this.y2);
      const buffer = 200; // Extra space to ensure it's fully off screen

      if (this.yincrement > 0 && minY > height) {
        // Moving down, wrap to top
        const offset = height + buffer;
        this.y1 -= offset;
        this.y2 -= offset;
      } else if (this.yincrement < 0 && maxY < -buffer) {
        // Moving up, wrap to bottom
        const offset = height + buffer;
        this.y1 += offset;
        this.y2 += offset;
      }
    }
  }

  resize();
  resizeHandler = resize;
  window.addEventListener('resize', resizeHandler);

  // Initialize rays
  for (let i = 0; i < rayArrayLength; i++) {
    const x = randomRangeInt(0, width);
    const y1 = height / 2 + randomRangeInt(100, 180);
    const y2 = height / 2 + randomRangeInt(-180, -100);
    const xincrement = .5 * Math.random() * (Math.round(Math.random()) ? .1 : -.1);
    const yincrement = simplex.noise3D(x * xOff, y1 * yOff, time * zOff) * amplitude;
    
    // Add directional flow: Left side down (positive), Right side up (negative)
    // Normalized position from -1 (left) to 1 (right)
    const normalizedX = (x / width - 0.5) * 2;
    // Flow velocity: left (-1) -> +flowSpeed, right (1) -> -flowSpeed
    const flowSpeed = 0.8; // Adjust speed as needed
    const flow = -normalizedX * flowSpeed;
    
    const totalYIncrement = yincrement + flow;
    
    const lineWidthRange = 10 + randomRangeInt(10, 20);
    const random = Math.random();
    rayArray.push(new Ray(ctx, x, y1, y2, xincrement, totalYIncrement, lineWidthRange, random));
  }

  function render() {
    time++;
    ctx.clearRect(0, 0, width, height);
    
    // Background color - dark blue/black for aurora
    offscreenctx.fillStyle = 'rgba(9, 8, 16, 0.3)'; // Keep the trail effect
    offscreenctx.fillRect(0, 0, offscreenwidth, offscreenheight);
    
    for (let i = 0; i < rayArrayLength; i++) {
      rayArray[i].draw();
      rayArray[i].update(height);
    }
    offscreenCanvasDraw();
    animationFrameId = requestAnimationFrame(render);
  }

  render();
});

onBeforeUnmount(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped>
.aurora-wrap {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000; /* Fallback */
}
</style>
