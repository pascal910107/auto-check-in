<template>
  <div v-if="login.login == 'true'" class="col-start-1 col-end-4">
    <div id="select" class="w-full mb-4">
      <select @change="onSelectUidChange" class="text-xl font-bold text-g w-full shadow-md rounded-lg select-none py-1 pl-3 focus:outline-none focus:ring-0 cursor-pointer" style="background:rgba(213,224,222,0.8);">
        <option v-for="role in account.roleList" :key="role.game_uid" :value="role.game_uid" :selected="role.game_uid === selectedUid" class="font-bold">
          {{ role.nickname }} ( {{ role.region }} {{ role.game_uid }} )
        </option>
      </select>
    </div>
    <div class="px-4 pt-4 pb-2 flex w-full justify-center rounded-2xl" style="background:rgba(231,245,241,0.6);">
      <div class="flex-auto">
        <div class="flex flex-col items-center text-xl font-semibold text-b mb-4 w-36 shadow-md rounded-lg border-0 select-none relative boxLayer1 overflow-hidden">
            <div class="p-2 w-full flex items-center rounded-t-lg" style="background:rgba(213,224,222,0.8);">
                <img src="/images/resinIcon.png" alt="">原粹樹脂
            </div>
            <div class="w-full flex items-center justify-center rounded-b-lg text-3xl pb-4" style="background:rgba(213,224,222,0.8);">
                {{ selectedRole.role.current_resin }}/{{ selectedRole.role.max_resin }}
            </div>
            <div class="absolute calTime w-full flex items-center justify-center rounded-t-lg text-lg p-2 text-a" style="background:rgba(58,62,103,0.8);">
              {{ convertSecondToHour(parseInt(selectedRole.role.resin_recovery_time)) }}
            </div>
            <div class="absolute finTime w-full flex items-center justify-center rounded-b-lg text-xl p-2 text-a" style="background:rgba(69,90,119,0.8);">
              {{ calFinTime(parseInt(selectedRole.role.resin_recovery_time)) }}
            </div>
        </div>
        <div class="flex flex-col items-center text-xl font-semibold text-b mb-4 w-36 shadow-md rounded-lg border-0 select-none relative boxLayer2 overflow-hidden">
            <div class="p-2 w-full flex items-center rounded-t-lg" style="background:rgba(213,224,222,0.8);">
              <img src="/images/coinIcon.png" alt="">洞天寶錢
            </div>
            <div class="w-full flex items-center justify-center rounded-b-lg text-2xl pb-4" style="background:rgba(213,224,222,0.8);">
                {{ selectedRole.role.current_home_coin }}/{{ selectedRole.role.max_home_coin }}
            </div>
            <div class="absolute calTime w-full flex items-center justify-center rounded-t-lg text-lg p-2 text-a" style="background:rgba(69,90,119,0.8);">
              {{ convertSecondToHour(parseInt(selectedRole.role.home_coin_recovery_time)) }}
            </div>
            <div class="absolute finTime w-full flex items-center justify-center rounded-b-lg text-xl p-2 text-a" style="background:rgba(58,62,103,0.8);">
              {{ calFinTime(parseInt(selectedRole.role.home_coin_recovery_time)) }}
            </div>
        </div>
        <div class="flex flex-col items-center text-lg font-semibold text-b w-36 shadow-md rounded-lg border-0 select-none relative boxLayer3 overflow-hidden">
            <div class="px-2 pt-2 w-full flex items-center rounded-t-lg" style="background:rgba(213,224,222,0.8);">
              <img src="/images/transformerIcon.png" alt="">參數質變儀
            </div>
            <div v-if="selectedRole.role.transformer" class="w-full flex items-center justify-center rounded-b-lg pb-2 text-xl" style="background:rgba(213,224,222,0.8);">
                {{ selectedRole.role.transformer.recovery_time.reached ? '可使用' : selectedRole.role.transformer.recovery_time.Day + '天' }}
            </div>
        </div>
      </div>
      <div class="flex-auto">
        <span class="px-2 pb-2 text-b text-xl font-semibold select-none flex items-center justify-center rounded-lg">
            探索派遣 {{ selectedRole.role.current_expedition_num }}/{{ selectedRole.role.max_expedition_num }}
        </span>
        <span v-for="order in selectedRole.role.expeditions" class="text-g text-base font-semibold shadow-md select-none flex items-center rounded-tr-lg rounded-bl-lg mb-1" style="background:rgba(61, 81, 112, 0.3);">
          <img :src="order.avatar_side_icon" width="36" style="transform: translateY(-5px);">
          {{ order.remained_time == '0' ? '已完成' : convertSecondToHour(parseInt(order.remained_time)) }}
        </span>
        
        <span class="p-2 text-b text-xl font-semibold select-none flex items-center justify-center rounded-lg">
            每日委託 {{ selectedRole.role.finished_task_num }}/{{ selectedRole.role.total_task_num }}
        </span>
        <span class="p-2 text-b text-xl font-semibold select-none flex items-center justify-center rounded-lg">
            半價周本 {{ selectedRole.role.resin_discount_num_limit - selectedRole.role.remain_resin_discount_num }}/{{ selectedRole.role.resin_discount_num_limit }}
        </span>
      </div>
    </div>
  </div>
  <div v-else class="col-start-1 col-end-4">
    <div id="select" class="">
      <div class="text-xl font-bold text-g w-full h-20 rounded-lg select-none flex items-center justify-center" style="background:rgba(213,224,222,0.8);">
        請先登入
        <a href="https://act.hoyolab.com/ys/event/signin-sea-v3/index.html?act_id=e202102251931481" class="bg-b text-a px-4 py-2 rounded-md ml-6" target="_blank">登入</a>
      </div>
    </div>
  </div>
