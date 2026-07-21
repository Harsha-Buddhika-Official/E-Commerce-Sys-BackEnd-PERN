import crypto from 'crypto';

export const generateTrackingCode = () => {
    const now = new Date();

    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');

    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();

    return `TRK-${datePart}-${randomPart}`;
}