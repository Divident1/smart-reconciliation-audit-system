const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

function checkFileType(file, cb) {
    const filetypes = /csv|xlsx|xls/; // Simple regex for extension
    // Checking mimetype can be tricky for excel/csv sometimes across OS, so checking ext details
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    // Also check mimetype if possible but optional since CSV mime types vary
    // const mimetype = ... 

    if (extname) {
        return cb(null, true);
    } else {
        cb(new Error('Images Only! Wait, no. CSV/Excel Only!'));
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit? 50k records might be small text-wise.
    // fileFilter: function (req, file, cb) {
    //     checkFileType(file, cb);
    // }
});

module.exports = upload;
