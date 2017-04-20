var registries = {
    addregistration: addregistration,
    getretrievedpassword: getretrievedpassword,
    addusers: addusers,
    getuser: getuser,
    changeuserpassword:changeuserpassword
}
function getretrievedpassword(req, res) {
    var email = req.params.email;
    var username = req.params.username;
    try {
        if (email != null || email != '' || typeof (email != 'undefined')) {
            db.collection('userregistrations', function (err, collection) {
                collection.find({ email: email }).toArray(function (err, output) {
                    if (err) {
                        res.send('user not found!!');
                    } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                        //send email with password
                        var pass = output[0].password;
                        var username = output[0].username;
                        common.passwordrecovery(email, username, pass);
                    }
                })
            })
        }
        else {
            db.collection('userregistrations', function (err, collection) {
                collection.find({ username: username }).toArray(function (err, output) {
                    if (err) {
                        res.send('user not found!!');
                    } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                        //send email with password
                        var pass = output[0].password;
                        var username = output[0].username;
                        common.passwordrecovery(email, username, pass);
                    }
                })
            })
        }
        res.send('Sent');
    }
    catch (err) {
        res.send('error occured' + err);
    }
}
function addregistration(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {
        var dateadded = common.gettodaydate();
        var username = fields.username;
        var gender = fields.gender;
        var email = fields.email;
        var dateofbirth = fields.dateofbirth;
        var password = fields.password;
        var termsandconditionschecked = fields.termsandconditionschecked;

        try {
            db.collection('userregistrations', function (err, collection) {
                collection.find({ email: email }).toArray(function (err, regresult) {
                    if (err) {
                        res.status(500).send(err);
                    } else if (regresult[0] != '' && typeof (regresult[0] != 'undefined')) {
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
                                    res.send({ status: 'failed to safe user' });
                                } else {
                                    res.send('user inserted sucessfully');
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
                fs.rename(tempPath, targetPath, function (err) {
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

module.exports = registries;



