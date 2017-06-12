const mv = require('mv');
const common = require('./common');

var registries = {
    addregistration: addregistration,
    getretrievedpassword: getretrievedpassword,
    addusers: addusers,
    getuser: getuser,
    changeuserpassword: changeuserpassword,
    unlockuserscreen: unlockuserscreen,
    getuserphoto: getuserphoto
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
    try {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var dateadded = common.gettodaydate();
            var file = 'None';
            var filesize = 0;
            var tempPath = '';
            var filename = '';
            var filetype = '';
            var targetPath = '';

            if (Object.keys(files).length > 0) {
                file = files.photoimage;
                tempPath = file.path;
                filename = file.name;
                filetype = file.type;
                filesize = file.size;
                targetPath = path.resolve('./images/' + filename);
            }

            var title = fields.title;
            var firstname = fields.firstname;
            var lastname = fields.lastname;
            var email = fields.email;
            var website = fields.website;
            var aboutme = fields.aboutme;
            var maritalstatus = fields.maritalstatus;
            var hasdiability = fields.hasdiability;
            var employmentstatus = fields.employmentstatus;
            var disabilitynature = fields.disabilitynature;
            var othermaritalstatus = fields.othermaritalstatus;
            var dateofbirth = fields.dateofbirth;
            var ninumber = fields.ninumber;
            var occupation = fields.occupation;
            var taxrefnumber = fields.taxrefnumber;
            var payerefnumber = fields.payerefnumber;
            var nationality = fields.nationality;
            var religion = fields.religion;
            var height = fields.height;
            var weight = fields.weight;
            var contacthousenameornumber = fields.contacthousenameornumber;
            var contactstreet1 = fields.contactstreet1;
            var contactstreet2 = fields.contactstreet2;
            var contactstreet3 = fields.contactstreet3;
            var contacttown = fields.contacttown;
            var contactcounty = fields.contactcounty;
            var contactpostcode = fields.contactpostcode;
            var contactcountry = fields.contactcountry;
            var contacttelno = fields.contacttelno;
            var contactmobileno = fields.contactmobileno;
            var contactpersonalemail = fields.contactpersonalemail;
            var contactworkemail = fields.contactworkemail;
            var contactotheremail = fields.contactotheremail;
            var addresshousenameornumber = fields.addresshousenameornumber;
            var addressstreetadd1 = fields.addressstreetadd1;
            var addressstreetadd2 = fields.addressstreetadd2;
            var addressstreetadd3 = fields.addressstreetadd3;
            var addresstown = fields.addresstown;
            var addresscounty = fields.addresscounty;
            var addresspostcodezip = fields.addresspostcodezip;
            var addresscountry = fields.addresscountry;
            var addresspersonalemail = fields.addresspersonalemail;
            var addressworkemail = fields.addressworkemail;
            var addressotheremail = fields.addressotheremail;
            var nextkintelnumber = fields.nextkintelnumber;
            var nextkinmobilenumber = fields.nextkinmobilenumber;
            var nextkinpersonalemail = fields.nextkinpersonalemail;
            var nextkinotheremail = fields.nextkinotheremail;
            var userid = fields.userid;
            var userregid = fields.id;
            var photoimage = '';


            if (targetPath !== '' && tempPath !== '') {
                mv(tempPath, targetPath, function (err) {
                    if (err) {
                        throw err
                    }
                    else {
                        if (targetPath != '') {
                            var data = fs.readFileSync(targetPath);
                            var image = new Binary(data);
                            photoimage = {
                                type: filetype,
                                name: filename,
                                imagedata: data
                            }
                        }
                        fs.unlink(targetPath);
                        if (userregid !== '' && typeof (userregid) !== 'undefined' && targetPath != '' && tempPath != '') {
                            if (Object.keys(photoimage).length > 0) {
                                db.collection('whoami', function (err, collection) {
                                    collection.update({ _id: new ObjectID(userregid) }, {
                                        $set: {
                                            photoimage: photoimage,
                                        }
                                    })
                                });
                            }
                            db.collection('whoami', function (err, collection) {
                                collection.update({ _id: new ObjectID(userregid) }, {
                                    $set: {
                                        title: title,
                                        firstname: firstname,
                                        lastname: lastname,
                                        email: email,
                                        website: website,
                                        aboutme: aboutme,
                                        maritalstatus: maritalstatus,
                                        hasdiability: hasdiability,
                                        employmentstatus: employmentstatus,
                                        disabilitynature: disabilitynature,
                                        othermaritalstatus: othermaritalstatus,
                                        dateofbirth: dateofbirth,
                                        ninumber: ninumber,
                                        occupation: occupation,
                                        taxrefnumber: taxrefnumber,
                                        payerefnumber: payerefnumber,
                                        nationality: nationality,
                                        religion: religion,
                                        height: height,
                                        weight: weight,
                                        contacthousenameornumber: contacthousenameornumber,
                                        contactstreet1: contactstreet1,
                                        contactstreet2: contactstreet2,
                                        contactstreet3: contactstreet3,
                                        contacttown: contacttown,
                                        contactcounty: contactcounty,
                                        contactpostcode: contactpostcode,
                                        contactcountry: contactcountry,
                                        contacttelno: contacttelno,
                                        contactmobileno: contactmobileno,
                                        contactpersonalemail: contactpersonalemail,
                                        contactworkemail: contactworkemail,
                                        contactotheremail: contactotheremail,
                                        addresshousenameornumber: addresshousenameornumber,
                                        addressstreetadd1: addressstreetadd1,
                                        addressstreetadd2: addressstreetadd2,
                                        addressstreetadd3: addressstreetadd3,
                                        addresstown: addresstown,
                                        addresscounty: addresscounty,
                                        addresspostcodezip: addresspostcodezip,
                                        addresscountry: addresscountry,
                                        addresspersonalemail: addresspersonalemail,
                                        addressworkemail: addressworkemail,
                                        addressotheremail: addressotheremail,
                                        nextkintelnumber: nextkintelnumber,
                                        nextkinmobilenumber: nextkinmobilenumber,
                                        nextkinpersonalemail: nextkinpersonalemail,
                                        nextkinotheremail: nextkinotheremail,
                                        userid: userid,
                                        dateadded: dateadded

                                    }
                                }, function (err, result) {
                                    res.send(result);
                                });
                            });
                        }
                        else {
                            db.collection('whoami', function (err, collection) {
                                collection.insert({
                                    photoimage: photoimage,
                                    title: title,
                                    firstname: firstname,
                                    lastname: lastname,
                                    email: email,
                                    website: website,
                                    aboutme: aboutme,
                                    maritalstatus: maritalstatus,
                                    hasdiability: hasdiability,
                                    employmentstatus: employmentstatus,
                                    disabilitynature: disabilitynature,
                                    othermaritalstatus: othermaritalstatus,
                                    dateofbirth: dateofbirth,
                                    ninumber: ninumber,
                                    occupation: occupation,
                                    taxrefnumber: taxrefnumber,
                                    payerefnumber: payerefnumber,
                                    nationality: nationality,
                                    religion: religion,
                                    height: height,
                                    weight: weight,
                                    contacthousenameornumber: contacthousenameornumber,
                                    contactstreet1: contactstreet1,
                                    contactstreet2: contactstreet2,
                                    contactstreet3: contactstreet3,
                                    contacttown: contacttown,
                                    contactcounty: contactcounty,
                                    contactpostcode: contactpostcode,
                                    contactcountry: contactcountry,
                                    contacttelno: contacttelno,
                                    contactmobileno: contactmobileno,
                                    contactpersonalemail: contactpersonalemail,
                                    contactworkemail: contactworkemail,
                                    contactotheremail: contactotheremail,
                                    addresshousenameornumber: addresshousenameornumber,
                                    addressstreetadd1: addressstreetadd1,
                                    addressstreetadd2: addressstreetadd2,
                                    addressstreetadd3: addressstreetadd3,
                                    addresstown: addresstown,
                                    addresscounty: addresscounty,
                                    addresspostcodezip: addresspostcodezip,
                                    addresscountry: addresscountry,
                                    addresspersonalemail: addresspersonalemail,
                                    addressworkemail: addressworkemail,
                                    addressotheremail: addressotheremail,
                                    nextkintelnumber: nextkintelnumber,
                                    nextkinmobilenumber: nextkinmobilenumber,
                                    nextkinpersonalemail: nextkinpersonalemail,
                                    nextkinotheremail: nextkinotheremail,
                                    userid: userid,
                                    dateadded: dateadded

                                }, { safe: true }, function (err, result) {
                                    if (err) {
                                        res.status(501).send(err);
                                    } else {
                                        if (result.ops[0].photoimage !== '') {
                                            const photo = new Buffer(result.ops[0].photoimage.imagedata).toString('base64');
                                            res.send(photo);
                                        }
                                        else {
                                            res.send(result.ops[0]);
                                        }
                                    }

                                });
                            });
                        }
                    }

                });
            }
            else {
                if (userregid !== '') {
                    if (targetPath !== '' && tempPath !== '') {
                        mv(tempPath, targetPath, function (err) {
                            if (err) {
                                throw err
                            }
                            else {
                                var data = fs.readFileSync(targetPath);
                                var image = new Binary(data);
                                photoimage = {
                                    type: filetype,
                                    name: filename,
                                    imagedata: data
                                }

                                fs.unlink(targetPath);
                                db.collection('whoami', function (err, collection) {
                                    collection.update({ _id: new ObjectID(userregid) }, {
                                        $set: {
                                            photoimage: photoimage,
                                        }
                                    })
                                });

                            }
                        });
                    }

                    db.collection('whoami', function (err, collection) {
                        collection.update({ _id: new ObjectID(userregid) }, {
                            $set: {
                                title: title,
                                firstname: firstname,
                                lastname: lastname,
                                email: email,
                                website: website,
                                aboutme: aboutme,
                                maritalstatus: maritalstatus,
                                hasdiability: hasdiability,
                                employmentstatus: employmentstatus,
                                disabilitynature: disabilitynature,
                                othermaritalstatus: othermaritalstatus,
                                dateofbirth: dateofbirth,
                                ninumber: ninumber,
                                occupation: occupation,
                                taxrefnumber: taxrefnumber,
                                payerefnumber: payerefnumber,
                                nationality: nationality,
                                religion: religion,
                                height: height,
                                weight: weight,
                                contacthousenameornumber: contacthousenameornumber,
                                contactstreet1: contactstreet1,
                                contactstreet2: contactstreet2,
                                contactstreet3: contactstreet3,
                                contacttown: contacttown,
                                contactcounty: contactcounty,
                                contactpostcode: contactpostcode,
                                contactcountry: contactcountry,
                                contacttelno: contacttelno,
                                contactmobileno: contactmobileno,
                                contactpersonalemail: contactpersonalemail,
                                contactworkemail: contactworkemail,
                                contactotheremail: contactotheremail,
                                addresshousenameornumber: addresshousenameornumber,
                                addressstreetadd1: addressstreetadd1,
                                addressstreetadd2: addressstreetadd2,
                                addressstreetadd3: addressstreetadd3,
                                addresstown: addresstown,
                                addresscounty: addresscounty,
                                addresspostcodezip: addresspostcodezip,
                                addresscountry: addresscountry,
                                addresspersonalemail: addresspersonalemail,
                                addressworkemail: addressworkemail,
                                addressotheremail: addressotheremail,
                                nextkintelnumber: nextkintelnumber,
                                nextkinmobilenumber: nextkinmobilenumber,
                                nextkinpersonalemail: nextkinpersonalemail,
                                nextkinotheremail: nextkinotheremail,
                                userid: userid,
                                dateadded: dateadded

                            }
                        }, function (err, result) {
                            res.send(result);
                        });

                    });
                }
                else {
                    db.collection('whoami', function (err, collection) {
                        
                        collection.insert({
                            photoimage: photoimage,
                            title: title,
                            firstname: firstname,
                            lastname: lastname,
                            email: email,
                            website: website,
                            aboutme: aboutme,
                            maritalstatus: maritalstatus,
                            hasdiability: hasdiability,
                            employmentstatus: employmentstatus,
                            disabilitynature: disabilitynature,
                            othermaritalstatus: othermaritalstatus,
                            dateofbirth: dateofbirth,
                            ninumber: ninumber,
                            occupation: occupation,
                            taxrefnumber: taxrefnumber,
                            payerefnumber: payerefnumber,
                            nationality: nationality,
                            religion: religion,
                            height: height,
                            weight: weight,
                            contacthousenameornumber: contacthousenameornumber,
                            contactstreet1: contactstreet1,
                            contactstreet2: contactstreet2,
                            contactstreet3: contactstreet3,
                            contacttown: contacttown,
                            contactcounty: contactcounty,
                            contactpostcode: contactpostcode,
                            contactcountry: contactcountry,
                            contacttelno: contacttelno,
                            contactmobileno: contactmobileno,
                            contactpersonalemail: contactpersonalemail,
                            contactworkemail: contactworkemail,
                            contactotheremail: contactotheremail,
                            addresshousenameornumber: addresshousenameornumber,
                            addressstreetadd1: addressstreetadd1,
                            addressstreetadd2: addressstreetadd2,
                            addressstreetadd3: addressstreetadd3,
                            addresstown: addresstown,
                            addresscounty: addresscounty,
                            addresspostcodezip: addresspostcodezip,
                            addresscountry: addresscountry,
                            addresspersonalemail: addresspersonalemail,
                            addressworkemail: addressworkemail,
                            addressotheremail: addressotheremail,
                            nextkintelnumber: nextkintelnumber,
                            nextkinmobilenumber: nextkinmobilenumber,
                            nextkinpersonalemail: nextkinpersonalemail,
                            nextkinotheremail: nextkinotheremail,
                            userid: userid,
                            dateadded: dateadded

                        }, { safe: true }, function (err, result) {
                            if (err) {
                                res.status(501).send(err);
                            } else {
                                if (result.ops[0].photoimage !== '') {
                                    const photo = new Buffer(result.ops[0].photoimage.imagedata).toString('base64');
                                    res.send(photo);
                                }
                                else {
                                    res.send(result.ops[0]);
                                }
                            }

                        });
                    });
                }
            }
        })
    }
    catch (err) {
        res.status(500).send("error has occurred");
    }
}
function getuserphoto(req, res) {
    try {
        var userid = req.params.userid || '';
        db.collection('whoami', function (err, collection) {
            collection.find({ userid: userid }).toArray(function (err, output) {
                if (err) {
                    res.send('user not found!!');
                } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                    var targetPath = path.resolve('./images/' + output[0].photoimage.name);

                    console.log(output[0].photoimage.imagedata);

                    fs.writeFile(targetPath, output[0].photoimage.imagedata.Binary, function (err) {
                        if (err) {
                            res.send(err);
                        }
                        var filestream = new Buffer(fs.readFileSync(targetPath)).toString("base64")

                        res.send(filestream);

                    });
                }
            })
        })
    }
    catch (err) {
        res.status(500).send("error has occurred");
    }
}
function getuser(req, res) {
    try {
        var userid = req.params.userid || '';
        db.collection('whoami', function (err, collection) {
            collection.find({ userid: userid }).toArray(function (err, output) {
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
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields) {
            const dateadded = common.gettodaydate();
            const oldpass = fields.oldpass;
            const newpass = fields.newpass;
            const old = common.decode(oldpass);
            const newp = common.decode(newpass);
            const userid = fields.userid;

            db.collection('userregistrations', function (err, collection) {
                collection.update({ _id: new ObjectID(userid), password: old }, {
                    $set: {
                        password: newp
                    }
                }, function (resp) {
                    res.send(resp);
                });
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



