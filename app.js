//app.js
App({

  onLaunch: function () {
    let self = this;
    wx.getSystemInfo({
      success: function (res) {
        self.globalData.screenWidth = res.windowWidth;
        self.globalData.screenHeight = res.windowHeight;
      }
    });
  },

  globalData: {
    screenWidth: null,
    screenHeight: null
  }

});