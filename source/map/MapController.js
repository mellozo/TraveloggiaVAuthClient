angularTraveloggia.controller('MapController', function (MapService,$scope)
{

    
    $scope.mapdivstyle = MapService.setMapSize();
 
       $scope.map = MapService.initMap();
    
}

);