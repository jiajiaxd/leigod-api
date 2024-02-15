"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.leiGodAccount = void 0;
var _axios = _interopRequireDefault(require("axios"));
var _crypto = require("crypto");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function generateMD5(str) {
  return (0, _crypto.createHash)('md5').update(str).digest('hex');
}
class TokenExpiredError extends Error {
  constructor() {
    super("Token is expired, please re-login to get a new token.");
    this.name = "TokenExpiredError";
  }
}
class leiGodAccount {
  /**
   * 
   * @param {String} token 
   */
  constructor(token = null) {
    this.token = token;
    this.session = _axios.default.create({
      baseURL: "https://webapi.leigod.com/api",
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.0.0',
        'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8",
        'Connection': "keep-alive",
        'Accept': "application/json, text/javascript, */*; q=0.01",
        'Accept-Encoding': "gzip, deflate, br",
        'Accept-Language': "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        'DNT': "1",
        'Referer': 'https://www.legod.com/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site'
      }
    });
  }

  /**
   * 
   * @param {String} userName 
   * @param {String} password 
   * @returns 
   */
  async loginThroughPassword(userName, password) {
    const response = await this.session.post("/auth/login", {
      'username': userName,
      'password': generateMD5(password),
      'user_type': '0',
      'src_channel': 'guanwang',
      'country_code': 86,
      'lang': 'zh_CN',
      'region_code': 1,
      'account_token': 'null'
    });
    if (response.data['code'] == 0) {
      this.token = response.data['data']['login_info']['account_token'];
      return this.token;
    } else {
      throw new Error(response.data['msg']);
    }
  }
  async getAccountInfo() {
    const response = await this.session.post('/user/info', {
      'account_token': this.token,
      "lang": "zh_CN"
    });
    if (response.data['code'] == 0) {
      return response.data['data'];
    } else if (response.data['code'] == 400006) {
      throw new TokenExpiredError();
    }
  }

  /**
   * 
   * 如果时间正在消耗，则返回false，否则返回用户信息
   */
  async getWhetherTimeIsConsuming() {
    const info = await this.getAccountInfo();
    const status = info['pause_status_id'];
    if (status == 1) {
      return false;
    } else {
      return info;
    }
  }
  async pauseTime() {
    const response = await this.session.post('/user/pause', {
      'account_token': this.token,
      "lang": "zh_CN"
    });
    if (response.status === 403) {
      throw new Error('Unknown server error.');
    } else {
      return response.data["msg"];
    }
  }
  async recoverTime() {
    const response = await this.session.post('/user/recover', {
      'account_token': this.token,
      "lang": "zh_CN"
    });
    if (response.status === 403) {
      throw new Error('Unknown server error.');
    } else {
      return response.data["msg"];
    }
  }
}
exports.leiGodAccount = leiGodAccount;