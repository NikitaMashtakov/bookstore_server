const { prisma } = require("../prisma/prisma-client");

const LikeController = {
  likeBook: async (req, res) => {
    const { bookId } = req.body;

    const userId = req.user.userId;

    if (!bookId) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }

    try {
      const existingLike = await prisma.like.findFirst({
        where: { bookId, userId },
      });

      if (existingLike) {
        return res
          .status(400)
          .json({ error: "Вы уже поставили лайк этой книге" });
      }

      const like = await prisma.like.create({
        data: { bookId, userId },
      });

      res.json(like);
    } catch (error) {
      res.status(500).json({ error: "Что-то пошло не так" });
    }
  },

  unlikeBook: async (req, res) => {
    const { id } = req.params;

    const userId = req.user.userId;

    if (!id) {
      return res
        .status(400)
        .json({ error: "Вы уже поставили дизлайк этой книге" });
    }

    try {
      const existingLike = await prisma.like.findFirst({
        where: { bookId: id, userId },
      });

      if (!existingLike) {
        return res.status(400).json({ error: "Лайк уже существует" });
      }

      const like = await prisma.like.deleteMany({
        where: { bookId: id, userId },
      });

      res.json(like);
    } catch (error) {
      res.status(500).json({ error: "Что-то пошло не так" });
    }
  },
};

module.exports = LikeController;
