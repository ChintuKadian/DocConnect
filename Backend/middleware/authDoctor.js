import jwt from 'jsonwebtoken'
//doctor authentication middleware

const authDoctor = async (req, res, next) => {
    try {
        const { dtoken } = req.headers;
        if (!dtoken) {
            return res.json({ success: false, message: "not Authorized login again" })
        }
        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET)
        
        req.body.docId= token_decode.id;//add id to reqest body, since token conatain id

        next()
    }
    catch {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

export default authDoctor