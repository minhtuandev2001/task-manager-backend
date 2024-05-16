
// [PATCH]
const create = (req, res, next) => {
  console.log("check ", req.body.project_id)
  const { project_id, title } = req.body;
  if (!project_id) {
    res.status(400).json({
      messages: "You must provide project id"
    })
    return
  }
  if (!title) {
    res.status(400).json({
      messages: "You must provide title"
    })
    return
  }
  next();
}

module.exports = {
  create
}