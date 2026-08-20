const express = require('express');
const connectDb = require('./config/connectionDB');
const User = require('./models/User.js');
const app = express();
const bcrypt = require('bcrypt');
const validator = require('validator');
const { validateSignUpData } = require('./utils/validation.js');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const userAuth = require('./middlewares/userAuth.js');

app.use(express.json());
app.use(cookieParser());

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
  try {
    validateSignUpData(req);
    const { firstName, lastName, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const userObj = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });
    await userObj.save();
    res.status(201).send('User created successfully');
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    if (err.name === 'ValidationError') {
      const errorMessages = Object.values(err.errors).map((e) => e.message);
      return res
        .status(400)
        .send(`Validation error: ${errorMessages.join(', ')}`);
    }

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res
        .status(400)
        .send(
          `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please use a different value.`
        );
    }

    console.error(err);
    res.status(500).send('Error creating user');
  }
});

app.get('/profile', userAuth, async (req, res) => {
  try {
    res.send('user profile: ' + req.user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving profile');
  }
});

app.post('/sentConnectionRequest', userAuth, async (req, res) => {
  try {
    res.send(req.user.firstName + ' sent connection request');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving profile');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!validator.isEmail(email)) {
      throw new Error('invalid credential');
    }
    const user = await User.findOne({ email: email });
    const token = jwt.sign({ _id: user.id }, 'XYZ123', { expiresIn: '8h' });
    const isValidUser = await bcrypt.compare(password, user.password);
    if (isValidUser) {
      res.cookie('token', token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.send('login successful');
    } else {
      throw new Error('invalid credential');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Invalid credential');
  }
});

app.delete('/deleteUser', async (req, res) => {
  try {
    const result = await User.deleteOne({ email: req.body.email });
    if (result.deletedCount === 0) {
      res.status(404).send('User not found');
    } else {
      res.status(200).send('User deleted successfully');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting user');
  }
});

app.patch('/updateUser/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).send('User ID is required');
    }

    // Validate MongoDB ObjectId format (24 hex characters)
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send('Invalid user ID format');
    }

    const LockedFields = ['email'];
    const isLockedFieldPresent = Object.keys(req.body).some((field) =>
      LockedFields.includes(field)
    );
    if (isLockedFieldPresent) {
      return res
        .status(400)
        .send(`Cannot update locked fields: ${LockedFields.join(', ')}`);
    }
    if (req.body.interests.length > 5) {
      return res.status(400).send('You cannot have more than 5 interests');
    }
    const result = await User.updateOne({ _id: userId }, { $set: req.body });
    if (result.matchedCount === 0) {
      res.status(404).send('User not found');
    } else {
      res.status(200).send('User updated successfully');
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errorMessages = Object.values(err.errors).map((e) => e.message);
      return res
        .status(400)
        .send(`Validation error: ${errorMessages.join(', ')}`);
    }
    console.error(err);
    res.status(500).send('Error updating user' + err.message);
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
