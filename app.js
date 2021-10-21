const express = require('express');
var cookieParser = require('cookie-parser');
const path = require('path');
const morgan = require('morgan');
const expressFileUpload = require('express-fileupload');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const errorHandler = require('./middleware/error');

// Load routes
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');
const ErrorResponse = require('./utils/errorResponse');

const app = express();

// Dev logging middleware
app.use(morgan('dev'));
// Body parser
app.use(express.json());
// Cookie parser
app.use(cookieParser());

// Statics Folder
app.use(express.static(path.join(__dirname, 'public')));

//Sanitize data against NoSQL query injection
app.use(mongoSanitize());
// Add some securities for headers
app.use(helmet());
// Prevent xss attacking
app.use(xss());
// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10 minutes
  max: 100,
});
app.use(limiter);
// Prevent http param pollution
app.use(hpp());
// Enable CORS
app.use(cors());
// Express file upload
app.use(expressFileUpload());

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);
app.all('*', (req, res, next) => {
  return next(
    new ErrorResponse(`Can't find ${req.originalUrl} on this server!`, 404)
  );
});

app.use(errorHandler);

module.exports = app;
