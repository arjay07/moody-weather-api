import dotenv from 'dotenv';
dotenv.config();

const environment = {
    PORT: process.env.PORT,
    APP_ORIGIN: process.env.APP_ORIGIN,
    INSULT_API: process.env.INSULT_API,
    COMPLIMENT_API: process.env.COMPLIMENT_API,
    WEATHER_API_KEY: process.env.WEATHER_API_KEY,
    WEATHER_API_BASE: process.env.WEATHER_API_BASE
};

export default environment;