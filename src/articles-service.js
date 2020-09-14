const ArticlesService = {
  getAllArticles(knexInstance) {
    return knexInstance
      .select('*')
      .from('blogful_articles');
  },
  insertArticle(knexInstance, newArticle) {
    return knexInstance
      .insert(newArticle)
      .into('blogful_articles')
      .returning('*')
      .then(rows => {
        return rows[0];
      })
  },
  getById(knexInstance, id) {
    return knexInstance
      .select('*')
      .from('blogful_articles')
      .where('id', id).first()
  },
  deleteArticle(knexInstance, id) {
    return knexInstance
      .select('*')
      .from('blogful_articles')
      .where({ id })
      .delete();
  },
  updateArticle(knexInstance, id, newArticleData) {
    return knexInstance
      .select('*')
      .from('blogful_articles')
      .where({ id })
      .update(newArticleData)
  }
};

module.exports = ArticlesService;