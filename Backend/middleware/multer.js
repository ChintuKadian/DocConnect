import multer from 'multer'
//  It's primarily used for uploading files such as images, documents, or videos from the client (frontend) to the server.
const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, file.originalname)
    }
})

const upload = multer({ storage });
export default upload