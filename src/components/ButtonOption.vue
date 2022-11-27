<template>
    <div class="relative col-start-3 col-end-4">
        <img id="prev" v-on:click="prev" src="/images/prev.png" width="36" class="absolute cursor-pointer select-none hover:scale-125 ease-linear duration-150" style="top:2.2rem;left:-4rem;">
        
        <div class="hover:bg-black rounded-full w-20 h-20 absolute top-1" style="#2e8c8a;right: 2.7rem;">
            <div v-for="(buttonOption, index) in buttonOptions" v-show="index == num" class="flex items-center justify-center bg-white rounded-full w-20 h-20 cursor-pointer" style="box-shadow:0 0 4px #2e8c8a;background:rgba(255,255,255,0.8);">
                <a :href="buttonOption.URL" class="text-b text-xl font-semibold w-12 h-12 flex text-center items-center select-none" target="_blank">{{ buttonOption.name }}</a>
            </div>
        </div>
        
        <img id="next" v-on:click="next" src="/images/next.png" width="36" class="absolute cursor-pointer select-none hover:scale-125 ease-linear duration-150" style="top:2.2rem;left:4rem;">
    </div>
</template>

<script setup>
    import { ref, reactive } from 'vue'
    const pageCount = ref(5);
    const num = ref(0);
    const buttonOptions = reactive([
        {
            name: '簽到頁面',
            URL: 'https://act.hoyolab.com/ys/event/signin-sea-v3/index.html?act_id=e202102251931481'
        },
        {
            name: '原神官網',
            URL: 'https://genshin.hoyoverse.com/zh-tw/home'
        },
        {
            name: '地圖資源',
            URL: 'https://act.hoyolab.com/ys/app/interactive-map/index.html?lang=zh-tw#/map/2?shown_types='
        },
        {
            name: '個人數據',
            URL: 'https://act.hoyolab.com/app/community-game-records-sea/index.html?bbs_presentation_style=fullscreen&bbs_auth_required=true&v=104&gid=2&utm_source=hoyolab&utm_medium=tools&bbs_theme=light&bbs_theme_device=1#/ys'
        },
        {
            name: '原神維基',
            URL: 'https://wiki.hoyolab.com/pc/genshin/aggregate/character?utm_source=hoyolab&utm_medium=tools&lang=zh-tw&bbs_theme=light&bbs_theme_device=1'
        },
        {
            name: '養成計算',
            URL: 'https://act.hoyolab.com/ys/event/calculator-sea/index.html?bbs_presentation_style=fullscreen&bbs_auth_required=true&utm_source=hoyolab&utm_medium=tools&lang=zh-tw&bbs_theme=light&bbs_theme_device=1#/'
        }
    ]);
    function prev () {
        num.value == 0 ? num.value = pageCount.value : num.value--;
    }

    function next () {
        num.value == pageCount.value ? num.value = 0 : num.value++;
    }
</script>

<style>
</style>