const mv = require('mv');
const common = require('./common');
const toArrayBuffer = require('to-arraybuffer');
const mammoth = require("mammoth");
path = require('path');
const propdf = require('./generatepdf');


var documentme = {
    getdocumenttype: getdocumenttype,
    uploaddocument: uploaddocument,
    getdocumentdetails: getdocumentdetails,
    getdocumentdata: getdocumentdata,
    getdocuments: getdocuments,
    deletedocument: deletedocument,
    emaildocument: emaildocument,
    getdocumentimage: getdocumentimage,
    removedocumentimage: removedocumentimage,
    getbase64document: getbase64document
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
function getbase64document(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var dateadded = common.gettodaydate();
        var file = 'None';
        var filesize = 0;
        var tempPath = '';
        var filename = '';
        var filetype = '';
        var targetPath = '';
        var html = '';
        var messages = '';

        if (Object.keys(files).length > 0) {
            file = files.documentfile;
            tempPath = file.path;
            filename = file.name;
            filetype = file.type;
            filesize = file.size;
            targetPath = path.resolve('./images/' + filename);
        }
        var documenttype = fields.document;
        var fileextension = fields.fileextension;
        var userid = fields.userid;
        var otherdoc = fields.otherdoc

        var data = fs.readFileSync(tempPath);
        var image = new Binary(data);
        var buffer = new Buffer(image.buffer).toString('base64');

        var processor = {
            tempPath: tempPath,
            targetPath: targetPath,
            otherdoc: otherdoc,
            filetype: filetype,
            filename: filename,
            userid: userid,
            documenttype: documenttype,
            dateadded: dateadded,
            skip: fileextension === 'docx',
            pdfdocumentid: ''

        }
        db.collection('pdfdocuments', function (err, collection) {
            collection.insert(
                {
                    userid: userid,
                    otherdoc: otherdoc,
                    documenttype: documenttype,
                    extension: fileextension,
                    dateadded: dateadded,
                    document: buffer,
                    pdfdoc: ''
                }, { safe: true }, function (err, result) {
                    if (err) {
                        res.send({ 'error': 'An error has occurred' });
                    }
                    else {
                        propdf.getpdfbase64(userid, result.insertedIds).then((response) => {
                            processor.pdfdocumentid = result.insertedIds[0];

                            if (processor.skip) {
                                mammoth.convertToHtml({ path: tempPath })
                                    .then(function (result) {
                                        html = result.value;
                                        messages = result.messages;
                                        prococessdocumentupload(processor, html, messages, res);
                                    })
                                    .done();
                            }
                            else {
                                prococessdocumentupload(processor, html, messages, res);
                            }
                        })


                    }

                });
        });
    })
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
                    retrievedocuments(userid, res);
                })
            }

        })
    })
}
function getdocumenttype(req, res) {
    var userid = req.params.userid || '';

    try {
        db.collection('documentothertype', function (err, collection) {
            collection.find({ $or: [{ userid: userid }, { userid: "" }] }).toArray(function (err, output) {
                if (err) {
                    res.status(500).send(err);
                } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                    res.send(JSON.stringify(output));
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
function prococessdocumentupload(processor, html, messages, res) {
    var photoimage = {};

    mv(processor.tempPath, processor.targetPath, function (err) {
        if (err) {
            throw err
        }
        else {
            var data = fs.readFileSync(processor.targetPath);
            var image = new Binary(data);
            photoimage = {
                type: processor.filetype,
                name: processor.filename,
                imagedata: image,
                imagedatahtml: processor.skip ? html : ''
            }

            fs.unlink(processor.targetPath);
            if (processor.otherdoc) {
                db.collection('documentothertype', function (err, collection) {
                    collection.insert(
                        {
                            userid: processor.userid,
                            documenttype: processor.documenttype,

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
                                            userid: processor.userid,
                                            filename: processor.filename,
                                            filetype: processor.filetype,
                                            documenttype: processor.documenttype,
                                            documentcategory: processor.documentcategory,
                                            pdfdocumentid: processor.pdfdocumentid,
                                            dateadded: processor.dateadded,
                                            document: photoimage
                                        }, { safe: true }, function (err, result) {
                                            if (err) {
                                                res.send({ 'error': 'An error has occurred' });
                                            }
                                            else {
                                                retrievedocuments(processor.userid, res)
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
                            userid: processor.userid,
                            filename: processor.filename,
                            filetype: processor.filetype,
                            documenttype: processor.documenttype,
                            pdfdocumentid: processor.pdfdocumentid,
                            documentcategory: processor.documentcategory,
                            dateadded: processor.dateadded,
                            document: photoimage
                        }, { safe: true }, function (err, result) {
                            if (err) {
                                res.send({ 'error': 'An error has occurred' });
                            }
                            else {
                                retrievedocuments(processor.userid, res)
                            }

                        });
                });
            }

        }
    })
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
        var html = '';
        var messages = '';

        if (Object.keys(files).length > 0) {
            file = files.documentfile;
            console.log(file);
            tempPath = file.path;
            filename = file.name;
            filetype = file.type;
            filesize = file.size;
            targetPath = path.resolve('./images/' + filename);
        }
        var documenttype = fields.document;
        var documentcategory = fields.documentcategory;
        var userid = fields.userid;
        var fileextension = fields.fileextension;
        var otherdoc = fields.otherdoc;

        var processor = {
            tempPath: tempPath,
            targetPath: targetPath,
            otherdoc: otherdoc,
            filetype: filetype,
            filename: filename,
            userid: userid,
            documenttype: documenttype,
            documentcategory: documentcategory,
            dateadded: dateadded,
            skip: fileextension === 'docx'

        }
        // var outputpath = path.resolve('./images/output.pdf');
        // converter.converter(tempPath, outputpath, 'words', (resp) => {
        //     console.log(resp)
        // })
        if (processor.skip) {
            mammoth.convertToHtml({ path: tempPath })
                .then(function (result) {
                    html = result.value;
                    messages = result.messages;
                    prococessdocumentupload(processor, html, messages, res);
                })
                .done();
        }
        else {
            prococessdocumentupload(processor, html, messages, res);
        }
    })
   // res.end();
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
                    res.send(JSON.stringify(finaloutput));
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
                            var filename = data.filename.split('.')[1]
                            if (filename !== 'docx') {
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
                                res.send(JSON.stringify(data));
                            }
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
                    res.send(JSON.stringify(data));
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
function retrievedocuments(userid, res) {
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
                res.send(JSON.stringify(data));
            }
            else {
                res.send('No data found');
            }
        })
    })
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
                        else {
                            res.send('No data found');
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

                                if (outcome !== undefined && outcome.rejected !== undefined && outcome.rejected.length === 0) {
                                    res.status(200).send('Document emailed!');
                                }
                                else {
                                    res.status(500).send(err);
                                }
                            });
                        }

                    })
                })
            }
        })
    })
}

module.exports = documentme;
