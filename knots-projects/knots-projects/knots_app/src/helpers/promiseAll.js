export default pomiseAll = async (arr, cb) => {
    let _await = arr.map(e => e);
    return await Promise.all(_await)
        .then(res => {
            cb(res);
            return res
        }).catch(err => {
            cb(null, err);
            return {err}
        })
}
