angularTraveloggia.service('SharedStateService', function (DataTransportService,$cacheFactory,$window)
{

    var local_scope = this;
    local_scope.readOnlyUser = false;
    local_scope.authenticatedMember = {};
    local_scope.center = null;
    local_scope.zoom = null;

    local_scope.Selected = {
        Map:null,
        Site: null,
        SiteID:null,// this is cheaper to watch
        Photo: null,
        Journal:null
    }


    local_scope.Repository = $cacheFactory('Repository', {});

    local_scope.Repository.put('Maps', []);

    local_scope.Repository.put('Sites', []);

    local_scope.Repository.put('Photos', []);

    local_scope.Repository.put('Journals',[])
  

})