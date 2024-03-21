const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const { exec } = require('child_process');
dotenv.config();

<script src="/js/myJS.js"></script>

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const app = express();
const PORT = process.env.PORT || 3000;

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

    // TODO: RETURN MOVIES WITHOUT SAVING TO DATABASE
    // const insertMovieQueries = movies.map(movie => {
    //   const title = movie.title.replace(/'/g, "''");
    //   const overview = movie.overview ? movie.overview.replace(/'/g, "''") : '';
    //   const releaseDate = movie.release_date ? `'${movie.release_date}'` : 'NULL';
    //   const posterPath = movie.poster_path ? `'${movie.poster_path}'` : 'NULL';

    //   return `INSERT INTO movies (title, overview, release_date, poster_path, tmdb_id)
    //           VALUES ('${title}', '${overview}', ${releaseDate}, ${posterPath}, ${movie.id})
    //           ON CONFLICT (tmdb_id) DO NOTHING;`;
    // });

    // const psqlCommand = `psql -d ${process.env.DB_NAME} -U ${process.env.DB_USER} -c "${insertMovieQueries.join(' ')}"`;

    // exec(psqlCommand, (error, stdout, stderr) => {
    //   if (error) {
    //     console.error(`Error executing psql: ${error}`);
    //     res.status(500).json({ error: 'An error occurred while fetching and inserting movies' });
    //     return;
    //   }

      // if (stderr) {
      //   console.error(`stderr: ${stderr}`);
      //   res.status(500).json({ error: 'An error occurred while fetching and inserting movies' });
      //   return;
      // }

    //   console.log(`stdout: ${stdout}`);
    //   res.json({ message: 'Movies data inserted successfully' });
    // });
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
