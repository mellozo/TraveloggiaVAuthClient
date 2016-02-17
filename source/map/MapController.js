angularTraveloggia.controller('MapController', function (MapService,$scope)
{

    
    $scope.mapdivstyle = MapService.setMapSize();
    $scope.cursorStyle;

    $scope.map = MapService.initMap();
    $scope.getLocation = function(){
       

            navigator.geolocation.getCurrentPosition(function(position){
                $scope.$apply(function(){
                    var geolocate = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                    $scope.map.setCenter(geolocate);
                    $scope.map.setZoom(14);
                });
        });
    }




    $scope.getCrossHairCursor = function () {

       
            $scope.map.setOptions({ draggableCursor: 'crosshair' });
       
      

    }
    
}

);