import express from 'express';
import axios from 'axios';
import cors from 'cors';
import logger from './logger.js';
import environment from './environment.js';
import he from 'he';

const app = express();

const { log, error } = logger();
const { APP_ORIGIN, 
        WEATHER_API_KEY, 
        WEATHER_API_BASE, 
        INSULT_API, 
        COMPLIMENT_API, 
        PORT } = environment;

app.use(cors({
    origin: APP_ORIGIN
}));

app.get('/', (req, res) => {
    res.send(`<h1>Moody Weather API</h1>
    <p>Get what you deserve plus the weather: <a href="/moody-weather?q=10001">Click here</a>`);
});

app.get('/insult', async (req, res) => {
    try {
        // Generate insult
        const insultResponse = await axios.get(`${INSULT_API}`, {
            params: {
                type: 'json'
            }
        });
        const insult = he.decode(insultResponse.data.insult);
        log('Retrieved insult...');
        res.send({
            isInsult: true,
            text: insult
        });
    } catch (e) {
        error(e.message);
        res.sendStatus(500);
    }
}); 

app.get('/compliment', async (req, res) => {
    try {
        // Generate compliment
        const complimentResponse = await axios.get(`${COMPLIMENT_API}`);
        let compliment = complimentResponse.data.compliment;
        compliment = `${compliment[0].toUpperCase()}${compliment.substring(1)}.`;
        log('Retrieved compliment...');
        
        res.send({
            isInsult: false,
            text: compliment
        });
    } catch (e) {
        error(e.message);
        res.sendStatus(500);
    }
});

app.get('/moody-weather', async (req, res) => {
    try {
        let { q, degrading } = req.query;

        if (!q) {
            error('Query not provided. Try again with \'q\' as a query parameter.');
            return;
        }

        const weatherResponse = await axios.get(`${WEATHER_API_BASE}/current.json`, {
            params: {
                key: WEATHER_API_KEY, 
                q
            }
        });

        // Get weather data
        const weather = weatherResponse.data;
        const weatherCode = weather.current.condition.code;
        log('Retrieved weather...');

        if (checkBadMood(weatherCode) || degrading == 'true') {
            // Generate insult
            const insultResponse = await axios.get(`${INSULT_API}`, {
                params: {
                    type: 'json'
                }
            });
            const insult = he.decode(insultResponse.data.insult);
            log('Retrieved insult...');

            res.send({weather, dialogue: {
                text: insult,
                isInsult: true
            }});
        } else {
            // Generate compliment
            const complimentResponse = await axios.get(`${COMPLIMENT_API}`);
            let compliment = complimentResponse.data.compliment;
            compliment = `${compliment[0].toUpperCase()}${compliment.substring(1)}.`;
            log('Retrieved compliment...');

            res.send({weather, dialogue: {
                text: compliment,
                isInsult: false
            }});
        }

    } catch (e) {
        error(e.message, 'Error');
        res.sendStatus(500);
    }   
});


function checkBadMood(code) {
    return (code !== 1000 && code !== 1003); // Not sunny or partly cloudy
}

app.listen(PORT, () => {
    console.clear();
    console.log(
`-------------------------------
\x1b[32mMoody Weather API Server\x1b[0m
-------------------------------`
    );
    log(`Listening to port \x1b[34m${PORT}\x1b[0m...`, 'Moody Weather API');
    log(`Allowing origin: \x1b[34m\x1b[4m${APP_ORIGIN}\x1b[0m`, 'Moody Weather API');
});