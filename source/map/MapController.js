angularTraveloggia.controller('MapController', function (MapService,$scope,$rootScope,DataFactory)
{

    
    $scope.mapdivstyle = MapService.setMapSize();

    $scope.map = MapService.initMap();

    $scope.MapList = [];

    $scope.LoadMaps = function () {
        DataFactory.getMaps().then(
            function (result) {
                if (result.data.length == 0) {
                    var defaultMap = new Map();
                    defaultMap.MemberID = $rootScope.MemberID;
                    $scope.MapList.push(defaultMap)
                  
                }
                else
                {
                    $scope.MapList = result.data;
                }
                $rootScope.currentMap = $scope.MapList[0];
            },
            function (error) {
                alert("you suck")
                //todo - move logging to its own service
            }
        );

    }

    $scope.LoadMaps();

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