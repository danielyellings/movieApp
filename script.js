// script.js

document.addEventListener('DOMContentLoaded', function() {
    const moviesContainer = document.querySelector('.movies');

    // Функция для получения данных о популярных фильмах из TMDB API
    async function fetchMovies() {
        const apiKey = 'YOUR_API_KEY'; // Замените на ваш API ключ TMDB
        const apiUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            return data.results; // Возвращаем массив фильмов
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    }

    // Функция для создания HTML карточки фильма
    function createMovieCard(movie) {
        const card = document.createElement('div');
        card.classList.add('movie-card');

        const image = document.createElement('img');
        image.src = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;
        image.alt = movie.title;

        const title = document.createElement('h3');
        title.textContent = movie.title;

        card.appendChild(image);
        card.appendChild(title);

        return card;
    }

    // Функция для рендеринга карточек фильмов
    async function renderMovies() {
        const movies = await fetchMovies();
        moviesContainer.innerHTML = ''; // Очищаем контейнер перед добавлением новых карточек
        movies.forEach(movie => {
            const card = createMovieCard(movie);
            moviesContainer.appendChild(card);
        });
    }

    // Вызываем функцию рендеринга карточек фильмов при загрузке страницы
    renderMovies();
});
