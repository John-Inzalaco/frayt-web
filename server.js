const express = require('express');
const favicon = require('express-favicon');
const path = require('path');
const fs = require('fs');
const port = process.env.PORT || 8080;
const app = express();
const cacheControl = require('express-cache-controller');
const enforce = require('express-sslify');

app.use(favicon(__dirname + '/build/favicon.ico'));
// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'build')));
app.use(cacheControl());
app.use(enforce.HTTPS({ trustProtoHeader: true }));

app.get('/ping', function (req, res) {
 return res.send('pong');
});

app.get(/\/static\/(js|css)\/([a-zA-Z0-9]*)\.([a-zA-Z0-9]*\.?)(chunk)?([a-zA-Z0-9.]*)$/, function (req, res) {
  const { 0: folder, 1: name, 2: chunk, 3: file_sub_type = '', 4: file_type } = req.params;
  const dir = '/build/static/' + folder;
  const file_name = new RegExp('^' + name + '\\..*' + file_sub_type + '(\\.)?' + file_type + '$');
  const file = fs.readdirSync(__dirname + dir).filter(f => (f.match(file_name) || [])[0])[0];
  var file_path = path.join(__dirname, req.originalUrl);
  if (file) {
    file_path = path.join(__dirname, dir, file);
  }

  return res.sendFile(file_path);
});

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));

  res.cacheControl = {
    noCache: true,
  };
});

app.listen(port);