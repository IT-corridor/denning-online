denningOnline
  // =========================================================================
  // Search Data
  // =========================================================================

  .service('searchService', function (http) {
    this.getFilter = function () {
      return http.GET('v1/generalSearch/category').then(function (resp) {
        return resp.data;
      })
    };

    this.search = function (keyword, category, page, pagesize) {
      return http.GET('v1/generalSearch', {
        search: keyword,
        category: category,
        page: page,
        pagesize: pagesize,
        isAutoComplete: 1
      }).then(function (resp) {
        var data = resp.data.map(function (item) {
          var newItem = angular.copy(item);
          try {
            newItem.parseJSON = JSON.parse(item.JSON.replace(/[\u0000-\u0019]+/g,""));
          } catch(err) {
            newItem.parseJSON = '';
          }
          return newItem;
        });
        
        return { data: data, total: resp.headers('x-total-count') };
      });
    };

    this.searchV2 = function (keyword, category, page, pagesize, auto) {
      return http.GET('v2/generalSearch', {
        search: keyword,
        category: category,
        page: page,
        pagesize: pagesize,
        isAutoComplete: auto
      }).then(function (resp) {
        var data = resp.data.map(function (item) {
          var newItem = angular.copy(item);
          try {
            newItem.parseJSON = JSON.parse(item.JSON.replace(/[\u0000-\u0019]+/g,""));
          } catch(err) {
            newItem.parseJSON = '';
          }
          return newItem;
        });
        
        return { data: data, total: resp.headers('x-total-count') };
      });
    };

    this.keyword = function (query) {
      return http.GET('v1/generalSearch/keyword', {
        search: query
      }).then(function (resp) {
        return resp.data;
      });
    };

    this.keywordV2 = function (query) {
      return http.GET('v2/generalSearch/keyword', {
        search: query
      }).then(function (resp) {
        return resp.data;
      });
    };

    this.getMenu = function () {
      return http.GET('v2/web/menu').then(function (resp) {
        return resp.data;
      });      
    }
  })
