const express = require('express');
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

// Connect database
connectDb();

const app = express();
const PORT = process.env.PORT || 5000;

// Dev logging middleware
app.use(morgan('dev'));
// Body parser
app.use(express.json());

// Statics Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express file upload
app.use(expressFileUpload());

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

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
