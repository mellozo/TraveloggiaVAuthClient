angularTraveloggia.controller('MapController', function (SharedStateService, $scope, $location, DataTransportService) {

    $scope.dialogIsShowing = false;

    $scope.searchAddress = null;

    $scope.confirmCancelQuestion = "Save location permanently to map?";

    $scope.dismiss = function () {
        $scope.dialogIsShowing = false;
    }

    $scope.drawSites = function (sites, map) {
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < sites.length; i++) {
            var marker = new google.maps.Marker({
                map: map,
                draggable: false,
                //  animation: google.maps.Animation.DROP,
                position: { lat: sites[i].Latitude, lng: sites[i].Longitude },
                title: sites[i].Name + " location: " + sites[i].Address
            });

            (function attachEventHandler(site) {
                marker.addListener('click', function () {
                    SharedStateService.Selected.Site = site;
                    SharedStateService.Selected.SiteID = site.SiteID;
                    SharedStateService.center = SharedStateService.googleMap.getCenter();
                    SharedStateService.zoom = SharedStateService.googleMap.getZoom();
                    $scope.$apply(function () { $location.path("/Album") })
                });

            })(sites[i], $scope, $location)

            var latLong = new google.maps.LatLng(sites[i].Latitude, sites[i].Longitude);
            bounds.extend(latLong);
        }

        map.fitBounds(bounds);

    }

    // called by the map directive declared on map.html
    $scope.loadMaps = function (map) {
        var cachedMaps = SharedStateService.Repository.get("Maps");
        if (cachedMaps.length==0 || cachedMaps[0].MemberID != SharedStateService.authenticatedMember.MemberID) {
            DataTransportService.getMaps(SharedStateService.authenticatedMember.MemberID).then(
                function (result) {
                    $scope.MapRecord = result.data[0];
                    SharedStateService.Selected.Map = $scope.MapRecord;
                    SharedStateService.Repository.put('Maps', result.data);
                    SharedStateService.Repository.put('Sites', $scope.MapRecord.Sites)
                    if ($scope.MapRecord.Sites.length > 0) {
                        SharedStateService.Selected.Site = $scope.MapRecord.Sites[0];
                        $scope.drawSites($scope.MapRecord.Sites, map)
                    }
                       
                },
                function (error) {
                    $scope.systemMessage.text = "error loading map data";
                    $scope.systemMessage.activate();

                }
            )// end then
        }
        else {
            $scope.MapRecord = SharedStateService.Repository.get('Maps')[0];
            SharedStateService.Selected.Map = $scope.MapRecord;
            if ($scope.MapRecord.Sites.length > 0) {
                var sites = $scope.MapRecord.Sites
                SharedStateService.Selected.Site = $scope.MapRecord.Sites[0];
                try {
                    $scope.drawSites(sites, map);
                }
                catch (error) {
                    $scope.systemMessage.text = "error " + error.data.Message;
                    $scope.systemMessage.activate();
                }
            }
        }
    }

    $scope.addMarker = function (latitude, longitude, title, imagePath) {
        var image = {
            url: imagePath,
            size: new google.maps.Size(90, 90),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(0, 0),
            scaledSize: new google.maps.Size(25, 25)
        };
        var latlng = { lat: latitude, lng: longitude };
        var marker = new google.maps.Marker({
            position: latlng,
            map: SharedStateService.googleMap,
            title: title,
            icon: image
        });
        return marker;
    }

    $scope.saveCurrentLocation = function () {
        $location.path("/Site");
    }

    $scope.getLocation = function () {
        navigator.geolocation.getCurrentPosition(function (pos) {
            var siteRecord = $scope.createSiteRecord(pos.coords.latitude, pos.coords.longitude);
            SharedStateService.Selected.Site = siteRecord;
            $scope.$apply(function () {
                var geolocate = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                SharedStateService.googleMap.setCenter(geolocate);
                var image = "../image/circle.png"
                var marker = $scope.addMarker(pos.coords.latitude, pos.coords.longitude, "current location", image);
                SharedStateService.googleMap.setZoom(13);
                if(SharedStateService.readOnlyUser == false)
                $scope.dialogIsShowing = true;
            });
        });

    }

    $scope.createSiteRecord = function (lat, lng) {
        var site = new Site();
        site.MapID = $scope.MapRecord.MapID;
        site.MemberID = SharedStateService.authenticatedMember.MemberID;
        site.Latitude = lat;
        site.Longitude = lng;
        return site;
    }

    $scope.geocodeAddress = function () {
        var geocoder = SharedStateService.geocoder;
        var address = $scope.searchAddress;
        var resultsMap =  SharedStateService.googleMap;
        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK)
            {
                var lat = results[0].geometry.location.lat();
                var lng = results[0].geometry.location.lng();
                var siteRecord = $scope.createSiteRecord(lat, lng);
                siteRecord.Address = results[0].formatted_address;
                SharedStateService.Selected.Site = siteRecord;
                resultsMap.setCenter(results[0].geometry.location);
                resultsMap.setZoom(13);
                var marker = new google.maps.Marker({
                    map: resultsMap,
                    position: results[0].geometry.location
                });
                if (SharedStateService.readOnlyUser == false)
                $scope.dialogIsShowing = true;
                angular.element('#accordion .in').collapse('hide');
                $scope.$apply();
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

});