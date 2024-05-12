const express = require('express');
const db = require('./configs/db.js');
const path = require('path');
const bcrypt = require('bcrypt');
const axios = require('axios');
const dotenv = require('dotenv');
const { Pool, Client } = require('pg');
const bodyParser = require('body-parser');
dotenv.config();
const ejs = require('ejs');
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

// Creating pool connections
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

// Роутинг для отображения HTML страниц
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'))
})

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'))
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get('/favorites', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favorites.html'))
})

// Подключение статических файлов
app.use(express.static(path.join(__dirname, 'public')))

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    'Authorization': `Bearer ${process.env.MOVIE_DB_API_KEY}`,
    'Content-Type': 'application/json;charset=utf-8'
  }
});


const options = {
  method: 'GET',
  url: 'https://api.themoviedb.org/3/account/21107427/lists?page=1',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer f1d75120f31392ccafdd1cda406eb0f2'
  }
};

// Middleware для обработки формата данных
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('pages/index')
})



// get popular movies
app.get('/popular-movies', async (req, res) => {
  try {
    const response = await tmdbApi.get('/movie/popular');
    const movies = response.data.results;
    res.render('index.ejs', { movies });
  } catch (error) {
    console.error('An error occurred while fetching movies:', error);
    res.status(500).json({ error: 'An error occurred while fetching movies' });
  }
});

// get list of movies
app.get('/movies', async (req, res) => {
  try {
    const response = await tmdbApi.get('/movie/list'); 
    const movies = response.data.results;
    res.render('index.ejs', { movies });
  } catch (error) {
    console.error('An error occurred while fetching movies:', error);
    res.status(500).json({ error: 'An error occurred while fetching movies' });
  }
})

// registration
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  console.log('Registration data:', { username, email, password})
  try {
    const userExistsQuery = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await pool.query(userExistsQuery, [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    console.log('Hash:', hashedPassword);
    const insertUserQuery = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)';
    await pool.query(insertUserQuery, [username, email, hashedPassword]);
    res.status(201).json({ message: 'User successfully registered!' });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Error during user registration' });
  }
});

// login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body)
  try {
    const getPassword = 'SELECT password FROM users WHERE username = $1';
    const { rows } = await pool.query(getPassword, [username]);
    console.log(rows);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }
    const hashedPassword = rows[0].password;
    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    console.log(passwordMatch);
    if (passwordMatch) {
      res.redirect('/');
    } else {
      return res.status(401).json({ message: 'Incorrect password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// run server
app.listen(PORT, (error) => {
  if (!error) {
    console.log(`Server is running on port ${PORT}`);
  } else {
    console.log('Error occurred', error);
  }
});
