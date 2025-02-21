// import Chat from "../models/Chat.js";

// export default (io) => {
//     io.on("connection", (socket) => {
//         console.log("ユーザーがソケット通信に接続しました:", socket.id);

//         // クライアントが特定のルームに参加
//         socket.on("join room", async ({ chatId, username }) => {
//             socket.join(chatId);
//             console.log(
//                 `${JSON.stringify(username, null, 2)} が参加しました。チャットルームID: ${chatId}`
//             );
//             io.to(chatId).emit("join confirmation", {
//                 message: `ソケットAPI soketId${socket.id},ユーザー${username}がチャットルームに参加しました。chatId:${chatId}`,
//             });
//         });

//         // メッセージを受信して同じチャットルームに送信
//         socket.on("chat message", async (newMessage) => {
//             console.log(
//                 `ユーザー${newMessage.sender} のメッセージ${newMessage.chatId}:`,
//                 newMessage.content
//             );

//             try {
//                 const chatRoom = await Chat.findById(newMessage.chatId);
//                 if (!chatRoom) {
//                     console.warn(`チャットルームが見つかりません: ${newMessage.chatId}`);
//                     socket.emit("error", { message: "チャットルームが存在しません。" });
//                     return;
//                 }

//                 chatRoom.messages.push({
//                     sender: newMessage.sender,
//                     content: newMessage.content,
//                     username: newMessage.username,
//                     timestamps: newMessage.timestamps,
//                 });

//                 await chatRoom.save();
//                 console.log(
//                     "メッセージを保存しました:",
//                     newMessage.sender,
//                     newMessage.content,
//                     newMessage.username,
//                     newMessage.timestamps
//                 );

//                 // ルーム内のクライアントにメッセージを送信
//                 io.to(newMessage.chatId).emit("chat message", newMessage);
//             } catch (error) {
//                 console.error("メッセージを保存できませんでした:", error);
//             }
//         });

//         // クライアントが切断した際の処理
//         socket.on("disconnect", () => {
//             console.log("User disconnected:", socket.id);

//             // クライアントが参加していたルームに通知
//             for (const room of socket.rooms) {
//                 if (room !== socket.id) {
//                     io.to(room).emit("announcement", `${socket.id}が退室しました`);
//                 }
//             }
//         });
//     });
// };
