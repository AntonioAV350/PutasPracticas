const jwt = require('jsonwebtoken');

function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Bearer <token>

        if (!token) {
            return res.sendStatus(401); // No token provided
        }

        jwt.verify(token, process.env.JWT_SECRET || "dev-secret", (err, user) => {
            if (err) {
                console.error("JWT Verification Error:", err);
                return res.sendStatus(403); 
            }

            req.user = user; 
            next();
        });
    } else {
        res.sendStatus(401);
    }
}

module.exports = authenticateJWT;
