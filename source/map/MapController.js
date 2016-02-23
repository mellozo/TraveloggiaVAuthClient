angularTraveloggia.controller('MapController', function (MapService,SharedStateService,$scope)
{
    var VM = this;
    
    $scope.mapdivstyle = MapService.setMapSize();

    VM.MapRecord = {};
    VM.map = MapService.initMap();
    // demonstrating use of promise ( dealing with the fact that we cant load data till we've authenticated
    SharedStateService.getCurrentMap().then(
        function (defaultMap) {
            VM.MapRecord = defaultMap;
            VM.drawSites(defaultMap.Sites);
        },
        function (error) { }
        );



   VM.drawSites = function (sites) {
     var      bounds = new google.maps.LatLngBounds();
           for (var i = 0; i < sites.length; i++) {
               VM.addMarker(sites[i].Latitude,sites[i].Longitude,sites[i].Name)
               var latLong = new google.maps.LatLng(sites[i].Latitude, sites[i].Longitude);
               bounds.extend(latLong);
           }
           VM.map.fitBounds(bounds);
   }


    VM.getLocation = function(){
      navigator.geolocation.getCurrentPosition(function(pos){
                $scope.$apply(function(){
                    var geolocate = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                    VM.map.setCenter(geolocate);
                    VM.map.setZoom(14);
                });
                $scope.$apply(function () {
                    VM.addMarker( pos.coords.latitude, pos.coords.longitude );
                });
                VM.createSiteRecord(pos.coords.latitude, pos.coords.longitude);
            });
    }


    VM.addMarker = function (latitude,longitude,title) {
        var latlng = { lat:latitude,lng:longitude};
       
            var marker = new google.maps.Marker({
                position: latlng,
                map: VM.map,
                title: title
            });
      
        

    }

   

    VM.createSiteRecord=function(lat, lng){
        var site = new Site();
        site.MapID = VM.MapRecord.MapID;
    //    site.MemberID = VM.SharedState.MemberID;
        site.Latitude = lat;
        site.Longitude = lng;
    //    SharedState.currentSite = site;
    //    SharedState.currentMap.Sites.push(site);

    }

    VM.storeMapExtent= function(){
        var googleBounds = VM.map.getBounds();
        var sw = googleBounds.getSouthWest();
        var ne = googleBounds.getNorthEast();

        VM.MapRecord.MinX = sw.lng();
        VM.MapRecord.MaxX = ne.lng();
        VM.MapRecord.MinY = sw.lat();
        VM.MapRecord.MaxY = ne.Lat();
    }


    $scope.$on('$locationChangeStart', function (event, next, current) {
       
        VM.storeMapExtent();
        if (VM.MapRecord.SavedToDB == false)
            SharedState.unsavedMaps.push(VM.MapRecord);
    });

    VM.getCrossHairCursor = function () {
            $scope.map.setOptions({ draggableCursor: 'crosshair' });
    }
    
});