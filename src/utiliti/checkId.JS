const checkIsObjectId = (id) => {
  // kiểm tra id có phải là kiểu objectId không
  return ((/^[0-9a-fA-F]{24}$/).test(id) === false) ? false : true
}

module.exports = checkIsObjectId