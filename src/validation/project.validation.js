
// [POST] /project/create
const create = (req, res, next) => {
  const { title, description, keyProject, createdBy } = req.body;
  if (!title) {
    res.status(400).json({
      messages: "You must provide a title"
    })
    return
  }
  console.log("check ", title, status, date, description, keyProject, createdBy)
  next();
}

module.exports = {
  create
}