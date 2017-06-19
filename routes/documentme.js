var mv = require('mv');
const common = require('./common');
const toArrayBuffer = require('to-arraybuffer')
var unoconv = require('unoconv');
var converter = require('office-converter');
var office = require("office-to-pdf")
path = require('path'),
    exec = require('child_process').exec;

var documentme = {
    getdocumenttype: getdocumenttype,
    uploaddocument: uploaddocument,
    getdocumentdetails: getdocumentdetails,
    getdocumentdata: getdocumentdata,
    getdocuments: getdocuments,
    deletedocument: deletedocument,
    emaildocument: emaildocument,
    getdocumentimage: getdocumentimage,
    removedocumentimage: removedocumentimage
}
const processdocuments = (documents) => {
    return documents.map((document) => {
        return {
            userid: document.userid,
            filename: document.filename,
            filetype: document.filetype,
            documenttype: document.documenttype,
            otherdocumenttype: document.otherdocumenttype
        };
    });
}
function removedocumentimage(req, res) {
    var userid = req.params.userid;
    var documentid = req.params.documentid;

    db.collection('documentme', function (err, collection) {
        collection.find({ userid: userid, _id: new ObjectID(documentid) }).toArray(function (err, result) {
            if (err) {
                res.send('document not found!!');
            } else if (result[0] != '' && typeof (result[0] != 'undefined')) {
                db.collection('documentme', function (error, collection) {
                    collection.remove({ userid: userid, _id: new ObjectID(documentid) });

                })
            }
            res.send('done');
        })
    })
}

function getdocumenttype(req, res) {
    var userid = req.params.userid || '';
    try {
        db.collection('documenttypes', function (err, collection) {
            collection.find({ userid: new ObjectID(userid) }).toArray(function (err, output) {
                if (err) {
                    res.status(500).send(err);
                } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                    res.send(output);
                }
                else {
                    var data = {
                        certificates: Certificates, options: { opt1: option1, opt2: option2 },
                        insurance: Insurances, options: { opt3: option3, opt4: option4 },
                        financial: Financial, options: { opt5: option5, opt6: option6 }, educational: Educational, options: { opt7: option7, opt8: option8 }
                    }
                    res.send(data);
                }
            })
        })
    }
    catch (err) {
        res.status(500).send("error has occurred");
    }
}
function uploaddocument(req, res) {
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
            file = files.documentfile;
            tempPath = file.path;
            filename = file.name;
            filetype = file.type;
            filesize = file.size;
            targetPath = path.resolve('./images/' + filename);
        }
        var documenttype = fields.document;
        var userid = fields.userid;
        var otherdoc = JSON.parse(fields.otherdoc);

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
                    imagedata: image
                }
                fs.unlink(targetPath);
                if (otherdoc) {
                    db.collection('documentothertype', function (err, collection) {
                        collection.insert(
                            {
                                userid: userid,
                                documenttype: documenttype,

                            }, { safe: true }, function (err, result) {
                                if (err) {
                                    res.send({ 'error': 'An error has occurred' });
                                }
                                else {
                                    var otherdocid = result.insertedIds[0];
                                    db.collection('documentme', function (err, collection) {
                                        collection.insert(
                                            {
                                                otherdocid: otherdocid,
                                                userid: userid,
                                                filename: filename,
                                                filetype: filetype,
                                                documenttype: documenttype,
                                                dateadded: dateadded,
                                                document: photoimage
                                            }, { safe: true }, function (err, result) {
                                                if (err) {
                                                    res.send({ 'error': 'An error has occurred' });
                                                }
                                                else {
                                                    res.status(200).send(result);
                                                }

                                            });
                                    });
                                }
                            });
                    });
                }
                else {
                    db.collection('documentme', function (err, collection) {
                        collection.insert(
                            {
                                userid: userid,
                                filename: filename,
                                filetype: filetype,
                                documenttype: documenttype,
                                dateadded: dateadded,
                                document: photoimage
                            }, { safe: true }, function (err, result) {
                                if (err) {
                                    res.send({ 'error': 'An error has occurred' });
                                }
                                else {
                                    res.status(200).send(result);
                                }

                            });
                    });
                }

            }
        })
    })
}
function getdocumentdetails(req, res) {
    var userid = req.params.userid || '';
    var docid = req.params.documentid || '';
    try {
        db.collection('documentme', function (err, collection) {
            collection.find({ userid: userid, _id: new ObjectID(docid) }).toArray(function (err, output) {
                if (err) {
                    res.status(500).send(err);
                } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                    var data = output[0];
                    var finaloutput = {
                        filename: data.filename,
                        filetype: data.filetype,
                        description: data.documenttype,
                        dateadded: data.dateadded
                    }
                    res.send(finaloutput);
                }
                else {
                    res.send('No record found');
                }
            })
        })
    }
    catch (err) {
        res.status(500).send("error has occurred");
    }
}
function getdocumentdata(req, res) {
    var userid = req.params.userid || '';
    var docid = req.params.documentid || '';
    try {
        db.collection('documentme', function (err, collection) {
            collection.find({ userid: userid, _id: new ObjectID(docid) }).toArray(function (err, output) {
                if (err) {
                    res.status(500).send(err);
                } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                    var data = output[0];
                    var targetPath = path.resolve('./images/' + data.filename);
                    fs.writeFile(targetPath, data.document.imagedata.buffer, function (err) {
                        if (err) {
                            res.send(err);
                        }
                        var filestream = fs.createReadStream(targetPath);
                        filestream.pipe(res);
                        fs.unlink(targetPath);

                    });
                }
                else {
                    res.send('No record found');
                }
            })
        })
    }
    catch (err) {
        res.status(500).send("error has occurred");
    }
}

