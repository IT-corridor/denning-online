denningOnline
    // =========================================================================
    // Billing Items
    // =========================================================================
    
    .service('spaclitemService', ['$q', '$timeout', '$http', function($q, $timeout, $http) {
        var service = {};

        service.spaclitems = null;
        service.getList = getList;
        service.getItem = getItem;
        service.save = save;
        service.delete = delete_;

        function getList() {
            if (service.spaclitems) {
                var deferred = $q.defer();
                deferred.resolve(service.spaclitems);
                return deferred.promise;
            } else {
                return $http.get('data/spaclitems.json')
                .then(function(resp){
                    service.spaclitems = resp.data;                
                    return resp.data;
                })                
            }
        }

        function getItem(code) {
            if(service.spaclitems) {
                var deferred = $q.defer();
                var item = service.spaclitems.filter(function(c) {
                    return c.code == code;
                });

                if (item.length == 1)
                    deferred.resolve(item[0]);
                else
                    deferred.reject(new Error('No Item with the code'));

                return deferred.promise;
            } else {
                return getList().then(function(data) {
                    var item = service.spaclitems.filter(function(c) {
                        return c.code == code;
                    });

                    if (item.length == 1)
                        return item[0];
                    else
                        throw new Error('No such item');
                });
            }
        }

        function save(spaclitem) {
            var deferred = $q.defer();

            $timeout(function(){
                var idx = service.spaclitems.map(function(c) { return c.code; }).indexOf(spaclitem.code);
                if(idx != -1) {
                    service.spaclitems[idx] = spaclitem;
                } else {
                    // should be done on server side
                    spaclitem.code = Math.floor(Math.random() * 1000 + 1);
                    service.spaclitems.push(spaclitem);
                }

                // @@ send post request to server to save the item
                deferred.resolve(spaclitem);
            }, 100);

            return deferred.promise;
        }

        function delete_(spaclitem) {
            var deferred = $q.defer();

            $timeout(function(){
                var idx = service.spaclitems.map(function(c) { return c.code; }).indexOf(spaclitem.code);
                if(idx != -1) {
                    service.spaclitems.splice(idx, 1);
                    deferred.resolve(spaclitem);
                } else {
                    deferred.reject(new Error('There is no such spaclitem'));
                }
                // @@ send delete request to server to delete the item
            }, 100);

            return deferred.promise;
        }
        return service;
        
    }])
