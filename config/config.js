const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    botToken: process.env.BOT_TOKEN,
    prefix: process.env.PREFIX,
    apiKey: process.env.API_KEY,
    oAuth: process.env.YOUTUBE_OAUTH,
};
