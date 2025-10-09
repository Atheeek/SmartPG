import jwt from 'jsonwebtoken';

const generateToken = (res, ownerId) => {
  const token = jwt.sign({ ownerId }, process.env.JWT_SECRET, {
    expiresIn: '30d', // The token will be valid for 30 days
  });

  return token;
};

export default generateToken;