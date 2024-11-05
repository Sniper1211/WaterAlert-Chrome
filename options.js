// 保存设置
function saveOptions() {
    const interval = document.getElementById('reminderInterval').value;
    chrome.storage.sync.set({ reminderInterval: interval }, function() {
        const status = document.getElementById('status');
        status.textContent = '设置已保存。新的提醒间隔将立即生效。';
        setTimeout(function() {
            status.textContent = '';
        }, 3000);
    });
}

// 加载设置
function loadOptions() {
    chrome.storage.sync.get({ reminderInterval: 60 }, function(items) {
        document.getElementById('reminderInterval').value = items.reminderInterval;
    });
}

document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('saveButton').addEventListener('click', saveOptions);
