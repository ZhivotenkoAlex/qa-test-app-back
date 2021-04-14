const jwt = require('jsonwebtoken')
const Users = require("../model/users");


function verifyToken(req,res,next) {
    try {
        // Bearer tokenstring
        const token = req.headers.authorization.split(' ')[1];
        
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({status:false,message:"Your session is not valid",data:error.message})
    }
}

function verifyRefreshToken(req, res, next) {
    const token = req.body.token;

    if (token === null) return res.status(401).json({ status: false, message: "Invalid request"})
     try {
         const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
         req.userData = decoded;

         // verify if token is in store or not
         const storedRefreshToken = Users.find(x => x.username === decoded.sub)
         
         if (storedRefreshToken===undefined) return res.status(401).json({ status: false, message: "Invalid request. Token is not in store" })
         if (storedRefreshToken.token !== token) return res.status(401).json({ status: false, message: "Invalid request. Token is not in store" })
      
             next();
         }         
     catch (error) {
        return res.status(401).json({ status: true, message: "Your session is not valid", data: error.message })
    }
}

module.exports = {
    verifyToken,
    verifyRefreshToken
}