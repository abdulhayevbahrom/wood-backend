require("dotenv").config();
const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const notfound = require("./middleware/notfound.middleware");
const router = require("./routes/router");
const authMiddleware = require("./middleware/AuthMiddleware");
const { createServer } = require("node:http");
const soket = require("./socket");
const connectDB = require("./config/dbConfig");

const app = express();
const server = createServer(app);
const io = require("./middleware/socket.header")(server);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS sozlamalari
const corsOptions = {
  origin: ["http://localhost:3000", "https://wood-black.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};
app.use(cors(corsOptions));

// MongoDB ulanish
(async () => {
  await connectDB();
})();
require("./controller/checkDebtsAndSendSms");
require("./utils/cron");
// Socket.IO sozlamalari
app.set("socket", io);
soket.connect(io);

app.use("/api", router); // Routerlarni ulash
app.get("/", (req, res) => res.send("Salom dunyo")); // Bosh sahifa
app.use(notfound); // 404 middleware

// Serverni ishga tushirish
server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
