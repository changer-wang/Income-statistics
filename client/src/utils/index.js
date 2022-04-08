import Taro from '@tarojs/taro'

const utils = {
  /* eslint-disable */
  log: console.log.bind(this),
  message(title, icon = 'none') {
    Taro.showToast({
      title,
      icon,
    });
  },
  alert(content, title = '提示') {
    return new Promise((resolve) => {
      Taro.showModal({
        title,
        content,
        showCancel: false,
        success() {
          resolve();
        },
        fail: resolve,
      });
    });
  },
  confirm(options) {
    return new Promise((resolve, reject) => {
      Taro.showModal({
        title: options.title ? options.title : '提示',
        content: options.text ? options.text : '',
        showCancel: options.cancel,
        confirmText: options.confirmText ? options.confirmText : '确定',
        confirmColor: options.confirmColor ? options.confirmColor : '#9bd323',
        success({ confirm }) {
          if (confirm) {
            resolve();
          } else {
            reject();
          }
        },
        fail: reject,
      });
    });
  },
  picker(items, options = {}) {
    return Taro.showActionSheet({
      itemList: items.map(i => i.label),
      ...options,
    }).then(({ tapIndex }) => {
      return items[tapIndex].value;
    });
  },
  isIos() {
    const { platform, system } =  Taro.getSystemInfoSync()
    return platform === 'ios' || /iOS/.test(system)
  },
  isAndroid() {
    const { platform, system } =  Taro.getSystemInfoSync()
    return platform === 'android' || /Android/.test(system)
  },
  authorize(scope) {
    return new Promise((resolve, reject) => {
      Taro.getSetting({
        success(res) {
          if (res.authSetting[scope]) {
            resolve();
          } else {
            reject();
          }
        },
        fail: reject,
      });
    });
  },
  querystring(object) {
    return Object
      .keys(object)
      .map(key => `${key}=${object[key]}`)
      .join('&');
  },
  login(path) {
    return new Promise((resolve, reject) => {
      if (path !== 'index') {
        const account = Taro.getStorageSync('account');
        if (account) {
          resolve(account);
          return;
        }
      }

      utils
        .getUserInfo()
        .then((userInfo) => {
          Taro.login({
            success({ code }) {
              utils
                .post({
                  url: '/auth/customizeMiniWechatLogin',
                  data: {
                    code,
                    avatar: userInfo.avatarUrl,
                    name: userInfo.nickName,
                  },
                  loading: '登录中...',
                })
                .then(({ account, token }) => {
                  Taro.setStorageSync('account', account);
                  Taro.setStorageSync('token', token);
                  resolve(account);
                }, (error) => {
                  reject(error);
                });
            },
            fail(error) {
              reject(error);
              // this.goAuthorize();
            },
          });
        }, (error) => {
            reject(error);
          // this.goAuthorize();
        });
    });
  },
  getAccount() {
    const account = Taro.getStorageSync('account');
    if (account) return account;

    return null;
  },
  setAccount(account) {
    Taro.setStorageSync('account', account);
  },
  getPageHeight() {
    const { windowHeight } = wx.getSystemInfoSync()
    return windowHeight
  },
  getUserInfo() {
    return new Promise((resolve, reject) => {
      Taro.getUserInfo({
        success(res) {
          resolve(res.userInfo);
        },
        fail: reject,
      });
    });
  },
  getApiPath(url) {
    if (process.env.NODE_ENV === 'production') {
      return `https://minicourse.wxzxzj.com/api${url}`;
    }


    const env = Taro.getStorageSync('env')

    if (env === 'online') {
      return `https://minicourse.wxzxzj.com/api${url}`
    } else if (env === 'test') {
      return `https://test-minicourse.vanthink.cn/api${url}`
    } else {
      return `https://dev-minicourse.vanthink.cn/api${url}`
    }
  },
  get(options) {
    return utils
      .ajax({
        method: 'GET',
        ...options,
      });
  },
  post(options) {
    return utils
      .ajax({
        method: 'POST',
        ...options,
      });
  },
  ajax({ url, loading, ...options }) {
    if (loading) {
      Taro.showLoading({
        title: loading,
        mask: true,
      });
    }
    const token = Taro.getStorageSync('token');
    if (token) {
      if (!options.header) {
        options.header = {};
      }
      options.header['Authorization'] = token;
      options.header['identity'] = 'wechat';
    }
    return new Promise((resolve, reject) => {
      Taro.request({
        url: utils.getApiPath(url),
        ...options,
        success(res) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            if (res.data.errcode) {
              reject(res.data);
            } else {
              resolve(res.data.data);
            }
          } else {
            console.error(res);
            reject({
              error: 901,
              message: '系统繁忙',
            });
          }
        },
        fail(res) {
          console.error(res);
          reject({
            error: 902,
            message: '系统繁忙',
          });
        },
        complete(res) {
          if (loading) {
            Taro.hideLoading();
          }
          if (res && res.data && res.data.errcode) {
            utils.message(res.data.errstr || '系统繁忙');
            if (res.data.errcode === 10010) {
              Taro.setStorageSync('account', null);
              Taro.setStorageSync('token', null);
              Taro.reLaunch({
                url: `/pages/error/error?message=${res.data.errstr || '哎呀，好像出现错误了哦~'}`
              });
            }
          }
        },
      });
    });
  },
  request({ name, loadingMessage, options }) {
    const account = utils.getAccount()
    const openid = account ? account.openid : null
    if (loadingMessage) {
      Taro.showLoading({
        title: loadingMessage,
        mask: true,
      });
    }
    return new Promise((resolve, reject) => {
      Taro.cloud
      .callFunction({
        name,
        data: {
          ...options,
          openid,
        },
      }).then(({ result }) => {
        console.log(result)
        if (loadingMessage) {
          Taro.hideLoading();
        }
        resolve(result)
      }).catch((result) => {
        if (loadingMessage) {
          Taro.hideLoading();
        }
        reject(result)
      })
    })
  },
  params(query, key) {
    const params = Object.create(null);

    if (query) {
      const values = decodeURIComponent(query).split('&');
      let pairs;
      for (const i in values) {
        pairs = values[i].split('=');
        params[pairs[0]] = pairs.length ? pairs[1] : '';
      }
    }

    if (this.isString(key)) {
      if (key in params) {
        return params[key];
      } else {
        return null;
      }
    } else {
      return params;
    }
  },
  isDate(value) {
    return Object.prototype.toString.call(value) === '[object Date]';
  },
  leftPad(value, pad, length) {
    value = String(value);
    while (value.length < length) {
      value = pad + value;
    }
    return value;
  },
  isString(value) {
    return typeof value === 'string';
  },
  isArray(value) {
    return Array.isArray(value);
  },
  getAudioDuration(src, scale = 11766) {
    return new Promise((resolve, reject) => {
      if (!src) {
        resolve(30)
        return
      }
      Taro.request({
        url: src,
        method: 'HEAD',
        success(res) {
          const duration = Math.round(res.header['Content-Length'] / scale)
          resolve(duration)
        },
        fail() {
          reject()
        },
      })
    })
  },
  Array: {
    findIndex(array, value, key, startIndex) {
      let index = -1;

      for (let i = startIndex || 0; i < array.length; i += 1) {
        const item = array[i];
        if (key && item[key] === value[key]) {
          index = i;
          break;
        } else if (item === value) {
          index = i;
          break;
        }
      }

      return index;
    },
    exist(array, value, key) {
      const index = this.findIndex(array, value, key);

      return index !== -1;
    },
    existArray(array, part, key) {
      let isAll = true;
      if (part) {
        for (let i = 0; i < part.length; i += 1) {
          const value = part[i];
          if (!this.exist(array, value, key)) {
            isAll = false;
            break;
          }
        }
      }
      return part && part.length && isAll;
    },
    find(array, value, key) {
      const index = this.findIndex(array, value, key);

      if (index !== -1) {
        return array[index];
      } else {
        return undefined;
      }
    },
    unipush(array, value, key) {
      if (!this.exist(array, value, key)) {
        array.push(value);
      }
    },
    pushReplace(array, value, key) {
      if (this.exist(array, value, key)) {
        this.remove(array, value, key)
      }
      array.push(value);
    },
    remove(array, value, key) {
      const index = this.findIndex(array, value, key);

      if (index !== -1) {
        array.splice(index, 1);
      }
    },
    removeAll(array, value, key, startIndex) {
      let index;
      while (index !== -1) {
        index = this.findIndex(array, value, key, startIndex);
        if (index !== -1) {
          array.splice(index, 1);
        }
      }
    },
    toggle(array, value, key) {
      if (this.exist(array, value, key)) {
        this.remove(array, value, key);
      } else {
        array.push(value);
      }
    },
    toggleArray(array, part, key) {
      if (this.existArray(array, part, key)) {
        part.forEach(value => this.remove(array, value, key));
      } else {
        part.forEach(value => this.unipush(array, value, key));
      }
    },
    concat(array, part, index) {
      if (utils.isUndefined(index)) {
        index = array.length;
      }
      array.splice(index, 0, ...(utils.isArray(part) ? part : [part]));
    },
    toMatrix(array, rows, cols) {
      const matrix = [];
      for (let i = 0; i < rows; i += 1) {
        matrix[i] = [];
        for (let j = 0; j < cols; j += 1) {
          matrix[i][j] = array[i * cols + j];
        }
      }
      return matrix;
    },
    getArrEqual(arr1, arr2) {
      let newArr = [];
      for (let i = 0; i < arr2.length; i++) {
        for (let j = 0; j < arr1.length; j++) {
          if (arr1[j] === arr2[i]) {
            newArr.push(arr1[j]);
          }
        }
      }
      return newArr;
    },
    getArrRepeatNumber(array, value, key) {
      let number = 0;
      for (let i = 0; i < array.length; i += 1) {
        if (array[i][key] === value[key]) {
          number += 1;
        }
      }
      return number;
    },
    sum(numbers) {
      return numbers.reduce((total, num) => (total + num));
    },
    groupBy(array, key) {
      const keyData = Array.from(new Set(array.map(item => item[key])));
      return keyData.map(value => array.filter(item => item[key] === value));
    },
    shuffle(array, key) {
      if (array.length <= 1) return array;

      let newArray = utils.clone(array);
      for (let i = newArray.length - 1; i >= 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        const itemAtIndex = newArray[randomIndex];
        newArray[randomIndex] = newArray[i];
        newArray[i] = itemAtIndex;
      }

      if (newArray.every((item, index) => key ? item[key] === array[index][key] : item === array[index])) {
        newArray = this.shuffle(array, key);
      }

      return newArray;
    },
    group(array, key) {
      const obj = {};
      for (let i = 0; i < array.length; i += 1) {
        if (key) {
          if (obj[array[i][key]]) {
            obj[array[i][key]].push(array[i]);
          } else {
            obj[array[i][key]] = [array[i]];
          }
        }
      }
      return obj;
    },
    flat(array) {
      while (array.some(type => Array.isArray(type))){
        array = ([]).concat.apply([], array)
      }

      return array
    }
  },
  Date: {
    format(date, formatExp) {
      let result = formatExp;
      if (utils.isDate(date)) {
        const years = String(date.getFullYear());
        const months = date.getMonth() + 1;
        const days = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const milliseconds = date.getMilliseconds();
        const spans = [
          {
            key: 'yyyy',
            value: years,
          },
          {
            key: 'yy',
            value: years.substr(-2),
          },
          {
            key: 'MM',
            value: utils.leftPad(months, '0', 2),
          },
          {
            key: 'M',
            value: months,
          },
          {
            key: 'dd',
            value: utils.leftPad(days, '0', 2),
          },
          {
            key: 'd',
            value: days,
          },
          {
            key: 'HH',
            value: utils.leftPad(hours, '0', 2),
          },
          {
            key: 'H',
            value: hours,
          },
          {
            key: 'mm',
            value: utils.leftPad(minutes, '0', 2),
          },
          {
            key: 'm',
            value: minutes,
          },
          {
            key: 'ss',
            value: utils.leftPad(seconds, '0', 2),
          },
          {
            key: 's',
            value: seconds,
          },
          {
            key: 'S',
            value: utils.leftPad(milliseconds, '0', 3),
          },
        ];
        for (let i = 0; i < spans.length; i += 1) {
          const span = spans[i];
          result = result.replace(new RegExp(span.key, 'g'), span.value);
        }
      }
      return result;
    },
    secondsToTime(totalSeconds) {
      let time = '';
        let hours = 0;
        let minutes = 0;
        let seconds = 0;

        seconds = totalSeconds;

        hours = Math.floor(seconds / (60 * 60));
        if (hours) {
          seconds = seconds % (60 * 60);
        }
        minutes = Math.floor(seconds / 60);
        if (minutes) {
          seconds = seconds % 60;
        }

        if (hours) {
          if (hours < 10) {
            time = '0';
          }
          time += hours;
          time += ':';
        }
        if (minutes < 10) {
          time += '0';
        }
        time += minutes;
        time += ':';
        if (seconds < 10) {
          time += '0';
        }
        time += seconds;

        return time;
    }
  },
  debounce(fn, delay) {
    let timer = null;
    return function handler() {
      const context = this;
      const args = arguments;

      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(context, args);
      }, delay);
    };
  },
  throttle(func, delay) {
    let prev = Date.now();
    return function() {
      const context = this;
      const args = arguments;
      const now = Date.now();
      if (now - prev >= delay) {
        func.apply(context, args);
        prev = Date.now();
      }
    };
  },
  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },
  // 全角转半角
  toCDB(str) {
    let tmp = '';
    let charCode;
    for (let i = 0; i < str.length; i += 1) {
      charCode = str.charCodeAt(i);
      if (charCode === 12288) {
        tmp += String.fromCharCode(str.charCodeAt(i) - 12256);
        continue;
      }
      if (charCode > 65248 && charCode < 65375) {
        tmp += String.fromCharCode(charCode - 65248);
      } else {
        tmp += String.fromCharCode(charCode);
      }
    }
    return tmp;
  },
  toNumber(str) {
    let tmp;
    let charCode;
    if (!str) return str;
    if (str.length === 1) {
      charCode = str.charCodeAt(0);
      // 将①～⑳转化成 数字1～20
      if (charCode >= 9312 && charCode <= 9331) {
        tmp = charCode - 9311;
      }
      // 将⑴～⒇转化成 数字1～20
      if (charCode >= 9332 && charCode <= 9351) {
        tmp = charCode - 9331;
      }
    } else if (/\(\d+\)|（\d+）|（\d+\)|\(\d+）/.test(str)) {
      tmp = str.replace(/\(|\)|（|）/g, '');
    } else if (str.length > 1) {
      tmp = str;
      for (let i = 0; i < str.length; i++) {
        const letter = str[i];
        charCode = letter.charCodeAt(0)
        // 将①～⑳转化成 数字1～20
        if (charCode >= 9312 && charCode <= 9331) {
          tmp = tmp.replace(letter, `${charCode - 9311}`);
        }
        // 将⑴～⒇转化成 数字1～20
        if (charCode >= 9332 && charCode <= 9351) {
          tmp = tmp.replace(letter, `${charCode - 9331}`);
        }
      }
    }
    return tmp ? tmp.toString() : str;
  }
};

export default utils;
