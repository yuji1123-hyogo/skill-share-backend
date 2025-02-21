const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);
  
    const statusCode = err.status || 500;
    res.status(statusCode).json({
      message: err.message || "サーバー内部エラーが発生しました",
      errors: err.errors || [],
    });
  };
  
  export default errorHandler;
  