import crypto from 'crypto';

export const generateTrackingCode = () => {
    // 1️⃣ Date part
    const now = new Date();

    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    // e.g. 20260414

    // 2️⃣ Random part (6 characters)
    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
    // e.g. A7F3K9

    return `TRK-${datePart}-${randomPart}`;
}