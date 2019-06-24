//index.js
//获取应用实例
const app = getApp()
const picDefaultWidth = 60;
const picDefaultHeight = 40;
const picTestFileDefaultWidth = 70;
var base64
var info

Page({
  onShareAppMessage(res){
    return{
      title: '测测你的颜值和我PK',
      path: '/pages/index/index'
    }
  },
  data: {
    picSelfAdaptHeight: picDefaultHeight,
    picSelfAdaptWidth: picDefaultWidth,
    testPicFile: '',
    testPicResult:null,
    base64:'',
    info:''
  },
  //取消选择图片
  handleCancelPic(){
    this.setData({
      testPicFile: '',
      testPicResult: null,
      picSelfAdaptHeight: picDefaultHeight,
      picSelfAdaptWidth: picDefaultWidth,
    });
  },
  //上传图片
  SelectImg() {
    let self = this;
    let ret = wx.chooseImage({
      count: 1,
      sizeType: "compressed",
      success: function (res) {
        self.setData({
          testPicFile: res.tempFiles[0].path,
        });
        self.getImageInfo(res.tempFiles[0].path, function (res) {
          self.setPicAdaptHeight(res.width, res.height);
        });
        wx.getFileSystemManager().readFile({
          filePath: res.tempFilePaths[0].toString(), //选择图片返回的相对路径
          encoding: 'base64', //编码格式
          success: res => { //成功的回调
            console.log('data:image/jpg;base64,' + res.data);
            base64 = res.data
          }
        })

      }
    });
  },
  //设置图片比例
  setPicAdaptHeight(picWidth, picHeight) {
    let h = (app.globalData.screenWidth * 0.7 / picWidth) * picHeight / app.globalData.screenHeight * 100;
    this.setData({
      picSelfAdaptHeight: h,
      picSelfAdaptWidth: picTestFileDefaultWidth
    });
  },
  getImageInfo(imgSrc, scb, ecb) {
    wx.getImageInfo({
      src: imgSrc,
      success: scb,
      fail: ecb
    });
  },
  //颜值鉴定
  ComputeScore(){
    let self = this;
    wx.showLoading({
      title: '颜值鉴定中',
      mask: true
    });
    wx.request({
      url: 'https://aip.baidubce.com/rest/2.0/face/v3/detect?access_token=XXX',  //此处XXX为自己在百度AI平台获取到的access_token
      data:{
        "image": base64,
        "image_type": "BASE64",
        "face_field": "face_shape,face_type,age,beauty"
      },
      method: 'POST',
      header:{
        'Content-Type': 'application/json; charset=UTF-8'
      },
      success : function(res){
        info = res.data.error_msg;

        if (res.data.result != null) {
          
          console.log('baidu--img-detect', res);
          self.setData({
            testPicResult: res.data.result.face_list[0].beauty,
          })

        } else if (res.data.result == null) {
          self.setData({
            info :'Sorry ' + res.data.error_msg
          })
          wx.showToast({
            title: info,
            icon : 'none',
            duration:2000
          });
          return false;
        } else {
          self.setData({
            info: 'Sorry 小程序崩溃了'
          })
        }
        wx.hideLoading();
      },
      fail: function (res) {
        wx.showToast({
          title: '网络异常，请稍后再试',
          icon: 'none',
          duration: 2000
        });
      }
    })
  },

  //再试一次
  handlePlayAgain() {
    this.setData({
      testPicFile: '',
      testPicResult: null,
      picSelfAdaptHeight: picDefaultHeight,
      picSelfAdaptWidth: picDefaultWidth
    });
  },
})
