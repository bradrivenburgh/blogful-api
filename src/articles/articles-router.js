const express = require('express');
const ArticlesService = require('./articles-service');

const articlesRouter = express.Router();
// const jsonParser = express.json();

articlesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    ArticlesService.getAllArticles(knexInstance)
      .then(articles => {
        res
        .status(200)
        .json(articles)
      })
      .catch(next);  
  });

articlesRouter
  .route('/')
  .post((req, res, next) => {
    const knexInstance = req.app.get('db');
    const { title, content, style } = req.body;
    const newArticle = { title, content, style };
    ArticlesService.insertArticle(knexInstance, newArticle)
      .then(article => {
        res
          .status(201)
          .location(`/articles/${article.id}`)
          .json(article);
      })
      .catch(next);
  });

articlesRouter
  .route('/:article_id')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    ArticlesService.getById(knexInstance, req.params.article_id)
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

module.exports = articlesRouter;