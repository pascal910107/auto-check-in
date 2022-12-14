import { makeGenshinRequest } from "./function.js";
//create a alarm
chrome.alarms.create("autoCheckIn", {
  delayInMinutes: 1,
  periodInMinutes: 1,
});
chrome.alarms.onAlarm.addListener(() => autoCheckInAndShowRoleInfo());

function autoCheckInAndShowRoleInfo() {
  getRoleList();
  chrome.storage.sync.get(["stime", "state", "lastDate"], (result) => {
    if (result.lastDate == undefined) {
      chrome.storage.sync.set({
        lastDate: new Date(
          new Date().getTime() - 1000 * 60 * 60 * 24
        ).toLocaleString(),
      });
      result.lastDate = new Date(
        new Date().getTime() - 1000 * 60 * 60 * 24
      ).toLocaleString();
    }

    let now = new Date();
    let signTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      result.stime.split(":")[0],
      result.stime.split(":")[1]
    );
    if (result.state === "open") {
      //與上次簽到不同天且時間大於設定時間就自動簽到
      if (
        (now.toLocaleString().split(/[/ ]/)[0] !==
          result.lastDate.split(/[/ ]/)[0] ||
          now.toLocaleString().split(/[/ ]/)[1] !==
            result.lastDate.split(/[/ ]/)[1] ||
          now.toLocaleString().split(/[/ ]/)[2] !==
            result.lastDate.split(/[/ ]/)[2]) &&
        now.getTime() >= signTime.getTime()
      ) {
        checkIn();
      }
    } else if (result.state === "close") {
      //不自動簽到
    }
  });
}

//簽到
async function checkIn() {
  let checkInInfo = await getCheckInInfo();
  if (checkInInfo["signed"] == true) {
    return true;
  }
  //使用者自己登出了
  if (!checkInInfo) {
    //判斷頁籤是否存在 不存在就開啟
    chrome.tabs.query(
      {
        url: "https://act.hoyolab.com/ys/event/signin-sea-v3/index.html?act_id=e202102251931481",
      },
      (tabs) => {
        if (tabs.length === 0) {
          chrome.tabs.create({
            url: "https://act.hoyolab.com/ys/event/signin-sea-v3/index.html?act_id=e202102251931481",
            active: false, //開啟分頁時不會focus
          });
        }
      }
    );

    return false;
  }
  await sign();
  chrome.storage.sync.set({ lastDate: new Date().toLocaleString() });
  //補簽
  await resign(checkInInfo);
  return true;
}

async function getCheckInInfo() {
  let checkInInfo = [];
  //只要referrerPolicy、method、mode、credentials
  let response = await fetch(
    "https://sg-hk4e-api.hoyolab.com/event/sol/resign_info?act_id=e202102251931481",
    {
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
    }
  );
  let data = await response.json();
  if (!data || !data.data) {
    return null;
  }
  Object.entries(data.data).forEach(([key, value]) => {
    checkInInfo[
      key
        .toLowerCase()
        .replace(/([-_][a-z])/g, (group) =>
          group.toUpperCase().replace("-", "").replace("_", "")
        )
    ] = value;
  });
  return checkInInfo;
}

//簽到
async function sign() {
  let response = await fetch("https://sg-hk4e-api.hoyolab.com/event/sol/sign", {
    referrerPolicy: "strict-origin-when-cross-origin",
    body: JSON.stringify({ act_id: "e202102251931481", lang: "zh-tw" }),
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
  return await response.json();
}

//補簽
async function resign(checkInInfo) {
  //沒登入或已補簽三次
  if (
    (checkInInfo === null || checkInInfo === void 0
      ? void 0
      : checkInInfo.signed) === 3
  ) {
    return false;
  }
  // await delay(0.5);
  //獲取補簽任務
  let task_response = await fetch(
    "https://sg-hk4e-api.hoyolab.com/event/sol/task/list?act_id=e202102251931481",
    {
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
    }
  );

  let data = await task_response.json();
  // console.log(data);
  //!沒登入 或 沒有任務
  if (data.data === null || !(data.data === void 0 ? void 0 : data.data.list)) {
    return false;
  }
  // await delay(1);
  // 完成補簽任務
  for (let i = 0; i < data.data.list.length; i++) {
    let r1 = await fetch(
      "https://sg-hk4e-api.hoyolab.com/event/sol/task/complete",
      {
        referrerPolicy: "strict-origin-when-cross-origin",
        body: JSON.stringify({
          id: data.data.list[i].id,
          act_id: "e202102251931481",
        }),
        method: "POST",
        mode: "cors",
        credentials: "include",
      }
    );
    // console.log(await r1.json());
    // await delay(1);

    let r2 = await fetch(
      "https://sg-hk4e-api.hoyolab.com/event/sol/task/award",
      {
        referrerPolicy: "strict-origin-when-cross-origin",
        body: JSON.stringify({}),
        method: "POST",
        mode: "cors",
        credentials: "include",
      }
    );
    // console.log(await r2.json());
  }
  // await delay(1);
  let resign_response = await fetch(
    "https://sg-hk4e-api.hoyolab.com/event/sol/resign",
    {
      referrerPolicy: "strict-origin-when-cross-origin",
      body: JSON.stringify({ act_id: "e202102251931481" }),
      method: "POST",
      mode: "cors",
      credentials: "include",
    }
  );
  // console.log(await resign_response.json());
  return true;
}

async function delay(s) {
  return new Promise((resolve) => {
    setTimeout(resolve, s * 1000);
  });
}

async function getRoleList() {
  let genshinRsp1 = await makeGenshinRequest(
    "https://api-os-takumi.mihoyo.com/binding/api/getUserGameRolesByCookie?game_biz=hk4e_global"
  );
  if (genshinRsp1.data == null) {
    //清空角色列表、選擇的角色
    chrome.storage.sync.set({ roleList: [] });
    chrome.storage.sync.set({ selectedUid: "" });
    chrome.storage.sync.set({ selectedRole: {} });
    chrome.storage.sync.set({ login: "false" });
    return false;
  } else {
    let result = [];
    for (let i = 0; i < genshinRsp1.data.list.length; i++) {
      let genshinRsp2 = await makeGenshinRequest(
        "https://bbs-api-os.hoyolab.com/game_record/app/genshin/api/dailyNote?role_id=" +
          genshinRsp1.data.list[i].game_uid +
          "&server=" +
          genshinRsp1.data.list[i].region
      );
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
      result.push(genshinRsp2.data);
    }
    chrome.storage.sync.set({ roleList: result });
  }
}
