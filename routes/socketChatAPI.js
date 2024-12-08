//チャット用socketAPI
//socket通信が来たら起動する
//io:サーバー全体を管理するオブジェクト
//socket:クライアントと接続されたときにクライアントごとに生成される。
//io:socket通信を行うクライアント全体、socket:特定のクライアント
//on:受信、emit:送信
//io.to("room1").emit("message", "Room1の全員にメッセージ");
const Chat = require('../models/Chat')

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('ユーザーがソケット通信に接続しました:', socket.id);

        // クライアントが特定のルームに参加
        socket.on('join room', async ({chatId,username}) => {
            socket.join(chatId);
            console.log(` ${JSON.stringify(username, null, 2)} が参加しました。チャットルームID: ${chatId}`);
            io.to("room1").emit('join confirmation', { message: `ソケットAPI soketId${socket.id},ユーザー${username}がチャットルームに参加しました。chatId:${chatId}`});
        });


        // メッセージを受信して同じチャットルームに送信
        //メッセージオブジェクトを受信できるようにする
        socket.on('chat message', async (newMessage) => {
            console.log(`ユーザー${newMessage.sender} のメッセージ${newMessage.chatId}:`,newMessage.content);

            // メッセージをデータベースに保存
            try {
                const chatRoom = await Chat.findById(newMessage.chatId);
                if (!chatRoom) {
                    console.warn(`チャットルームが見つかりません: ${newMessage.chatId}`);
                    socket.emit('error', { message: 'チャットルームが存在しません。' });
                    return;
                }
                if (chatRoom) {
                    chatRoom.messages.push({ 
                        sender: newMessage.sender, 
                        content: newMessage.content,
                        username: newMessage.username,
                        timestamps: newMessage.timestamps});
                    await chatRoom.save();
                    console.log("メッセージを保存しました:", newMessage.sender,newMessage.content,newMessage.username,newMessage.timestamps);
                }
            } catch (error) {
                console.error("メッセージを保存できませんでした:", error);
            }

            // ルーム内のクライアントにメッセージを送信
            io.to(newMessage.chatId).emit('chat message', newMessage);
        });

        // クライアントが切断した際の処理
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
                // クライアントが参加していたルームに通知
            for (const room of socket.rooms) {
                if (room !== socket.id) { // デフォルトで自身のIDもroomsに含まれるため除外
                    io.to(room).emit('announcement', `${socket.id}が退室しました`);
                }
            }
        });
    });
};
