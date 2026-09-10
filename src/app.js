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
const { authRouter } = require('./routes/auth.js');
const { profileRouter } = require('./routes/profile.js');
const { requestRouter } = require('./routes/request.js');
const { userRouter } = require('./routes/user.js');
const cors = require('cors');

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);

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
