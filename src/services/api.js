import axios from 'axios';

const BASE_URL = 'https://yts.lt/api/v2';

const api = {
    async getTrending(limit = 15) {
        try {
            const response = await axios.get(`${BASE_URL}/list_movies.json`, {
                params: {
                    sort_by: 'download_count',
                    limit: limit
                }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching trending:', error);
            return null;
        }
    },

    async getTopRated(limit = 15) {
        try {
            const response = await axios.get(`${BASE_URL}/list_movies.json`, {
                params: {
                    sort_by: 'rating',
                    minimum_rating: 8,
                    limit: limit
                }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching top rated:', error);
            return null;
        }
    },

    async getActionMovies(limit = 15) {
        try {
            const response = await axios.get(`${BASE_URL}/list_movies.json`, {
                params: {
                    genre: 'action',
                    sort_by: 'download_count',
                    limit: limit
                }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching action movies:', error);
            return null;
        }
    },

    async getComedyMovies(limit = 15) {
        try {
            const response = await axios.get(`${BASE_URL}/list_movies.json`, {
                params: {
                    genre: 'comedy',
                    sort_by: 'download_count',
                    limit: limit
                }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching comedies:', error);
            return null;
        }
    },

    async search(query) {
        try {
            const response = await axios.get(`${BASE_URL}/list_movies.json`, {
                params: {
                    query_term: query,
                    limit: 20
                }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error searching:', error);
            return null;
        }
    },

    async getMovieDetails(movieId) {
        try {
            const response = await axios.get(`${BASE_URL}/movie_details.json`, {
                params: {
                    movie_id: movieId,
                    with_images: true,
                    with_cast: true
                }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching details:', error);
            return null;
        }
    }
};

export default api;
