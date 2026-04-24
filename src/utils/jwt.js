import jwt from 'jsonwebtoken';

export const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, 
        { expiresIn: '1h' });
}

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw new Error('Invalid token');
    }
}

// export const decodeToken = (token) => {
//     try {
//         return jwt.decode(token);
//     } catch (err) {
//         throw new Error('Invalid token');
//     }
// }