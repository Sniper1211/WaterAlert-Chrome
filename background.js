let lastAlarmHandled = true;

chrome.runtime.onInstalled.addListener(() => {
    createAlarm();
    setBadgeColor();  // 设置徽章颜色为红色
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (lastAlarmHandled) {
        chrome.action.setBadgeText({text: '喝水'});
        lastAlarmHandled = false;
    }
});

chrome.action.onClicked.addListener(() => {
    chrome.action.setBadgeText({text: ''});
    lastAlarmHandled = true;
});

function createAlarm() {
    let now = new Date();
    let start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0, 0);
    let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0, 0, 0);

    if (now > start && now < end) {
        chrome.alarms.create('drinkWaterAlarm', {
            delayInMinutes: 0.5,
            periodInMinutes: lastAlarmHandled ? 0.5 : 0
        });
    }
}

function setBadgeColor() {
    chrome.action.setBadgeBackgroundColor({color: "#D04737"});  // 设置徽章背景颜色为红色
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'drinkWaterHandled') {
      chrome.action.setBadgeText({text: ''});
      lastAlarmHandled = true;
      createAlarm();
  }
});
