angularTraveloggia.controller('MapController', function (MapService)
{

    angular.element(document).ready(function () {
        MapService.initMap();
        MapService.setMapSize();
    });
}

);