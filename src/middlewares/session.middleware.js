import { v4 as uuidv4 } from 'uuid';

const COOKIE_NAME = 'sid';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

// Attach session to every cart request
export const attachSession = (req, _res, next) => {
  const existing = req.cookies?.[COOKIE_NAME];
  // console.log('Existing session ID:', existing);

  req.sessionId = existing || uuidv4();
  req.isNewSession = !existing;

  next();
};

// Called by service layer when cart is created for the first time
export const setSessionCookie = (res, sessionId) => {
  res.cookie(COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE,
  });
};