angularTraveloggia.controller('MapController', function (MapService,SharedState,$scope)
{
    var VM = this;
    
    $scope.mapdivstyle = MapService.setMapSize();

   VM.map = MapService.initMap();

  // VM.MapList = SharedState.MapList;

   $scope.MapName = "";
   SharedState.getMapName().then(
       function (name) { $scope.MapName = name; });

    VM.getLocation = function(){
            navigator.geolocation.getCurrentPosition(function(position){
                $scope.$apply(function(){
                    var geolocate = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    VM.map.setCenter(geolocate);
                    VM.map.setZoom(14);
                });
        });
    }


    VM.getCrossHairCursor = function () {
            $scope.map.setOptions({ draggableCursor: 'crosshair' });
    }
    
}

);