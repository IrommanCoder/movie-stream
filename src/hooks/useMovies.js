import { useState, useEffect } from 'react';
import { movies } from '../services/api';

export const useMovies = () => {
    const [trending, setTrending] = useState([]);
    const [topRated, setTopRated] = useState([]);
    const [action, setAction] = useState([]);
    const [comedy, setComedy] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch categories independently to show content faster
        const fetchTrending = async () => {
            try {
                const res = await movies.getTrending();
                setTrending(res.data.data.movies || []);
            } catch (e) { console.error(e); }
        };

        const fetchTopRated = async () => {
            try {
                const res = await movies.getTopRated();
                setTopRated(res.data.data.movies || []);
            } catch (e) { console.error(e); }
        };

        const fetchAction = async () => {
            try {
                const res = await movies.getAction();
                setAction(res.data.data.movies || []);
            } catch (e) { console.error(e); }
        };

        const fetchComedy = async () => {
            try {
                const res = await movies.getComedy();
                setComedy(res.data.data.movies || []);
            } catch (e) { console.error(e); }
        };

        // Fire all requests
        Promise.all([
            fetchTrending(),
            fetchTopRated(),
            fetchAction(),
            fetchComedy()
        ]).then(() => setLoading(false));

    }, []);

    return { trending, topRated, action, comedy, loading };
};
