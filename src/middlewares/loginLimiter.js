// import rateLimit from 'express-rate-limit';

// const loginLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 5, // Limit each IP to 5 login requests per `window` (here, per 15 minutes)
//     message: 'Too many login attempts from this IP, please try again after 15 minutes',
//     standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//     legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// });

// export default loginLimiter;

import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    console.log("Rate limit triggered");
    const resetTime = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const retryAfter = Math.ceil((new Date(resetTime) - new Date()) / 1000); // in seconds
    res.setHeader("Retry-After", retryAfter);
    res.status(429).json({
        success: false,
        message: "Too many login attempts. Try again shortly.",
        retryAfter: retryAfter,
    });
  },
});

export default loginLimiter;