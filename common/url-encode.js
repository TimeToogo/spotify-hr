
export const urlEncode = function (object) {
    let fBody = [];
    for (let prop in object) {
        let key = encodeURIComponent(prop);
        let value = encodeURIComponent(object[prop]);
        fBody.push(key + "=" + value);
    }
    fBody = fBody.join("&");
    return fBody;
};