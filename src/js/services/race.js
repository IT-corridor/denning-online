denningOnline
  .service('raceService', function (http) {
    var service = {};

    service.getList = function (page, pagesize, keyword) {
      return http.GET('v1/table/Race', {
        page: page,
        pagesize: pagesize,
        search: keyword
      }).then(function (resp) {
        return resp.data;
      });
    }

    service.getItem = function (code) {
      return http.GET('v1/table/Race/'+code).then(function (resp) {
        return resp.data;
      });
    }

    return service;
  })
