import multer from 'multer';

const storage = multer.memoryStorage();

const MAX_FILE_SIZE = 50 * 1024 * 1024;

// mimetype -> allowed extensions
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

const fileFilter = (req, file, cb) => {
    const ext = getExtension(file.originalname);

    // 1. Hard block known-dangerous types first
    if (EXPLICITLY_BLOCKED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new MulterFileTypeError(
            `File type "${file.mimetype}" is not allowed.`
        ));
    }

    // 2. Allow-list check — was buggy before: ALLOWED_MIME_TYPES was an array,
    //    now ALLOWED_TYPES is the object it needs to be
    const allowedExtensions = ALLOWED_TYPES[file.mimetype];
    if (!allowedExtensions) {
        return cb(new MulterFileTypeError(
            `Invalid file type "${file.mimetype}". Allowed: ${Object.keys(ALLOWED_TYPES).join(', ')}`
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

const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter
});

export default upload;
export { MulterFileTypeError };