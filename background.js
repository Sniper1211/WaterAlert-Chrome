let REMINDER_INTERVAL = 60 * 60 * 1000; // 默认为1小时
let lastDrinkTime;
let drinkCount = 0;
let lastResetDate;

// 加载保存的设置
function loadSettings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get({
            reminderInterval: 60,
            drinkCount: 0,
            lastResetDate: new Date().toDateString()
        }, function(items) {
            REMINDER_INTERVAL = items.reminderInterval * 60 * 1000; // 转换为毫秒
            drinkCount = items.drinkCount;
            lastResetDate = new Date(items.lastResetDate);
            console.log('当前设置的提醒间隔：', items.reminderInterval, '分钟');
            console.log('实际使用的间隔：', REMINDER_INTERVAL / 1000, '秒');
            console.log('当前喝水次数：', drinkCount);
            console.log('上次重置日期：', lastResetDate);
            checkAndResetDailyCount();
            resolve();
        });
    });
}

// 检查并重置每日计数
function checkAndResetDailyCount() {
    const today = new Date().toDateString();
    if (today !== lastResetDate.toDateString()) {
        console.log('新的一天，重置喝水次数');
        drinkCount = 0;
        lastResetDate = new Date(today);
        chrome.storage.sync.set({
            drinkCount: drinkCount,
            lastResetDate: lastResetDate.toDateString()
        });
    }
}

// 显示提醒
function showReminder() {
    console.log('显示喝水提醒');
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: '喝水提醒',
        message: '该喝水啦！保持水分很重要哦。'
    });
    chrome.action.setBadgeText({ text: '喝水' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
    chrome.action.setBadgeTextColor({ color: '#FFFFFF' });
}

// 清除提醒
function hideReminder() {
    console.log('隐藏喝水提醒');
    chrome.action.setBadgeText({ text: '' });
}

// 重置定时器
function resetTimer() {
    console.log('重置计时器');
    hideReminder();
    lastDrinkTime = Date.now();
    checkAndResetDailyCount(); // 检查是否需要重置计数
    drinkCount++;
    chrome.storage.sync.set({ drinkCount: drinkCount });
    chrome.alarms.create('waterReminder', { delayInMinutes: REMINDER_INTERVAL / 60000 });
}

// 初始化
console.log('初始化扩展');
loadSettings().then(() => {
    lastDrinkTime = Date.now();
    chrome.alarms.create('waterReminder', { delayInMinutes: REMINDER_INTERVAL / 60000 });
});

// 监听设置变化
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync' && 'reminderInterval' in changes) {
        console.log('设置已更改，重新加载设置');
        loadSettings().then(resetTimer);
    }
});

// 处理定时器事件
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'waterReminder') {
        showReminder();
    }
});

// 处理消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('收到消息:', request);
    if (request.type === 'DRINK_WATER') {
        resetTimer();
        sendResponse({ success: true });
    } else if (request.type === 'GET_REMAINING_TIME') {
        const remainingTime = REMINDER_INTERVAL - (Date.now() - lastDrinkTime);
        sendResponse({ remainingTime: Math.max(0, remainingTime), interval: REMINDER_INTERVAL });
    } else if (request.type === 'GET_DRINK_COUNT') {
        checkAndResetDailyCount(); // 在获取喝水次数时也检查是否需要重置
        sendResponse({ drinkCount: drinkCount });
    }
    return true; // 保持消息通道开放，以支持异步响应
});

// 每天凌晨检查并重置计数
chrome.alarms.create('dailyReset', { when: getNextMidnight(), periodInMinutes: 24 * 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'dailyReset') {
        checkAndResetDailyCount();
    }
});

function getNextMidnight() {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return nextMidnight.getTime();
}