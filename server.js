const express = require('express');
const cors = require('cors');
const db = require('./configs/db.js');
const path = require('path');
const bcrypt = require('bcrypt');
const axios = require('axios');
const dotenv = require('dotenv');
const { Pool, Client } = require('pg');
const bodyParser = require('body-parser');
dotenv.config();
const { pgTable, serial, text, varchar } = require("drizzle-orm/pg-core");
const { drizzle } = require("drizzle-orm/node-postgres");

const app = express();

var corsOptions = {
  origin: "https://localhost:8081"
}

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

//simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to MovieAPP!"})
})

//set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
  if (!error) {
    console.log(`Server is running on port ${PORT}`);
  } else {
    console.log('Error occurred', error);
  }
});


require('./configs/dotenv.js');

// Initialize PostgreSQL client
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client.connect((err) => {
  if (err) {
    console.log(err)
  } else {
    console.log("Data logging initiated!")
  }
})


const user = require('./routes/users.js')
app.use('/user', user) //route for /user endpoint of API  

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
app.use(bodyParser.json());

//creating pool connections
const pool = new Pool({
  database: 'movieapp',
  user: 'daniyaryerkinov',
  password: process.env.DB_PASSWORD,
  port: 5432,
  max: 20, 
  idleTimeoutMillis: 1000, 
  connectionTimeoutMillis: 1000,
  maxUses: 7500,
})

//sendFile go here
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'))
})

app.use(express.static(path.join(__dirname, 'public')))

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    'Authorization': `Bearer ${process.env.MOVIE_DB_API_KEY}`,
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/popular-movies', async (req, res) => {
  try {
    //getting connections from pool
    // const client = await pool.connect();

    //sending request to TMDB API
    const response = await tmdbApi.get('/movie/popular');
    const movies = response.data.results;

    //release connection to pool
    // client.release();

    return res.json({ movies });
  } catch (error) {
    console.error('An error occurred while fetching movies:', error);
    res.status(500).json({ error: 'An error occurred while fetching movies' });
  }
});


app.use(express.json());

//registration logic
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  console.log('Registration data:', { username, email, password})
  try {
    // Check if user already registered
    const userExistsQuery = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await pool.query(userExistsQuery, [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: 'User with this is email is already exists' });
    }
    //hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    console.log('Hash:', hashedPassword);
    // Inserting new USER with hashed password
    const insertUserQuery = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)';
    await pool.query(insertUserQuery, [username, email, hashedPassword]);
    res.status(201).json({ message: 'User successfully registered!' });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Error during user registration' });
  }
});


//post request to log into main page
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
<<<<<<< HEAD:server.js
  if ( username === 'username' && password === 'password') {
    req.session.isLoggedIn = true;
    res.redirect('/main-page')
  } else {
    res.send('Incorrect username or password')
  }
})
=======
  console.log(req.body)
  try {
    // Getting hashed password from the database based on email
    const getPassword = 'SELECT password FROM users WHERE username = $1';
    const { rows } = await pool.query(getPassword, [username]);
    console.log(rows);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }
    const hashedPassword = rows[0].password;
      // Compare provided password with hashed passwords 
      const passwordMatch = await bcrypt.compare(password, hashedPassword);
      console.log(passwordMatch);
      if (passwordMatch) {
        // Passwords match, SUCCESS!
        return res.status(200).json({ message: 'Login successful' });
      } else {
        // Passwords don't match message
        return res.status(401).json({ message: 'Incorrect password' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
>>>>>>> mybranch:index.js

app.get('/main-page', (req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect('/login')
  } else {
    res.render('main-page', { movies: moviesData })
  }
})

<<<<<<< HEAD:server.js
=======
app.listen(PORT, (error) => {
  if (!error) {
    console.log(`Server is running on port ${PORT}`);
  } else {
    console.log('Error occurred', error);
  }
});




>>>>>>> mybranch:index.js

