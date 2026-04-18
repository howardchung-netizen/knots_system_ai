import React, { useEffect, useRef } from 'react';
import moment from 'moment/min/moment-with-locales';
import i18n from "i18next";
import ReactDOM from 'react-dom';

export const isAuthorized = (roles, resource, action) => {
  if (!roles || !roles.length || !resource || !action) return false;

  for (let i = 0; i < roles.length; i++) {
    if (!roles[i].permissions || !roles[i].permissions.length) continue;

    for (let j = 0; j < roles[i].permissions.length; j++) {
      if (
        (roles[i].permissions[j].resource === '.*' || roles[i].permissions[j].resource === resource) &&
        (roles[i].permissions[j].actions.includes('ALL') || roles[i].permissions[j].actions.includes(action))
      ) return true;
    }
  }

  return false;
};

export const getAuthorizationStatus = (resource, action) => {
  try {
    const data = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALSTORAGE_ITEM));

    if (!data) return { isAuthorized: false, authorizationError: '未登入，請先登入。' };
    if (data.exp && data.exp * 1000 <= Date.now()) return { isAuthorized: false, authorizationError: '登入逾時，請重新登入。' };

    if (resource && action) {
      if (isAuthorized(data.roles, resource, action)) {
        return { isAuthorized: true, userData: data };
      } else {
        return { isAuthorized: false, authorizationError: '權限不足，請以其他賬號登入。' };
      }
    } else {
      return { isAuthorized: true, userData: data };
    }
  } catch (error) {
    console.error(error);
    return { isAuthorized: false, authorizationError: '請重新登入。' };
  }
};

/**
 * 
 * @param {Object[]} premissions {resource, action}
 * @returns 
 */
export const getAuthorizationStatusFromPermissions = (premissions) => {
  try {
    const data = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALSTORAGE_ITEM));

    if (!data) return { isAuthorized: false, authorizationError: '未登入，請先登入。' };
    if (data.exp && data.exp * 1000 <= Date.now()) return { isAuthorized: false, authorizationError: '登入逾時，請重新登入。' };

    if (premissions?.length > 0) {
      if (premissions.some(({ resource, action }) => isAuthorized(data.roles, resource, action))) {
        return { isAuthorized: true, userData: data };
      } else {
        return { isAuthorized: false, authorizationError: '權限不足，請以其他賬號登入。' };
      }
    } else {
      return { isAuthorized: true, userData: data };
    }
  } catch (error) {
    console.error(error);
    return { isAuthorized: false, authorizationError: '請重新登入。' };
  }
};

