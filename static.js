const express = require('express');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');
const { exec } = require('child_process');
dotenv.config();

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const app = express();
const PORT = process.env.PORT || 3000;

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
    const response = await tmdbApi.get('/movie/popular');
    const movies = response.data.results;

    return res.json({ movies });
  } catch (error) {
    console.error('An error occurred while fetching movies:', error);
    res.status(500).json({ error: 'An error occurred while fetching movies' });
  }
});

app.listen(PORT, (error) => {
  if (!error) {
    console.log(`Server is running on port ${PORT}`);
  } else {
    console.log('Error occurred', error);
  }
});
