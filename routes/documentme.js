var mv = require('mv');
var documentme = {
    getdocumenttype: getdocumenttype,
    uploaddocument: uploaddocument,
    getdocumentdetails: getdocumentdetails,
    getdocumentdata: getdocumentdata,
    getdocuments: getdocuments,
    deletedocument: deletedocument,
    emaildocument:emaildocument
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
        var file = files.file;
        var filename = file.name;
        var tempPath = file.path;
        var filetype = file.type;

        var documenttype = fields.documenttype;
        var otherdocumenttype = fields.otherdocumenttype || '';
        var userid = fields.userid;

        var targetPath = path.resolve('./documents/' + filename);

        mv(tempPath, targetPath, function (err) {
            if (err) {
                throw err
            }
            else {
                var data = fs.readFileSync(targetPath);
                fs.unlink(targetPath);
                db.collection('documentme', function (err, collection) {
                    collection.insert(
                        {
                            userid: userid,
                            filename: filename,
                            filetype: filetype,
                            documenttype: documenttype,
                            otherdocumenttype: otherdocumenttype,
                            document: data
                        }, { safe: true }, function (err, result) {
                            if (err) {
                                res.send({ 'error': 'An error has occurred' });
                            }
                            else {
                                res.send(result);
                            }
                        });
                });
            }
        });

    });

}
function getdocumentdetails(req, res) {
    var userid = req.params.userid || '';
    var docid = req.params.docid || '';
    try {
        db.collection('documentme', function (err, collection) {
            collection.find({ userid: new ObjectID(userid), _id: new ObjectID(docid) }).toArray(function (err, output) {
                if (err) {
                    res.status(500).send(err);
                } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                    var data = output[0];
                    res.send({
                        userid: data.userid,
                        filename: data.filename,
                        filetype: data.filetype,
                        documenttype: data.documenttype,
                        otherdocumenttype: data.otherdocumenttype
                    });
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
    var docid = req.params.docid || '';
    try {
        db.collection('documentme', function (err, collection) {
            collection.find({ userid: new ObjectID(userid), _id: new ObjectID(docid) }).toArray(function (err, output) {
                if (err) {
                    res.status(500).send(err);
                } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                    var data = output[0];
                    res.send({
                        document: data.document
                    });
                }
            })
        })
    }
    catch (err) {
        res.status(500).send("error has occurred");
    }
}
function getdocuments(req, res) {
    var userid = req.params.userid || '';
    var docid = req.params.docid || '';
    try {
        db.collection('documentme', function (err, collection) {
            collection.remove({ userid: new ObjectID(userid) }, { safe: true }, function (err, result) {
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
    var userid = req.params.userid || '';
    var docid = req.params.docid || '';
    var mailto = req.params.mailto || '';
    var message = req.params.message || '';
    var pathtemp = path.resolve('./templates/emails/welcome/html.html');
    try {
        db.collection('documentme', function (err, collection) {
            collection.find({ userid: new ObjectID(userid), _id: new ObjectID(docid) }).toArray(function (err, output) {
                if (err) {
                    res.status(500).send(err);
                } else if (output[0] != '' && typeof (output[0] != 'undefined')) {
                    var data = output[0];
                    common.genericmailer(mailto, '', pathtemp, message, '', '', 'documentme', (outcome) => {
                        if (outcome === 'done') {
                            res.send('Document emailed!');
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
module.exports = documentme;
