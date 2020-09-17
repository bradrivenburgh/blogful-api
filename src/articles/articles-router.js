const express = require('express');
const xss = require('xss');
const ArticlesService = require('./articles-service');

const articlesRouter = express.Router();
const knexInstance = (req) => req.app.get('db')
const sanitizedArticle = (article) => ({
  id: article.id,
  style: article.style,
  title: xss(article.title), // sanitize title
  content: xss(article.content), // sanitize content
  date_published: article.date_published,
});

articlesRouter
  .route('/articles')
  .get((req, res, next) => {
    ArticlesService.getAllArticles(knexInstance(req))
      .then(articles => {
        res
        .status(200)
        .json(articles.map(sanitizedArticle))
      })
      .catch(next);  
  });

articlesRouter
  .route('/articles')
  .post((req, res, next) => {
    const { title, content, style } = req.body;
    const newArticle = { title, content, style };

    for (const [key, value] of Object.entries(newArticle)) {
      if (value == null) {
        return res
          .status(400)
          .json({error: {message: `Missing '${key}' in request body`}})
      }
    }

    ArticlesService.insertArticle(knexInstance(req), newArticle)
      .then(article => {
        res
          .status(201)
          .location(`/articles/${article.id}`)
          .json(sanitizedArticle(article));
      })
      .catch(next);
  });

articlesRouter
  .route('/articles/:article_id')
  .get((req, res, next) => {
    ArticlesService.getById(knexInstance(req), req.params.article_id)
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

articlesRouter
  .route('/articles/:article_id')
  .delete((req, res, next) => {
    ArticlesService.deleteArticle(knexInstance(req), req.params.article_id)
      .then((numRowsDeleted) => {
        (numRowsDeleted)
        ? res
          .status(204)
          .end()
        : res
          .status(404)
          .json({
            error: { message: `Article doesn't exist` }
          }); 
      })
      .catch(next)
  })

module.exports = articlesRouter;