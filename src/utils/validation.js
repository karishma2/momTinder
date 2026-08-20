const validator = require('validator');

const validateSignUpData = (req) => {
  // const MandatoryFields = ['firstName', 'email', 'password'];
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error('Name is not valid');
  }
  if (!validator.isEmail(email)) {
    throw new Error('email is not valid');
  }
  if (!validator.isStrongPassword(password)) {
    const error = new Error('Please enter a strong password');
    error.statusCode = 400;
    throw error;
  }
};

module.exports = { validateSignUpData };
