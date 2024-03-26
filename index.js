const express = require('express');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');
const { Pool } = require('pg')
const bodyParser = require('body-parser')
dotenv.config();

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;

//creating pool connections
var pool = new Pool({
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
