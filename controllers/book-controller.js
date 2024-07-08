const { prisma } = require("../prisma/prisma-client");

const BookController = {
  getAllBooks: async (req, res) => {
    const userId = req.user.userId;

    try {
      const books = await prisma.book.findMany({
        include: {
          likes: true,
          author: true,
          comments: true,
        },
        orderBy: {
          createdAt: "desc", // 'desc' означает сортировку по убыванию, т.е. новые посты будут первыми
        },
      });

      const booksWithLikeInfo = books.map((book) => ({
        ...book,
        likedByUser: book.likes.some((like) => like.userId === userId),
      }));

      res.json(booksWithLikeInfo);
    } catch (err) {
      res.status(500).json({ error: "Произошла ошибка при получении книг" });
    }
  },

  getBookById: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
      const book = await prisma.book.findUnique({
        where: { id },
        include: {
          comments: {
            include: {
              user: true,
            },
          },
          likes: true,
          author: true,
        }, // Include related books
      });

      if (!book) {
        return res.status(404).json({ error: "Книга не найдена" });
      }

      const bookWithLikeInfo = {
        ...book,
        likedByUser: book.likes.some((like) => like.userId === userId),
      };

      res.json(bookWithLikeInfo);
    } catch (error) {
      res.status(500).json({ error: "Произошла ошибка при получении книги" });
    }
  },
};

module.exports = BookController;
