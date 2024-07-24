const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user-controller");
const BookController = require("../controllers/book-controller");
const LikeController = require("../controllers/like-controller");
const CommentController = require("../controllers/comment-controller");
const AdminController = require("../controllers/admin-controller");
const { authenticateToken } = require("../middleware/auth");
const multer = require("multer");

const uploadDestination = "uploads";

const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

const uploads = multer({ storage: storage });

router.get("/register", (req, res) => {
  res.send("register");
});

module.exports = router;
