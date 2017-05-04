var jwt = require('jwt-simple');
var auth = {
    login: login,
    validateUser: validateUser
}
 
function login(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, data) {
        var email = data.email || '';
        var password = data.password || '';
 

        if (email == '' || password == '') {
            res.status(401);
            res.json({
                "status": 401,
                "message": "Invalid credentials"
            });
            return;
        }

        
 
        validate(email, function (err, output) {
 
            if (!output) { // If authentication fails, we send a 401 back
                res.status(401);
                res.json({
                    "status": 401,
                    "message": "Invalid credentials"
                });
                return;
            }

            if (output) {

                // If authentication is success, we will generate a token
                // and dispatch it to the client
                res.json(genToken(output));
            }
        });

    })
};

function validate(email, password, callback) {
    db.collection('userregistrations', function (err, collection) {
        collection.find({ email: email}).toArray(function (err, items) {
            return callback(null, items[0]);
        });
    });
};

function validateUser(email, callback) {
    return validate(email, callback);
 
};
// private method
function genToken(user) {
    var expires = expiresIn(7); // 7 days
    var token = jwt.encode({
        exp: expires
    }, require('../config/secret')());

    return {
        token: token,
        expires: expires,
        user: user
    };
}

function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
}

module.exports = auth;