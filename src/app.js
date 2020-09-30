require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const articlesRouter = require('./articles/articles-router');
const usersRouter = require('./users/users-router');
const commentsRouter = require('./comments/comments-router');

// Create Express application
const app = express();

// Create middleware logic and options
// Morgan options
const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

// Validation function
function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  // move to the next middleware
  next();
}

// Error handler
function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response);
}

// Implement Middleware
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json()); // Middleware converts req.body to JSON format
// app.use(validateBearerToken); // Enable after adding validation
app.use('/api', articlesRouter);
/** 
 * Routers for /users and /comments pass in the full endpoint; 
 * differs from router for /articles which only passes in the 
 * '/api' portion of the route to be more explicit in the router
 * module about the endpoint
*/
app.use('/api/users', usersRouter);
app.use('/api/comments', commentsRouter);
app.use(errorHandler);

// Endpoint handlers
app.get('/', (req, res) => {
  res.send('Hello, boilerplate!');
});

module.exports = app;