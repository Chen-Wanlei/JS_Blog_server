const express = require("express");
const router = express.Router();

router.use("/avatar",require("./avatar"));

module.exports = router