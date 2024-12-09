const express = require("express");
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {cors: {origin: "*"}});
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const cookieParser = require('cookie-parser');
require('dotenv').config();
const {storage,cloudinary} = require('./cloudinary/cloudinary.js');
const multer = require('multer');
const upload = multer({storage});
const mongo_DB_URI = process.env.MONGO_DB_URI
const mongo_Atlas_URI = process.env.MONGO_ATLAS_URI
const morgan = require('morgan');
const helmet = require('helmet');

const searchRoutes = require("./routes/search.js")
const userRoutes = require("./routes/users.js")
const postRoutes = require("./routes/post")
const authRoutes = require("./routes/auth")
const chatWebsocketRoutes = require("./routes/socketChatAPI")
const chatHTTPRoutes = require("./routes/chat")
const uploadRoutes = require('./routes/upload.js')
const clubRoutes = require("./routes/club.js")
const eventRoutes = require("./routes/event.js")
const checkJWT = require("./midlewear/checkJWT")



const corsOptions = {
    origin: ["http://localhost:3001","http://localhost:3000", "https://skill-share-frontend-git-master-yuji1123-hyogos-projects.vercel.app"],  // 許可するオリジン
    credentials: true                 // クッキーを許可
  };

app.use(morgan('combined'));
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());  


const mongoose = require("mongoose");

// MongoDBへの接続
mongoose.connect(mongo_Atlas_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
//接続の確認
const db = mongoose.connection;
db.on('error',console.error.bind(console,'conection error'));
db.once('open',function(){
    console.log("MONGODBコネクション成功！");
});


app.get("/",(req,res)=>{
    res.send("hello")
})


app.use('/api/search',searchRoutes)
app.use('/api/upload',checkJWT,upload.single('image'),uploadRoutes)
app.use('/api/auth',authRoutes)
app.use('/api/clubs',checkJWT,clubRoutes)
app.use('/api/users',checkJWT,userRoutes)
app.use('/api/posts',checkJWT,postRoutes)
app.use('/api/chats',checkJWT,chatHTTPRoutes)
app.use('/api/events',checkJWT,eventRoutes)
chatWebsocketRoutes(io)
console.log("CLOUDINARY_KEY:",process.env.CLOUDINARY_KEY)

server.listen(PORT,()=>console.log("サーバー起動"))