export const isRole = (role) => {
  try {
    const data = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALSTORAGE_ITEM));

    if (!data) return false;
    if (data.exp && data.exp * 1000 <= Date.now()) return false;

    if (data.roles && data.roles.length > 0) {
      return data.roles.some(x => x.name === role)
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

export const isRolesIncluded = (myRoles, requiredRoles, includedAdmin = true) => {
  if (!myRoles || !myRoles.length || !requiredRoles || !requiredRoles.length) return false;
  return myRoles.some(r => requiredRoles.includes(r.name) || (includedAdmin && r.name === 'admin'))
}

const convertLocaleToMomentLocale = (locale) => {
  if (locale === 'ZH_HANT') {
    return 'zh-hk';
  }
  else if (locale === 'ZH_HANS') {
    return 'zh-cn';
  }
  else return 'en'
}

export const toLocaleDatetime = (datetime, format = 'LLLL', empty = '不適用') => {
  const locale = convertLocaleToMomentLocale(i18n.language)
  return datetime ? moment(datetime).locale(locale).format(format) : empty;
};

export const getShopBookingTimes = (shop) => {
  if (shop) {
    const {
      bookingTimeSlotSaturdayFirst,
      bookingTimeSlotSaturdayLast,
      bookingTimeSlotSpan,
      bookingTimeSlotSundayFirst,
      bookingTimeSlotSundayLast,
      bookingTimeSlotWeekdayFirst,
      bookingTimeSlotWeekdayLast,
    } = shop;

    return [
      { startTime: moment(bookingTimeSlotSundayFirst, 'HH:mm:ss'), endTime: moment(bookingTimeSlotSundayLast, 'HH:mm:ss'), timeSpan: bookingTimeSlotSpan },
      { startTime: moment(bookingTimeSlotWeekdayFirst, 'HH:mm:ss'), endTime: moment(bookingTimeSlotWeekdayLast, 'HH:mm:ss'), timeSpan: bookingTimeSlotSpan },
      { startTime: moment(bookingTimeSlotWeekdayFirst, 'HH:mm:ss'), endTime: moment(bookingTimeSlotWeekdayLast, 'HH:mm:ss'), timeSpan: bookingTimeSlotSpan },
      { startTime: moment(bookingTimeSlotWeekdayFirst, 'HH:mm:ss'), endTime: moment(bookingTimeSlotWeekdayLast, 'HH:mm:ss'), timeSpan: bookingTimeSlotSpan },
      { startTime: moment(bookingTimeSlotWeekdayFirst, 'HH:mm:ss'), endTime: moment(bookingTimeSlotWeekdayLast, 'HH:mm:ss'), timeSpan: bookingTimeSlotSpan },
      { startTime: moment(bookingTimeSlotWeekdayFirst, 'HH:mm:ss'), endTime: moment(bookingTimeSlotWeekdayLast, 'HH:mm:ss'), timeSpan: bookingTimeSlotSpan },
      { startTime: moment(bookingTimeSlotSaturdayFirst, 'HH:mm:ss'), endTime: moment(bookingTimeSlotSaturdayLast, 'HH:mm:ss'), timeSpan: bookingTimeSlotSpan },
    ];
  } else return []
}

export const getTimeSlots = (shop, date) => {
  if (!shop || !date) return { startTime: "", endTime: "", timeSlots: [] };

  const {
    bookingTimeSlotSpan,
    bookingTimeSlotSaturdayFirst, bookingTimeSlotSaturdayLast,
    bookingTimeSlotSundayFirst, bookingTimeSlotSundayLast,
    bookingTimeSlotWeekdayFirst, bookingTimeSlotWeekdayLast
  } = shop;

  const week = moment(date).day()
  let startTime = moment(bookingTimeSlotWeekdayFirst, 'HH:mm:ss');
  let endTime = moment(bookingTimeSlotWeekdayLast, 'HH:mm:ss');
  if (week === 0) {
    startTime = moment(bookingTimeSlotSundayFirst, 'HH:mm:ss');
    endTime = moment(bookingTimeSlotSundayLast, 'HH:mm:ss');
  } else if (week === 6) {
    startTime = moment(bookingTimeSlotSaturdayFirst, 'HH:mm:ss');
    endTime = moment(bookingTimeSlotSaturdayLast, 'HH:mm:ss');
  }

  let time = startTime;
  const timeSlots = [moment(startTime)];
  while (moment(time).isSameOrBefore(endTime)) {
    time = moment(time).add(bookingTimeSlotSpan, 'minutes');
    timeSlots.push(moment(time));
  }
  return { startTime, endTime, timeSlots };
}

export const getDisplayTimeSlot = (shop, date, timespan = null) => {
  if (!shop || !date) return;

  const shopBookingTimes = getShopBookingTimes(shop);
  if (shopBookingTimes?.length > 0) {
    const bookingTimes = shopBookingTimes[date.day()];
    const { startTime, endTime, timeSpan } = bookingTimes
    const times = [];
    let time = startTime;
    times.push(startTime);
    while (moment(time).isBefore(endTime)) {
      time = moment(time).add((timespan || timeSpan), 'minutes');
      times.push(time);
    }
    return {
      ...bookingTimes,
      timeSlots: times.map(t => moment(t).format("HH:mm")),
      displayTimeSlots: timespan ? times.map(t => moment(t).format("HH:mm")) : times.filter(t => moment(t).format("mm") === "00" || moment(t).format("mm") === "30").map(t => moment(t).format("HH:mm"))
    };
  }
}

export const onCheckTimeSlotDuplicate = (time, item) => {
  return (moment(time.startTime, "HH:mm:ss").isSameOrBefore(moment(item.startTime, "HH:mm:ss")) && moment(time.endTime, "HH:mm:ss").isSameOrAfter(moment(item.endTime, "HH:mm:ss"))) ||
    moment(time.startTime, "HH:mm:ss").isBetween(moment(item.startTime, "HH:mm:ss"), moment(item.endTime, "HH:mm:ss")) ||
    moment(time.endTime, "HH:mm:ss").isBetween(moment(item.startTime, "HH:mm:ss"), moment(item.endTime, "HH:mm:ss"));
}

export const usePrev = (value) => {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = React.useRef();

  // Store current value in ref
  React.useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

export const useForceUpdate = () => {
  const [fourceUpdateCounter, setFourceUpdateCounter] = React.useState(0); // integer state
  return () => setFourceUpdateCounter(fourceUpdateCounter + 1 > 255 ? 0 : fourceUpdateCounter + 1); // update the state to force render
}

export const getFirstChar = (item) => {
  let pattern = /^[A-Z]+$/;
  const char = item.charAt(0).toUpperCase()
  return pattern.test(char) ? char : '中';
}

export const isChinese = (item) => {
  let pattern = /^[A-Z]+$/;
  return !pattern.test(item.charAt(0).toUpperCase());
}

export const getMemberSpecialCodes = (data) => {
  if (!data) return '-';

  let specialCodes = data.split('').reduce((a, c, i) => {
    if (c === '1') a.push(`[A${i + 1}]`);
    return a;
  }, []);

  return specialCodes.length ? specialCodes.join(' ') : '-';
}

export const getStaffs = (staff, length) => (member, hideUsername = false) => Array.from({ length }, (_, n) => member?.[`${staff}${n > 0 ? n + 1 : ''}`])
  .filter(val => !!val)
  .map(val => val ? `${val?.name}${(!hideUsername && val?.username) ? `(${val?.username})` : ''}` : '');

export const getConsultants = getStaffs('consultant', 5);

export const getTherapists = getStaffs('therapist', 2);

export const getShops = (user) => user ? [user?.shop, ...(user?.accessibleShops || [])].filter((val, idx, arr) => val && arr.findIndex(y => y?.id === val?.id) === idx) : [];

export const smartFixed = (num, digi, keepDecimal = false) => {
  const value = num.toFixed(digi);
  return keepDecimal ? value : Number(value)
}

export const strToHex = function (str) {
  var hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  var color = '#';
  for (let i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 255;
    color += ('ff' + value.toString(16)).substr(-2);
  }
  return color;
}

export const strToHSL = function (str, opts) {
  var h, s, l;
  opts = opts || {};
  opts.hue = opts.hue || [0, 360];
  opts.sat = opts.sat || [75, 100];
  opts.lit = opts.lit || [40, 60];

  var range = function (hash, min, max) {
    var diff = max - min;
    var x = ((hash % diff) + diff) % diff;
    return x + min;
  }

  var hash = 0;
  if (str.length === 0) return hash;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }

  h = range(hash, opts.hue[0], opts.hue[1]);
  s = range(hash, opts.sat[0], opts.sat[1]);
  l = range(hash, opts.lit[0], opts.lit[1]);

  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function getLocale(district) {
  switch (district) {
    case 'AU': return 'EN'
    default: return 'ZH_HANT'
  }
}


//如果個therapist個salesShop.city係澳門，唔使check therapist type
export const validateItemWithTherapistType = (itemTherapistType, therapist) => {
  return !therapist || therapist?.salesShop?.city === '澳門' || therapist?.allowedItemTherapistTypes?.includes(itemTherapistType);
};

export const generateUUID = () => { // Public Domain/MIT
  var d = new Date().getTime();//Timestamp
  var d2 = (performance && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16;//random number between 0 and 16
    if (d > 0) {//Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {//Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = `${cname}=${cvalue};${expires};path=/`;
}

export function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return;
}

export function convertYYMMDD(inputDate) {
  let date = new Date(inputDate);
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let dt = date.getDate();

  if (dt < 10) {
    dt = '0' + dt;
  }
  if (month < 10) {
    month = '0' + month;
  }

  return year + '-' + month + '-' + dt;
}

export function addZero(number) {
  return number > 9 ? number : `0${number}`;
}

export const isBookingCheckExamEnabled = (config, date, shopCountry) => {
  const {enable, startDate, limitedCountries} = config;
  return (
    enable &&
    (startDate ? moment(startDate).isSameOrBefore(moment(date)) : true) &&
    (limitedCountries ? limitedCountries.includes(shopCountry) : true)
  );
};

export const isTreatmentNotDone = (purchaseId, treatmentId, worksheets) => {
  return worksheets.every(ws => ws.treatment.id !== treatmentId || (ws.treatment.id === treatmentId && ws.usedItems.every(item => item.purchasedId !== purchaseId)))
}

export const isTreatmentDone = (purchaseId, treatmentId, worksheets) => {
  return worksheets.some(ws => ws.treatment.id === treatmentId && ws.usedItems.some(item => item.purchasedId === purchaseId));
}

export const getTreatmentsNotInWorksheets = (purchaseId, treatments, worksheets) => {

  return treatments.filter(t => worksheets.every(ws => ws.treatment.id !== t.id || (ws.treatment.id === t.id && ws.usedItems.every(item => item.purchasedId !== purchaseId))))
}

export const updateBookingStatusChange = (prev, data, shopId, date, status) => {
  if (!data) return prev;

  const bookingChange = data.onBookingChange;
  const { mutation, node, updatedFields, previousValues } = bookingChange;
  const edgeType = "BookingEdge";
  const connection = "bookings";

  let edges = null, totalCount = prev?.[connection].totalCount;
  if (mutation == "CREATED" && node.status === status) {
    edges = [...prev?.[connection]?.edges, { node, cursor: "", __typename: edgeType }];
    totalCount += 1;
  }
  else if (mutation == "UPDATED") {
    //remove record if updateFields contain "deleted",
    if (updatedFields.includes('deleted')) {
      edges = [...prev?.[connection]?.edges?.filter(x => x.node.id !== node.id)];
      totalCount -= 1;
    }
    else if (updatedFields.includes('shop') || updatedFields.includes('date') || updatedFields.includes('status')) {
      if (node.shop.id === shopId && node.date === date && node.status === status) {
        //Insert new record
        edges = [...prev?.[connection]?.edges, { node, cursor: "", __typename: edgeType }];
        totalCount += 1;
      }
      else {
        //Remove record which either shop or date or status is not match
        edges = [...prev?.[connection]?.edges?.filter(x => x.node.id !== node.id)];
        totalCount -= 1;
      }
    }
    else {
      //Update current record
      edges = [...prev?.[connection]?.edges?.map(x => x.node.id === node.id ? { ...x, node } : x)];
    }
  }

  return edges ? {
    [connection]: {
      __typename: prev?.[connection].__typename,
      edges,
      pageInfo: prev?.[connection].pageInfo,
      totalCount
    }
  } : prev;
}

export const updateNewWorksheet = (prev, data) => {
  if (!data) return prev;
  const newWorksheet = data.onNewWorksheet;
  const { mutation, node } = newWorksheet;
  const edgeType = 'WorksheetEdge';
  const connection = 'worksheets';

  let edges = null, totalCount = prev?.[connection].totalCount;
  if (mutation == 'CREATED') {
    edges = [...prev?.[connection]?.edges, { node, cursor: '', __typename: edgeType }];
    totalCount += 1;
  }

  return edges ? {
    [connection]: {
      __typename: prev?.[connection].__typename,
      edges,
      pageInfo: prev?.[connection].pageInfo,
      totalCount
    }
  } : prev;
}

export const updateNewTreatmentReceipt = (prev, data) => {
  if (!data) return prev;
  const newTreatmentReceipt = data.onNewTreatmentReceipt;
  const { mutation, node } = newTreatmentReceipt;
  const edgeType = 'WorksheetEdge';
  const connection = 'worksheets';

  let edges = null, totalCount = prev?.[connection].totalCount;
  if (mutation == 'CREATED') {
    edges = prev?.[connection]?.edges.map(x => {
      if (x?.node?.treatmentReceiptNumber === node?.treatmentReceiptNumber) {
        return {
          ...x,
          node: {
            ...x?.node,
            treatmentReceipt: node
          }
        }
      }
      return x;
    });
  }

  return edges ? {
    [connection]: {
      __typename: prev?.[connection].__typename,
      edges,
      pageInfo: prev?.[connection].pageInfo,
      totalCount
    }
  } : prev;
}

export function toFixedNumber(num, decimalPlaces = 1) {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(num * factor) / factor;
}

export const roundNumber = (num, decimalNumber = 1) => {
  const rate = Math.pow(10, decimalNumber);
  return Math.round(num * rate) / rate
}

export const toMoney = (num, decimalPlaces = 1) => {
  if (isNaN(num) || num == undefined) return  '$' + 0
  const factor = Math.pow(10, decimalPlaces);
  const resule = Math.round(num * factor) / factor;
  return '$' + resule.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

 export function darkenColor(colorCode, amount) {
  // 判斷輸入的顏色格式
  const isRGB = (colorCode) => {
    if (!colorCode) {
      return false;
    }

    if (typeof colorCode !== 'string') {
      return false;
    }

    if (colorCode.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)) {
      return false;
    }

    if (!colorCode.match(/^rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)$/)) {
      return false;
    }

    return true;
  };

  const isHEX = (colorCode) => {
    if (!colorCode) {
      return false;
    }

    if (typeof colorCode !== 'string') {
      return false;
    }

    if (colorCode.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)) {
      return true;
    }

    if (!colorCode.match(/^rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)$/)) {
      return false;
    }

    return false;
  };

  // 檢查輸入是否合法
  const isValidInput = (colorCode, amount) => {
    if (!colorCode || typeof amount !== 'number' || amount < 0) {
      return false;
    }

    if (!isRGB(colorCode) && !isHEX(colorCode)) {
      return false;
    }

    return true;
  };

  // 如果輸入不合法，則回傳 null
  if (!isValidInput(colorCode, amount)) {
    return null;
  }

  // 將 HEX 格式的顏色值轉換為 RGB 格式的顏色值
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // 將 rgb 格式的顏色值轉換為陣列
  const rgbToArray = (colorCode) => {
    const rgb = colorCode.match(/\d+/g);
    return [parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2])];
  };

  // 將陣列形式的 rgb 值轉換為 rgb 格式的顏色值
  const arrayToRgb = (rgbArray) => {
    return `rgb(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]})`;
  };

  // 加深顏色
  const rgb = isHEX(colorCode) ? rgbToArray(hexToRgb(colorCode)) : rgbToArray(colorCode);
  const darkerRgb = rgb.map((color) => Math.max(color - amount, 0));

  // 回傳
  return isHEX(colorCode) ? arrayToRgb(darkerRgb) : `rgb(${darkerRgb[0]}, ${darkerRgb[1]}, ${darkerRgb[2]})`;
}

