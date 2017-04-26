var documentme = {
    getdocumenttype: getdocumenttype,
    uploaddocument: uploaddocument,
    assignsecureme: assignsecureme
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

        var targetPath = path.resolve('./document/' + filename);

        fs.rename(tempPath, targetPath, function (err) {
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
exports.uploadAvatar = function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var file = files.file;
        var fsiz = file.size;
        var questionno = fields.questionno;
        var tempPath = file.path;

        var targetPath = path.resolve('./public/images/' + file.name);

        fs.rename(tempPath, targetPath, function (err) {
            if (err) {
                throw err
            }
            else {
                var data = fs.readFileSync(targetPath);
                var imageType = file.type;
                var imageName = file.name;
                fs.unlink(targetPath);
                db.collection('questionimagecollection', function (err, collection) {
                    collection.insert({ questionno: questionno, imagename: imageName, imagetype: imageType, image: data }, { safe: true }, function (err, result) {
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

};

exports.fileUpload = function (req, res) {
    var file = req.body;
    db.collection('questionimagecollection', function (err, collection) {
        collection.insert(file, { safe: true }, function (err, result) {
            if (err) {
                res.send({ 'error': 'An error has occurred' });
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

module.exports = documentme;
