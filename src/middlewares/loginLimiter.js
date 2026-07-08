// import rateLimit from "express-rate-limit";

// const loginLimiter = rateLimit({
//   windowMs: 10 * 60 * 1000,
//   max: 5,
//   handler: (req, res) => {
//     console.log("Rate limit triggered");
//     const resetTime = new Date(Date.now() + 10 * 60 * 1000).toISOString();
//     const retryAfter = Math.ceil((new Date(resetTime) - new Date()) / 1000); // in seconds
//     res.setHeader("Retry-After", retryAfter);
//     res.status(429).json({
//         success: false,
//         message: "Too many login attempts. Try again shortly.",
//         retryAfter: retryAfter,
//     });
//   },
// });

// export default loginLimiter;

import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const resetTime = req.rateLimit?.resetTime;
    const retryAfter = resetTime
      ? Math.max(0, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
      : 600; 

    res.setHeader("Retry-After", String(retryAfter));

    res.status(429).json({
      success: false,
      message: "Too many login attempts. Try again shortly.",
      retryAfter,
    });
  },
});

export default loginLimiter;