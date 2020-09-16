require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const ArticleService = require('../src/articles/articles-service');

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
app.use(express.json()); // Enable if using non-GET endpoints
// app.use(validateBearerToken); // Enable after adding validation
// Routers can go here
app.use(errorHandler);

// Endpoint handlers
app.get('/', (req, res) => {
  res.send('Hello, boilerplate!');
});

app.get('/articles', (req, res, next) => {
  const knexInstance = req.app.get('db');
  ArticleService.getAllArticles(knexInstance)
    .then(articles => {
      res
      .status(200)
      .json(articles)
    })
    .catch(next);
});

app.get('/articles/:article_id', (req, res, next) => {
  const knexInstance = req.app.get('db');
  ArticleService.getById(knexInstance, req.params.article_id)
    .then(article => {
      if (!article) {
        return res
          .status(404)
          .json({
            error: { message: `Article doesn't exist` }
          });
      }
      res.json(article);
    })
    .catch(next);
});

app.post('/articles', (req, res, next) => {
  const knexInstance = req.app.get('db');
  const { title, content, style } = req.body;
  const newArticle = { title, content, style };
  ArticleService.insertArticle(knexInstance, newArticle)
    .then(article => {
      res
        .status(201)
        .location(`/articles/${article.id}`)
        .json(article);
    })
    .catch(next);
});

module.exports = app;