export const checkArrayInclusion = function checkArrayInclusion(arry1, arry2) {
  console.log(arry1)
  return arry1.some(item => arry2.includes(item));
}
export function calculateTextMetrics(text, fontSize, maxWidth) {
  console.log("maxWidth", maxWidth)
  // 创建一个隐藏的div元素，用于模拟文本呈现
  const div = document.createElement('div');
  // div.style.visibility = 'hidden';
  div.style.position = 'absolute';
  div.style.width = `${maxWidth}px`; // 设置最大宽度以触发文本折行
  div.style.fontSize = `${fontSize}px`; // 设置字体大小
  div.style.zIndex = `100`; // 设置字体大小
  div.innerHTML = text; // 设置要显示的文本

  // 将div添加到文档中
  document.body.appendChild(div);

  // 获取div的实际高度
  const height = div.offsetHeight;

  // 计算行数（假设每行高度等于字体大小）
  const lineCount = Math.ceil(height / fontSize);

  // 从文档中移除div
  // document.body.removeChild(div);

  // 返回行数和总高度（以像素为单位）
  return {
    lineCount,
    totalHeight: height,
  };
}

export function calculateElementHeight(reactElement) {
  // 创建一个虚拟的DOM容器
  const container = document.createElement('div');
  document.body.appendChild(container);

  // 将React元素渲染到虚拟DOM中
  ReactDOM.render(reactElement, container);

  // 获取容器的高度
  const height = container.clientHeight;

  // 从文档中移除容器
  document.body.removeChild(container);

  return height;
}

export function insertItemToGanttTask (data) {
  return data.map((task) => {
    const subTasks = task?.child?.length > 0 ? insertItemToGanttTask(task.child) : [];
    return {
      name: task.name_cht,
      subTasks: subTasks,
    };
  });
}

export function addLineBreaks(text) {
  if(!text) return '';
  return text.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));
}