const { createApp, ref, useTemplateRef, defineComponent, watch } = Vue;

const app = createApp({
	setup() {
		// 允许转换为的类型
		const ALLOW_TRANSFORM_TYPES = [
			{ type: 'png', selected: true },
			{ type: 'tiff', selected: false },
			{ type: 'jpeg', selected: false },
			{ type: 'webp', selected: false },
		];

		// 转换类型（将所有图片转换为）
		const transformForAll = ref('null');
		watch(transformForAll, (val) => {
			if (val === 'null') return;
			taskList.value = taskList.value.map((t) => {
				return {
					...t,
					transformType: val,
				};
			});
		});

		// 图片文件列表
		const taskList = ref([]);
		watch(
			taskList,
			(val) => {
				if (val.length === 0) clearTask();
			},
			{ deep: true }
		);
		// 向任务列表添加任务
		const addTask = (task) => {
			if (!taskList.value.some((item) => item.path === task.path)) {
				taskList.value.push(task);
			} else {
				showCustomMessage('图片已存在');
			}
		};
		// 移除任务
		const removeTask = (task) => {
			const index = taskList.value.findIndex((item) => item.path === task.path);
			if (index > -1) {
				taskList.value.splice(index, 1);
			}
		};
		// 清空任务列表
		const clearTask = () => {
			taskList.value = [];
			location.reload();
		};

		// 点击选择图片
		let selectImgTimer = null;
		const handleSlectImg = () => {
			clearInterval(selectImgTimer);
			preloadApi.handleSelectImg();
			selectImgTimer = setInterval(async () => {
				const result = await preloadApi.handleGetImgList();
				if (result instanceof Array) {
					result.forEach((item) => {
						addTask(item);
					});
					if (taskList.value.length > 0) {
						uploadVisible.value = false;
						taskListVisilbe.value = true;
					}
					clearInterval(selectImgTimer);
				}
			}, 500);
		};

		// 继续选择图片
		let continueSelectImgTimer = null;
		const handleSelectMoreImg = () => {
			clearInterval(continueSelectImgTimer);
			preloadApi.handleSelectImg();
			continueSelectImgTimer = setInterval(async () => {
				const result = await preloadApi.handleGetImgList();
				if (result instanceof Array) {
					result.forEach((item) => {
						addTask(item);
					});
					if (taskList.value.length > 0) {
						uploadVisible.value = false;
						taskListVisilbe.value = true;
					}
					clearInterval(continueSelectImgTimer);
				}
			}, 500);
		};

		// 开始转换
		let getStatusTimer = null;
		const isTransforming = ref(false);
		const handleTransform = () => {
			clearInterval(getStatusTimer);
			const list = JSON.stringify(taskList.value);
			preloadApi.handleStartTransform(list);
			isTransforming.value = true;

			// 获取转换状态
			getStatusTimer = setInterval(async () => {
				const result = await preloadApi.handleGetTransformStatus();
				if (result.isFinish || result.isError) {
					isTransforming.value = false;
					clearInterval(getStatusTimer);
				}
			});
		};

		const uploadVisible = ref(true); // 是否显示上传
		const taskListVisilbe = ref(false); // 是否显示任务列表

		// 帮助对话框
		const helpDialogVisible = ref(false);
		const handleHelpDialog = (type) => {
			if (type === 'open') {
				helpDialogVisible.value = true;
			} else if (type === 'close') {
				helpDialogVisible.value = false;
			} else {
				throw new Error('handleHelpDialog: Invalid type');
			}
		};

		// 关闭对话框
		const aboutDialogVisible = ref(false);
		const handleAboutDialog = (type) => {
			if (type === 'open') {
				aboutDialogVisible.value = true;
			} else if (type === 'close') {
				aboutDialogVisible.value = false;
			} else {
				throw new Error('handleAboutDialog: Invalid type');
			}
		};

		// 转换字节数为可读格式
		const convertMemory = (bytes) => {
			if (bytes < 1024) {
				return `${bytes} B`;
			}
			const kb = bytes / 1024;
			if (kb < 1024) {
				return `${kb.toFixed(2)} KB`;
			}
			const mb = kb / 1024;
			if (mb < 1024) {
				return `${mb.toFixed(2)} MB`;
			}
			const gb = mb / 1024;
			return `${gb.toFixed(2)} GB`;
		};

		return {
			taskList,
			uploadVisible,
			isTransforming,
			transformForAll,
			taskListVisilbe,
			helpDialogVisible,
			aboutDialogVisible,
			ALLOW_TRANSFORM_TYPES,
			clearTask,
			removeTask,
			convertMemory,
			handleSlectImg,
			handleTransform,
			handleHelpDialog,
			handleAboutDialog,
			handleSelectMoreImg,
		};
	},
}).mount('#app');
