angularTraveloggia.service('SharedStateService', function (DataTransportService,$q,$window,$cacheFactory)
{

    var local_scope = this;

    local_scope.Repository = $cacheFactory('Repository', {});
    local_scope.Repository.put('unsavedSites', []);
    local_scope.Repository.put('unsavedMaps',[])

    local_scope.unsavedMaps = [];
    local_scope.unsavedSites = [];

    local_scope.authenticatedMember = {};
    local_scope.currentSite = {};
    local_scope.currentMap = $q.defer();
    local_scope.MapList = $q.defer();


    $window.onbeforeunload = function () {
        local_scope.addNewSites();
    }

    local_scope.saveDirtyMaps=function(){


    }

    local_scope.addNewSites = function () {
        var newSites = local_scope.Repository.get('unsavedSites')
        for (var i = 0; i < newSites.length; i++) {

            DataTransportService.addSite(newSites[i]).then(
                function (result) { },
                function (error) {
                    console.log("error inserting site")
                }
            );
        }

    }





    local_scope.LoadMaps = function () {
        //$scope.systemMessage.text = "loading maps";
        //$scope.systemMessage.activate();

        DataTransportService.getMaps(local_scope.authenticatedMember.MemberID).then(
            function (result) {
               local_scope.MapList.resolve(result.data);
               local_scope.currentMap.resolve(result.data[0]);
            },
            function (error) {
                $scope.systemMessage.text = "error loading map data";
                $scope.systemMessage.activate();
            }
        );

    }


   
    local_scope.getMapList= function(){
        return local_scope.promise;
    }

    local_scope.getCurrentMap = function () {
        return local_scope.currentMap.promise;
    }
})