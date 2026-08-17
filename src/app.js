const express = require('express');
const connectDb = require('./config/connectionDB');
const adminAuth = require('./middlewares/adminAuth.js');
const userAuth = require('./middlewares/userAuth.js');
const User = require('./models/User.js');
const app = express();

app.use(express.json());

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
  const MandatoryFields = ['firstName', 'email', 'password'];
  const AllowedOptionalFields = [
    'lastName',
    'interests',
    'phone',
    'bio',
    'languages',
    'city',
    'area',
    'numberOfChildren',
    'childrenAgeGroups',
    'profilePhoto',
  ];

  // Combine mandatory and optional fields into allowed fields
  const AllowedFields = [...MandatoryFields, ...AllowedOptionalFields];

  // Get request body keys
  const requestBodyKeys = Object.keys(req.body);

  // Check if all mandatory fields are present
  const missingMandatoryFields = MandatoryFields.filter(
    (field) => !req.body.hasOwnProperty(field) || req.body[field] === ''
  );

  if (req.body.interests.length > 5) {
    return res.status(400).send('You cannot have more than 5 interests');
  }
  if (missingMandatoryFields.length > 0) {
    return res
      .status(400)
      .send(`Missing mandatory fields: ${missingMandatoryFields.join(', ')}`);
  }

  // Check if there are any extra fields not in allowed list
  const extraFields = requestBodyKeys.filter(
    (field) => !AllowedFields.includes(field)
  );

  if (extraFields.length > 0) {
    return res
      .status(400)
      .send(`Invalid fields in request body: ${extraFields.join(', ')}`);
  }

  const userObj = new User(req.body);
  try {
    await userObj.save();
    res.status(201).send('User created successfully');
  } catch (err) {
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

app.delete('/deleteUser', async (req, res) => {
  try {
    console.log('Request body:', req.body);
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
