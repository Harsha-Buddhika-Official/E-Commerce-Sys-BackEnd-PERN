import multer from 'multer';

const storage = multer.memoryStorage();

const MAX_FILE_SIZE = 50 * 1024 * 1024; 
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
    'video/mp4',
    'video/webm',
    'video/ogg'
];

const EXPLICITLY_BLOCKED_MIME_TYPES = [
    'application/x-msdownload',
    'application/x-sh',
    'application/x-httpd-php',
    'text/x-php',
    'application/javascript',
    'application/x-executable',
    'application/vnd.microsoft.portable-executable'
];

// const fileFilter = (req, file, cb) => {
//     if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
//         cb(null, true);
//     } else {
//         cb(new Error('Invalid file type. Only JPG, JPEG, PNG and WebP are allowed.'));
//     }
// };

const fileFilter = (req, file, cb) => {
    const ext = getExtension(file.originalname);

    // 1. Hard block known-dangerous types first, regardless of anything else
    if (EXPLICITLY_BLOCKED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new MulterFileTypeError(
            `File type "${file.mimetype}" is not allowed.`
        ));
    }

    // 2. Allow-list check
    const allowedExtensions = ALLOWED_TYPES[file.mimetype];
    if (!allowedExtensions) {
        return cb(new MulterFileTypeError(
            `Invalid file type "${file.mimetype}". Allowed: ${Object.keys(ALLOWED_TYPES).join(', ')}`
        ));
    }

    // 3. Cross-check extension against declared mimetype to catch casual spoofing
    //    (e.g. malware.exe renamed with a fake Content-Type header)
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
