export const regex = {
    IsEmail: function (str) { return str == undefined || str == null ? false : /^[a-zA-Z0-9][\w\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\w\.-]*[a-zA-Z0-9]\.[a-zA-Z][a-zA-Z\.]*[a-zA-Z]$/.test(str); },
    IsHKtel: function (str) { return str == undefined || str == null ? false : /^[235689][0-9]{7}$/.test(str); },
    IsHKmobile: function (str) { return /^[45689][0-9]{7}$/.test(str); },
    IsHKID: function isHKID(_id) {
        try {
            if (!_id) return false;

            // Remove special characters and spaces
            let id = _id.replace(/[\(\)\[\]\-\s]/g, '');

            // Check length of HKID
            if (id.length !== 8 && id.length !== 9) return false;

            if (id.length == 8) {
                var lastThree = _id.substring(7, 10);
                return /^\([A-Za-z0-9]\)$/.test(lastThree);

            } else if (id.length == 9) {
                // Check the last three characters
                var lastThree = _id.substring(8, 11);
                return /^\([A-Za-z0-9]\)$/.test(lastThree);
              
            }
        } catch (error) {
            return false;
        }
    }
};

export default regex;