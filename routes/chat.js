const router = require("express").Router()
const User = require("../models/User")
const Chat = require('../models/Chat')
const { default: mongoose } = require("mongoose")
//チャット一覧:参加者にユーザーが含まれているチャットを返す
// クライアント側でチャット開始のトリガーとなるボタンをクリック時⇒
// すでにそのチャットルームが存在するかをサーバー側で検索(参加者またはクラブをもとに)⇒
// 存在しなければチャットルーム作成API/存在していればメッセージ一覧取得API

// クエリにクラブのID、ユーザーのIDを含める
//チャット開始ボタンをクリックしたときのAPI(クラブ用):
router.get("/clubchat",async (req,res)=>{
     const {clubId} = req.query
     try{
        const clubChat = await Chat.findOne({club:clubId})
        if(!clubChat){
            return res.status(404).json({message:"クラブチャットが存在しません"})
        }else{
            if(!clubChat.participants.includes(req.user.id)){
                // `participants`配列にユーザーIDを追加
                clubChat.participants.push(req.user.id);
                await clubChat.save()
            }
            return res.status(200).json(clubChat)
        }
     }catch(e){
        console.log(e)
        return res.status(500).json({message:"クラブチャットの取得に失敗しました"})
     }
})

//チャット内のメッセージを取得するAPI(DM用):
//自分じゃないほうのユーザーもセットする
router.get("/userchat/:chatId", async (req, res) => {
    const chatId = req.params.chatId;

    // chatIdが存在しない場合のエラーハンドリング
    if (!chatId) {
        return res.status(400).json({ message: "chatIdが指定されていません" });
    }

    try {
        const personalChat = await Chat.findOne({ _id: chatId }).populate('participants').lean();

        if (!personalChat) {
            return res.status(404).json({ message: "個人チャットが存在しません" });
        }

        const fromUser = req.user.user._id;
        const toUser = personalChat.participants.filter(
            (chatUser) => chatUser._id.toString() !== fromUser.toString()
        );

        return res.status(200).json({ ...personalChat, toUser });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "個人チャットの取得に失敗しました" });
    }
});

//チャットルーム作成ボタンをクリックしたときのAPI(クラブ用用)
router.post("/clubchat",async(req,res)=>{
    const {clubId} = req.body
    try{
        const clubChat = await Chat.findOne({club:clubId})
        if(clubChat){
            return res.status(409).json({message:"このクラブチャットは既に存在します"})
        }else{
            const newClubChat = new Chat({
                club:clubId
            })
            await newClubChat.save()
            return res.status(200).json(newClubChat)
        }
    }catch(e){
        console.log(e)
        return res.status(500).json({message:"クラブチャットの作成に失敗しました"})
    }
})

//チャットルーム作成ボタンをクリックしたときのAPI(DM用)
router.post("/userchat/:toId",async(req,res)=>{
    const fromId = req.user.user._id
    const toId = req.params.toId
    try{
        const personalChat = await Chat.findOne({participants:{$all:[fromId,toId]}})
        if(personalChat){
            return res.status(409).json({message:"この個人チャットは既に存在します",chatId:personalChat._id})
        }else{
            const newPersonalChat = new Chat({
                participants:[fromId, toId]
            })
            await newPersonalChat.save()
            return res.status(200).json({chatId: newPersonalChat._id})
        }
    }catch(e){
        console.log(e); // エラー内容をログに出力
        return res.status(500).json({message:"個人チャットの作成に失敗しました"})
    }
})


//フレンドとの間にすでにチャットルームを持っているかどうかを判別
//フレンドのIDリストを取得
//自分のユーザーID、フレンドのユーザーID両方を含んでいるチャットを取得
// {
//     ユーザー1ID:チャットID,//すでにチャットルームを作成した相手
//     ユーザー2ID:"メッセージを送ってみよう",//チャットルームがまだない相手
//     ユーザー3ID:チャットID,//すでにチャットルームを作成した相手
// }
//といった具合で作成

//req.body:[userId1,userId2,userId3]⇒req.user.user._id(自分のユーザーID)と組み合わせてチャットルームを検索
//200⇒userId:chatId,404:"メッセージを送ってみよう"の形でレスポンス用のオブジェクトに追加

