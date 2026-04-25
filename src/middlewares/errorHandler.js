export const errorHandler = (err, req, res, next) => {
  console.error(err); 

  let statusCode = err.statusCode || err.status || 500; 
  let message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message
  })
};