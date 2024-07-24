const { prisma } = require("../prisma/prisma-client");

const AdminController = {
  createBook: async (req, res) => {
    const { name } = req.body;

    //const authorId = req.user.userId;

    if (!name && !author) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }

    try {
      const book = await prisma.book.create({
        data: {
          name,
          author,
        },
      });

      res.json(book);
    } catch (error) {
      console.error("Error in createBook:", error);

      res.status(500).json({ error: "There was an error creating the book" });
    }
  },

  deleteBook: async (req, res) => {
    if (req.user.isAdmin) {
      const { id } = req.params;
      // Проверка, что пользователь удаляет свой пост
      const book = await prisma.book.findUnique({ where: { id } });

      if (!book) {
        return res.status(404).json({ error: "Книга не найдена" });
      }

      try {
        const transaction = await prisma.$transaction([
          prisma.comment.deleteMany({ where: { bookId: id } }),
          prisma.like.deleteMany({ where: { bookId: id } }),
          prisma.book.delete({ where: { id } }),
        ]);
        res.json(transaction);
      } catch (error) {
        res.status(500).json({ error: "Что-то пошло не так" });
      }
    } else {
      return res.status(403).json({ error: "Нет доступа" });
    }
  },
};

module.export = AdminController;
