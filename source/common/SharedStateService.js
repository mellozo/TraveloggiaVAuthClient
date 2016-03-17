angularTraveloggia.service('SharedStateService', function (DataTransportService,$cacheFactory,$window)
{

    var local_scope = this;
    local_scope.readOnlyUser = false;
    local_scope.authenticatedMember = {};
    local_scope.center = null;
    local_scope.zoom = null;

    local_scope.Selected = {
        Map:null,
        Site:null,
        Photo: null,
        Journal:null
    }


    local_scope.liveSite = new Site();

    local_scope.Repository = $cacheFactory('Repository', {});
    local_scope.Repository.put('Journals',[])
    local_scope.Repository.put('unsavedSites', []);
    local_scope.Repository.put('unsavedMaps',[])

    local_scope.unsavedMaps = [];
    local_scope.unsavedSites = [];
    
 

    $window.onbeforeunload = function () {
        if(local_scope.readOnlyUser == false)
        local_scope.addNewSites();
    }

    local_scope.saveDirtyMaps=function(){


    }

    local_scope.addNewSites = function () {
        var newSites = local_scope.Repository.get('unsavedSites')
        for (var i = 0; i < newSites.length; i++) {

            DataTransportService.addSite(newSites[i]).then(
                function (result) {
                    alert("saved")
            },
                function (error) {
                    console.log("error inserting site")
                }
            );
        }

    }

 

 
    //local_scope.MapList = $q.defer();

    //local_scope.LoadMaps = function () {
   
    //    DataTransportService.getMaps(local_scope.authenticatedMember.MemberID).then(
    //        function (result) {
    //           local_scope.MapList.resolve(result.data);
   
    //local_scope.getMapList= function(){
    //    return local_scope.promise;
    //}

})