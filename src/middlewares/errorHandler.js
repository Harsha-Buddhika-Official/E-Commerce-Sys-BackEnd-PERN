export const errorHandler = (err, req, res, next) => {
  console.error(err); //for debugging purposes, you can log the error to the console

  let statusCode = err.status || 500; //default to 500 if no status is provided
  let message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message
  })
};