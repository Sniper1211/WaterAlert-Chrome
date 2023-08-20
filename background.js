let lastAlarmHandled = true;

chrome.runtime.onInstalled.addListener(() => {
    createAlarm();
    setBadgeColor();  // 设置徽章颜色为红色
});

chrome.alarms.onAlarm.addListener((alarm) => {
    let now = new Date();
    let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0, 0, 0);
    
    // 如果现在的时间超过了21点，则取消提醒
    if (now > end) {
        chrome.alarms.clear('drinkWaterAlarm');
        return;
    }

    if (lastAlarmHandled) {
        chrome.action.setBadgeText({text: '喝水'});
        lastAlarmHandled = false;
    }
});

chrome.action.onClicked.addListener(() => {
    chrome.action.setBadgeText({text: ''});
    lastAlarmHandled = true;
    createAlarm();  // 当用户点击徽章时，重新创建提醒，确保它始终与用户的最新操作保持同步
});

function createAlarm() {
    // 首先，取消之前的提醒
    chrome.alarms.clear('drinkWaterAlarm');

    let now = new Date();
    let start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0, 0);
    let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0, 0, 0);

    if (now > start && now < end) {
        chrome.alarms.create('drinkWaterAlarm', {
            delayInMinutes: 45,
            periodInMinutes: lastAlarmHandled ? 45 : 0
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
