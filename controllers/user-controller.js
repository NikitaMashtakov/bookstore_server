const bcrypt = require("bcryptjs");
const Jdenticon = require("jdenticon");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
require("dotenv").config;
const { prisma } = require("../prisma/prisma-client");

const UserController = {
  register: async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "Пользователь существует" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const png = Jdenticon.toPng(name, 200);
      const avatarName = `${name}_${Date.now}.png`;
      const avatarPath = path.join(__dirname, "../uploads", avatarName);
      fs.writeFileSync(avatarPath, png);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          avatarUrl: `/uploads/${avatarPath}`,
        },
      });
      res.json(user);
    } catch (error) {
      console.log("Error in register", error);
      res.status(500).json({ error: "Server error" });
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Пользователь не существует" });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(400).json({ error: "Неверный логин или пароль" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(400).json({ error: "Неверный логин или пароль" });
      }

      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY);
      res.json({ token });
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getUserById: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        return res.status(400).json({ error: "Пользователь не существует" });
      }
      res.json({ ...user });
    } catch {
      console.error("get Current Error");
      res.status(500).json({ error: "Internal server error" });
    }
  },
  updateUser: async (req, res) => {
    const { id } = req.params;
    const { email, name, dateOfBirth, bio, location } = req.body;

    let filePath;

    if (req.file && req.file.path) {
      filePath = req.file.path;
    }

    // Проверка, что пользователь обновляет свою информацию
    if (id !== req.user.userId) {
      return res.status(403).json({ error: "Нет доступа" });
    }

    try {
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: { email: email },
        });

        if (existingUser && existingUser.id !== parseInt(id)) {
          return res.status(400).json({ error: "Почта уже используется" });
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          email: email || undefined,
          name: name || undefined,
          avatarUrl: filePath ? `/${filePath}` : undefined,
          dateOfBirth: dateOfBirth || undefined,
          bio: bio || undefined,
          location: location || undefined,
        },
      });
      res.json(user);
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ error: "Что-то пошло не так" });
    }
  },
  currentUser: async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
      });

      if (!user) {
        return res.status(400).json({ error: "Не удалось найти пользователя" });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.log("err", error);
      res.status(500).json({ error: "Что-то пошло не так" });
    }
  },
};

module.exports = UserController;
