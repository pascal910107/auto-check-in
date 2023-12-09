import { cookies } from "webextension-polyfill";

export async function makeGenshinRequest(url) {
  console.log("make request to: ", url);
  let cookie = await getCookie();
  let ds = getDS(url);
  let response = await fetch(url, {
    method: "GET",
    headers: {
      "x-rpc-app_version": "2.22.0",
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBSOversea/2.22.0",
      "x-rpc-client_type": "2",
      Origin: "https://act.hoyolab.com",
      "X-Requested-With": "com.mihoyo.hoyolab",
      Referer: "https://act.hoyolab.com",
      Cookie: cookie,
      DS: ds,
    },
  });
  if (response.status >= 400) {
    console.log(response.status, "bad response from Genshin server: ", response);
    return;
  } else if (response.status >= 300) {
    console.log(response.status, "redirected from Genshin server: ", response);
    return;
  }
  let data = await response.json();
  console.log(response.status, "response from Genshin server: ", data);
  return data;
}

export async function getCookie() {
  let cookieString = "";
  const _cookies = await cookies.getAll({ domain: "hoyolab.com" });
  if (_cookies.length !== 0) {
    cookieString = "";
    for (const cookie of _cookies)
      cookieString += `${cookie.name}=${encodeURIComponent(cookie.value)};`;
    return cookieString;
  } else {
    return "";
  }
}

export function getDS(url) {
  const timestamp = Math.floor(Date.now() / 1000);
  const random = randomIntFromInterval(100000, 200000);
  const param = url.split("?")[1];
  const text = `salt=okr4obncj8bw5a65hbnn5oo6ixjc3l9w&t=${timestamp}&r=${random}&b=&q=${param}`;
  const check = md5(text);
  return `${timestamp},${random},${check}`;
}

export function stringifyParams(params) {
  const keys = Object.keys(params);
  keys.sort();
  const values = [];
  keys.forEach((key) => {
    values.push(`${key}=${params[key]}`);
  });
  const paramsStr = values.join("&");
  return paramsStr;
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//給秒換算小時分鐘
export function convertSecondToHour(second) {
  let hours = Math.floor(second / 3600);
  second -= hours * 3600;
  let minutes = Math.floor(second / 60) % 60;
  let time = "";
  if (hours > 0) {
    time += hours + "小時";
  }
  if (minutes > 0) {
    time += minutes + "分鐘";
  }
  return time;
}

export function calFinTime(time) {
  let curTime = Date.parse(new Date());

  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0);
  tomorrow.setMinutes(0);
  tomorrow.setSeconds(0);
  tomorrow.setMilliseconds(0);
  let tomorrowTime = Date.parse(tomorrow);

  let finTime = curTime + time * 1000;
  let date = new Date(finTime);

  let h = date.getHours();
  let m = date.getMinutes();
  h < 10 && (h = "0" + h);
  m < 10 && (m = "0" + m);

  if (finTime < tomorrowTime) {
    return "今日" + h + ":" + m;
  } else if (finTime - tomorrowTime > 86400000) {
    return `周${"日一二三四五六".charAt(date.getDay())}` + h + ":" + m;
  } else {
    return "明日" + h + ":" + m;
  }
}

