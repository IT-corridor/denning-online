denningOnline
  .controller('propertyListCtrl', function (NgTableParams, propertyService, $state, Auth) {
    var self = this;
    self.userInfo = Auth.getUserInfo();

    self.tableFilter = new NgTableParams({}, {
      getData: function (params) {
        return propertyService.getList(params.page(), params.count(), self.keyword)
        .then(function (data) {
          params.total(data.headers('x-total-count'));
          return data.data;
        });
      }
    });

    self.search = function (event, clear) {
      if(event.which == 13 || clear) { 
        if (clear) {
          self.keyword = '';
        }
        self.tableFilter.reload();
      }
    }
  })

  .controller('propertyEditCtrl', function($stateParams, growlService, $scope, propertyService, bankBranchService,
                                           $state, Auth, $uibModal, contactService, refactorService, cityService,
                                           uibDateParser, mukimService, buildingService, staffService,
                                           $uibModalInstance, entityCode, isDialog, projectService, isNew) 
  {
    var self = this;
    self.userInfo = Auth.getUserInfo();
    self._type = 'property';

    self.isDialog = isDialog;
    self.can_edit = isNew;
    self.isNew = isNew;
    self.entityCode = isDialog? entityCode: $stateParams.id;

    self.refList = ['MukimType', 'LotType', 'TitleType', 'ParcelType', 'LandUse', 
                    'RestrictionAgainst', 'TenureType', 'AreaType'];
    self.storeyList = ["Single Storey", "1 1/2 Storey", "Double Storey", "2  1/2 storey",
                       "Three Storey", "Four Storey", "Five Storey", "Multi-storey"];
    self.types = {};
    self.true = true;
    self.is_west_malaysia = true;

    propertyService.getFormatList(1, 10, '').then(function (resp) {
      self.formatList = resp.data;
    });

    if(self.entityCode) {
      self.title = 'Edit Property';
      propertyService.getItem(self.entityCode).then(function (item) {
        self.entity = refactorService.preConvert(item, true);
        self.entity_ = angular.copy(self.entity);
        self.popoutUrl = $state.href('properties.edit', { id: self.entity.code });

        // wrapper attrs for auto complete
        if (self.entity.clsMukim && self.entity.clsMukim.code) {
          self.strMukim_ = { 
            mukim: self.entity.clsMukim.strMukim,
            daerah: self.entity.clsMukim.strDaerah,
            negeri: self.entity.clsMukim.strNegeri 
          };
        }

        if (self.entity.strApprovingAuthority) {
          self.strApprovingAuthority_ = {
            description: self.entity.strApprovingAuthority
          };
        }

        if (self.entity.strCountry) {
          self.strCountry = {
            strDescription: self.entity.strCountry
          };
        }

        angular.forEach(self.formatList, function (value, key) {
          if (value.code == self.entity.intPropertyFormat) {
            self.strFormat = value;
          }
        });
      });
    } else {
      self.title = 'New Property';
      self.popoutUrl = $state.href('properties.new');

      self.strFormat = {
        code: "1",
        strCountry: "Malaysia",
        strDescription: "West Malaysia",
        strState: "West Malaysia"
      };

      self.entity = {
        strMukimType: 'Mukim',
        strPropertyType: '1',
        intPropertyFormat: '1'
      };
    }

    $scope.open = function($event, opened) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope[opened] = true;
    };

    self.queryProjects = function (searchText) {
      return projectService.getList(1, 10, searchText).then(function (resp) {
        return resp.data;
      });
    };

    self.queryFormats = function (searchText) {
      return self.formatList.filter(function (item) {
        return (item.strCountry + item.strState).search(new RegExp(searchText, "i")) > -1;
      })
    };

    self.queryBanks = function (searchText) {
      return bankBranchService.getTableList(1, 10, searchText).then(function (resp) {
        return resp.data;
      });
    };

    self.queryContacts = function (searchText) {
      return contactService.getCustomerList(1, 10, searchText).then(function (resp) {
        return resp.data;
      });
    };

    self.queryStaffs = function (searchText) {
      return staffService.getList(1, 10, searchText).then(function (resp) {
        return resp.data;
      });
    }

    self.queryBCs = function (searchText) {
      return buildingService.getList(1, 10, searchText).then(function (resp) {
        return resp.data;
      });
    }

    self.queryMukims = function (searchText) {
      return mukimService.getList(1, 10, searchText).then(function (resp) {
        return resp.data;
      });
    }

    self.queryCountries = function (searchText) {
      return cityService.getCountryList(1, 10, searchText).then(function (resp) {
        return resp.data;
      });
    }

    // get approving authorities
    propertyService.getApprovingAuthorityList().then(function (data) {
      self.aaList = data;
    })

    self.queryAAs = function (searchText) {
      return self.aaList;
    }

    self.aaChange = function (item) {
      if (item) {
        self.entity.strApprovingAuthority = item.description;
      }
    }

    self.queryList = function (labels, q, obj, attr) {
      var arr = labels.filter(function(item) {
        return item.search(new RegExp(q, "i")) > -1;
      });

      if (arr && arr.length == 0) {
        obj[attr] = q;
        return [q];
      } else {
        return arr;
      }
    };

    self.formatChange = function (item) {
      if (item) {
        self.is_west_malaysia = item && item.strState == "West Malaysia";
        self.entity.intPropertyFormat = item.code;        
      }
    }

    self.mukimChange = function (item) {
      if (item) {
        self.entity.clsMukim = {
          code: item.code,
          strDaerah: item.daerah,
          strMukim: item.mukim,
          strNegeri: item.negeri,
          strSCode: item.sCode
        }
      }
    }

    self.countryChange = function (item) {
      if (item) {
        self.entity.strCountry = item.strDescription;
      }
    }

    self.projectChange = function (item) {
      if (item) {
        projectService.getItem(item.code).then(function (project) {
          self.entity.clsDeveloper = project.clsDeveloper;
          self.entity.clsProprietor = project.clsProprietor;
          self.entity.intBlockMasterTitle = project.strMasterTitle;
          self.entity.strProjectName = project.strProjectName;
        });
      }
    }

    self.relatedMatter = function () {
      if ($uibModalInstance) {
        $uibModalInstance.close();
      }
      $state.go('properties.matters', {id: self.entity.code});
    }

    $("#back-top").hide();
    $(window).scroll(function() {
      if ($(this).scrollTop() > 100) {
        $('#back-top').fadeIn();
        $('.btn-balances').fadeIn();
      } else {
        $('#back-top').fadeOut();
        $('.btn-balances').fadeOut();
      }
    });

    self.scrollUp = function () {
      $('body,html').animate({
          scrollTop : 0
      }, 500);
      return false;
    };
    
    self.copy = function () {
      self.isNew = true;
      self.can_edit = true;
      self.entity_ = null;

      var deleteList = ['code', 'dtDateEntered', 'dtDateUpdated', 'strPropertyID', 'clsEnteredBy', 'clsUpdatedBy'];
      for (ii in deleteList) {
        key = deleteList[ii];
        delete self.entity[key];
      }
    }

    self.save = function () {
      entity = refactorService.getDiff(self.entity_, self.entity);
      propertyService.save(entity).then(function (property) {
        if (property) {
          if (self.isDialog) {
            $uibModalInstance.close(property);
          } else {
            if (self.entity_) {
              $state.reload();
            } else {
              $state.go('properties.edit', { 'id': property.code });
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
        $state.go('properties.list');
      }
    }
    
    angular.forEach(self.refList, function (value, key) {
      propertyService.getTypeList(value).then(function (data) {
        self.types[value] = data;
      });
    });

    self.openFolder = function () {
      if ($uibModalInstance) {
        $uibModalInstance.close();
      }
      $state.go('folders.list', {id: self.entity.code, type: 'property'});
    }

    //Prevent Outside Click
    self.openDelete = function (event, entity) {
      event.stopPropagation();

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'deleteEntityModal.html',
        controller: 'deleteEntityModalCtrl',
        size: '',
        backdrop: 'static',
        keyboard: true,
        resolve: {
          entity: function () {
            return entity;
          }, 
          on_list: function () {
            return false;
          },
          entity_type: function () {
            return 'property';
          },
          service: function () {
            return propertyService;
          },
          return_state: function () {
            return 'properties.list';
          }
        }
      });
    };
  })
