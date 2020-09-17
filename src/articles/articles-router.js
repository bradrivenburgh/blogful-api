const express = require('express');
const xss = require('xss');
const ArticlesService = require('./articles-service');

const articlesRouter = express.Router();
const sanitizedArticle = (article) => ({
  id: article.id,
  style: article.style,
  title: xss(article.title), // sanitize title
  content: xss(article.content), // sanitize content
  date_published: article.date_published,
});

articlesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    ArticlesService.getAllArticles(knexInstance)
      .then(articles => {
        res
        .status(200)
        .json(articles.map(sanitizedArticle))
      })
      .catch(next);  
  });

articlesRouter
  .route('/')
  .post((req, res, next) => {
    const knexInstance = req.app.get('db');
    const { title, content, style } = req.body;
    const newArticle = { title, content, style };

    for (const [key, value] of Object.entries(newArticle)) {
      if (value == null) {
        return res
          .status(400)
          .json({error: {message: `Missing '${key}' in request body`}})
      }
    }

    ArticlesService.insertArticle(knexInstance, newArticle)
      .then(article => {
        res
          .status(201)
          .location(`/articles/${article.id}`)
          .json(sanitizedArticle(article));
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
        res.json(sanitizedArticle(article));
      })
      .catch(next);
  });

module.exports = articlesRouter;