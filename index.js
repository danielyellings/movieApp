const express = require('express');
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


require('./configs/dotenv.js')

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

const app = express();

const user = require('./routes/users.js')
app.use('/user', user) //route for /user endpoint of API  

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;

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

// app.get('/', async (req, res) => {
//   try {
//     const result = await db.query('SELECT * FROM users');
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Internal Server Error');
//   }
// });

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



//registration logic
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  console.log('My data:', { username, email, password})
  try {
    // Check if user already registered
    const userExistsQuery = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await pool.query(userExistsQuery, [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: 'User with this is email is already exists' });
    }

    // Inserting new USER
    const insertUserQuery = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)';
    await pool.query(insertUserQuery, [username, email, password]);
    res.status(201).json({ message: 'User successfully registered!' });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Error during user registration' });
  }
});


//post request to log into main page
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if ( username === 'user' && password === 'password') {
    req.session.isLoggedIn = true;
    res.redirect('/main-page')
  } else {
    res.send('Incorrect username or password')
  }
})

app.get('/main-page', (req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect('/login')
  } else {
    res.render('main-page', { movies: moviesData })
  }
})

app.listen(PORT, (error) => {
  if (!error) {
    console.log(`Server is running on port ${PORT}`);
  } else {
    console.log('Error occurred', error);
  }
});
