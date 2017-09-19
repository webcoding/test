(function(window){
  function getUrlParam(url, key) {
    if (!url) url = window.location.href;

    var searchReg = /([^&=?#]+)=([^&#]+)/g;
    var urlReg = /\/+.*\?/;
    var arrayReg = /(.+)\[\]$/;
    var urlParams = {};
    var match, name, value, isArray;


    // url = url.replace(/(.*)\?(.*)\?(.*)/, '$1?$2&$3');
    // var tempUrl = url.split('?');
    //
    // var tempLen = tempUrl.length;
    // if(tempLen>1){
    //   var temp = tempUrl[0];
    //   for(var i=0;i<tempLen;i++){
    //
    //   }gu
    // }
    //TODO：更好的方法做这件事，location.hash 替换掉 hash 部分以及第一个？，
    //      然后剩余部分的？全部替换为 &，之后取 key-value 值
    //故此方法可以优化[2016-03-18记]
    // url = url.replace(/(.*)\?(.*)\?(.*)/, '$1?$2&$3');

    //新方案，将所有？替换为&，之后将第一个&替换为？
    url = url.replace(/\?/g, '&').replace('&', '?');

    //var url = 'http://www.w3school.com.cn/tags/html_ref_canvas.asp?aa=1?cc=2&rr=4';
    //var reg = /^(http(?:s?):\/\/[\w\.\/?]+)([\w?=&]*)/
    //url.replace(reg, function(match,s1,s2){ return s1 + (!!s2 ? s2.replace(/\?/g,'&') : '');})

    while (match = searchReg.exec(url)) {
      name = match[1];
      value = match[2];
      isArray = name.match(arrayReg);
      //处理参数为url这种情况
      if (urlReg.test(value)) {
        urlParams[name] = url.substr(url.indexOf(value));
        break;
      } else {
        if (isArray) {
          name = isArray[1];
          urlParams[name] = urlParams[name] || [];
          urlParams[name].push(value);
        } else {
          urlParams[name] = value;
        }
      }
    }

    return key ? urlParams[key] : urlParams;
  };

  window.getUrlParam = getUrlParam;
})(window)

(function(window){
  // 取授权跳转 url
  var userAgent = navigator.userAgent.toLowerCase();
  var isWechat = userAgent.indexOf('micromessenger') >-1;
  var isAlipay = userAgent.indexOf("aliapp(ap") > -1;
  var oauthHost;
  var debugCode;
  var debugCodePath;
  var oauthUrl;
  var appId;
  var time = Date.now();

  oauthHost = 'm.haoshiqi.net';
  debugCode = !(location.host === oauthHost);
  if(isAlipay){
    appId = '2014082500009174';
    debugCodePath = '/debug/alipay/code.html';
  }
  if(isWechat){
    appId = 'wxc9dd03d5b90cf5f5';
    debugCodePath = '/debug/wechat/code.html';
  }
  function oauthUrl(type, url){
    if(isAlipay){
      return 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm' +
        '?app_id=' + appId +
        '&redirect_uri=' + getRedirectUrl(type, url) +
        '&scope=' + type +
        '&state=' + time;
    }
    if(isWechat){
      return 'https://open.weixin.qq.com/connect/oauth2/authorize' +
        '?appid=' + appId +
        '&redirect_uri=' + getRedirectUrl(type, url) +
        '&response_type=code' +
        '&scope=' + type +
        '&state=' + time +
        // '&connect_redirect=1' +
        '#wechat_redirect';
    }
  }
  function getRedirectUrl(authType, url){
    //jumpurl 即为当前页面，非线上环境，作为中转页面的回跳地址，目前有可选参数 page_type
    var jumpurl = url || (location.origin + location.pathname + location.hash);

    var urlfix = jumpurl.indexOf("?") === -1 ? '?' : '&';
    var redirectUrl;

    // 测试环境途径中转页面 线上环境直接跳转
    if(debugCode){
      redirectUrl = location.protocol + '//' + oauthHost + debugCodePath + '?auth_type=' + authType;
    }else{
      redirectUrl = jumpurl + urlfix + 'auth_type=' + authType;
    }
    if(debugCode && jumpurl){
      redirectUrl += '&jumpurl=' + encodeURIComponent(jumpurl);
    }
    return encodeURIComponent(redirectUrl);
  }

  window.wxAuth = {
    appId: appId,
    oauthUrl: oauthUrl,
  };
  window.isAlipay = isAlipay;
  window.isWechat = isWechat;
})(window)
