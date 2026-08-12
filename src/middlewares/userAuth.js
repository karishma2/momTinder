const userAuth = (req, res, next) => {
  const token = 'xyz123'; // Replace with your actual token validation logic
  const authorized = token === 'xyz123'; // Replace with your actual token validation logic
  if (!authorized) {
    res.status(401).json({ message: 'Unauthorized' });
  } else {
    console.log('User authorized');
    next();
  }
};

module.exports = userAuth;
