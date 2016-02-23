angularTraveloggia.service('MapService', function ($window) {

    var local_scope = this;
    var map;
    var mapOptions;
    var currentLocation;
    var MarkerArray = [];
    var bounds = null;
    var mapTypeControlOptions = {
        mapTypeIds: [google.maps.MapTypeId.TERRAIN, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.ROADMAP],
        position: google.maps.ControlPosition.BOTTOM_LEFT
    };

    local_scope.onReceivePosition = function (position) {
        map.setCenter(position.coords);
    }

    local_scope.getCurrentLocation = function ( ) {
        $window.navigator.geolocation.getCurrentPosition(local_scope.onReceivePosition(position))
    }

    local_scope.initMap = function() {
      
        lat = 0;// 52.516274;
        lng = 0;//13.377678;
        currentLocation = new google.maps.LatLng(lat, lng);

        mapOptions = {
            MapTypeControlOptions: mapTypeControlOptions,
            center: currentLocation,
            zoom: 2
        }

        // if(!map)
        map = new google.maps.Map(document.getElementById("map_canvas"),
             mapOptions);
        // }

        return map;
    }


    local_scope.setMapSize = function() {

        var deviceWidth = $window.innerWidth;

        //if (deviceWidth > 550)
        //    deviceWidth = (deviceWidth * 66.66666) / 100;  //-30;

        var deviceHeight = $window.innerHeight;// -30;// $('[data-role="page"]').first().height();

        //  angular.element(document).find('#map_canvas').css({ 'width': deviceWidth, 'height': deviceHeight });

        //if (map) {
        //    bounds = new google.maps.LatLngBounds();
        //    google.maps.event.trigger(map, 'resize');
        //    if (bounds != undefined)
        //        map.fitBounds(bounds);
        //}

        var h = deviceHeight + "px"
        var w = deviceWidth + "px"
        var styleString = {'height':h,'width':w}
        return styleString;
}



});