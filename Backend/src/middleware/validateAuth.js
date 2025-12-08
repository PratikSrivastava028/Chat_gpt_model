module.exports = {
  validateLogin: (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    // basic sanity checks
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid input types' });
    }
    next();
  },

  validateRegister: (req, res, next) => {
    const { fullName, email, password } = req.body;
    if (!fullName || typeof fullName !== 'object') {
      return res.status(400).json({ message: 'fullName object with firstName and lastName is required' });
    }
    const { firstName, lastName } = fullName || {};
    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'Both firstName and lastName are required in fullName' });
    }
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid input types' });
    }
    next();
  }
};
