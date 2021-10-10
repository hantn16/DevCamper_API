const express = require('express');
var cookieParser = require('cookie-parser');
const path = require('path');
const morgan = require('morgan');
const colors = require('colors');
const expressFileUpload = require('express-fileupload');
const logger = require('./middleware/logger');
const connectDb = require('./config/db');
const errorHandler = require('./middleware/error');

// Load routes
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');

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

// Express file upload
app.use(expressFileUpload());

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);

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
