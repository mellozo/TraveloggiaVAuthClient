
angularTraveloggia.directive('mapCanvas', function (SharedStateService,$location) {
    return {
        restrict: 'E',

        link: function (scope, element) {
            scope.savedZoom = 2
            scope.savedCenter = new google.maps.LatLng(0, 0);
            if (SharedStateService.center != null)
            {
                scope.savedZoom = SharedStateService.zoom;
                scope.savedCenter = SharedStateService.center;
            }
       
            var mapOptions = {
                center: scope.savedCenter,
                zoom: scope.savedZoom
            };
            SharedStateService.googleMap = new google.maps.Map(element[0], mapOptions);
            scope.loadMaps(SharedStateService.googleMap);
            var googleGeocoder = new google.maps.Geocoder();
            SharedStateService.geocoder = googleGeocoder;

            if (SharedStateService.readOnlyUser == false)
            {
                var drawingManager = new google.maps.drawing.DrawingManager({
                    drawingControl: true,
                    drawingControlOptions: {
                        position: google.maps.ControlPosition.TOP_CENTER,
                        drawingModes: [
                          google.maps.drawing.OverlayType.MARKER,
                        ]
                    },
                    markerOptions: { icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png' },

                });
                drawingManager.setMap(SharedStateService.googleMap);

                google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {
                    if (event.type == google.maps.drawing.OverlayType.MARKER) {
                        var x = event;
                        var lat = event.overlay.position.lat();
                        var long = event.overlay.position.lng();
                        var site = new Site();
                        site.Latitude = lat;
                        site.Longitude = long;
                        site.MemberID = SharedStateService.authenticatedMember.MemberID;
                        site.MapID = SharedStateService.Selected.Map.MapID;
                        SharedStateService.Selected.Site = site;
                        $location.path("/Site");
                        scope.$apply();
                    }
                });
            }
                

        }
    };
});