const service = require('../../services/app-service');
const { setTitle, showError, showSuccess } = require('../../utils/page');

Page({
  data: {
    useCloud: false,
  },

  onLoad() {
    setTitle('设置');
    this.refresh();
  },

  refresh() {
    const session = service.getSession();
    this.setData({ useCloud: session.useCloud });
  },

  onCloudChange(event) {
    const value = event.detail.value;
    service.setUseCloud(value);
    this.setData({ useCloud: value });
    showSuccess(value ? '已切换到云开发模式' : '已切换到 Demo 模式');
  },

  resetDemo() {
    try {
      service.resetDemoData();
      this.setData({ useCloud: false });
      showSuccess('演示数据已重置');
    } catch (error) {
      showError(error);
    }
  },
});