function pipedoc(inputPath, finaltype, stream) {
    // var finalPath = path.resolve('./images/' + 'output.html');// path.dirname(inputPath) + "/" + path.basename(inputPath).split('.')[0] + ".html";
    // var convCommand = 'unoconv -f ' + finaltype + " " + inputPath;
    // console.log(inputPath)
    // exec(convCommand, function (err, stdout, stderr) {
    //     console.log(err)
    //     process.stdout.write(stdout);
    //     console.log(stdout)
    //     fs.createReadStream(finalPath).pipe(stream);
    // });
    // var unoconv = require('unoconv');

    // unoconv.convert(inputPath, 'pdf', function (err, result) {
    //     var listener = unoconv.listen({ port: 2002 });

    //     listener.stdout.on('data', function (data) {
    //         console.log('stdout: ' + data.toString('utf8'));
    //     });
    //     listener.stdout.on('end', function (data) {
    //         // fs.writeFile('converted.pdf', result);
    //         console.log('end: ' + data.toString('utf8'));
    //     });

    // });


    office(inputPath).then(
        () => {
            console.log("OK")
        }, (err) => {
            console.log(err)
        }
    )
}

function getdocumentimage(req, res) {
    var userid = req.params.userid || '';
    var docid = req.params.documentid || '';
    try {
        db.collection('documentme', function (err, collection) {
            collection.find({ userid: userid, _id: new ObjectID(docid) }).toArray(function (err, output) {
                if (err) {
                    res.status(500).send(err);
                } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                    var data = output[0];
                    var photo = '';
                    var filedata = data.filetype.split('/')[0]
                    switch (filedata) {
                        case 'application':
                            var targetPath = path.resolve('./images/' + data.filename);
                            fs.writeFile(targetPath, data.document.imagedata.buffer, function (err) {
                                if (err) {
                                    res.send(err);
                                }
                                // pipedoc(targetPath, 'html', res);
                                var filestream = fs.createReadStream(targetPath);
                                filestream.pipe(res);
                                fs.unlink(targetPath);

                            });
                            break;
                        case 'image':
                            if (data.document.imagedata !== null && data.document.imagedata !== '') {
                                photo = new Buffer(data.document.imagedata.buffer).toString('base64');
                            }
                            res.send(photo);
                            break;
                    }

                }
                else {
                    res.send('No record found');
                }
            })
        })
    }
    catch (err) {
        res.status(500).send("error has occurred");
    }
}
function getdocuments(req, res) {
    var userid = req.params.userid;
    try {
        db.collection('documentme', function (err, collection) {
            collection.find({ userid: userid }).toArray(function (err, output) {
                if (err) {
                    res.status(500).send(err);
                } else if (output[0] != '' && typeof (output[0] != 'undefined')) {

                    const data = output.map(function (item) {
                        return {
                            documentid: item._id,
                            userid: item.userid,
                            filename: item.filename,
                            filetype: item.filetype,
                            description: item.documenttype,
                            dateadded: item.dateadded
                        }
                    })
                    res.send(data);
                }
            })
        })
    }
    catch (err) {
        res.status(500).send("error has occurred");
    }
}

function deletedocument(req, res) {
    var userid = req.params.userid || '';
    var docid = req.params.docid || '';
    try {
        db.collection('documentme', function (err, collection) {
            collection.remove({ userid: new ObjectID(userid), _id: new ObjectID(docid) }, { safe: true }, function (err, result) {
                if (err) {
                    res.send({ 'error': 'An error has occurred - ' + err });
                } else {
                    collection.find({ userid: new ObjectID(userid) }).toArray(function (err, output) {
                        if (err) {
                            res.send('error returning documentme!!');
                        } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                            const finaloutput = processdocuments(output);
                            res.send(JSON.stringify(finaloutput));
                        }
                    })
                }
            });
        })
    }
    catch (err) {
        res.status(500).send("error has occurred");
    }
}
function emaildocument(req, res) {
    var message = req.body;
    message.cc = [];
    var pathtemp = path.resolve('./templates/emails/docattachment.html');
    db.collection('documentme', function (err, collection) {
        collection.find({ userid: message.userid, _id: new ObjectID(message.documentid) }).toArray(function (err, output) {
            if (err) {
                res.status(500).send(err);
            } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                db.collection('userregistrations', function (err, userregistrations) {
                    userregistrations.find({ _id: new ObjectID(message.userid) }).toArray(function (err, fromuser) {
                        if (err) {
                            res.status(500).send(err);
                        }
                        else if (fromuser[0] != '' && typeof (fromuser[0] != 'undefined')) {
                            data = output[0];

                            if (message.emailcopy && fromuser.length > 0) {
                                message.cc.push(fromuser[0].email)
                            }
                            common.genericmailer(message.email, data, pathtemp, message, '', '', 'documentme', '', (outcome) => {
                                if (outcome.rejected.length === 0) {
                                    res.send('Document emailed!');
                                }
                            });
                        }

                    })
                })
            }
        })
    })
}




//     // }
//     // catch (err) {
//     //     res.status(500).send("error has occurred");
//     // }
// })

module.exports = documentme;