export function md5(string) {
  function md5_RotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function md5_AddUnsigned(lX, lY) {
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      else return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    } else {
      return lResult ^ lX8 ^ lY8;
    }
  }
  function md5_F(x, y, z) {
    return (x & y) | (~x & z);
  }
  function md5_G(x, y, z) {
    return (x & z) | (y & ~z);
  }
  function md5_H(x, y, z) {
    return x ^ y ^ z;
  }
  function md5_I(x, y, z) {
    return y ^ (x | ~z);
  }
  function md5_FF(a, b, c, d, x, s, ac) {
    a = md5_AddUnsigned(
      a,
      md5_AddUnsigned(md5_AddUnsigned(md5_F(b, c, d), x), ac)
    );
    return md5_AddUnsigned(md5_RotateLeft(a, s), b);
  }
  function md5_GG(a, b, c, d, x, s, ac) {
    a = md5_AddUnsigned(
      a,
      md5_AddUnsigned(md5_AddUnsigned(md5_G(b, c, d), x), ac)
    );
    return md5_AddUnsigned(md5_RotateLeft(a, s), b);
  }
  function md5_HH(a, b, c, d, x, s, ac) {
    a = md5_AddUnsigned(
      a,
      md5_AddUnsigned(md5_AddUnsigned(md5_H(b, c, d), x), ac)
    );
    return md5_AddUnsigned(md5_RotateLeft(a, s), b);
  }
  function md5_II(a, b, c, d, x, s, ac) {
    a = md5_AddUnsigned(
      a,
      md5_AddUnsigned(md5_AddUnsigned(md5_I(b, c, d), x), ac)
    );
    return md5_AddUnsigned(md5_RotateLeft(a, s), b);
  }
  function md5_ConvertToWordArray(string) {
    let lWordCount;
    const lMessageLength = string.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 =
      (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] =
        lWordArray[lWordCount] |
        (string.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function md5_WordToHex(lValue) {
    let WordToHexValue = "";
    let WordToHexValue_temp = "";
    let lByte;
    let lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = `0${lByte.toString(16)}`;
      WordToHexValue =
        WordToHexValue +
        WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }
  function md5_Utf8Encode(string) {
    string = string.replace(/\r\n/g, "\n");
    let utftext = "";
    for (let n = 0; n < string.length; n++) {
      const c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  }
  let x = [];
  let k, AA, BB, CC, DD, a, b, c, d;
  const S11 = 7;
  const S12 = 12;
  const S13 = 17;
  const S14 = 22;
  const S21 = 5;
  const S22 = 9;
  const S23 = 14;
  const S24 = 20;
  const S31 = 4;
  const S32 = 11;
  const S33 = 16;
  const S34 = 23;
  const S41 = 6;
  const S42 = 10;
  const S43 = 15;
  const S44 = 21;
  string = md5_Utf8Encode(string);
  x = md5_ConvertToWordArray(string);
  a = 0x67452301;
  b = 0xefcdab89;
  c = 0x98badcfe;
  d = 0x10325476;
  for (k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = md5_FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = md5_FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = md5_FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = md5_FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = md5_FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = md5_FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = md5_FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = md5_FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = md5_FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = md5_FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = md5_FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = md5_FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = md5_FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = md5_FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = md5_FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = md5_FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
    a = md5_GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = md5_GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = md5_GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = md5_GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = md5_GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = md5_GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = md5_GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = md5_GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = md5_GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = md5_GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = md5_GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = md5_GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = md5_GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = md5_GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = md5_GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = md5_GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
    a = md5_HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = md5_HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = md5_HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = md5_HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = md5_HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = md5_HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = md5_HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = md5_HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = md5_HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = md5_HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = md5_HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = md5_HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
    a = md5_HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = md5_HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = md5_HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = md5_HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
    a = md5_II(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = md5_II(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = md5_II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = md5_II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = md5_II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = md5_II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = md5_II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = md5_II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = md5_II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = md5_II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = md5_II(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = md5_II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = md5_II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = md5_II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = md5_II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = md5_II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
    a = md5_AddUnsigned(a, AA);
    b = md5_AddUnsigned(b, BB);
    c = md5_AddUnsigned(c, CC);
    d = md5_AddUnsigned(d, DD);
  }
  return (
    md5_WordToHex(a) +
    md5_WordToHex(b) +
    md5_WordToHex(c) +
    md5_WordToHex(d)
  ).toLowerCase();
}
// function md5(str) {
//   function d(n, t) {
//     var r = (65535 & n) + (65535 & t)
//     return (((n >> 16) + (t >> 16) + (r >> 16)) << 16) | (65535 & r)
//   }

//   function f(n, t, r, e, o, u) {
//     return d(((c = d(d(t, n), d(e, u))) << (f = o)) | (c >>> (32 - f)), r)
//     var c, f
//   }

//   function l(n, t, r, e, o, u, c) {
//     return f((t & r) | (~t & e), n, t, o, u, c)
//   }

//   function v(n, t, r, e, o, u, c) {
//     return f((t & e) | (r & ~e), n, t, o, u, c)
//   }

//   function g(n, t, r, e, o, u, c) {
//     return f(t ^ r ^ e, n, t, o, u, c)
//   }

//   function m(n, t, r, e, o, u, c) {
//     return f(r ^ (t | ~e), n, t, o, u, c)
//   }

//   function i(n, t) {
//     var r, e, o, u;
//     (n[t >> 5] |= 128 << t % 32), (n[14 + (((t + 64) >>> 9) << 4)] = t)
//     for (var c = 1732584193, f = -271733879, i = -1732584194, a = 271733878, h = 0; h < n.length; h += 16)
//       (c = l((r = c), (e = f), (o = i), (u = a), n[h], 7, -680876936)),
//       (a = l(a, c, f, i, n[h + 1], 12, -389564586)),
//       (i = l(i, a, c, f, n[h + 2], 17, 606105819)),
//       (f = l(f, i, a, c, n[h + 3], 22, -1044525330)),
//       (c = l(c, f, i, a, n[h + 4], 7, -176418897)),
//       (a = l(a, c, f, i, n[h + 5], 12, 1200080426)),
//       (i = l(i, a, c, f, n[h + 6], 17, -1473231341)),
//       (f = l(f, i, a, c, n[h + 7], 22, -45705983)),
//       (c = l(c, f, i, a, n[h + 8], 7, 1770035416)),
//       (a = l(a, c, f, i, n[h + 9], 12, -1958414417)),
//       (i = l(i, a, c, f, n[h + 10], 17, -42063)),
//       (f = l(f, i, a, c, n[h + 11], 22, -1990404162)),
//       (c = l(c, f, i, a, n[h + 12], 7, 1804603682)),
//       (a = l(a, c, f, i, n[h + 13], 12, -40341101)),
//       (i = l(i, a, c, f, n[h + 14], 17, -1502002290)),
//       (c = v(c, (f = l(f, i, a, c, n[h + 15], 22, 1236535329)), i, a, n[h + 1], 5, -165796510)),
//       (a = v(a, c, f, i, n[h + 6], 9, -1069501632)),
//       (i = v(i, a, c, f, n[h + 11], 14, 643717713)),
//       (f = v(f, i, a, c, n[h], 20, -373897302)),
//       (c = v(c, f, i, a, n[h + 5], 5, -701558691)),
//       (a = v(a, c, f, i, n[h + 10], 9, 38016083)),
//       (i = v(i, a, c, f, n[h + 15], 14, -660478335)),
//       (f = v(f, i, a, c, n[h + 4], 20, -405537848)),
//       (c = v(c, f, i, a, n[h + 9], 5, 568446438)),
//       (a = v(a, c, f, i, n[h + 14], 9, -1019803690)),
//       (i = v(i, a, c, f, n[h + 3], 14, -187363961)),
//       (f = v(f, i, a, c, n[h + 8], 20, 1163531501)),
//       (c = v(c, f, i, a, n[h + 13], 5, -1444681467)),
//       (a = v(a, c, f, i, n[h + 2], 9, -51403784)),
//       (i = v(i, a, c, f, n[h + 7], 14, 1735328473)),
//       (c = g(c,(f = v(f, i, a, c, n[h + 12], 20, -1926607734)),i,a,n[h + 5],4,-378558)),
//       (a = g(a, c, f, i, n[h + 8], 11, -2022574463)),
//       (i = g(i, a, c, f, n[h + 11], 16, 1839030562)),
//       (f = g(f, i, a, c, n[h + 14], 23, -35309556)),
//       (c = g(c, f, i, a, n[h + 1], 4, -1530992060)),
//       (a = g(a, c, f, i, n[h + 4], 11, 1272893353)),
//       (i = g(i, a, c, f, n[h + 7], 16, -155497632)),
//       (f = g(f, i, a, c, n[h + 10], 23, -1094730640)),
//       (c = g(c, f, i, a, n[h + 13], 4, 681279174)),
//       (a = g(a, c, f, i, n[h], 11, -358537222)),
//       (i = g(i, a, c, f, n[h + 3], 16, -722521979)),
//       (f = g(f, i, a, c, n[h + 6], 23, 76029189)),
//       (c = g(c, f, i, a, n[h + 9], 4, -640364487)),
//       (a = g(a, c, f, i, n[h + 12], 11, -421815835)),
//       (i = g(i, a, c, f, n[h + 15], 16, 530742520)),
//       (c = m(c,(f = g(f, i, a, c, n[h + 2], 23, -995338651)),i,a,n[h],6,-198630844)),
//       (a = m(a, c, f, i, n[h + 7], 10, 1126891415)),
//       (i = m(i, a, c, f, n[h + 14], 15, -1416354905)),
//       (f = m(f, i, a, c, n[h + 5], 21, -57434055)),
//       (c = m(c, f, i, a, n[h + 12], 6, 1700485571)),
//       (a = m(a, c, f, i, n[h + 3], 10, -1894986606)),
//       (i = m(i, a, c, f, n[h + 10], 15, -1051523)),
//       (f = m(f, i, a, c, n[h + 1], 21, -2054922799)),
//       (c = m(c, f, i, a, n[h + 8], 6, 1873313359)),
//       (a = m(a, c, f, i, n[h + 15], 10, -30611744)),
//       (i = m(i, a, c, f, n[h + 6], 15, -1560198380)),
//       (f = m(f, i, a, c, n[h + 13], 21, 1309151649)),
//       (c = m(c, f, i, a, n[h + 4], 6, -145523070)),
//       (a = m(a, c, f, i, n[h + 11], 10, -1120210379)),
//       (i = m(i, a, c, f, n[h + 2], 15, 718787259)),
//       (f = m(f, i, a, c, n[h + 9], 21, -343485551)),
//       (c = d(c, r)),
//       (f = d(f, e)),
//       (i = d(i, o)),
//       (a = d(a, u))
//     return [c, f, i, a]
//   }

//   function a(n) {
//     for (var t = '', r = 32 * n.length, e = 0; e < r; e += 8)
//       t += String.fromCharCode((n[e >> 5] >>> e % 32) & 255)
//     return t
//   }

//   function h(n) {
//     var t = []
//     for (t[(n.length >> 2) - 1] = void 0, e = 0; e < t.length; e += 1)
//       t[e] = 0
//     for (var r = 8 * n.length, e = 0; e < r; e += 8)
//       t[e >> 5] |= (255 & n.charCodeAt(e / 8)) << e % 32
//     return t
//   }

//   function e(n) {
//     for (var t, r = '0123456789abcdef', e = '', o = 0; o < n.length; o += 1)
//       (t = n.charCodeAt(o)),
//         (e += r.charAt((t >>> 4) & 15) + r.charAt(15 & t))
//     return e
//   }

//   function r(n) {
//     return unescape(encodeURIComponent(n))
//   }

//   function o(n) {
//     return a(i(h((t = r(n))), 8 * t.length))
//     var t
//   }

//   function u(n, t) {
//     return (function (n, t) {
//       var r,e,o = h(n),u = [],c = []
//       for (u[15] = c[15] = void 0,16 < o.length && (o = i(o, 8 * n.length)),r = 0;r < 16;r += 1)
//         (u[r] = 909522486 ^ o[r]), (c[r] = 1549556828 ^ o[r])
//       return ((e = i(u.concat(h(t)), 512 + 8 * t.length)), a(i(c.concat(e), 640)))
//     })(r(n), r(t))
//   }

//   function t(n, t, r) {
//     return t ? (r ? u(t, n) : e(u(t, n))) : r ? o(n) : e(o(n))
//   }

//   return t(str)
// }
