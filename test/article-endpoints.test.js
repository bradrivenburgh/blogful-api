const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeArticlesArray } = require('./articles.fixtures');

describe.only('Articles Endpoints', function () {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });

    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db('blogful_articles').truncate());

  afterEach('cleaup', () => db('blogful_articles').truncate());

  describe(`GET /articles`, () => {
    context(`Given there are articles in the database`, () => {
      const testArticles = makeArticlesArray();

      beforeEach('insert articles', () => {
        return db
          .into('blogful_articles')
          .insert(testArticles);
      });

      it(`responds with 200 and all of the articles`, () => {
        return supertest(app)
          .get('/articles')
          .expect(200, testArticles)
      });
    });

    describe(`GET /articles/:article_id`, () => {
      context(`Given there are articles in the database`, () => {
        const testArticles = makeArticlesArray();

        beforeEach('insert articles', () => {
          return db
            .into('blogful_articles')
            .insert(testArticles);
        });  

        it(`responds with 200 and the specified article`, () => {
          const article_id = 1;
          const expectedArticle = testArticles[article_id - 1]
          return supertest(app)
            .get(`/articles/${article_id}`)
            .expect(200, expectedArticle)
        });
      });
    });
  });
});