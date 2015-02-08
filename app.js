var http = require('http');
var express = require('express');
var app = express();
var fs = require('fs');
var crypto = require('crypto');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var sqlite3 = require('sqlite3').verbose();

app.use("/", express.static(__dirname + '/webroot'));

app.post("/upload", multipartMiddleware, function(req, res){
    fs.readFile(req.files.file.path, "utf-8", function(err, file){
        if (err) throw err;
        var db = new sqlite3.Database('db/kindle.db');
        var stmt = db.prepare("INSERT INTO abstract VALUES (?,?,?,?)");
        file.split(/\=+/).forEach(function(item){
            var keys = item.trim().split(/\r\n/);
            if(keys[0] && keys[3]){
                stmt.run(genSID(), keys[0], keys[3], new Date().getTime().toString());
            }
        });
        stmt.finalize();
        db.close();
        res.end();
    });
});

http.createServer(app).listen('4321', '127.0.0.1', function(){
    console.log('Service has started.');
});

function genSID(){
    var str = (((Math.random() * 9301 + 49297) % 233280) / 233280.0).toString().substring(2);
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
}