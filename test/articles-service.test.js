const ArticlesService = require('../src/articles/articles-service');
const knex = require('knex');
const { makeArticlesArrayAS } = require('./articles.fixtures');

/** NOTE:
 * Before running tests for the first time; create the table in the test db 
 * if it doesn't already exist.
 */

describe('ArticlesService object', () => {
  let db;

  // Create test data; this will be our expected value
  let testArticles = makeArticlesArrayAS();

  // Create knex instance before running all tests
  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
  });

  // Clear data from test table before running all tests
  before(() => db('blogful_articles').truncate());

  // Disconnect from the knex-practice-test db after running all tests
  after(() => db.destroy());

  // Clear data from test table after each test
  afterEach(() => db('blogful_articles').truncate());


  context(`Given 'blogful_articles' has data`, () => {
    // Seed the test table with the expected values from testArticles
    beforeEach(() => {
      return db
        .into('blogful_articles')
        .insert(testArticles);
    });

    // Test that ArticlesService.getAllArticles gets the data from the table
    it(`getAllArticles() resolves all articles from 'blogful_articles' table` , () => {
      return ArticlesService.getAllArticles(db)
        .then(actual => {
          expect(actual).to.eql(testArticles);
        });
    });

    it(`getById() resolves and article by id from 'blogful_articles' table`, () => {
      const thirdId = 3;
      const thirdTestArticle = testArticles[thirdId - 1];
      return ArticlesService.getById(db, thirdId)
        .then(actual => {
          expect(actual).to.eql({
            id: thirdId,
            style: 'News',
            title: thirdTestArticle.title,
            content: thirdTestArticle.content,
            date_published: thirdTestArticle.date_published
          });
        });
    });

    it(`deleteArticle() removes an article by id from 'blogful_articles' table`, () => {
      const thirdId = 3;
      return ArticlesService.deleteArticle(db, thirdId)
        .then(() => ArticlesService.getAllArticles(db))
        .then(allArticles => {
          // copy the test articles array without the 'deleted' article
          const expected = testArticles.filter(article => article.id !== thirdId);
          expect(allArticles).to.eql(expected)
        });
    });

    it(`updateArticle() updates an article from the 'blogful_articles' table`, () => {
      const thirdId = 3;
      const newArticleData = {
        title: 'updated title',
        style: 'News',
        content: 'udpated content',
        date_published: new Date()
      }
      return ArticlesService.updateArticle(db, thirdId, newArticleData)
        .then(() => ArticlesService.getById(db, thirdId))
        .then(article => {
          expect(article).to.eql({
            id: thirdId,
            ...newArticleData
          });
        });
    });
  });

  context(`Given 'blogful_articles' has no data`, () => {
    it(`getAllArticles() resolves an empty array`, () => {
      return ArticlesService.getAllArticles(db)
        .then(actual => expect(actual).to.eql([]));
    });

    it(`insertArticle() inserts a new article and resolves the new article with an 'id'`, () => {
      const newArticle = {
        title: 'Test new title',
        style: 'News',
        content: 'Test new content',
        date_published: new Date('2020-01-01T00:00:00.000Z')
      }
      return ArticlesService.insertArticle(db, newArticle)
        .then(actual => {
          expect(actual).to.eql({
            id: 1,
            title: newArticle.title,
            style: newArticle.style,
            content: newArticle.content,
            date_published: newArticle.date_published
          });
        });
    });

  });
});
