const app = require('../src/app');

describe('App', () => {
  it(`GET '/' responds with 200 containing 'Hello, boilerplate!'`, () => {
    return supertest(app)
      .get('/')
      .expect(200, 'Hello, boilerplate!');
  });

  it(`GET '/articles' responds with 200 containing 'All articles'`, () => {
    return supertest(app)
      .get('/articles')
      .expect(200, 'All articles');
  });
});