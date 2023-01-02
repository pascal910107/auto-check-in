  
  <template>
    <div v-if="isLoaded" id="background" class="w-96 p-6 border-0 shadow-md grid grid-cols-3 gap-4 bg-a overflow-hidden"> 
      
       <div class="col-start-1 col-end-4 w-full flex justify-between items-center relative">
          
        <img src="/images/title.png" width="94.4" height="63.6" class="absolute select-none" style="top: -1.4rem;left:-0.6rem;">
        
        <State :state="state" :login="login" :checkIn="checkIn"></State>
          
          
      </div>
      
      <SwitchButtonAndTime v-model:state="state" v-model:time="time"></SwitchButtonAndTime>
      <ButtonOption></ButtonOption>
      <RoleInformation :login="login"></RoleInformation>
    </div>
  </template>
  
  <script setup>
    import ButtonOption from './components/ButtonOption.vue'
    import SwitchButtonAndTime from './components/SwitchButtonAndTime.vue'
    import State from './components/State.vue'
    import RoleInformation from './components/RoleInformation.vue'
    import { ref, onBeforeMount, onMounted } from 'vue'
    
    const state = ref("");
    const login = ref("");
    const checkIn = ref("");
    const time = ref("");
    const isLoaded = ref(false);


    onBeforeMount(async() => {
        await chrome.storage.sync.get(["state", "stime", "login", "checkIn"], (result) => {
            result.state ? state.value = result.state : (state.value = "open", chrome.storage.sync.set({ state: "open" }));
            result.stime ? time.value = result.stime : (time.value = "00:01", chrome.storage.sync.set({ stime: "00:01" }));
            result.login ? login.value = result.login : (login.value = "false", chrome.storage.sync.set({ login: "false" }));
            result.checkIn ? checkIn.value = result.checkIn : (checkIn.value = "false", chrome.storage.sync.set({ checkIn: "false" }));
        });
        await getCheckInInfo();
    });

    onMounted(() => {
        isLoaded.value = true;
    });

    async function getCheckInInfo() {
        fetch("https://sg-hk4e-api.hoyolab.com/event/sol/resign_info?act_id=e202102251931481", {
            headers: {
                accept: "*/*",
                "accept-language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
                "sec-ch-ua":
                '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
            },
            referrer: "https://act.hoyolab.com/",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: null,
            method: "GET",
            mode: "cors",
            credentials: "include",
        })
        .then((response) => response.json())
        .then((data) => {
            let checkInInfo = data.data;
            if (!checkInInfo) {
                login.value = "false";
                chrome.storage.sync.set({ login: "false" });
            } else {
                if (checkInInfo.signed) {
                    login.value = "true";
                    checkIn.value = "true";
                    chrome.storage.sync.set({ login: "true" });
                    chrome.storage.sync.set({ checkIn: "true" });
                } else {
                    login.value = "true";
                    checkIn.value = "false";
                    chrome.storage.sync.set({ login: "true" });
                    chrome.storage.sync.set({ checkIn: "false" });
                }
            }
        });
    }

  </script>

  <style>
    #background {
        background: radial-gradient(circle at left, #020d21, transparent),
                    radial-gradient(ellipse at right, #58d9c0, transparent),
                    radial-gradient(ellipse at top, #123e4d, #a0c8c1),
                    radial-gradient(circle at bottom, #788a83, transparent);
    }
  </style>