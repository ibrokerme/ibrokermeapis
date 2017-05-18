var express = require('express');
var helmet = require('helmet')
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cluster = require('cluster');
var mime = require('mime');
var cors = require('cors');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient

fs = require('fs');
path = require('path');
formidable = require('formidable');

Server = mongo.Server,
    connect = mongo.Connect,
    Db = mongo.Db,
    ObjectID = mongo.ObjectID;
Binary = mongo.Binary;


//put in environmental variable
process.env.MONGOLAB_URI = 'mongodb://jideboris:computer@ds133281.mlab.com:33281/ibrokerdb';
//set MONGOLAB_URI=mongodb://ibrokermedb:ibrokerme123@ds117348.mlab.com:17348/ibrokerme123
var url = process.env.MONGOLAB_URI;


// if (cluster.isMaster) {
//     var cpuCount = require('os').cpus().length;

//     // Create a worker for each CPU
//     for (var i = 0; i < cpuCount; i += 1) {
//         cluster.fork();

//     }
//     cluster.on('exit', function (worker) {

//         // Replace the dead worker,
//         // we're not sentimental
//         console.log('Worker %d died :(', worker.id);
//         cluster.fork();

//     });
// }
// else {
MongoClient.connect(url, function (err, database) {

    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        console.log('Connection established to', url);
        db = database;
        // do some work here with the database.

        //Close connection
        // db.close();
    }
});


var registrations = require('./routes/registrations');
var documentme = require('./routes/documentme');
var secureme = require('./routes/secureme');
var auth = require('./routes/auth');
var version = '/api/v1/';



var app = express();

app.engine('html', require('ejs').renderFile);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// create a write stream (in append mode)
 app.use(logger('dev'));
// var accessLogStream = fs.createWriteStream(__dirname + '/access.log', { flags: 'a' });
// app.use(logger('combined', { stream: accessLogStream }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet())
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

// Auth Middleware - This will check if the token is valid
// Only the requests that start with /api/v1/* will be checked for the token.
// Any URL's that do not follow the below pattern should be avoided unless you 
// are sure that authentication is not needed
app.all('/api/v1/*', [require('./middlewares/validaterequest')]);

//login
app.post('/login', auth.login);

app.post('/userregistration', registrations.addregistration);
//  app.get(version + 'subjecttopics/:selectedsubject', edata.getsubjecttopics);

// If no route is matched by now, it must be a 404
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Start the server
app.set('port', process.env.PORT || 3000);


var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
});
//}

