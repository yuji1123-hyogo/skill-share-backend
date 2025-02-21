import dotenv from "dotenv";
dotenv.config();

//  パッケージのインポート
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";


//  必要なルートのインポート
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/post.js";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/upload.js";
import clubRoutes from "./routes/club.js";
import eventRoutes from "./routes/event.js";
import commentRoutes from "./routes/comment.js"
import tagRoutes from "./routes/tagRoutes.js"


//  JWTを検証するミドルウェアのインポート
import checkJWT from "./middlewears/checkJWT.js";


//  共通エラーハンドリングのインポート
import errorHandler from "./middlewears/errorHandler.js"

//  CORS設定
const corsOptions = {
  origin: [
    "http://localhost:3001",
    "http://localhost:3000",
    "https://skill-share-frontend-git-master-yuji1123-hyogos-projects.vercel.app",
  ],
  credentials: true, // クッキーを許可
};

//  Expressアプリの作成
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

//  MongoDBへの接続
const mongo_DB_URI = process.env.MONGO_DB_URI;
const mongo_Atlas_URI = process.env.MONGO_ATLAS_URI;
mongoose.connect(mongo_DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//  接続の確認
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB接続エラー"));
db.once("open", () => {
  console.log("✅ MongoDBコネクション成功！");
});

//  ミドルウェア
app.use(morgan("combined"));
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello from localhost:5000!");
});
//  ルート設定
app.use("/api/upload", checkJWT, uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clubs", checkJWT, clubRoutes);
app.use("/api/users", checkJWT, userRoutes);
app.use("/api/posts", checkJWT, postRoutes);
app.use("/api/comments", checkJWT, commentRoutes);
app.use("/api/events", checkJWT, eventRoutes);
app.use("/api/tags", checkJWT, tagRoutes);

//  共通エラーハンドリング
app.use(errorHandler);

//  サーバーの起動
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(` サーバーが起動しました（PORT: ${PORT}）`));


