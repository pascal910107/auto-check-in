<template>
    <div class="flex space-x-12 mx-12 mt-4 2xl:mt-12 col-start-1 col-end-4"></div>
    <div class="flex flex-col w-44 col-start-1 col-end-2 justify-center items-start">
        <span class="text-white text-lg font-semibold mb-2 select-none flex items-center" style="text-shadow:2px 1px 6px #2e8c8a;">
            <label for="state" class="mr-2 w-9 h-5 inline-flex relative items-center cursor-pointer">
                <input v-on:click="switchState" :checked="props.state == 'open'" type="checkbox" value="" id="state" class="sr-only peer">
                <div v-if="props.state == 'open' || props.state == 'close'" class="w-9 h-5 bg-a peer-focus:outline-none peer-focus:ring-0 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-c after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-c"></div>
            </label>
            開啟自動簽到
            
        </span>
        
        <input v-on:change="changeTime" v-model="time" type="time" id="time" class="h-12 pl-3 w-36 pr-4 text-base font-bold shadow-md rounded-lg text-b border-0 focus:outline-none focus:ring-0 bg-a select-none">
    </div>
</template>

<script setup>
    import { ref, defineEmits, defineProps, watch } from "vue";

    const emits = defineEmits(["update:state", "update:time"]);
    const props = defineProps(['state', 'time']);
    const time =  ref(props.time);
    watch(() => props.time, () => { time.value = props.time });


    function switchState () {
        props.state == "open" ? chrome.storage.sync.set({ state: "close" }) : chrome.storage.sync.set({ state: "open" });
        emits("update:state", props.state == "open" ? "close" : "open");
        // console.log(props.time);
    }
    function changeTime () {
        chrome.storage.sync.set({ time: time.value });
        emits('update:time', time.value);
        // console.log(time.value);
        
    }
    
</script>

<style>
</style>