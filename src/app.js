const express = require('express');

const app = express();


// request handler
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/test', (req, res) => {
  res.send('Hello test World!');
});

app.get('/hello', (req, res) => {
  res.send('Hello hello hello!');
});



app.listen(3000, () => {
  console.log('Server is running on port 3000');
});