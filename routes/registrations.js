var mv = require('mv');
const common = require('./common');

var registries = {
    addregistration: addregistration,
    getretrievedpassword: getretrievedpassword,
    addusers: addusers,
    getuser: getuser,
    changeuserpassword: changeuserpassword,
    unlockuserscreen: unlockuserscreen
}
function getretrievedpassword(req, res) {
    var form = new formidable.IncomingForm();
    const pathtemp = path.resolve('./templates/emails/recovery.html');

    form.parse(req, function (err, fields) {
        const name = fields.name;
        const email = fields.email;
        try {
            if (email !== '') {
                db.collection('userregistrations', function (err, collection) {
                    collection.find({ email: email }).toArray(function (err, output) {
                        if (err) {
                            res.send('user not found!!');
                        } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                            common.genericmailer(output[0].email, output[0], pathtemp, '', '', '', 'recover', '', function (resp) {
                                res.status(200).send('done');
                            })
                        }
                    })
                })
            }
            else if (name !== '') {
                db.collection('userregistrations', function (err, collection) {
                    collection.find({ username: name }).toArray(function (err, output) {
                        if (err) {
                            res.send('user not found!!');
                        } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                            common.genericmailer(output[0].email, output[0], pathtemp, '', '', '', 'recover', '', function (resp) {
                                res.status(200).send('done');
                            })

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

function addregistration(req, res) {
    var form = new formidable.IncomingForm();
    const pathtemp = path.resolve('./templates/emails/registration.html');

    form.parse(req, function (err, fields) {
        const dateadded = common.gettodaydate();
        const username = fields.username;
        const gender = fields.gender;
        const email = fields.email;
        const dateofbirth = fields.dateofbirth;
        const password = fields.password;
        const termsandconditionschecked = fields.termsaccepted;
        const loginurl = fields.location;

        try {
            db.collection('userregistrations', function (err, userregistrations) {
                userregistrations.find({ email: email }).toArray(function (err, regresult) {
                    if (err) {
                        res.status(500).send(err);
                    } else if (typeof (regresult[0]) !== 'undefined') {
                        res.send('Email already used');
                    }
                    else {
                        db.collection('userregistrations', function (err, userregistrations) {
                            userregistrations.insert({
                                username: username,
                                email: email,
                                password: password,
                                gender: gender,
                                termsandconditionschecked: termsandconditionschecked,
                                dateadded: dateadded

                            }, { safe: true }, function (err, result) {
                                if (err) {
                                    res.send('error');
                                } else {
                                    common.genericmailer(result.ops[0].email, result.ops[0], pathtemp, '', '', '', 'registration', loginurl, function (resp) {
                                    })
                                    res.send(result).end();
                                }

                            });
                        });

                    }
                })
            })

        }
        catch (err) {
            res.status(500).send("error has occurred");
        }

    })

}
function addusers(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var dateadded = common.gettodaydate();
        var file = 'None';
        var fsiz = 0;
        var tempPath = '';
        var filename = '';
        var targetPath = '';
        if (Object.keys(files).length > 0) {
            file = files.file;
            fsiz = file.size;
            tempPath = file.path;
            filename = file.name;
            targetPath = path.resolve('./public/images/' + filename);
        }
        var title = fields.title;
        var firstname = fields.firstname;
        var lastname = fields.lastname;
        var emailaddress = fields.emailaddress;
        var website = fields.website;
        var aboutme = fields.aboutme;
        var userregid = fields.userregid;
        var contactinfo = fields.contactinfo;

        try {
            if (targetPath != '' && tempPath != '') {
                mv(tempPath, targetPath, function (err) {
                    if (err) {
                        throw err
                    }
                    else {
                        var data = fs.readFileSync(targetPath);
                        var image = new Binary(data);
                        var imageType = file.type;
                        var imageName = file.name;
                        fs.unlink(targetPath);
                        if (userregid != '' && typeof (userregid) != 'undefined') {
                            db.collection('users', function (err, collection) {
                                collection.update({ _id: new ObjectID(userregid) }, {
                                    $set: {
                                        title: title,
                                        firstname: firstname,
                                        lastname: lastname,
                                        emailaddress: emailaddress,
                                        website: website,
                                        aboutme: aboutme,
                                        image: image,
                                        imageType: imageType,
                                        imageName: imageName,
                                        contactinfo: contactinfo,
                                        dateadded: dateadded
                                    }
                                });
                            });
                        }
                        db.collection('users', function (err, collection) {
                            collection.insert({
                                userregid: userregid,
                                title: title,
                                firstname: firstname,
                                lastname: lastname,
                                emailaddress: emailaddress,
                                website: website,
                                aboutme: aboutme,
                                image: image,
                                imageType: imageType,
                                imageName: imageName,
                                contactinfo: contactinfo,
                                dateadded: dateadded

                            }, { safe: true }, function (err, result) {
                                if (err) {
                                    res.send({ status: 'failed to safe user' });
                                } else {
                                    res.send('user inserted sucessfully');
                                }

                            });
                        });
                    }
                });
            }

        }
        catch (err) {
            res.status(500).send("error has occurred");
        }
    })

}
function getuser(req, res) {
    try {
        var userregid = req.params.userregid || '';
        db.collection('users', function (err, collection) {
            collection.find({ _id: new ObjectID(userregid) }).toArray(function (err, output) {
                if (err) {
                    res.send('user not found!!');
                } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                    res.send(JSON.stringify(output));
                }
            })
        })
    }
    catch (err) {
        res.status(500).send("error has occurred");
    }
}
function changeuserpassword(req, res) {
    try {
        var userregid = req.params.userregid || '';
        var oldpassword = req.params.oldpassword || '';
        var newpassword = req.params.newpassword || '';
        db.collection('userregistrations', function (err, collection) {
            collection.update({ _id: new ObjectID(userregid), password: oldpassword }, {
                $set: {
                    password: newpassword
                }
            });
        })
    }
    catch (err) {
        res.status(500).send("error has occurred");
    }
}
function unlockuserscreen(req, res) {
    try {
        var userregid = req.params.userregid || '';
        var password = req.params.password || '';
        db.collection('userregistrations', function (err, collection) {
            collection.find({
                _id: new ObjectID(userregid).toArray(function (err, output) {
                    if (err) {
                        res.send('user not found!!');
                    } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                        res.send(JSON.stringify(output));
                    }
                })

            })
        })
    }
    catch (err) {
        res.status(500).send("error has occurred");
    }


}
module.exports = registries;



