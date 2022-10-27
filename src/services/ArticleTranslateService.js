import apiClient from "../config/api.js";
import Constants from "../config/Constant.js";

class ArticleTranslateService {

  getTranlatedArticle(storeId, articleId, langCode) {
    return new Promise((resolve, reject) => {
      apiClient.get(`${Constants.BEEHIVE_SERVICE}/api/blog-article-languages/store/${storeId}/article/${articleId}/lang/${langCode}`)
        .then(result => {
          if (result.status === 204 && result.headers['x-error-key'] === "article.lang.not.found") {
            reject(new Error("article.lang.not.found"));
          }
          resolve(result.data);
        }, reject);
    });
  }

  updateTranslatedArticle(data) {
    return new Promise((resolve, reject) => {
      apiClient.put(`${Constants.BEEHIVE_SERVICE}/api/blog-article-languages`, data)
        .then(result => resolve(result.data), reject);
    });
  }

  createTranslatedArticle(data) {
    return new Promise((resolve, reject) => {
      apiClient.post(`${Constants.BEEHIVE_SERVICE}/api/blog-article-languages`, data)
        .then(result => resolve(result.data), reject);
    });
  }
}

const articleTranslateService = new ArticleTranslateService();
export default articleTranslateService;
