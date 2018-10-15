denningOnline
  .run(function ($rootScope, Auth, $state){
  	$rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
      $rootScope.toState = toState;
      $rootScope.toStateParams = toStateParams;


      if (toState.data && toState.data.access) {
        /*Cancel going to the authenticated state and go back to landing*/
        if (toState.data.access == '@' && !Auth.isAuthenticated()) {
          event.preventDefault();
          return $state.go('login');
        }

        if (toState.data.access == '?' && Auth.isAuthenticated()) {
          event.preventDefault();
          return $state.go('home');
        }
      }
    });
  })

  .run(function($uibModal, formlyConfig, contactService, propertyService, legalFirmService, 
                presetbillService, spaChecklistService, bankBranchService) 
  {
    function getContacts(page, pagesize, keyword) {
      return contactService.getCustomerList(page, pagesize, keyword).then(function (resp) {
        return resp.data;
      });
    }

    function getBankBranches(page, pagesize, keyword) {
      return bankBranchService.getTableList(page, pagesize, keyword).then(function (resp) {
        return resp.data;
      });
    }

    function getStaffs(page, pagesize, keyword) {
      return contactService.getStaffList(1, 10, keyword).then(function (resp) {
        return resp.data;
      });
    }

    function getPresetBills(page, pagesize, keyword) {
      return presetbillService.getTableList(page, pagesize, keyword).then(function (resp) {
        return resp;
      });
    }

    function getPresetChecklist(page, pagesize, keyword) {
      return spaChecklistService.getTableList(page, pagesize, keyword).then(function (resp) {
        return resp;
      });
    }

    function getProperties(page, pagesize, keyword) {
      return propertyService.getTableList(page, pagesize, keyword).then(function (resp) {
        return resp.data;
      });
    }

    function getSolicitors(page, pagesize, keyword) {
      return legalFirmService.getTableList(page, pagesize, keyword).then(function (resp) {
        return resp.data;
      });
    }

    function range (min, max, step) {
      step = step || 1;
      var input = [];
      for (var i = min; i <= max; i += step) {
          input.push(i);
      }
      return input;
    } 

    formlyConfig.setType({
      name: 'offer',
      templateUrl: 'offer.html'
    });

    function contactDialog (model, key, viewMode) {
      if (viewMode && (!model[key] || !model[key].code)) {
        alert('Please select a party.');
        return false;
      }

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'entity-modal.html',
        controller: 'contactEditCtrl',
        controllerAs: 'vm',
        size: 'lg',
        backdrop: 'static',
        keyboard: true,
        resolve: {
          isNew: !viewMode,
          entityCode: function () {
            return viewMode ? model[key].code : null;
          },
          isDialog: true
        }
      });

      modalInstance.result.then(function (contact) {
        if (!viewMode && contact) {
          model[key] = {
            code: contact.code,
            strCitizenship: contact.strCitizenship,
            strIDNo: contact.strIDNo,
            strName: contact.strName
          };
        }
      })
    }

    function solicitorDialog (model, key, viewMode) {
      if (viewMode && (!model[key] || !model[key].code)) {
        alert('Please select a lawyer.');
        return false;
      }

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'entity-modal.html',
        controller: 'legalFirmEditCtrl',
        controllerAs: 'vm',
        size: 'lg',
        backdrop: 'static',
        keyboard: true,
        resolve: {
          isNew: !viewMode,
          entityCode: function () {
            return viewMode ? model[key].code : null;
          },
          isDialog: true
        }
      });

      modalInstance.result.then(function (entity) {
        if (!viewMode && entity) {
          model[key] = {
            code: entity.code,
            strCity: entity.strCity,
            strEmailAddress: entity.strEmailAddress,
            strPhone1: entity.strPhone1,
            strPhone2: entity.strPhone2,
            strPhoneMobile: entity.strPhoneMobile,
            strName: entity.strName
          };
        }
      })
    }

    // contact attribute
    formlyConfig.setType({
      name: 'contact',
      templateUrl: 'contact.html',
      controller: function ($scope, legalFirmService, contactService, Auth, $uibModal) {
        $scope.represent_this = $scope.model['strLawyer'+$scope.to.idx+'Ref'] && 
                                $scope.model['strLawyer'+$scope.to.idx+'Ref'].indexOf('tmho') > -1;
        $scope.userInfo = Auth.getUserInfo();
        
        $scope.representChange = function() {
          $scope.represent_this = !$scope.represent_this;
          // if ($scope.represent_this && $scope.userInfo.catPersonal.length > 0) {
            // $scope.model['strLawyer'+$scope.to.idx+'Ref'] = 
            // $scope.userInfo.catPersonal[0].LawFirm.name;
          if ($scope.represent_this) {
            // 6000-2862/0/tmho/Siti/501
            $scope.model['strLawyer'+$scope.to.idx+'Ref'] = $scope.model.strFileNo1 + "/0/tmho";
          } else {
            $scope.model['strLawyer'+$scope.to.idx+'Ref'] = '';
          }
        }

        $scope.range = function (min, max, step) {
          return range(min, max, step);
        };

        if ($scope.to.party) {
          for (var i = $scope.to.c_start; i <= $scope.to.c_end; i++) {
            if ($scope.model['clsC'+i] && $scope.model['clsC'+i].code) {
              $scope.model.tmp['clsC'+i] = true;
            }
          }
        }

        $scope.addParty = function(start, end) {
          var flag = false;
          for(var i = start; i <= end; i++) {
            if (!$scope.model.tmp['clsC'+i] && (!$scope.model['clsC'+i] || !$scope.model['clsC'+i].code)) {
              $scope.model.tmp['clsC'+i] = true;
              flag = true;
              break;
            }
          }
          if (!flag) {
            alert('Sorry, you cannot add more party!');
          }
        }

        $scope.removeParty = function(idx, start, end) {
          var last = end;
          for(var i = idx; i < end; i++) {           // shift 
            if (!$scope.model['clsC'+(i+1)].code && !$scope.model.tmp['clsC'+(i+1)]) {
              last = i;
              break;
            }
            $scope.model['clsC'+i] = $scope.model['clsC'+(i+1)];
            $scope.model.tmp['clsC'+i] = $scope.model.tmp['clsC'+(i+1)];
          }
          $scope.model.tmp['clsC'+last] = false;
          $scope.model['clsC'+last] = {};
        }

        $scope.queryContacts = function(searchText) {
          return getContacts(1, 10, searchText);
        }

        $scope.queryLFs = function(searchText) {
          return getSolicitors(1, 10, searchText);
        }

        $scope.contactDialog = function(key, viewMode) {
          contactDialog($scope.model, key, viewMode);
        }

        $scope.solicitorDialog = function(key, viewMode) {
          solicitorDialog($scope.model, key, viewMode);
        }
      }
    });
    
    // property attribute
    formlyConfig.setType({
      name: 'property',
      templateUrl: 'property.html',
      controller: function ($scope, propertyService, $uibModal) {        
        function initProperty(item) {
          if (item && item.code) {
            propertyService.getItem(item.code).then(function (item) {
              $scope.property = item;
            });
          } else {
            $scope.property = {};
          }          
        }

        initProperty($scope.model.clsP1);

        $scope.propertyChange = function (item, n) {
          if (n == 1) {
            initProperty(item);
          }
        };

        $scope.range = function (min, max, step) {
            return range(min, max, step);
        };

        $scope.addProperty = function(start, end) {
          var flag = false;
          for(var i = start; i <= end; i++) {
            if (!$scope.model.tmp['clsP'+i] && (!$scope.model['clsP'+i] || !$scope.model['clsP'+i].code)) {
              $scope.model.tmp['clsP'+i] = true;
              flag = true;
              break;
            }
          }
          if (!flag) {
            alert('Sorry, you cannot add more property!');
          }
        }

        $scope.removeProperty = function(idx, start, end) {
          var last = end;
          for(var i = idx; i < end; i++) {           // shift 
            if (!$scope.model['clsP'+(i+1)].code && !$scope.model.tmp['clsP'+(i+1)]) {
              last = i;
              break;
            }
            $scope.model['clsP'+i] = $scope.model['clsP'+(i+1)];
            $scope.model.tmp['clsP'+i] = $scope.model.tmp['clsP'+(i+1)];
          }
          $scope.model.tmp['clsP'+last] = false;
          $scope.model['clsP'+last] = {};
        }

        $scope.queryProperties = function(searchText) {
          return getProperties(1, 10, searchText);
        }

        //Create Property Modal
        $scope.propertyDialog = function(key, viewMode) {
          if (viewMode && !$scope.model[key].code) {
            alert('Please select a property.');
            return false;
          }

          var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'views/property-edit.html',
            controller: 'propertyEditCtrl',
            controllerAs: 'vm',
            size: 'lg',
            backdrop: 'static',
            keyboard: true,
            resolve: {
              isNew: !viewMode,
              entityCode: function () {
                return viewMode ? $scope.model[key].code : null;
              },
              isDialog: true
            }      
          });

          modalInstance.result.then(function (property) {
            if (!viewMode && property) {
              $scope.model[key] = {
                code: property.code,
                strAddress: property.strAddress,
                strLotPTNo: property.strLotPTNo,
                strLotType: property.strLotType,
                strPropertyAdr: property.strPropertyAdr,
                strTitleNo: property.strTitleNo,
                strTitleType: property.strTitleType
              };
            }
          })
        }
      }
    });

    // file attribute
    formlyConfig.setType({
      name: 'info',
      templateUrl: 'info.html',
      controller: function ($scope, legalFirmService, matterCodeService, Auth, $uibModal, 
                            fileMatterService) 
      {
        $scope.userInfo = Auth.getUserInfo();

        if ($scope.model.strRelatedFile) {
          $scope.rmatter = {
            key: $scope.model.strRelatedFile
          }          
        }

        fileMatterService.getFileStatusList().then(function (resp) {
          $scope.fileStatus = resp.data;
        });

        $scope.queryMatters = function (search) {
          return fileMatterService.getList(1, 5, search).then(function (resp) {
            return resp.data
          })
        }

        $scope.matterChange = function (matter) {
          if (matter) {
            $scope.model.strRelatedFile = matter.key;
          }
        }

        $scope.queryContacts = function(searchText) {
          return getContacts(1, 10, searchText);
        }

        $scope.queryStaffs = function (searchText) {
          return getStaffs(1, 10, searchText);
        }

        $scope.queryCodes = function(searchText) {
          return matterCodeService.getList(1, 10, searchText).then(function (data) {
            return data.data;
          });
        }

        $scope.matterCodeChange = function (item) {
          if (item && $scope.model.clsMatterCode != $scope.model.tmp.oldMatterCode) {
            if (!$scope.model.strFileNo1 || confirm('Are you sure to change the matter code? \nChanging matter ' + 
                        'code could lead to change of tabs.')) {
              $scope.model.tmp.matterCodeChange(item);
              $scope.model.tmp.oldMatterCode = item;
            } else {
              $scope.model.clsMatterCode = $scope.model.tmp.oldMatterCode;
            }
          }
        }

        $scope.queryBills = function (searchText) {
          return getPresetBills(1, 10, searchText);
        }

        $scope.queryChecklist = function (searchText) {
          return getPresetChecklist(1, 10, searchText);
        }

        legalFirmService.getList().then(function(resp) {
          $scope.legalFirms = resp.data;
        });

        $scope.contactDialog = function(key, viewMode) {
          contactDialog($scope.model, key, viewMode);
        }
      }
    });

    // case attribute
    formlyConfig.setType({
      name: 'case',
      templateUrl: 'case.html'
    });

    // price attribute
    formlyConfig.setType({
      name: 'price',
      templateUrl: 'price.html',
      controller: function ($scope, $timeout, refactorService) {
        // // default values for calculating total
        // if (!$scope.model.decRM1) {
        //   $scope.model.decRM1 = 0.00;
        // }
        // if ($scope.model.decRM17 == "") {
        //   $scope.model.decRM17 = 0;
        // }
        // if ($scope.model.decRM18 == "") {
        //   $scope.model.decRM18 = 0;
        // }
        // if (!$scope.model.decRM3) {
        //   $scope.model.decRM3 = 0.00;
        // }
        // if ($scope.model.decRM20 == "") {
        //   $scope.model.decRM20 = 0;
        // }
        // if ($scope.model.decRM21 == "") {
        //   $scope.model.decRM21 = 0;
        // }
        // if ($scope.model.decRM2 == "") {
        //   $scope.model.decRM2 = 0;
        // }
        // if ($scope.model.decRM19 == "") {
        //   $scope.model.decRM19 = 0;
        // }
        // if ($scope.model.decRM22 == "") {
        //   $scope.model.decRM22 = 0;
        // }

        $scope.calcForm = function (model) {
          // $timeout(function () {
            var v1 = refactorService.convertFloat(angular.element('.rm1').val()),
                v3 = refactorService.convertFloat(angular.element('.rm3').val()),
                v17 = refactorService.convertFloat(angular.element('.rm17').val()),
                v20 = refactorService.convertFloat(angular.element('.rm20').val()),
                v21 = refactorService.convertFloat(angular.element('.rm21').val());

            console.log(v1, model.decRM1);
            model.decRM18 = v1 * 0.1 - v17;
            model.decRM2 = v1 * 0.1;
            model.decRM19 = v1 - model.decRM2;
            model.decRM22 = v1 + v3 + v20 + v21;
          // }, 200);
        }
      }
    });  

    // loan attribute
    formlyConfig.setType({
      name: 'loan',
      templateUrl: 'loan.html'
    });  

    formlyConfig.setType({
      name: 'premises-rent',
      templateUrl: 'premises-rent.html',
      controller: function ($scope) {
        $scope.types = ['Dwelling House', 'Apartment', 'Condominium', 'Shop', 'Office', 
                        'Factory', 'Workshop', 'Land'];
        $scope.queryList = function (q) {
          return $scope.types.filter(function(item) {
            return item.search(new RegExp(q, "i")) > -1;
          });
        };
      }
    });  

    formlyConfig.setType({
      name: 'term',
      templateUrl: 'term.html'
    });  

    formlyConfig.setType({
      name: 'summary',
      templateUrl: 'summary.html',
      controller: function ($scope, $uibModal, propertyService) {
        $scope.preview = function () {
          var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'preview-summary.html',
            controller: function ($scope, $sce) {
              var content = document.getElementById('summary').innerHTML;
              content = content.replace('col-md-8 col-md-offset-1', 'col-md-10 col-md-offset-1')
              $scope.content = $sce.trustAsHtml(content);

              $scope.print = function () {
                var content = document.getElementById('summary').innerHTML;
                var printWindow = window.open('');

                printWindow.document.write("<html><head><style>  \
                  @font-face { \
                    font-family: roboto; \
                    src: url('fonts/roboto/Roboto-Regular-webfont.eot'); \
                    src: url('fonts/roboto/Roboto-Regular-webfont.eot?#iefix') format('embedded-opentype'), url('fonts/roboto/Roboto-Regular-webfont.woff') format('woff'), url('fonts/roboto/Roboto-Regular-webfont.ttf') format('truetype'), url('fonts/roboto/Roboto-Regular-webfont.svg#icon') format('svg'); \
                    font-weight: 400; \
                    font-style: normal; \
                  }             \
                  * { \
                    font-family: roboto; \
                  } \
                  .hidden-print {  \
                    display: none;  \
                  }  \
                  h2 {  \
                    color: #9c27b0 !important;  \
                  }  \
                  h4 {  \
                    color: #006400;  \
                    margin-bottom: 10px; \
                  }  \
                  h5 { \
                    font-size: 16px; \
                    margin-bottom: 0px; \
                  }             \
                  .col-md-5 {  \
                    width: 49%; \
                    float: left;  \
                  } \
                  .col-md-5.first {  \
                    padding-right: 5px; \
                  } \
                  .col-md-5.second {  \
                    padding-left: 5px; \
                  } \
                  dt { \
                    color: #eee; \
                    font-weight: 500; \
                  } \
                  dd { \
                    color: #eee; \
                  } \
                  .dl-horizontal dt { \
                    float: left; \
                    text-align: left; \
                    width: 130px; \
                  } \
                  .dl-horizontal dd { \
                    margin-left: 145px; \
                    word-wrap: break-word; \
                  } \
                  dt, dd { \
                    line-height: 1.32; \
                    font-size: 13px; \
                  } \
                  .dl-horizontal dd:after { \
                    display: table; \
                    content: ' '; \
                    clear: both; \
                  } \
                  dl { \
                    margin-top: 6px; \
                    margin-bottom: 6px; \
                  } \
                  @page { \
                    margin-top: 50px; \
                  } \
                  .logo-summary-report { \
                    width: 72px; \
                    position: absolute; \
                    top: 2px; \
                    right: 10px; \
                  }             \
                </style>");
                printWindow.document.write('</head><body class="summary">');
                printWindow.document.write(content);
                printWindow.document.write('</body></html>');
                printWindow.print();
                printWindow.close();
              }

            },
            size: 'lg',
            keyboard: true
          }).result.then(function () {}, function (res) {});
        }

        // property detail
        if ($scope.model.clsP1 && $scope.model.clsP1.code) {
          propertyService.getItem($scope.model.clsP1.code).then(function (item) {
            $scope.property = item;
          });
        }

        // group labels from matter code
        $scope.matterCode = [];
        if ($scope.model.clsMatterCode && $scope.model.clsMatterCode.jsonFieldLabels) {
          $scope.matterCode = JSON.parse($scope.model.clsMatterCode.jsonFieldLabels);
        }

        $scope.getLabel = function (key) {
          for (var i = 0; i < $scope.matterCode.length; i++) {
            if ($scope.matterCode[i].JsonField == key) {
              return $scope.matterCode[i].Label;
            }
          }
        }
      }
    });  

    formlyConfig.setType({
      name: 'rpgt',
      templateUrl: 'rpgt.html'
    });  

    formlyConfig.setType({
      name: 'arrear',
      templateUrl: 'arrear.html'
    });  

    formlyConfig.setType({
      name: 'chain',
      templateUrl: 'chain.html'
    });  

    formlyConfig.setType({
      name: 'beneficiary',
      templateUrl: 'beneficiary.html'
    });  

    formlyConfig.setType({
      name: 'other',
      templateUrl: 'other.html'
    });  

    formlyConfig.setType({
      name: 'report',
      templateUrl: 'report.html'
    });  

    formlyConfig.setType({
      name: 'tenancy',
      templateUrl: 'tenancy.html'
    });  

    formlyConfig.setType({
      name: 'vehicle',
      templateUrl: 'vehicle.html'
    });  

    formlyConfig.setType({
      name: 'estate-agent',
      templateUrl: 'estate-agent.html'
    });  

    // bank group
    function bankCtrl ($scope, $uibModal) {
      $scope.queryBanks = function(searchText) {
        return getBankBranches(1, 10, searchText)
      };

      $scope.viewBankBranch = function(branch) {
        if (branch) {
          $scope.bankDialog(branch, true);
        } else {
          alert('Please select a branch.')
        }
      };

      $scope.bankDialog = function(party, viewMode) {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'views/bank-branch-edit.html',
          controller: 'bankBranchCreateModalCtrl',
          controllerAs: 'vm',
          size: 'lg',
          backdrop: 'static',
          keyboard: true,
          resolve: {
            viewMode: viewMode,
            party: party
          }      
        });
      };

      $scope.bankCACDialog = function(party, viewMode) {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'views/bank-CAC-edit.html',
          controller: 'bankCACCreateModalCtrl',
          controllerAs: 'vm',
          size: 'lg',
          backdrop: 'static',
          keyboard: true,
          resolve: {
            viewMode: viewMode,
            party: party
          }      
        });
      };
    }

    formlyConfig.setType({
      name: 'bank1',
      templateUrl: 'bank1.html',
      controller: bankCtrl
    });

    // bank group
    formlyConfig.setType({
      name: 'bank2',
      templateUrl: 'bank2.html',
      controller: bankCtrl
    });

    // gen-doc attribute
    formlyConfig.setType({
      name: 'gen-doc',
      templateUrl: 'gen-doc.html',
      controller: function($scope, $filter, NgTableParams, templateService, $uibModal) {
        $scope.sources = ['All', 'Online', 'User'];        
        $scope.docInfo = {
          fileno: $scope.model.strFileNo1,
          source: 'All'
        };

        $scope.chooseTemplate = function (tpl) {
          $scope.tpl = tpl;
        };

        $scope.generate = function () {
          if (!$scope.tpl) {
            alert("Please choose a template.");
            return false;
          }

          templateService.generateDoc($scope.tpl).then(function (data) {
            var modalInstance = $uibModal.open({
              animation: true,
              templateUrl: 'preview-doc.html',
              controller: function ($scope, $sce) {
                var url = 'https://docs.google.com/gview?url=https://denningchat.com.my/'+
                          'denningwcf/'+data+'&embedded=true';
                $scope.url = $sce.trustAsResourceUrl(url);
              },
              size: 'lg',
              keyboard: true
            });
          })
        }

        $scope.updateTemplates = function() {
          $scope.tableFilter = new NgTableParams({
            page: 1,
            count: 15,
            sorting: {
              name: 'asc'
            }
          }, {
            getData: function(params) {
              return templateService.getTemplates($scope.docInfo, params.page(), params.count(), 
                                                  $scope.keyword)
              .then(function (data) {
                params.total(data.headers('x-total-count'));
                return data.data;
              });
            }
          })
        };

        $scope.updateType = function() {
          templateService.getTypes($scope.docInfo.category).then(function (data) {
            $scope.types = data;
            $scope.docInfo.type = data[0].strTypeCode;
            $scope.updateTemplates();
          });
        }

        templateService.getCategories().then(function(data) {
          $scope.categories = data;
          $scope.docInfo.category = data[0];
          $scope.updateType();
        });
      }
    });
  })