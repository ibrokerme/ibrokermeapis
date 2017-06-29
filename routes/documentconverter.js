var msopdf = require('node-msoffice-pdf');

var converter = function (docpath, outputpath, doctype, callback) {
    msopdf(null, function (error, office) {

        if (error) {
            console.log("Init failed", error);
            return callback(error);
        }
        switch (doctype) {
            case 'words':

                office.word({ input: docpath, output: outputpath }, function (error, pdf) {
                    if (error) {
                        /* 
                            Sometimes things go wrong, re-trying usually gets the job done
                            Could not get remoting to repiably not crash on my laptop
                        */
                        console.log("Woops", error);
                    } else {
                        console.log("Saved to", pdf);
                    }
                });
                break;

            case 'excel':
                office.excel({ input: "infile.xlsx", output: "outfile.pdf" }, function (error, pdf) {
                    if (error) {
                        console.log("Woops", error);
                    } else {
                        console.log("Saved to", pdf);
                    }
                });
                break;

            case 'powerpoint':
                office.powerPoint({ input: "infile.pptx", output: "outfile.pdf" }, function (error, pdf) {
                    if (error) {
                        console.log("Woops", error);
                    } else {
                        console.log("Saved to", pdf);
                    }
                });

                /*
                  Word/PowerPoint/Excel remain open (for faster batch conversion)
             
                  To clean them up, and to wait for the queue to finish processing
                */
                break;
        }

        office.close(null, function (error) {
            if (error) {
                console.log("Woops", error);
            } else {
                console.log("Finished & closed");
            }
        });
        return callback(error);
    });

}
exports.converter = converter;