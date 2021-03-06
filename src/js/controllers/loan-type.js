denningOnline
    .controller('loanTypeListCtrl', function($filter, $sce, $uibModal, NgTableParams, loanTypeService) {
        var self = this;
        self.dataReady = false;
        self.openDelete = openDelete;

        loanTypeService.getList().then(function(data) {
            self.data = data;
            self.dataReady = true;
            initializeTable();
        });        
        
        function initializeTable () {
            //Filtering
            self.tableFilter = new NgTableParams({
                page: 1,            // show first page
                count: 10,
                sorting: {
                    name: 'asc'     // initial sorting
                }
            }, {
                total: self.data.length, // length of data
                getData: function(params) {
                    // use build-in angular filter
                    var orderedData = params.filter() ? $filter('filter')(self.data, params.filter()) : self.data;
                    orderedData = params.sorting() ? $filter('orderBy')(orderedData, params.orderBy()) : orderedData;

                    this.new_ic = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    this.id_type = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    this.name = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    this.email = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    this.phone3 = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

                    params.total(orderedData.length); // set total for recalc pagination
                    return this.new_ic, this.id_type, this.name, this.email, this.phone3;
                }
            })      
        }

        self.modalContent = 'Are you sure to delete the contract?';
    
        //Create Modal
        function modalInstances(animation, size, backdrop, keyboard, contact) {
            var modalInstance = $uibModal.open({
                animation: animation,
                templateUrl: 'myModalContent.html',
                controller: 'loanTypeDeleteModalCtrl',
                size: size,
                backdrop: backdrop,
                keyboard: keyboard,
                resolve: {
                    contact: function () {
                        return contact;
                    }
                }
            
            });
        }
        //Prevent Outside Click
        function openDelete(contact) {
            modalInstances(true, '', 'static', true, contact)
        };        
    })

    .controller('loanTypeDeleteModalCtrl', function ($scope, $uibModalInstance, contact, loanTypeService, $state) {
        $scope.ok = function () {
            loanTypeService.delete(contact).then(function(contact) {
                $state.reload();
            })
            .catch(function(err){
                //Handler

                //$scope.formname.contactInfo.$error.push({meessage:''});
            });
            $uibModalInstance.close();
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    })

    .controller('loanTypeEditCtrl', function($filter, $stateParams, loanTypeService, $state) {
        var self = this;
        self.save = save;

        if($stateParams.id) {
            loanTypeService.getItem($stateParams.id)
            .then(function(item){
                self.contact = item;
            });
        } else {
            self.contact = {};
        }

        function save() {
            loanTypeService.save(self.contact).then(function(contact) {
                self.contact = contact;
                $state.go('contacts.list');
            })
            .catch(function(err){
                //Handler

                //$scope.formname.contactInfo.$error.push({meessage:''});
            });
        }
    })