const adminAuth = (req, res, next) => {
  const token = 'xyz123'; // Replace with your actual token validation logic
  const authorized = token === 'xyz1234'; // Replace with your actual token validation logic
  if (!authorized) {
    res.status(401).json({ message: 'Unauthorized' });
  } else {
    console.log('Admin authorized');
    next();
  }
};

module.exports = adminAuth;
