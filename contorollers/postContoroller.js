import {
    createPostService,
    getPostDetailsService,
    getUserPostsService,
    getClubPostsService,
    getHomePostsService,
  } from "../service/postService.js";
  
  /**
   * ✅ 投稿を作成
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
   * ✅ 投稿の詳細を取得
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
   * ✅ ユーザーの投稿一覧を取得
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
   * ✅ クラブの投稿一覧を取得
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
   * ✅ ホームの投稿一覧を取得
   */
  export const getHomePostsController = async (req, res, next) => {
    try {
      const posts = await getHomePostsService(req.userId);
      res.status(200).json({ message:"ホームの投稿ID一覧を取得しました",posts: posts });
    } catch (error) {
      next(error);
    }
  };
  