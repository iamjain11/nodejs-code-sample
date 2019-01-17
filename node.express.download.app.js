'use strict';

var express = require('express');
var fs = require('fs');
var compress = require('compression');
var bodyParser = require('body-parser');
var path = require('path');
var stream = require("stream")
var mime = require('mime');
var app = express();
app.set('port', 9999);
app.use(bodyParser.json({ limit: '1mb' }));
app.use(compress());


app.use(function (req, res, next) {
    req.setTimeout(3600000)
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept,' + Object.keys(req.headers).join());

    if (req.method === 'OPTIONS') {
        res.write(':)');
        res.end();
    } else next();
});

function readApp(req, res) {

    if (req.originalUrl === "/read-file-from-dir") {

        let filePath = path.join(__dirname, '/data')
        let filename = 'sample_file.txt';

        fs.exists(filePath, function (exists) {
            if (exists) {
                res.writeHead(200, {
                    "Content-Type": "application/octet-stream",
                    "Content-Disposition": `attachment; filename=${filename}`
                });
                fs.createReadStream(`${filePath}/${filename}`).pipe(res);

            } else {
                res.writeHead(400, { "Content-Type": "text/plain" });
                res.end("ERROR File does NOT Exists");
            }
        });
    } else if (req.originalUrl === '/read-text-as-file') {
        res.writeHead(200, {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": "attachment; filename=textData.txt"
        });

        let a = new stream.PassThrough()

        a.write("some sample string data to download as file")
        a.end()
        a.on('end', function () {
            console.log('ended') // the end event will be called properly
        })
        a.pipe(res)
    }
}

app.get('/read-file-from-dir', function (req, res) {
    readApp(req, res)
});

app.get('/read-text-as-file', function (req, res) {
    readApp(req, res)
});


app.get('/download', function (req, res) {

    var file = __dirname + '/data/sample_file.txt';

    var filename = path.basename(file);
    var mimetype = mime.lookup(file);

    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);

    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
});

app.get('/express-download', function (req, res) {
    var file = __dirname + '/data/sample_file.txt';
    res.download(file);
});

var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
});