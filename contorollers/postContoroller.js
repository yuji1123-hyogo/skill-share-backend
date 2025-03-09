import {
    createPostService,
    getPostDetailsService,
    getUserPostsService,
    getClubPostsService,
    getHomePostsService,
  } from "../service/postService.js";
  

  /**
   * 新しい投稿を作成するコントローラー
   * @param {Object} req - Expressリクエストオブジェクト
   * @param {string} req.userId - リクエストユーザーのID（認証ミドルウェアから注入）
   * @param {Object} req.body - リクエストボディ
   * @param {string} req.body.content - 投稿内容
   * @param {string} [req.body.media] - メディアURL（任意）
   * @param {string} [req.body.club] - 関連するクラブID（任意）
   * @param {Object} res - Expressレスポンスオブジェクト 
   * @param {Function} next - 次のミドルウェア関数
   * @returns {Promise<void>} - JSON形式でレスポンスを返す
   * @response {Object} - レスポンスオブジェクト
   * @response {string} message - 成功メッセージ
   * @response {Object} post - 作成された投稿
   * @response {string} post.id - 投稿ID
   * @response {string} post.content - 投稿内容
   * @response {string|null} post.media - メディアURL
   * @response {string|null} post.club - 関連クラブID
   * @response {string} post.createdAt - 作成日時
   * @response {Array<Object>} post.tags - タグ情報
   * @response {Array<string>} post.comments - コメントID一覧
   * @response {Object} post.author - 投稿者情報
   */
  export const createPostController = async (req, res, next) => {
    try {
      const newPost = await createPostService(req.userId, req.body);
      res.status(201).json({ message: "投稿が作成されました", post: newPost });
    } catch (error) {
      next(error);
    }
  };
  

  /**
   * 投稿の詳細情報を取得するコントローラー
   * @param {Object} req - Expressリクエストオブジェクト
   * @param {Object} req.params - URLパラメータ
   * @param {string} req.params.postId - 取得する投稿ID
   * @param {Object} res - Expressレスポンスオブジェクト 
   * @param {Function} next - 次のミドルウェア関数
   * @returns {Promise<void>} - JSON形式でレスポンスを返す
   * @response {Object} - レスポンスオブジェクト
   * @response {string} message - 成功メッセージ
   * @response {Object} post - 投稿詳細
   * @response {string} post.id - 投稿ID
   * @response {string} post.content - 投稿内容
   * @response {string|null} post.media - メディアURL
   * @response {string|null} post.club - 関連クラブID
   * @response {string} post.createdAt - 作成日時
   * @response {Array<Object>} post.tags - タグ情報
   * @response {Array<string>} post.comments - コメントID一覧
   * @response {Object} post.author - 投稿者情報
   */
  export const getPostDetailsController = async (req, res, next) => {
    try {
      const post = await getPostDetailsService(req.params.postId);
      res.status(200).json({message:"投稿の詳細情報を取得しました",post:post});
    } catch (error) {
      next(error);
    }
  };
  

  /**
   * ユーザーの投稿一覧を取得するコントローラー
   * @param {Object} req - Expressリクエストオブジェクト
   * @param {Object} req.params - URLパラメータ
   * @param {string} req.params.userId - 投稿を取得するユーザーID
   * @param {Object} res - Expressレスポンスオブジェクト 
   * @param {Function} next - 次のミドルウェア関数
   * @returns {Promise<void>} - JSON形式でレスポンスを返す
   * @response {Object} - レスポンスオブジェクト
   * @response {string} message - 成功メッセージ
   * @response {Array<Object>} posts - 投稿一覧
   * @response {string} posts[].id - 投稿ID
   * @response {string} posts[].content - 投稿内容
   * @response {string|null} posts[].media - メディアURL
   * @response {string|null} posts[].club - 関連クラブID
   * @response {string} posts[].createdAt - 作成日時
   * @response {Array<Object>} posts[].tags - タグ情報
   * @response {Array<string>} posts[].comments - コメントID一覧
   * @response {Object} posts[].author - 投稿者情報
   */
  export const getUserPostsController = async (req, res, next) => {
    try {
      const posts = await getUserPostsService(req.params.userId);
      res.status(200).json({message:"プロフィールページの投稿ID一覧を取得しました",posts:posts });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * クラブの投稿一覧を取得するコントローラー
   * @param {Object} req - Expressリクエストオブジェクト
   * @param {Object} req.params - URLパラメータ
   * @param {string} req.params.clubId - 投稿を取得するクラブID
   * @param {Object} res - Expressレスポンスオブジェクト 
   * @param {Function} next - 次のミドルウェア関数
   * @returns {Promise<void>} - JSON形式でレスポンスを返す
   * @response {Object} - レスポンスオブジェクト
   * @response {string} message - 成功メッセージ
   * @response {Array<Object>} posts - 投稿一覧
   * @response {string} posts[].id - 投稿ID
   * @response {string} posts[].content - 投稿内容
   * @response {string|null} posts[].media - メディアURL
   * @response {string|null} posts[].club - 関連クラブID
   * @response {string} posts[].createdAt - 作成日時
   * @response {Array<Object>} posts[].tags - タグ情報
   * @response {Array<string>} posts[].comments - コメントID一覧
   * @response {Object} posts[].author - 投稿者情報
   */
  export const getClubPostsController = async (req, res, next) => {
    try {
      const posts = await getClubPostsService(req.params.clubId);
      res.status(200).json({ message:"クラブの投稿ID一覧を取得しました",posts: posts });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * ホームの投稿一覧を取得するコントローラー
   * @param {Object} req - Expressリクエストオブジェクト
   * @param {string} req.userId - リクエストユーザーのID（認証ミドルウェアから注入）
   * @param {Object} res - Expressレスポンスオブジェクト 
   * @param {Function} next - 次のミドルウェア関数
   * @returns {Promise<void>} - JSON形式でレスポンスを返す
   * @response {Object} - レスポンスオブジェクト
   * @response {string} message - 成功メッセージ
   * @response {Array<Object>} posts - 投稿一覧
   * @response {string} posts[].id - 投稿ID
   * @response {string} posts[].content - 投稿内容
   * @response {string|null} posts[].media - メディアURL
   * @response {string|null} posts[].club - 関連クラブID
   * @response {string} posts[].createdAt - 作成日時
   * @response {Array<Object>} posts[].tags - タグ情報
   * @response {Array<string>} posts[].comments - コメントID一覧
   * @response {Object} posts[].author - 投稿者情報
   */
  export const getHomePostsController = async (req, res, next) => {
    try {
      const posts = await getHomePostsService(req.userId);
      res.status(200).json({ message:"ホームの投稿ID一覧を取得しました",posts: posts });
    } catch (error) {
      next(error);
    }
  };
  