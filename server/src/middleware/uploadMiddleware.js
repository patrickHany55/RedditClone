import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "uploads/avatars");
    },
    filename(req, file, cb) {
        cb(
            null,
            `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

const fileFilter = (req, file, cb) => {
    const filetypes = /jpg|jpeg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error("Images only!"));
    }
};

export const uploadAvatar = multer({
    storage,
    fileFilter,
});
