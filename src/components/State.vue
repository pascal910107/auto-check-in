<template>
    <div id="not-open" v-if="state == 'close'">
        <div class="absolute w-32 h-12 flex justify-center items-center rounded-bl-md" style="background-color: rgba(149,137,137,0.4);right:-1.75rem;top:-1.5rem;">
            <span class="text-white text-2xl font-semibold select-none" style="text-shadow:2px 1px 6px #6aa287;">未開啟</span>
        </div>
    </div>
    <div id="not-login" v-else-if="login == 'false'">
        <div class="absolute w-32 h-12 flex justify-center items-center rounded-bl-md" style="background-color: rgba(149,137,137,0.4);right:-1.75rem;top:-1.5rem;">
            <span class="text-white text-2xl font-semibold select-none" style="text-shadow:2px 1px 6px #6aa287;">未登入</span>
        </div>
    </div>
    <div id="not-check-in" v-else-if="checkIn == 'false'">
        <div class="absolute w-32 h-12 flex justify-center items-center rounded-bl-md" style="background-color: rgba(149,137,137,0.4);right:-1.75rem;top:-1.5rem;">
            <span class="text-white text-2xl font-semibold select-none" style="text-shadow:2px 1px 6px #6aa287;">未簽到</span>
        </div>
    </div>
    <div id="check-in" v-else>
        <div class="absolute w-32 h-12 flex justify-center items-center rounded-bl-md" style="background-color: rgba(100,218,218,0.5);right:-1.75rem;top:-1.5rem;">
            <span class="text-white text-2xl font-semibold select-none" style="text-shadow:2px 1px 6px #8acb5f;">已簽到</span>
        </div>
    </div>
</template>

<script setup>
    import { defineProps } from "vue";
    defineProps(['state', 'login', 'checkIn']);
    
</script>

<style>
</style>