</template>

<script setup>
    import { ref, reactive, defineProps, onBeforeMount } from "vue";
    import { makeGenshinRequest, calFinTime, convertSecondToHour } from "../function.js";

    const login = defineProps(['login']);
    const account = reactive({
      roleList: [],
    });
    const selectedUid = ref("");
    const selectedRole = reactive({
      role: {},
    });


    onBeforeMount(async() => {
      await chrome.storage.sync.get(["roleList"], async(result) => {
        if (!result.roleList) {
          await getRoleList();
        } else {
          if (login.login == 'true') {
            await chrome.storage.sync.get(["roleList", "selectedUid", "selectedRole"], (result) => {
              account.roleList = result.roleList;
              selectedUid.value = result.selectedUid;
              selectedRole.role = result.selectedRole;
            });
          }
          await getRoleList();
        }
      });
      
    });

    const onSelectUidChange = (e) => {
      selectedUid.value = e.target.value || selectedUid.value;
      chrome.storage.sync.set({ selectedUid: selectedUid.value });
      selectedRole.role = account.roleList.find((role) => role.game_uid === selectedUid.value);
      chrome.storage.sync.set({ selectedRole: selectedRole.role });
    };
    

    async function getRoleList() {
        let genshinRsp1 = await makeGenshinRequest("https://api-os-takumi.mihoyo.com/binding/api/getUserGameRolesByCookie?game_biz=hk4e_global");
        if (genshinRsp1.data == null) {
            //清空角色列表、選擇的角色
            account.roleList = [];
            chrome.storage.sync.set({ roleList: [] });
            selectedUid.value = "";
            chrome.storage.sync.set({ selectedUid: "" });
            selectedRole.role = {};
            chrome.storage.sync.set({ selectedRole: {} });
        } else {
            let result = [];
            for (let i = 0; i < genshinRsp1.data.list.length; i++) {
                // console.log(genshinRsp1.data.list[i]);
                let genshinRsp2 = await makeGenshinRequest("https://bbs-api-os.hoyolab.com/game_record/app/genshin/api/dailyNote?role_id=" + genshinRsp1.data.list[i].game_uid + "&server=" + genshinRsp1.data.list[i].region);
                // console.log(genshinRsp2);
                if (genshinRsp2.data == null) {
                  continue;
                }
                genshinRsp2.data.game_uid = genshinRsp1.data.list[i].game_uid;
                genshinRsp2.data.nickname = genshinRsp1.data.list[i].nickname;
                switch (genshinRsp1.data.list[i].region) {
                  case "os_asia":
                    genshinRsp2.data.region = "亞服";
                    break;
                  case "os_euro":
                    genshinRsp2.data.region = "歐服";
                    break;
                  case "os_usa":
                    genshinRsp2.data.region = "美服";
                    break;
                  case "os_cht":
                    genshinRsp2.data.region = "台港澳服";
                    break;
                  default:
                    break;
                }
                selectedUid.value == "" && (selectedUid.value = genshinRsp1.data.list[0].game_uid, chrome.storage.sync.set({ selectedUid: genshinRsp1.data.list[0].game_uid }));
                if (genshinRsp2.data.game_uid === selectedUid.value) {
                  selectedRole.role = genshinRsp2.data;
                  chrome.storage.sync.set({ selectedRole: selectedRole.role });
                }
                result.push(genshinRsp2.data);
            }
            account.roleList = result;
            // console.log(account.roleList);
            chrome.storage.sync.set({ roleList: result });
        }
    }
    
</script>

<style scoped>
  #select {
    position: relative;
  }
  
  #select::after,
  #select::before {
    content: " ";
    width: 10px;
    height: 10px;
    position: absolute;
    border: 0px solid #fff;
    transition: all 1s;
    pointer-events: none;
  }
  
  #select::after {
    top: -1px;
    left: -1px;
    border-top: 4px solid rgba(213,224,222, 1);
    border-left: 4px solid rgba(213,224,222, 1);
  }
  
  #select::before {
    bottom: -1px;
    right: -1px;
    border-bottom: 4px solid rgba(213,224,222, 1);
    border-right: 4px solid rgba(213,224,222, 1);
  }

  #select select {
    transition: all 1s;
  }

  #select select:hover {
    border-top-right-radius: 0px;
    border-bottom-left-radius: 0px;
  }

  #select:hover::before,
  #select:hover::after {
    width: 105%;
    height: 115%;
  }

  .calTime{
    position: absolute;
    height: 50%;
    top: 0%;
    left: -138px;
    transition: all 0.5s;
  }
  .boxLayer1:hover .calTime{
    left: 0px;
  }
  .boxLayer2:hover .calTime{
    left: 0px;
  }
  .finTime{
    position: absolute;
    height: 50%;
    top: 50%;
    right: -138px;
    transition: all 0.5s;
  }
  .boxLayer1:hover .finTime{
    right: 0px;
  }
  .boxLayer2:hover .finTime{
    right: 0px;
  }
</style>