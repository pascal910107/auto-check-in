import "jquery";
import "./styles/app.css";

$(() => {
  //卡片初始化
  chrome.storage.sync.get(["time", "state", "lastDate"], (result) => {
    //上次登入日期
    if (result.lastDate === undefined) {
      chrome.storage.sync.set({
        lastDate: new Date(
          new Date().getTime() - 1000 * 60 * 60 * 24
        ).toLocaleString(),
      });
    }
    //時間
    if (result.time === undefined) {
      chrome.storage.sync.set({ time: "00:00" });
    }
    $("#time").val(result.time);

    //自動簽到按鈕狀態
    if (result.state === "close") {
      chrome.storage.sync.remove([
        "ltuid",
        "ltoken",
        "cookie_token",
        "account_id",
      ]);
      $("#state").prop("checked", false);
      $("#not-open").show();
      $("#not-login").hide();
      $("#not-check-in").hide();
      $("#check-in").hide();
    } else {
      chrome.storage.sync.set({ state: "open" }); //設給undefined
      $("#state").prop("checked", true);
      chrome.cookies.getAll(
        {
          url: "https://www.hoyolab.com",
        },
        function (cookies) {
          if (cookies) {
            cookies.forEach((cookie) => {
              if (cookie["name"] === "ltuid") {
                chrome.storage.sync.set({ ltuid: cookie["value"] });
              }
              if (cookie["name"] === "ltoken") {
                chrome.storage.sync.set({ ltoken: cookie["value"] });
              }
              if (cookie["name"] === "cookie_token") {
                chrome.storage.sync.set({ cookie_token: cookie["value"] });
              }
              if (cookie["name"] === "account_id") {
                chrome.storage.sync.set({ account_id: cookie["value"] });
              }
            });
          }
        }
      );

      //判斷登入狀態
      chrome.storage.sync.get(
        ["ltuid", "ltoken", "cookie_token", "account_id"],
        function (data) {
          if (Object.keys(data).length) {
            $("#not-open").hide();
            $("#not-login").hide();
            // $("#not-check-in").show();
            // $("#check-in").hide();
            //判斷簽到
            fetch(
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
            )
              .then((response) => response.json())
              .then((data) => {
                let checkInInfo = data.data;
                if (!checkInInfo) {
                  chrome.storage.sync.remove([
                    "ltuid",
                    "ltoken",
                    "cookie_token",
                    "account_id",
                  ]);
                  $("#not-open").hide();
                  $("#not-login").show();
                  $("#not-check-in").hide();
                  $("#check-in").hide();
                } else {
                  if (checkInInfo.signed) {
                    $("#not-open").hide();
                    $("#not-login").hide();
                    $("#not-check-in").hide();
                    $("#check-in").show();
                  } else {
                    $("#not-open").hide();
                    $("#not-login").hide();
                    $("#not-check-in").show();
                    $("#check-in").hide();
                  }
                }
              });
          } else {
            $("#not-open").hide();
            $("#not-login").show();
            $("#not-check-in").hide();
            $("#check-in").hide();
            // alert("請先登入");
          }
        }
      );
    }
  });
  $("#time").on("change", function () {
    let time = $(this).val();
    chrome.storage.sync.set({ time: time });
  });
  $("#state").on("change", function () {
    if ($(this).prop("checked")) {
      chrome.storage.sync.set({ state: "open" });
      chrome.cookies.getAll(
        {
          url: "https://www.hoyolab.com",
        },
        function (cookies) {
          if (cookies) {
            cookies.forEach((cookie) => {
              if (cookie["name"] === "ltuid") {
                chrome.storage.sync.set({ ltuid: cookie["value"] });
              }
              if (cookie["name"] === "ltoken") {
                chrome.storage.sync.set({ ltoken: cookie["value"] });
              }
              if (cookie["name"] === "cookie_token") {
                chrome.storage.sync.set({ cookie_token: cookie["value"] });
              }
              if (cookie["name"] === "account_id") {
                chrome.storage.sync.set({ account_id: cookie["value"] });
              }
            });
          }
          //判斷登入狀態
          chrome.storage.sync.get(
            ["ltuid", "ltoken", "cookie_token", "account_id"],
            function (data) {
              if (Object.keys(data).length) {
                //判斷簽到
                fetch(
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
                )
                  .then((response) => response.json())
                  .then((data) => {
                    let checkInInfo = data.data;
                    if (!checkInInfo) {
                      chrome.storage.sync.remove([
                        "ltuid",
                        "ltoken",
                        "cookie_token",
                        "account_id",
                      ]);
                      $("#not-open").hide();
                      $("#not-login").show();
                      $("#not-check-in").hide();
                      $("#check-in").hide();
                    } else {
                      if (checkInInfo.signed) {
                        $("#not-open").hide();
                        $("#not-login").hide();
                        $("#not-check-in").hide();
                        $("#check-in").show();
                      } else {
                        $("#not-open").hide();
                        $("#not-login").hide();
                        $("#not-check-in").show();
                        $("#check-in").hide();
                      }
                    }
                  });
              } else {
                $("#not-open").hide();
                $("#not-login").show();
                $("#not-check-in").hide();
                $("#check-in").hide();
                // alert("請先登入");
              }
            }
          );
        }
      );
    } else {
      chrome.storage.sync.set({ state: "close" });
      chrome.storage.sync.remove([
        "ltuid",
        "ltoken",
        "cookie_token",
        "account_id",
      ]);
      $("#not-open").show();
      $("#not-check-in").hide();
      $("#check-in").hide();
      $("#not-login").hide();
    }
  });

  $("#prev").on("click", function () {
    let num = parseInt($(".activeNum").attr("id"));
    $("#" + num)
      .removeClass("activeNum")
      .addClass("hidden");
    if (num == 1) {
      num = 3;
    } else {
      num--;
    }
    $("#" + num)
      .addClass("activeNum")
      .removeClass("hidden");
  });

  $("#next").on("click", function () {
    let num = parseInt($(".activeNum").attr("id"));
    $("#" + num)
      .removeClass("activeNum")
      .addClass("hidden");
    if (num == 3) {
      num = 1;
    } else {
      num++;
    }
    $("#" + num)
      .addClass("activeNum")
      .removeClass("hidden");
  });
});
