const express = require('express');
const connectDb = require('./config/connectionDB');
const adminAuth = require('./middlewares/adminAuth.js');
const userAuth = require('./middlewares/userAuth.js');
const User = require('./models/User.js');
const app = express();

app.use(express.json());

// app.use('/admin', adminAuth);

// app.get('/admin/getAllData', (req, res) => {
//   res.send('Getting all data for admin');
// });

// app.get('/admin/deleteAnyUserData', (req, res) => {
//   res.send('Deleting a user data for admin');
// });

// app.get('/user/login', (req, res) => {
//   res.send('logging in user.No auth needed');
// });

// app.get('/user', userAuth, (req, res) => {
//   throw new Error('Something went wrong!');
//   res.send('this is the user profile page');
// });

// app.use('/', (err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

app.get('/user', async (req, res) => {
  try {
    const user = await User.find({ email: req.body.email });
    if (user.length === 0) {
      res.status(404).send('User not found');
    } else {
      res.send(user);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving user');
  }
});

app.get('/feed', async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving users');
  }
});

app.post('/signUp', async (req, res) => {
  console.log('Request body:', req.body);
  const userObj = new User(req.body);
  try {
    await userObj.save();
    res.send('Creating a new user');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating user');
  }
});

app.delete('/deleteUser', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const result = await User.deleteOne({ email: req.body.email });
    if (result.deletedCount === 0) {
      res.status(404).send('User not found');
    } else {
      await res.send('User deleted successfully');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting user');
  }
});

app.patch('/updateUser', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const result = await User.updateOne(
      { email: req.body.email },
      { $set: req.body }
    );
    if (result.matchedCount === 0) {
      res.status(404).send('User not found');
    } else {
      await res.send('User updated successfully');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating user');
  }
});

connectDb()
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
