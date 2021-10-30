import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import dateformat from 'dateformat';
import cors from 'cors';

dotenv.config();
const app = express();

app.use(cors({
    origin: process.env.APP_ORIGIN
}));

const log = (message, topic) => {
    const timestamp = dateformat(new Date(), 'yy-mm-dd HH:MM:ss');
    console.log(`\x1b[33m[${timestamp}] \x1b[36m${topic ? topic : 'Log'} \x1b[0m: ${message}`);
};

const error = (message, topic) => {
    const timestamp = dateformat(new Date(), 'yy-mm-dd HH:MM:ss');
    console.log(`\x1b[33m[${timestamp}] \x1b[31m${topic ? topic : 'ERROR'} \x1b[0m: \x1b[31m${message}\x1b[0m`);
}

app.get('/moody-weather', async (req, res) => {
    try {
        let { q } = req.query;

        if (!q) {
            error('Query not provided. Try again with \'q\' as a query parameter.');
            return;
        }

        const weatherResponse = await axios.get(`${process.env.WEATHER_API_BASE}/current.json`, {
            params: {
                key: process.env.WEATHER_API_KEY, 
                q
            }
        });

        // Get weather data
        const weather = weatherResponse.data;
        const weatherCode = weather.current.condition.code;
        log('Retrieved weather...');

        if (checkBadMood(weatherCode)) {
            // Generate insult
            const insultResponse = await axios.get(`${process.env.INSULT_API}`, {
                params: {
                    type: 'json'
                }
            });
            const insult = insultResponse.data.insult;
            log('Retrieved insult...');

            res.send({weather, dialogue: insult});
        } else {
            // Generate compliment
            const complimentResponse = await axios.get(`${process.env.COMPLIMENT_API}`);
            let compliment = complimentResponse.data.compliment;
            compliment = `${compliment[0].toUpperCase()}${compliment.substring(1)}.`;
            log('Retrieved compliment...');

            res.send({weather, dialogue: compliment});
        }

    } catch (e) {
        error(e.message, 'Error');
        res.sendStatus(500);
    }   
});


function checkBadMood(code) {
    return (code !== 1000 && code !== 1003); // Not sunny or partly cloudy
}

app.listen(process.env.PORT, () => {
    console.clear();
    console.log(
`-------------------------------
\x1b[32mMoody Weather API Server\x1b[0m
-------------------------------`
    );
    log(`Listening to port \x1b[34m${process.env.PORT}\x1b[0m...`, 'Moody Weather API');
});