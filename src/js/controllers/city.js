denningOnline
  .controller('cityListCtrl', function(NgTableParams, cityService) {
    var self = this;
    
    self.tableFilter = new NgTableParams({
      page: 1,
      count: 10,
    }, {
      getData: function(params) {
        return cityService.getList(params.page(), params.count(), self.keyword)
        .then(function (data) {
          params.total(data.headers('x-total-count'));
          return data.data;
        });
      }
    })

    self.search = function () {
      self.tableFilter.reload();
    }
  })

  .controller('cityEditCtrl', function($stateParams, cityService, $state, $uibModalInstance, Auth, 
                                       entityCode, isDialog, isNew, refactorService, growlService) 
  {
    var self = this;
    self.userInfo = Auth.getUserInfo();
    self._type = 'city';

    self.isDialog = isDialog;
    self.can_edit = isNew;
    self.isNew = isNew;
    self.entityCode = isDialog ? entityCode : $stateParams.id;

    if (self.entityCode) {
      self.title = 'Edit Postcode';

      cityService.getItem(self.entityCode).then(function (item) {
        self.entity = refactorService.preConvert(item, true);
        self.entity_ = angular.copy(self.entity);

        self.popoutUrl = $state.href('cities.edit', { id: self.entity.code });
      });
    } else {
      self.title = 'New Postcode';

      self.entity = {};
      
      self.popoutUrl = $state.href('cities.new');
    }

    self.save = function () {
      entity = refactorService.getDiff(self.entity_, self.entity);
      cityService.save(entity).then(function (contact) {
        if (contact) {  // ignore when errors
          if (self.isDialog) {
            $uibModalInstance.close(contact);
          } else {
            if (self.entity_) {
              $state.reload();
            } else {
              $state.go('cities.edit', { 'id': contact.code });
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
        $state.go('cities.list');
      }
    }

    self.copy = function () {
      self.isNew = true;
      self.can_edit = true;
      self.entity_ = null;

      var deleteList = ['code', 'dtDateEntered', 'dtDateUpdated', 'clsEnteredBy', 'clsUpdatedBy'];
      for (ii in deleteList) {
        key = deleteList[ii];
        delete self.entity[key];
      }
    }
  })
