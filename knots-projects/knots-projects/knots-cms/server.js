const express = require('express');
require('dotenv').config();
const path = require('path');
const app = express();
const port = process.env.SERVER_PORT;

// Serve the static files
app.use(express.static(path.join(__dirname, 'build')));

app.use('/gantt_chart', express.static(path.join(__dirname, 'gantt')));
app.use('/cms/gantt_chart', express.static(path.join(__dirname, 'gantt')));

// Serve the resource folder
app.use('/rs', express.static(path.join(__dirname, 'public')));
app.use('/cms/rs', express.static(path.join(__dirname, 'public/cms/rs')));

app.get('*.js', (req, res, next) => {
  req.url = `${req.url}.gz`;
  res.set('Content-Encoding', 'gzip');
  next();
});

app.get('/iframe/gantt_chart/*', (req, res) => {
  if (req.url.endsWith('.js')) {
    return res.sendFile(path.join(__dirname, `gantt/${req.url}`));
  }
  res.sendFile(path.join(__dirname, 'gantt/index.html'));
});

app.get('/iframe/cms/gantt_chart/*', (req, res) => {
  if (req.url.endsWith('.js')) {
    return res.sendFile(path.join(__dirname, `gantt/${req.url}`));
  }
  res.sendFile(path.join(__dirname, 'gantt/index.html'));
});

app.get('*', (req, res) => {
  if (req.url.endsWith('.js')) {
    return res.sendFile(path.join(__dirname, `build/${req.url}`));
  }
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
