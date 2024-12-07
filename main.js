const fs = require('node:fs');
const path = require('node:path');
const { transform } = require('./sharp');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { ALLOW_IMG_TYPES, ALLOW_TRANSFORM_TYPES } = require('./constant');

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// 1. 创建一个 createWindow 函数，将 html 加载到新的 BrowserWindow 实例中
let win;
let imgList = null;
const createWindow = () => {
	win = new BrowserWindow({
		width: 1000, // 设置窗口宽度
		height: 700, // 设置窗口高度
		autoHideMenuBar: true,
		resizable: false, // 禁止调整窗口大小
		webPreferences: {
			preload: path.resolve(__dirname, 'preload.js'),
		},
	});

	fs.mkdirSync(path.resolve(process.cwd(), 'output'), { recursive: true, mode: 0o777 });

	// 选择图片
	ipcMain.on('select-img', () => {
		// 打开文件选择对话框
		dialog
			.showOpenDialog({
				title: '选择图片',
				properties: ['openFile', 'multiSelections'],
				filters: [{ name: '图片文件', extensions: ALLOW_IMG_TYPES }],
			})
			.then(({ filePaths }) => {
				imgList = [];
				try {
					filePaths.forEach((item) => {
						const stat = fs.statSync(item);
						if (stat.isFile()) {
							imgList.push({ path: item, transformType: 'png', size: stat.size });
						}
					});
				} catch (error) {
					console.error(error);
				}
			})
			.catch((err) => {
				console.error(err);
			});
	});

	// 获取图片列表
	ipcMain.handle('get-img-list', () => {
		temp = [...imgList];
		imgList = null;
		return temp;
	});

	// 转换状态
	let status = {
		isFinish: false,
		isError: false,
	};
	// 开始转换
	ipcMain.on('start-transform', async (event, list) => {
		list = JSON.parse(list);

		if (list instanceof Array && list.length >= 1) {
			for (let i in list) {
				const index = Number(i);
				const filePath = list[index].path;
				const type = list[index].transformType.toLowerCase();
				if (!ALLOW_TRANSFORM_TYPES.includes(type)) {
					dialog.showErrorBox(
						'错误',
						`第 ${index + 1} 张图片转换失败，不支持该格式转换：${type}`
					);
					break;
				}
				try {
					await transform(filePath, type);
					// 转换完成
					if (index === list.length - 1) {
						status.isFinish = true;
						dialog.showMessageBox({
							title: '完成',
							message: `转换完成，共转换 ${index + 1} 张图片 \n 输出目录：${path.resolve(
								process.cwd(),
								'output'
							)}`,
							type: 'info',
						});
					}
				} catch (error) {
					status.isError = true;
					dialog.showErrorBox('错误', error.message);
				}
			}
		} else {
			dialog.showErrorBox('错误', '请先选择图片');
		}
	});

	// 转换完成
	ipcMain.handle('get-transform-status', () => status);

	win.loadFile('./index.html'); // 加载 html
};

// 2. 调用 createWindow 函数来打开窗口
app.whenReady().then(() => {
	createWindow();

	app.on('window-all-closed', () => {
		// 所有窗口都关闭时退出应用
		if (process.platform !== 'darwin') app.quit();
	});

	app.on('activate', () => {
		// 重新激活窗口时创建窗口
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});
