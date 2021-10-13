const express = require('express');
var cookieParser = require('cookie-parser');
const path = require('path');
const morgan = require('morgan');
const colors = require('colors');
const expressFileUpload = require('express-fileupload');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const logger = require('./middleware/logger');
const connectDb = require('./config/db');
const errorHandler = require('./middleware/error');

// Load routes
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

// Connect database
connectDb();

const app = express();
const PORT = process.env.PORT || 5000;

// Dev logging middleware
app.use(morgan('dev'));
// Body parser
app.use(express.json());
// Cookie parser
app.use(cookieParser());

// Statics Folder
app.use(express.static(path.join(__dirname, 'public')));

//Sanitize data
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

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //Close server & exit process
  server.close(() => process.exit(1));
});
