let countdownInterval;
let totalInterval;

function getDrinkCount() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'GET_DRINK_COUNT' }, (response) => {
      resolve(response.drinkCount);
    });
  });
}

function updateDrinkCount() {
  getDrinkCount().then((count) => {
    document.getElementById('drinkCount').textContent = count;
  });
}

function updateCountdown(remainingTime) {
    const formattedTime = new Intl.DateTimeFormat('zh-CN', {
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date(remainingTime));
    document.getElementById('countdown').textContent = formattedTime;
    
    // 更新进度条
    const progressPercentage = 100 - (remainingTime / totalInterval * 100);
    document.getElementById('progress-bar').style.width = `${progressPercentage}%`;
}

function startCountdown() {
    chrome.runtime.sendMessage({ type: 'GET_REMAINING_TIME' }, (response) => {
        if (response && response.remainingTime !== undefined) {
            let remainingTime = response.remainingTime;
            totalInterval = response.interval;
            updateCountdown(remainingTime);

            clearInterval(countdownInterval);
            countdownInterval = setInterval(() => {
                remainingTime -= 1000;
                if (remainingTime <= 0) {
                    clearInterval(countdownInterval);
                    updateCountdown(0);
                    setTimeout(startCountdown, 1000);
                } else {
                    updateCountdown(remainingTime);
                }
            }, 1000);
        } else {
            console.error('无法获取剩余时间');
            document.getElementById('countdown').textContent = '获取时间失败';
        }
    });
}

function drinkWater() {
    chrome.runtime.sendMessage({ type: 'DRINK_WATER' }, (response) => {
        if (response && response.success) {
            console.log('已记录喝水，重置计时器');
            startCountdown();
            updateDrinkCount();
        }
    });
}

function openSettings() {
    chrome.runtime.openOptionsPage();
}

document.addEventListener('DOMContentLoaded', () => {
    updateDrinkCount();
    document.getElementById('drinkButton').addEventListener('click', drinkWater);
    document.getElementById('settingsButton').addEventListener('click', openSettings);
    startCountdown();
});

// 当popup重新打开时，重新开始倒计时
chrome.runtime.onConnect.addListener(function(port) {
    if (port.name === "popup") {
        port.onDisconnect.addListener(function() {
            clearInterval(countdownInterval);
        });
    }
});

chrome.runtime.connect({name: "popup"});