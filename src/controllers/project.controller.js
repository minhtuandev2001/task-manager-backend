
// [POST] /project/create

const create = (req, res) => {
  res.status(200).json({
    messages: "Create project success"
  })
}

module.exports = {
  create
}