//mongooseのメソッドはプロミスオブジェクトを作成する
//map関数でプロミスオブジェクトの配列を作成
//promise.allで並列処理

router.post('/chatListOfFollowings', async (req, res) => {
    const fromId = req.user.user._id; // 現在のユーザーID
    const toIdList = req.body;       // リクエストボディからフレンドのIDリストを取得

    // リクエストボディの検証
    if (toIdList.length === 0) {
        return res.status(400).json({ message: "フレンドIDリストが無効です。" ,reqbody:toIdList});
    }

    // レスポンス用のオブジェクトを初期化
    const chatListResponse = {};

    try {
        // 各フレンドIDに対してチャットルームを検索
        //プロミスオブジェクトの配列が作成される。map自体は同期的に動作し即座に配列の要素としてプロミスを格納
        const chatPromises = toIdList.map(async (toId) => {
            // 自分と相手の両方を含むチャットルームを検索
            const chat = await Chat.findOne({ participants: { $all: [fromId, toId] } });
            if (chat) {
                // チャットルームが存在する場合、チャットIDを設定
                chatListResponse[toId] = chat._id;
            } else {
                // チャットルームが存在しない場合、デフォルトメッセージを設定
                chatListResponse[toId] = "新しくやり取りを始める";
            }
        });

        // 全ての検索が終わるまで待機
        await Promise.all(chatPromises);

        // 成功レスポンスを返す
        return res.status(200).json(chatListResponse);
    } catch (e) {
        console.error(e); // エラーをログに出力
        return res.status(500).json({ message: "チャットリストの取得に失敗しました" });
    }
});
       

//ログイン中のユーザーとチャットを行っているユーザーの情報とチャットIDを返す
//返す情報以下のような形のオブジェクトを要素とする配列
//{ユーザーID、ユーザー名、プロフィール画像,タグ,チャットID,最後のメッセージ}

router.get('/chatList', async (req, res) => {
    const fromId = req.user.user._id; // ログイン中のユーザーID

    try {
        // fromIdが参加しているチャットを取得し、participantsを展開
        const chatList = await Chat.find({ participants: { $in: [fromId] } })
            .populate('participants', '_id username profilePicture') // participantsの詳細を取得
            .lean(); // ドキュメントを純粋なオブジェクトに変換

        // レスポンス用配列を構築
        const chatListResponse = chatList.map((chat) => {
            // 自分以外のユーザーを取得
            const otherParticipants = chat.participants.filter(
                (participant) => participant._id.toString() !== fromId.toString()
            );

            // 最後のメッセージを取得
            const lastMessage = chat.messages.length > 0
                ? chat.messages[chat.messages.length - 1]
                : null;

            // 他の参加者ごとにデータを構築
            return otherParticipants.map((participant) => ({
                _id: participant._id,
                username: participant.username,
                profilePicture: participant.profilePicture || '',
                hobbies:participant.hobbies || [],
                chatId: chat._id,
                lastMessage: lastMessage
                    ? {
                          content: lastMessage.content,
                          timestamp: lastMessage.timestamps,
                          sender: lastMessage.sender.toString(),
                      }
                    : null,
            }));
        });

        // フラット化してレスポンスを返す
        return res.status(200).json(chatListResponse.flat());
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'チャットリストの取得に失敗しました' });
    }
});


//ログイン中のユーザーと相手ユーザーでチャットが存在するかどうかを確認
router.get('/exist-between-users/:toId', async (req, res) => {
    const fromId = req.user.user._id; // ログイン中のユーザーID
    const toId = req.params.toId;

    try {
        // fromIdが参加しているチャットを取得し、participantsを展開
        const chat = await Chat.findOne({ participants: { $all: [fromId,toId] } })
            .populate('participants', '_id username profilePicture') // participantsの詳細を取得

      
        if(!chat){
            return res.status(404).json({message:"チャットが存在しません"});
        }
        return res.status(200).json({
            exists: true,
            chatId: chat._id,
            participants: chat.participants,
        });
    } catch (error) {
        console.log(toId)
        console.error(error);
        return res.status(500).json({ message: 'チャットリストの取得に失敗しました' });
    }
});


  module.exports = router;

