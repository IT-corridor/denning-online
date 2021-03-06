denningOnline
  .controller('judgeListCtrl', function (NgTableParams, judgeService, Auth, $state) {
    var self = this;
    self.userInfo = Auth.getUserInfo();

    self.tableFilter = new NgTableParams({
      page: 1,
      count: 10,
    }, {
      getData: function(params) {
        return judgeService.getList(params.page(), params.count(), self.keyword)
        .then(function (data) {
          params.total(data.headers('x-total-count'));
          return data.data;
        });
      }
    })

    self.search = function (event, clear) {
      if(event.which == 13 || clear) { 
        if (clear) {
          self.keyword = '';
        }
        self.tableFilter.reload();
      }
    }
  })

  .controller('judgeEditCtrl', function($stateParams, judgeService, $state, Auth, courtService,
                                        refactorService, growlService, $uibModalInstance, 
                                        entityCode, isDialog, isNew) 
  {
    var self = this;
    self.userInfo = Auth.getUserInfo();
    self._type = 'judge';

    self.isDialog = isDialog;
    self.can_edit = isNew;
    self.isNew = isNew;
    self.entityCode = isDialog ? entityCode : $stateParams.id;

    self.queryCourts = function (searchText) {
      return courtService.getTypeList(1, 10, searchText).then(function (resp) {
        return resp.data;
      })
    }

    self.queryCourtPlaces = function (searchText) {
      if (self.strCourtType) {
        return courtService.getList(1, 10, searchText, self.strCourtType.strTypeE).then(function (resp) {
          return resp.data;
        })        
      } else {
        return [];
      }
    }

    self.courtChange = function (item) {
      if (item) {
        self.entity.strCourtType = item.strTypeE;
      } else {
        self.entity.strCourtType = null;
      }
    }

    self.courtPlaceChange = function (item) {
      self.entity.strCourtName = '';
      if (item) {
        self.entity.strCourtName = item.code;
      }
    }

    if (self.entityCode) {
      self.title = 'Edit Judge';
      judgeService.getItem(self.entityCode).then(function (item) {
        self.entity = refactorService.preConvert(item, true);
        self.entity_ = angular.copy(self.entity);
        self.popoutUrl = $state.href('judges.edit', { id: self.entity.code });

        if (self.entity.strCourtType) {
          self.strCourtType = { strTypeE: self.entity.strCourtType };
        }
      });
    } else {
      self.title = 'New Judge';
      self.entity = {}
      self.popoutUrl = $state.href('judges.new');
    }

    self.copy = function () {
      self.isNew = true;
      self.can_edit = true;
      self.entity_ = null;

      var deleteList = ['code', 'name', 'dtDateEntered', 'dtDateUpdated'];
      
      for (ii in deleteList) {
        key = deleteList[ii];
        delete self.entity[key];
      }
    }

    self.save = function () {
      entity = refactorService.getDiff(self.entity_, self.entity);
      judgeService.save(entity).then(function (item) {
        if (item) {
          if (self.isDialog) {
            $uibModalInstance.close(item);
          } else {
            if (self.entity_) {
              $state.reload();
            } else {
              $state.go('judges.edit', { 'id': item.code });
            }
            growlService.growl('Saved successfully!', 'success');
          }
        }
      });
    }

    self.cancel = function () {
      if (self.isDialog) {
        $uibModalInstance.close();
      } else {
        $state.go('judges.list');
      }
    }
  })
