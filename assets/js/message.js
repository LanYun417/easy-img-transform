// 创建消息提示框的主元素
const messageBox = document.createElement('div');
messageBox.style.position = 'fixed';
messageBox.style.top = '10px';
messageBox.style.right = '10px';
messageBox.style.padding = '15px';
messageBox.style.borderRadius = '4px';
messageBox.style.boxShadow = '0 10px 40px -10px rgba(0, 64, 128, .3)';
messageBox.style.backgroundColor = '#fff';
messageBox.style.zIndex = '9999';
messageBox.style.display = 'none';
messageBox.style.color = '#07689f';
messageBox.onclick = hideMessage;

// 创建显示消息内容的元素
const messageContent = document.createElement('span');
messageContent.style.marginRight = '10px';

// 将内容元素和关闭按钮添加到消息框元素中
messageBox.appendChild(messageContent);

// 显示消息的函数
function showCustomMessage(message) {
	document.body.appendChild(messageBox);
	messageContent.textContent = message;
	messageBox.style.display = 'block';
	setTimeout(() => {
		hideMessage();
	}, 3000); // 3秒后自动关闭消息框，可根据需求调整时间
}

// 隐藏消息的函数
function hideMessage() {
	messageBox.style.display = 'none';
	messageBox.remove();
}
