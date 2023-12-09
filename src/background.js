import { makeGenshinRequest } from "./function.js";
//create a alarm

//簽到
async function checkIn() {
  let checkInInfo = await getCheckInInfo();
  if (checkInInfo["signed"] == true) {
    console.log("already signed");
    return true;
  }
  //使用者自己登出了
  if (!checkInInfo) {
    console.log("not login, open sign page");
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
  let count = 10;
  while (checkInInfo["signed"] != true && count--) {
    console.log("signing, count times: ", 10 - count);
    await sign();
    checkInInfo = await getCheckInInfo();
  }
  //正常簽到失敗，可能是網路問題或驗證碼，開啟簽到頁面
  if (checkInInfo["signed"] != true) {
    console.log("sign fail, open sign page");
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
  let lastDate = new Date().toLocaleString();
  console.log("set lastDate: ", lastDate);
  chrome.storage.sync.set({ lastDate: lastDate });
  
  console.log("resigning");
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
  if (response.status >= 400) {
    console.log(response.status, "get check in info error: ", response);
    return null;
  } else if (response.status >= 300) {
    console.log(response.status, "get check in info redirect: ", response);
    return null;
  }
  let data = await response.json();
  console.log(response.status, "get check in info: ", data);
  if (!data || !data.data) {
    console.log("get check in info success but no data");
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
  console.log("check in info: ", checkInInfo);
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
  if (response.status >= 400) {
    console.log(response.status, "sign error: ", response);
    return false;
  } else if (response.status >= 300) {
    console.log(response.status, "sign redirect: ", response);
    return false;
  }
  let data = await response.json();
  console.log(response.status, "sign: ", data);
  return data;
}

//補簽
async function resign(checkInInfo) {
  //沒登入或已補簽三次
  if (
    (checkInInfo === null || checkInInfo === void 0
      ? void 0
      : checkInInfo.signed) === 3
  ) {
    console.log("not login or already resign 3 times");
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
  if (task_response.status >= 400) {
    console.log(task_response.status, "get task list error: ", task_response);
    return false;
  } else if (task_response.status >= 300) {
    console.log(task_response.status, "get task list redirect: ", task_response);
    return false;
  }
  let data = await task_response.json();
  console.log(task_response.status, "get task list: ", data);
  //!沒登入 或 沒有任務
  if (data.data === null || !(data.data === void 0 ? void 0 : data.data.list)) {
    console.log("not login or no resign task");
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
    if (r1.status >= 400) {
      console.log(r1.status, "complete task error: ", r1);
      return false;
    } else if (r1.status >= 300) {
      console.log(r1.status, "complete task redirect: ", r1);
      return false;
    }
    let r1_data = await r1.json();
    console.log(r1.status, "complete task: ", r1_data);
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
    if (r2.status >= 400) {
      console.log(r2.status, "get award error: ", r2);
      return false;
    } else if (r2.status >= 300) {
      console.log(r2.status, "get award redirect: ", r2);
      return false;
    }
    let r2_data = await r2.json();
    console.log(r2.status, "get award: ", r2_data);
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
  if (resign_response.status >= 400) {
    console.log(resign_response.status, "resign error: ", resign_response);
    return false;
  } else if (resign_response.status >= 300) {
    console.log(resign_response.status, "resign redirect: ", resign_response);
    return false;
  }
  let resign_data = await resign_response.json();
  console.log(resign_response.status, "resign: ", resign_data);
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
    console.log("can't get role list, clear existing role list");
    //清空角色列表、選擇的角色
    chrome.storage.sync.set({ roleList: [] });
    chrome.storage.sync.set({ selectedUid: "" });
    chrome.storage.sync.set({ selectedRole: {} });
    chrome.storage.sync.set({ login: "false" });
    return false;
  } else {
    console.log("get role list success");
    let result = [];
    for (let i = 0; i < genshinRsp1.data.list.length; i++) {
      let genshinRsp2 = await makeGenshinRequest(
        "https://bbs-api-os.hoyolab.com/game_record/app/genshin/api/dailyNote?role_id=" +
          genshinRsp1.data.list[i].game_uid +
          "&server=" +
          genshinRsp1.data.list[i].region
      );
      if (genshinRsp2.data == null) {
        console.log("can't get role info, skip");
        continue;
      }
      genshinRsp2.data.game_uid = genshinRsp1.data.list[i].game_uid;
      genshinRsp2.data.nickname = genshinRsp1.data.list[i].nickname;
      console.log("current role info: ", genshinRsp2.data);
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
      chrome.storage.sync.get(["selectedUid"], (result) => {
        result.selectedUid == "" &&
          chrome.storage.sync.set({
            selectedUid: genshinRsp1.data.list[0].game_uid,
          });

        if (genshinRsp2.data.game_uid === result.selectedUid) {
          chrome.storage.sync.set({ selectedRole: genshinRsp2.data });
        }
      });
      console.log("add role info to role list");
      result.push(genshinRsp2.data);
    }
    console.log("set role list: ", result);
    chrome.storage.sync.set({ roleList: result });
  }
}

chrome.alarms.create("autoCheckIn", {
  delayInMinutes: 0.1,
  periodInMinutes: 0.1,
});
chrome.alarms.onAlarm.addListener(() => autoCheckInAndShowRoleInfo());

function autoCheckInAndShowRoleInfo() {
  console.log("auto check in");
  chrome.storage.sync.get(["stime", "state", "lastDate"], async (result) => {
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
    if (result.stime == undefined) {
      chrome.storage.sync.set({ stime: "00:00" });
      result.stime = "00:00";
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
        (now.toLocaleString().split(/[/ ]/)[0] !=
          result.lastDate.split(/[/ ]/)[0] ||
          now.toLocaleString().split(/[/ ]/)[1] !=
            result.lastDate.split(/[/ ]/)[1] ||
          now.toLocaleString().split(/[/ ]/)[2] !=
            result.lastDate.split(/[/ ]/)[2]) &&
        now.getTime() >= signTime.getTime()
      ) {
        console.log("check in");
        checkIn();
      }
    } else if (result.state === "close") {
      //不自動簽到
    }
    console.log("get role list");
    getRoleList();
  });
}
