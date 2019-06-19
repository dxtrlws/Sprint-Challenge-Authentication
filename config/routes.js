const axios = require('axios');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Users = require('../models/userModel')

const { authenticate } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h'
    }
  );
}

async function register(req, res) {
  // implement user registration
  try {
    const user = req.body;
    const hash = await bcrypt.hashSync(user.password, 10);
    user.password = hash;
    const newUser = await Users.add(user);
    const token = await generateToken(newUser);
    res
      .status(201)
      .json({ message: `Welcome ${newUser.username}`, authToken: token });
  } catch (err) {
    res.status(500).json(err);
  }
}

async function login(req, res) {
  // implement user login
  try{
    const { username, password } = req.body
    const user = await Users.find({username})
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = await generateToken(user)
      res.status(200).json({
        message: `Welcome ${user.username}`,
        authToken: token
      })
    } else {
      res.status(401).json({message: 'Invalid credentials'})
    }
  } catch(err) {
    res.status(500).json(err)
  }
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
