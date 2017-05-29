var jwt = require('jwt-simple');
var validateUser = require('../routes/auth').validateUser;

module.exports = function (req, res, next) {
    var token = req.headers['x-access-token'];
    var key = req.headers['x-userid'];
    var email = req.headers['x-email'];
    var username = req.headers['x-username'];
 
    if (token) {
        try {
            var decoded = jwt.decode(token, require('../config/secret.js')());

            if (decoded.exp <= Date.now()) {
                res.status(400);
                res.json({
                    "status": 400,
                    "message": "Token Expired"
                });
                return;
            }

            validateUser(email, function (err, response) {
                if (response) {
                    if (req.url.indexOf('admin') >= 0 || (req.url.indexOf('admin') < 0 && req.url.indexOf('/api/v1/') >= 0)) {
                        next(); // To move to next middleware
                    } else {
                        res.status(403);
                        res.json({
                            "status": 403,
                            "message": "Not Authorized"
                        });
                        return;
                    }
                } else {
                    // No user with this name exists, respond back with a 401
                    res.status(401);
                    res.json({
                        "status": 401,
                        "message": "Invalid User"
                    });
                    return;
                }
            }); // The key would be the logged in user's username


        } catch (err) {
            res.status(500);
            res.json({
                "status": 500,
                "message": "Oops something went wrong",
                "error": err
            });
        }
    } else {
        res.status(401);
        res.json({
            "status": 401,
            "message": "Invalid Token or Key"
        });
        return;
    }
};