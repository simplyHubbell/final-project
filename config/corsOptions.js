const whitelist = [
    'https://dazzling-snickerdoodle-777101.netlify.app', 
    'http://127.0.0.1:5500', 
    'http://localhost:3500',
    '*'];

const corsOptions = {
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1 || 1 === 1) {
            callback(null, true)
        } else {
            callback (new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
}

module.exports = corsOptions;

