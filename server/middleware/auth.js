const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const headerAuth = req.headers.authorization;

        if (!headerAuth || !headerAuth.startsWith("Bearer ")) {
            return res.status(401).send({ message: 'Access token not found or invalid' });
        }

        const token = headerAuth.split(' ')[1];
        const payload = jwt.verify(token,process.env.JWTPRIVATEKEY);
        req.user =payload;
        next();
    }
    catch (err) {
        console.error("Error form /server/middleware/auth.js: "+ err);
       return res.status(401).send({ message: 'Invalid or expired token' });
    }
}

module.exports = authMiddleware;