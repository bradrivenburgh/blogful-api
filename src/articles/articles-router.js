const path = require('path');
const express = require('express');
const xss = require('xss');
const ArticlesService = require('./articles-service');

const articlesRouter = express.Router();
const knexInstance = (req) => req.app.get('db')
const sanitizeArticle = (article) => ({
  id: article.id,
  style: article.style,
  title: xss(article.title), // sanitize title
  content: xss(article.content), // sanitize content
  date_published: article.date_published,
  author: article.author,
});

articlesRouter
  .route('/articles')
  .get((req, res, next) => {
    ArticlesService.getAllArticles(knexInstance(req))
      .then(articles => {
        res
        .status(200)
        .json(articles.map(sanitizeArticle))
      })
      .catch(next);  
  });

articlesRouter
  .route('/articles')
  .post((req, res, next) => {
    const { title, content, style, author } = req.body;
    const newArticle = { title, content, style };

    for (const [key, value] of Object.entries(newArticle)) {
      if (value == null) {
        return res
          .status(400)
          .json({error: {message: `Missing '${key}' in request body`}})
      }
    }

    // add the author to newArticle post-validation bc it's not necessary
    newArticle.author = author;

    ArticlesService.insertArticle(knexInstance(req), newArticle)
      .then(article => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${article.id}`))
          .json(sanitizeArticle(article));
      })
      .catch(next);
  });

articlesRouter
  .route('/articles/:article_id')
  .all((req, res, next) => {
    ArticlesService.getById(knexInstance(req), req.params.article_id)
      .then(article => {
        if (!article) {
          return res.status(404).json({
            error: { message: `Article doesn't exist` }
          })
        }
        res.article = article;
        next();
      })
      .catch(next);
  });

articlesRouter
  .route('/articles/:article_id')
  .get((req, res, next) => {
    res.json(sanitizeArticle(res.article))
  });

articlesRouter
  .route('/articles/:article_id')
  .delete((req, res, next) => {
    ArticlesService.deleteArticle(knexInstance(req), req.params.article_id)
      .then((numRowsDeleted) => {
        res
          .status(204)
          .end()
      })
      .catch(next)
  })

articlesRouter
  .route('/articles/:article_id')
  .patch((req, res, next) => {
    const { title, content, style } = req.body;
    const articleToUpdate = { title, content, style };

    const numberOfValues = Object.values(articleToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'title', 'style' or 'content'`
        }
      })
    }

    ArticlesService.updateArticle(
      knexInstance(req), 
      req.params.article_id, 
      sanitizeArticle(articleToUpdate)
    )
      .then(numRowsAffected => {
        res
          .status(204)
          .end()
      })
      .catch(next)

  });

module.exports = articlesRouter;