document.addEventListener("DOMContentLoaded", function() {
    function clearBadge() {
        console.log("Clearing badge...");

        // 先发送消息
        chrome.runtime.sendMessage({action: 'drinkWaterHandled'}, function(response) {
            // 确保消息已被处理后，再关闭popup
            window.close();
        });
    }

    document.getElementById('drinkButton').addEventListener('click', clearBadge);
});
