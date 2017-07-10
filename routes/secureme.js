const common = require('./common');
var secureme = {
    addsecureme: addsecureme,
    removesecureme: removesecureme,
    emailassignment: assignsecureme,
    getsecuremes: getsecuremes
}
function getsecuremes(req, res) {
    var userid = req.params.userid || '';
    try {
        db.collection('secureme', function (err, collection) {
            collection.find({ userid: userid }).toArray(function (err, output) {
                if (err) {
                    res.status(500).send(err);
                } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                    res.send(output);
                }
                else {
                    res.send('No data found');
                }
            })
        })
    }
    catch (err) {
        res.status(500).send("error has occurred");
    }
}
function addsecureme(req, res) {
    var dateadded = common.gettodaydate();
    var secureme = req.body;
    var myurl = secureme.myurl;
    var username = secureme.username;
    var password = secureme.password;
    var info = secureme.info;
    var userid = secureme.userid;
    var securemeid = secureme.securemeid;

    try {
        if (securemeid === '') {
            db.collection('secureme', function (err, secureme) {
                secureme.insert({
                    url: myurl,
                    username: username,
                    password: password,
                    comment: info,
                    userid: userid,
                    dateadded: dateadded

                }, { safe: true }, function (err, result) {
                    if (err) {
                        res.send({ status: 'failed to safe secureme' });
                    } else {
                        db.collection('secureme', function (err, collection) {
                            collection.find({ userid: userid }).toArray(function (err, output) {
                                if (err) {
                                    res.status(500).send(err);
                                } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                                    res.send(output);
                                }
                                else {
                                    res.send('No data found');
                                }
                            })
                        })
                    }

                });
            });
        }
        else {
            db.collection('secureme', function (err, collection) {
                collection.update({ _id: new ObjectID(securemeid) }, {
                    $set: {
                        url: myurl,
                        username: username,
                        password: password,
                        comment: info,
                        dateadded: dateadded
                    }
                }, function (err, result) {
                    if (err) {
                        res.send({ status: 'failed to safe secureme' });
                    } else {
                        db.collection('secureme', function (err, collection) {
                            collection.find({ userid: userid }).toArray(function (err, output) {
                                if (err) {
                                    res.status(500).send(err);
                                } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                                    res.send(output);
                                }
                                else {
                                    res.send('No data found');
                                }
                            })
                        })
                    }
                });
            })
        }
    }
    catch (err) {
        res.status(500).send("error has occurred");
    }
}
function removesecureme(req, res) {
    var securemeid = req.params.id || '';
    var userid = req.params.userid || '';
    db.collection('secureme', function (err, collection) {
        collection.remove({ _id: new ObjectID(securemeid) }, { safe: true }, function (err, result) {
            if (err) {
                res.send({ 'error': 'An error has occurred - ' + err });
            } else {
                collection.find({ userid: userid }).toArray(function (err, output) {
                    if (err) {
                        res.send('error returning secureme!!');
                    } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                        res.send(JSON.stringify(output));
                    }
                    else {
                        res.send('No data found');
                    }
                })
            }
        });
    });
}
function assignsecureme(req, res) {
    try {
        var message = req.body;
        message.cc = [];
        var pathtemp = path.resolve('./templates/emails/assignpassword.html');
        db.collection('secureme', function (err, collection) {
            collection.find({ userid: message.userid, _id: new ObjectID(message.securemeid) }).toArray(function (err, output) {
                if (err) {
                    res.status(500).send(err);
                } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                    db.collection('userregistrations', function (err, userregistrations) {
                        userregistrations.find({ _id: new ObjectID(message.userid) }).toArray(function (err, fromuser) {
                            if (err) {
                                res.status(500).send(err);
                            }
                            else if (fromuser[0] != '' && typeof (fromuser[0] != 'undefined')) {
                                var data = output.map((item) => {
                                    item.password = common.decode(item.password);
                                    return item;
                                });
                                if (fromuser.length > 0) {
                                    message.cc.push(fromuser[0].email)
                                }
                                common.genericmailer(message.email, data, pathtemp, message, '', '', 'secureme', '', (outcome) => {
                                    if (outcome !== undefined && outcome.rejected !== undefined && outcome.rejected.length === 0) {
                                        res.status(200).send('Assigned!');
                                    }
                                    else {
                                        res.status(500).send(err);
                                    }
                                });
                            }
                            else {
                                res.send('No data found');
                            }

                        })
                    })
                }
            })
        })
    }
    catch (err) {
        res.status(500).send(err);
    }
}

module.exports = secureme;



