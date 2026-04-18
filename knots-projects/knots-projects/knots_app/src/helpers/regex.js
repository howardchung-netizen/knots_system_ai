export const IsDate = function (str) { return /^((((1[6-9]|[2-9]\d)\d{2})-(0?[13578]|1[02])-(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})-(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-))$/.test(str); }
export const IsTimeMin = function (str) { return /^(20|21|22|23|[0-1]+\d):[0-5]+\d$/.test(str); }
export const IsTimeSec = function (str) { return /(20|21|22|23|[0-1]+\d):[0-5]+\d:[0-5]+\d/.test(str); }
export const IsDatetime = function (str) { return /^((((1[6-9]|[2-9]\d)\d{2})-(0?[13578]|1[02])-(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})-(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-)) (20|21|22|23|[0-1]+\d):[0-5]+\d:[0-5]+\d$/.test(str); }
export const IsIP = function (str) { return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(str); }
export const IsSP = function (str) { return /[\;\:\""\'\<\>\\[\]\{\}\?\/\\\~\`\!\@\#\$\%\^\&\*\(\)\|]/.test(str); }
export const IsID = function (str) { return str == undefined || str == null ? false : /^[a-zA-Z][a-zA-Z0-9_-]{3,50}$/.test(str); }
export const IsAC = function (str) { return str == undefined || str == null ? false : /^[a-zA-Z0-9_-]{3,50}$/.test(str); }
export const IsMD5 = function (str) { return str == undefined || str == null ? false : /^[a-zA-Z0-9]{32}$/.test(str); }
export const IsNum = function (str) { return str == undefined || str == null ? false : /^[0-9]+$/.test(str); }
export const IsStr = function (str) { return str == undefined || str == null ? false : /^[a-zA-Z0-9]+$/.test(str); }
export const IsEng = function (str) { return str == undefined || str == null ? false : /^[a-zA-Z\ ]+$/.test(str); }
export const IsLetter = function (str) { return str == undefined || str == null ? false : /^[\u4e00-\u9fa5a-zA-Z\s]{1,20}$/.test(str); }
export const IsEmailToken = function (str) { return str == undefined || str == null ? false : /^\d{4}$/.test(str); }
// export const IsText = function (str) { return /^[\u4e00-\u9fa5\uff01-\uff5a\u3008-\u3030a-zA-Z0-9\ \+\(\)\/\,\.\-\[\]\!\%\\\ ]+$/.test(str); }
export const IsText = function (str) { if (typeof str === 'string') { if (str != '') return true; } return false; }
export const IsPlan = function (str) { return str == undefined || str == null ? false : /^(A|B|C)$/.test(str); }
export const IsEmail = function (str) { return str == undefined || str == null ? false : /^[a-zA-Z0-9][\w\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\w\.-]*[a-zA-Z0-9]\.[a-zA-Z][a-zA-Z\.]*[a-zA-Z]$/.test(str); }
export const IsHKtel = function (str) { return str == undefined || str == null ? false : /^[235689][0-9]{7}$/.test(str); }
export const IsBirth = function (str) { return str == undefined || str == null ? false : /\d\d\d\d-\d\d-\d\d/.test(str); }
export const IsFloat = function (str) { return typeof str === 'number' ? true : false; }
export const IsMoney = function (str) { return /^$/.test(str); }
export const IsExpiry = function (str) { return /^(0[1-9]|1[0-2])\/(1[6-9]|[2-9][0-9])$/.test(str); }
export const FilterIP = function (str) { try { return str.match(/(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/)[0]; } catch (e) { return ''; } }
export const FilterStr = function (str) { try { return str.match(/[0-9a-zA-Z]/g)[0]; } catch (e) { return ''; } }
export const FilterNum = function (str) { try { return str.match(/[0-9]/g)[0]; } catch (e) { return ''; } }
export const IsTextBox = function (str) { return str == undefined || str == null ? false : /^[\u4e00-\u9fa5\uff01-\uff5a\u3008-\u3030a-zA-Z0-9\ \+\(\)\/\,\.\-\[\]\!\%\\\　]+$/.test(str); }
export const IsAddress = function (str) { return str == undefined || str == null ? false : /^[\u4e00-\u9fa5a-zA-Z0-9\-\_\,\.\(\)\s]{5,200}$/.test(str); }
export const IsBarCode = function (str) { return /^[0-9]{12}$/.test(str); }
export const IsBoolean = function (str) { return typeof str === 'boolean'; }
export const IsNickName = function (str) { return str == undefined || str == null ? false : /^[\u4e00-\u9fa5a-zA-Z0-9]{1,20}$/.test(str); }
export const IsFullName = function (str) { return str == undefined || str == null ? false : /^[\u4e00-\u9fa5a-zA-Z0-9\ ]{2,40}$/.test(str); }
export const IsPoolPW = function (str) { return str == undefined || str == null ? false : /^[a-zA-Z0-9\.\,\`\~\!\@\#\$\%\^\&\*\(\)\-\+\{\}\[\]]{8,20}$/g.test(str); }
export const IsPassword = function (str) { return str == undefined || str == null ? false : /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9\.\,\`\~\!\@\#\$\%\^\&\*\(\)\-\+\{\}\[\]]{8,20}$/g.test(str); }
export const IsHKmobile = function (str) { return /^[56789][0-9]{7}$/.test(str); }
export const CheckArray = function (str, array) { for (var i in array) { if (str == array[i]) return true; } return false; }
export const IsCardBrand = function (str) { return /^(VISA|Master)$/.test(str); }
export const IsPageParam = function (str) { return str == undefined || str == null ? false : /^\d+,\d+$/.test(str); }
export const IsTimeSelect = function (str) { return /^(20|21|22|23|[0-1]+\d)[0-5]+\d$/.test(str); }
export const IsCountryCode = function (str) { return /^([0-9]{1,4}|[0-9]{1,2}-[0-9]{1,4})$/.test(str); }
export const IsGoodPassword = function (str) { return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\.\,\`\~\!\@\#\$\%\^\&\*\(\)\-\+\{\}\[\]])[a-zA-Z0-9\.\,\`\~\!\@\#\$\%\^\&\*\(\)\-\+\{\}\[\]]{8,20}$/.test(str); }
export const GetCardBrand = function (str) {
    var tmp = ''; tmp = '' + str + ''; str = tmp;
    var item = function (regex, length, brand) { this.brand = brand; this.regex = regex; this.length = length; };
    var info = [
        new item(/^(51|52|53|54|55)/, 16, 'Master'),
        new item(/^(4)/, 16, 'VISA'), new item(/^(4)/, 13, 'VISA'),
        new item(/^(34|37)/, 15, 'AMEX'),
        new item(/^(6011)/, 16, 'Discover'),
        new item(/^(300|301|302|303|304|305|36|38)/, 14, 'DinersClub'),
        new item(/^(3)/, 16, 'JCB'), new item(/^(2131|1800)/, 15, 'JCB'),
        new item(/^(2014|2149)/, 15, 'enRoute')
    ];
    for (var i in info) { if (str.length == info[i].length && info[i].regex.test(str)) return info[i].brand; }
    return 'Unknown';
}
export const IsLat = function (str) {
    if (typeof str === 'number') {
        if (str > 22.06774463945894 && str < 22.57589587134169) {
            return true;
        } else { return false; }
    } else { return false; }
}
export const IsLng = function (str) {
    if (typeof str === 'number') {
        if (str > 113.75948574648442 && str < 114.48732998476567) {
            return true;
        } else { return false; }
    } else { return false; }
}
export const IsCreditCard = function (str) {
    var tmp = ''; tmp = '' + str + ''; str = tmp;
    if (regex.GetCardBrand(str) == 'Unknown') { return false; }
    var luhnChk = function (a) { return function (c) { for (var l = c.length, b = 1, s = 0, v; l;)v = parseInt(c.charAt(--l), 10), s += (b ^= 1) ? a[v] : v; return s && 0 === s % 10; }; }([0, 2, 4, 6, 8, 1, 3, 5, 7, 9]);
    return luhnChk(str);
}
export const IsHKID = (id) => {
    try {
        if (!id) return false;
        id = id.replace(/(\(|\)| |\[|\]|\-)/g, '').split('');
        if (id.length !== 8) return false;
        var result = 0, n = 8;
        for (var i = 0; i <= 6; i++) {
            id[i] = id[i].toLocaleUpperCase().charCodeAt(0);
            id[i] = i === 0 ? (id[i] - 64) * n : (id[i] - 48) * n;
            result += id[i];
            n--;
        }
        result += id[7].toLocaleUpperCase() == 'A' ? 10 : parseInt(id[7]);
        return result % 11 === 0;
    } catch (error) { return false; }
}
export const isChinese = (str) => {
    return str == undefined || str == null ? false : /^[\u4E00-\u9FA5]+$/.test(str);
}
export const isEnglish = (str) => {
    return str == undefined || str == null ? false : /^[a-zA-Z]+$/.test(str);
}
export const isChineseAddress = (str) => {
    return str == undefined || str == null ? false : /^[\u4E00-\u9FA5]+$/.test(str);
}
export const isEnglishAddress = (str) => {
    return str == undefined || str == null ? false : /^[0-9a-zA-Z ]+$/.test(str);
};
