import multer from 'multer';

const storage = multer.memoryStorage();

const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Full type list — used for banners, brands, products, categories, etc.
const ALLOWED_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/jpg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'application/pdf': ['.pdf'],
    'video/mp4': ['.mp4'],
    'video/webm': ['.webm'],
    'video/ogg': ['.ogv', '.ogg']
};

// Narrower list — used only for payment receipt uploads.
// A bank deposit slip is always an image or a PDF, never video.
const RECEIPT_ALLOWED_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/jpg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'application/pdf': ['.pdf']
};

const EXPLICITLY_BLOCKED_MIME_TYPES = [
    'application/x-msdownload',
    'application/x-sh',
    'application/x-httpd-php',
    'text/x-php',
    'application/javascript',
    'application/x-executable',
    'application/vnd.microsoft.portable-executable'
];

const getExtension = (filename = '') => {
    const idx = filename.lastIndexOf('.');
    return idx === -1 ? '' : filename.slice(idx).toLowerCase();
};

class MulterFileTypeError extends Error {
    constructor(message) {
        super(message);
        this.name = 'MulterFileTypeError';
        this.statusCode = 400;
    }
}

// Factory — builds a fileFilter bound to whichever allowed-types map is passed in,
// so both multer instances share the exact same validation logic.
const createFileFilter = (allowedTypes) => (req, file, cb) => {
    const ext = getExtension(file.originalname);

    // 1. Hard block known-dangerous types first
    if (EXPLICITLY_BLOCKED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new MulterFileTypeError(
            `File type "${file.mimetype}" is not allowed.`
        ));
    }

    // 2. Allow-list check
    const allowedExtensions = allowedTypes[file.mimetype];
    if (!allowedExtensions) {
        return cb(new MulterFileTypeError(
            `Invalid file type "${file.mimetype}". Allowed: ${Object.keys(allowedTypes).join(', ')}`
        ));
    }

    // 3. Cross-check extension against declared mimetype
    if (!allowedExtensions.includes(ext)) {
        return cb(new MulterFileTypeError(
            `File extension "${ext}" does not match declared type "${file.mimetype}".`
        ));
    }

    cb(null, true);
};

// General-purpose upload — banners, brands, products, categories, etc.
// Unchanged behavior from before.
const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: createFileFilter(ALLOWED_TYPES)
});

// Receipt-only upload — images and PDFs only, no video.
const receiptUpload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: createFileFilter(RECEIPT_ALLOWED_TYPES)
});

export default upload;
export { receiptUpload, MulterFileTypeError };