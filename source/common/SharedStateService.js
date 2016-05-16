angularTraveloggia.service('SharedStateService', function (DataTransportService,$cacheFactory,$window)
{

    var local_scope = this;
    local_scope.readOnlyUser = true;
    local_scope.authenticatedMember = {MemberID:1};
    local_scope.geocoder = null;
    local_scope.googleMap = null;
    local_scope.center = null;
    local_scope.zoom = null;

    local_scope.Selected = {
        Map:null,
        Site: null,
        SiteID:null,// this is cheaper to watch
        Photo: null,
        Journal:null
    }

    local_scope.Authorization = {
        canEdit:false


    }


    local_scope.Repository = $cacheFactory('Repository', {});

    local_scope.Repository.put('Maps', []);

    local_scope.Repository.put('Sites', []);

    // for now these are not multi - dimensional arrays
    // but todo - store whatever we load from the same map
    local_scope.Repository.put('Photos', []);

    local_scope.Repository.put('Journals',[])
  

})