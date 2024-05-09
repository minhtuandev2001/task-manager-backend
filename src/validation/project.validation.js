
// [POST] /project/create
const create = (req, res, next) => {
  const { title } = req.body;
  if (!title) {
    res.status(400).json({
      messages: "You must provide a title"
    })
    return
  }
  next();
}

module.exports = {
  create
}