denningOnline
  .controller('invoiceListCtrl', function(NgTableParams, invoiceService, Auth, $state, refactorService) {
    var self = this;
    self.userInfo = Auth.getUserInfo();

    self.tableFilter = new NgTableParams({
      page: 1,
      count: 10,
    }, {
      getData: function(params) {
        var type = self.outstanding ? 'outstanding': 'all';
        return invoiceService.getOutstandingList(type, params.page(), params.count(), self.keyword)
        .then(function (data) {
          params.total(data.headers('x-total-count'));
          return data.data.map(function (item) {
            var item_ = angular.copy(item);
            item_.tax = refactorService.convertFloat(item.decTaxofFee_Billed) + 
                        refactorService.convertFloat(item.decTaxofDisbWithTax_Billed);
            item_.decPaid = refactorService.convertFloat(item.decDisbOnly_Received) + 
                          refactorService.convertFloat(item.decDisbWithTax_Received) +
                          refactorService.convertFloat(item.decFee_Received) +
                          refactorService.convertFloat(item.decTaxofDisbWithTax_Received) +
                          refactorService.convertFloat(item.decTaxofFee_Received);
            return item_;
          });
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

  .controller('invoiceEditCtrl', function($stateParams, invoiceService, $state, Auth,
                                          refactorService, matterService, growlService,
                                          matterCodeService, presetbillService, contactService,
                                          uibDateParser, $uibModal, NgTableParams) 
  {
    var self = this;
    self.userInfo = Auth.getUserInfo();

    self.isDialog = false;
    self.can_edit = $state.$current.data.can_edit;
    self.isNew = $state.$current.data.can_edit;

    self.itemType = 'All';
    self.taxType = 'NoTax';
    self.invoiceToList = [];
    self.showItems = true;
    
    self.queryMatters = function (search) {
      return matterService.getList(1, 5, search).then(function (resp) {
        return resp.data
      })
    }

    self.openMatter = function () {
      var url = $state.href('file-matters.edit', { fileNo: self.entity.clsFileNo.strFileNo1 || self.entity.clsFileNo.key });
      window.open(url,'_blank');
    }

    self.matterChange = function (matter, json) {
      if (matter) {
        var matterInfo = matter;
        if (json) {
          if (!matter.JsonDesc) return;
          matterInfo = JSON.parse(matter.JsonDesc.replace(/[\u0000-\u0019]+/g,""));
        }

        self.entity.fileNo = matterInfo.systemNo;
        var clsPrimaryClient = matterInfo.primaryClient;

        self.entity.clsMatterCode = {
          'code': matterInfo.matter.code,
          'strDescription': matterInfo.matter.description,
        };

        self.matterDescription = matterInfo.matter.description;
        if (matterInfo.propertyGroup[0]) {
          self.entity.strPropertyAddress = matterInfo.propertyGroup[0].fullTitle;
        }
        self.entity.issueToName = clsPrimaryClient.name;
        self.entity.strClientID = clsPrimaryClient.code;

        // get quotation to info
        self.invoiceToList = [];
        for (var idx in matterInfo.partyGroup) {
          var pg = matterInfo.partyGroup[idx];
          if (pg.party.length > 0) {
            self.invoiceToList.push({ name: pg.PartyName, group: true });
            for (var sidx in pg.party) {
              self.invoiceToList.push({ name: pg.party[sidx].name, group: false });
            }
          }
        }
      } else {
        self.entity.strClientID = '';
        self.entity.issueToName = '';
        self.invoiceToList = [];
        self.strBillTo = null;
      }
    }

    self.presetBillChange = function (item) {
      if (item && self.entity.clsPresetBill.code != item.code) {
        presetbillService.getItem(item.code).then(function (item) {
          self.entity.clsDetails.listBilledItems = item.listBilledItems;
          self.refreshItems();
        });
      }
    }

    self.queryCodes = function(searchText) {
      return matterCodeService.getList(1, 10, searchText).then(function (data) {
        return data.data;
      });
    }

    self.queryBills = function (keyword) {
      return presetbillService.getTableList(1, 10, keyword).then(function (resp) {
        return resp.data;
      });
    }

    self.matterCodeChange = function (item) {
      if (item && item.strDescription) {
        self.entity.strBillingMatter = item.strDescription;
      }
    }

    self.insert = function (idx) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'billItemModal.html',
        controller: 'billItemModalCtrl as vm',
        size: 'lg',
        keyboard: true,
        resolve: {
          state: function () {
            return self.entity.strState;
          },
          category: function () {
            return null;
          },
          excludes: function () {
            var arr = [];
            for (ii in self.entity.clsDetails.listBilledItems) {
              var item = self.entity.clsDetails.listBilledItems[ii];
              arr.push(item.strItemCode);
            }
            return arr;
          }
        }
      }).result.then(function (res) {
        if (res && res.length > 0) {
          for (ii in res) {
            if (idx != -1) {
              self.entity.clsDetails.listBilledItems.splice(idx+parseInt(ii)+1, 0, res[ii]);
            } else {
              self.entity.clsDetails.listBilledItems.push(res[ii]);
            }
          }
          self.refreshItems();
        }
      }, function (res) {});
    }

    self.move = function (x, y) {
      if (x < 0) {
        return;
      } else if (y == self.entity.clsDetails.listBilledItems.length) {
        return;
      }

      var b = self.entity.clsDetails.listBilledItems[y];
      self.entity.clsDetails.listBilledItems[y] = self.entity.clsDetails.listBilledItems[x];
      self.entity.clsDetails.listBilledItems[x] = b;
      self.tableFilter.reload();
    };

    self.remove = function (code) {
      for (ii in self.entity.clsDetails.listBilledItems) {
        var item = self.entity.clsDetails.listBilledItems[ii];
        if (item.strItemCode == code) {
          self.entity.clsDetails.listBilledItems.splice(ii, 1);
          break;
        }
      }
      self.refreshItems();
    }

    function initializeTable () {
      self.tableFilter = new NgTableParams({
        page: 1,
        count: 10,
        sorting: {
          name: 'asc' 
        }
      }, {
        counts: [],
        getData: function (params) {
          return self.entity.clsDetails.listBilledItems.filter(function (item) {
            return self.itemType == 'All' || 
                   item.strBillItemType == self.itemType || 
                   item.strTaxCode == self.taxType;
          })
        } 
      });
      
      self.refreshItems();
    }

    function parseFFloat(strVal) {
      return parseFloat(strVal.replace(',', '').replace('(', '').replace(')', ''));
    }

    self.refreshItems = function () {
      self.gross = {
        All: 0.0,
        Fees: 0.0,
        Disb: 0.0,
        DisbWithTax: 0.0
      };

      self.sst = {
        Fees: 0.0,
        Disb: 0.0,
        DisbWithTax: 0.0
      };

      var G0001 = null;
      for (ii in self.entity.clsDetails.listBilledItems) {
        var item = self.entity.clsDetails.listBilledItems[ii];
        if (item.strItemCode != 'G0001') {
          item.decUnitCost = parseFFloat(item.decUnitPrice) * parseFFloat(item.decUnit);
          item.decUnitTax = parseFFloat(item.decTaxRate) * item.decUnitCost;
          item.decTotal = item.decUnitCost + item.decUnitTax;

          self.gross[item.strBillItemType] += item.decUnitCost;
          self.sst[item.strBillItemType] += item.decUnitTax;
          self.gross['All'] += item.decUnitCost;
        } else {
          G0001 = item;
        }
      }

      if (G0001) {
        G0001.decUnitPrice = self.sst.Fees + self.sst.DisbWithTax;
        G0001.decUnitCost = self.sst.Fees + self.sst.DisbWithTax;
        G0001.decTotal = item.decUnitCost + item.decUnitTax;
      }

      self.tableFilter.reload();
    }

    self.filterItem = function (type, tax) {
      self.itemType = type;
      self.taxType = tax;
      self.tableFilter.reload();
    }

    self.credit = {
      Fees: 0.00,
      DisbWithTax: 0.00,
      Disb: 0.00
    };

    self.debit = {
      Fees: 0.00,
      DisbWithTax: 0.00,
      Disb: 0.00
    };

    self.strClientName = '';
    if ($stateParams.id) {
      self.title = 'Edit Invoice';
      invoiceService.getItem($stateParams.id).then(function (item) {
        self.entity = refactorService.preConvert(item, true);
        self.entity_ = angular.copy(self.entity);
        initializeTable();

        matterService.getItemApp(self.entity.clsFileNo.strFileNo1).then(function (matterInfo) {
          for (var idx in matterInfo.partyGroup) {
            var pg = matterInfo.partyGroup[idx];
            if (pg.party.length > 0) {
              self.invoiceToList.push({ name: pg.PartyName, group: true });
              for (var sidx in pg.party) {
                self.invoiceToList.push({ name: pg.party[sidx].name, group: false });
              }
            }
          }
        });

        if(!self.entity.clsPresetBill.code) {
          self.entity.clsPresetBill = null;
        }

        if (self.entity.strBillTo) {
          self.strBillTo = {
            name: self.entity.strBillTo,
            group: false
          }
        }

        if (self.entity.strClientID) {
          contactService.getItem(self.entity.strClientID).then(function (client) {
            self.strClientName = client.strName;
          }); 
        }
      });

      invoiceService.getNote($stateParams.id, 'Credit').then(function (item) {
        if (item.length > 0) {
          self.credit = {
            Fees: parseFFloat(item[0].decFee)+parseFFloat(item[0].decFeeGST),
            DisbWithTax: parseFFloat(item[0].decDisbTax)+parseFFloat(item[0].decDisbTaxGST),
            Disb: parseFFloat(item[0].decDisbOnly)
          };
        }
      });

      invoiceService.getNote($stateParams.id, 'Debit').then(function (item) {
        if (item.length > 0) {
          self.debit = {
            Fees: parseFFloat(item[0].decFee)+parseFFloat(item[0].decFeeGST),
            DisbWithTax: parseFFloat(item[0].decDisbTax)+parseFFloat(item[0].decDisbTaxGST),
            Disb: parseFFloat(item[0].decDisbOnly)
          };
        }
      });
    } else {
      self.title = 'New Invoice';
      self.entity = {
        strState: 'Common',
        dtCreateDate: uibDateParser.parse(new Date()),
        clsDetails: {
          listBilledItems: []
        },
        clsFileNo: { 
          strFileNo1: ' '
        }
      };

      if ($stateParams.fileNo) {
        self.entity.clsFileNo = {
          strFileNo1: $stateParams.fileNo
        };

        matterService.getItemApp(self.entity.clsFileNo.strFileNo1).then(function (matterInfo) {
          self.matterChange(matterInfo, false);
        });
      }

      if ($stateParams.billNo) {
        self.entity.clsPresetBill = {
          code: $stateParams.billNo
        };
        self.presetBillChange(self.entity.clsPresetBill);
      }

      initializeTable();
    }

    self.quoteToChange = function (item) {
      if (item) {
        self.entity.strBillTo = item.name;
      }
    }

    self.save = function () {
      entity = refactorService.getDiff(self.entity_, self.entity);
      for (ii in entity.clsDetails.listBilledItems) {
        var item = entity.clsDetails.listBilledItems[ii];
        entity.clsDetails.listBilledItems[ii] = refactorService.convertDouble(item);
      }

      invoiceService.save(entity).then(function (item) {
        if (item) {
          if (self.entity_) {
            $state.reload();
          } else {
            $state.go('billing.invoices-edit', { 'id': item.code });
          }
          growlService.growl('Saved successfully!', 'success');
        }
      });
    }
  })
