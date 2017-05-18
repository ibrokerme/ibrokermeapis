var secureme = {
    addsecureme: addsecureme,
    removesecureme: removesecureme,
    assignsecureme: assignsecureme,
    getsecureme: getsecureme
}
function getsecureme(req, res) {
    var userid = req.params.userid || '';
    try {
        db.collection('secureme', function (err, collection) {
            collection.find({ userid: new ObjectID(userid) }).toArray(function (err, output) {
                if (err) {
                    res.status(500).send(err);
                } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                    res.send(output);
                }
            })
        })
    }
    catch (err) {
        res.status(500).send("error has occurred");
    }
}
function addsecureme(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {
        var dateadded = common.gettodaydate();
        var userid = fields.userid;
        var urldata = fields.url;
        var username = fields.username;
        var password = fields.password;
        var comment = fields.comment;
        var secureid = fields.comment;

        try {
            if (secureid === '0') {
                db.collection('secureme', function (err, secureme) {
                    secureme.insert({
                        url: urldata,
                        username: username,
                        password: password,
                        comment: comment,
                        userid: userid,
                        dateadded: dateadded

                    }, { safe: true }, function (err, result) {
                        if (err) {
                            res.send({ status: 'failed to safe secureme' });
                        } else {
                            res.send('secureme inserted sucessfully');
                        }

                    });
                });
            }
            else {
                db.collection('secureme', function (err, collection) {
                    collection.find({ userid: new ObjectID(userid), _id: new object(secureid) }).toArray(function (err, output) {
                        if (err) {
                            res.status(500).send(err);
                        } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                            collection.update({ _id: new ObjectID(secureid) }, {
                                $set: {
                                    url: urldata,
                                    username: username,
                                    password: password,
                                    comment: comment,
                                    dateadded: dateadded
                                }
                            });
                        }

                    })
                })
            }
        }
        catch (err) {
            res.status(500).send("error has occurred");
        }
    })

}
function removesecureme(req, res) {
    var securemeid = req.params.securemeid || '';
    var userid = req.params.userid || '';
    db.collection('secureme', function (err, collection) {
        collection.remove({ '_id': new ObjectID(securemeid) }, { safe: true }, function (err, result) {
            if (err) {
                res.send({ 'error': 'An error has occurred - ' + err });
            } else {
                collection.find({ userid: new ObjectID(userid) }).toArray(function (err, output) {
                    if (err) {
                        res.send('error returning secureme!!');
                    } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                        res.send(JSON.stringify(output));
                    }
                })
            }
        });
    });
}
function assignsecureme(req, res) {
    try {
        var securemeid = req.params.securemeid || '';
        var userid = req.params.userid || '';
        var mailto = req.params.mailto || '';
        var message = req.params.message || '';
        var pathtemp = path.resolve('./templates/emails/welcome/html.html');

        db.collection('secureme', function (err, collection) {
            collection.find({ _id: new ObjectID(securemeid), userid: new object(userid) }).toArray(function (err, output) {
                if (err) {
                    res.send('secureme not found!!');
                } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                    common.genericmailer(mailto, output[0], pathtemp, message, '', '', 'asignedsecureme', (outcome) => {
                        if (outcome === 'done') {
                            res.send(JSON.stringify(output[0]));
                        }
                    });

                }
            })
        })
    }
    catch (err) {
        res.status(500).send("error has occurred");
    }
}
module.exports = secureme;


