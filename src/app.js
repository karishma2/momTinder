const express = require('express');
const adminAuth = require('./middlewares/adminAuth.js');
const userAuth = require('./middlewares/userAuth.js');
const app = express();

app.use('/admin', adminAuth);

app.get('/admin/getAllData', (req, res) => {
  res.send('Getting all data for admin');
});

app.get('/admin/deleteAnyUserData', (req, res) => {
  res.send('Deleting a user data for admin');
});

app.get('/user/login', (req, res) => {
  res.send('logging in user.No auth needed');
});

app.get('/user', userAuth, (req, res) => {
  res.send('this is the user profile page');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
