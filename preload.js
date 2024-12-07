const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('preloadApi', {
	// 选择图片
	handleSelectImg() {
		ipcRenderer.send('select-img');
	},
	// 获取图片列表
	handleGetImgList() {
		return ipcRenderer.invoke('get-img-list');
	},
	// 开始转换
	handleStartTransform(list) {
		ipcRenderer.send('start-transform', list);
	},
	// 获取转换状态
	handleGetTransformStatus() {
		return ipcRenderer.invoke('get-transform-status');
	},
});
