<template>
    <button id="goTop" class="glass-style">
        <span class="border-progress"></span>
        <span class="icon icon-arrow-top"></span>
    </button>
</template>
<script>
export default {
    name: 'GoTop'
}
</script>
<style scoped>
#goTop.glass-style {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px; /* Match tf-btn radius */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

#goTop.glass-style:hover {
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
}
</style>


