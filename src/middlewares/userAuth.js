const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const userAuth = async (req, res, next) => {
  const token = req.cookies.token;
  try {
    if (!token) {
      return res.status(401).send('Unauthorized: No token provided');
    }
    const decodedMessage = await jwt.verify(token, 'XYZ123');
    const user_id = decodedMessage._id;
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

module.exports = userAuth;
