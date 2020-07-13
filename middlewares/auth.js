const jwt = require('jsonwebtoken');
const authConfig = require('../config/authConfig.json');


module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader) {
        return res.status(401).send({ error: 'Not token provided' });
    }

    const parts = authHeader.split(' ');

    if(!parts.length === 2) {
        return res.status(401).send({ error: 'Token error' });
    }

    const [ sheme, token ] = parts;

    if(!/^Bearer$/i.test(sheme)) {
        return res.status(401).send({ error: 'Token malformatted' });
    } //regex

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if(err) {
            return res.status(401).send({ error: 'Token invaled' });
        }

        req.userId = decoded._id;
    });

    return next();
};