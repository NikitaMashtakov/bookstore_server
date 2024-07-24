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

// Показываем, где хранить загружаемые файлы
const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
// Роуты User
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/current", authenticateToken, UserController.current);
router.get("/users/:id", authenticateToken, UserController.getUserById);
router.put(
  "/users/:id",
  authenticateToken,
  upload.single("avatar"),
  UserController.updateUser
);

// Роуты Book
router.get("/books", authenticateToken, BookController.getAllBooks);
router.get("/books/:id", authenticateToken, BookController.getBookById);

//Роуты Admin
router.post("/books", authenticateToken, AdminControllerController.createBook);
router.delete("/books/:id", authenticateToken, AdminController.deleteBook);

// Роуты лайков
router.post("/likes", authenticateToken, LikeController.likeBook);
router.delete("/likes/:id", authenticateToken, LikeController.unlikeBook);

// Роуты комментариев
router.post("/comments", authenticateToken, CommentController.createComment);
router.delete(
  "/comments/:id",
  authenticateToken,
  CommentController.deleteComment
);

module.exports = router;
