const express = require('express');
const authRouter = express.Router();
const { validateSignUpData } = require('../utils/validation.js');
const bcrypt = require('bcrypt');
const User = require('../models/User.js');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const userAuth = require('../middlewares/userAuth.js');

authRouter.post('/signUp', async (req, res) => {
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

authRouter.post('/login', async (req, res) => {
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
      res.send(user);
    } else {
      throw new Error('invalid credential');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Invalid credential');
  }
});

authRouter.patch('/changePassword', userAuth, async (req, res) => {
  try {
    const currentPassword = req.body.password;
    const passwordToUpdate = req.body.updatedPassword;
    const isValidUser = await bcrypt.compare(
      currentPassword,
      req.user.password
    );
    if (isValidUser) {
      if (validator.isStrongPassword(passwordToUpdate)) {
        const passwordHash = await bcrypt.hash(passwordToUpdate, 10);
        await User.findByIdAndUpdate(req.user._id, {
          password: passwordHash,
        });
        res.send('password changed successfully');
      } else {
        throw new Error('Please set the stong password');
      }
    } else {
      throw new Error('invalid credential');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Not able to update ' + err);
  }
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.send('logout successful');
});

module.exports = { authRouter };
