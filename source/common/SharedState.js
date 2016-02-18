angularTraveloggia.service('SharedState', function (DataTransportService,$q)
{

    var local_scope = this;

    local_scope.MemberID = null;
    local_scope.currentMap = $q.defer();
    local_scope.MapList =$q.defer();
    local_scope.MapName = $q.defer();

    local_scope.LoadMaps = function () {
        DataTransportService.getMaps(local_scope.MemberID).then(
            function (result) {
                if (result.data.length == 0) {
                    var defaultMap = new Map();
                    defaultMap.MemberID = local_scope.MemberID;
                    var shortList = [];
                    shorList.push(defaultMap);
                    local_scope.MapList.resolve(shorList);
                }
                else {
                    local_scope.MapList.resolve(result.data);
                }
                local_scope.currentMap.resolve( local_scope.MapList[0]);
                local_scope.MapName.resolve(local_scope.currentMap.MapName);
            },
            function (error) {
                alert("you suck")
                //todo - move logging to its own service
            }
        );

    }

// returns a promise
    local_scope.getMapName = function () {
        return local_scope.MapName.promise;
    }

    local_scope.getMapList= function(){
        return local_scope.promise;
    }

    local_scope.getCurrentMap = function () {
        return local_scope.currentMap.promise;
    }
})