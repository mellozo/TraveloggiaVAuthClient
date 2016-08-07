angularTraveloggia.controller('MapController', function (SharedStateService, $window, $scope, $location, DataTransportService,$timeout,$http) {

    var vpHeight = $window.innerHeight;
    var vpWidth = $window.innerWidth;
    $scope.mapStyle = {
        "height": vpHeight,
       "width":vpWidth
    }

    $scope.dialogIsShowing = false;

    $scope.searchAddress = null;

    $scope.confirmCancelQuestion = "Save location permanently to map?";

    $scope.dismiss = function () {
        $scope.dialogIsShowing = false;
    }

    $scope.setView = function () {
        SharedStateService.setSelected("Site", $scope.MapRecord.Sites[0]);
    }

    $scope.drawSites = function () {
        var sites = $scope.MapRecord.Sites;
        SharedStateService.Repository.put("Sites", sites);
        var arrayOfMsftLocs = [];

            var pushpinCollection = new Microsoft.Maps.Layer();
            for (var i = 0; i < sites.length; i++) {
                var loc = new Microsoft.Maps.Location(sites[i].Latitude, sites[i].Longitude)
                var pin = new Microsoft.Maps.Pushpin(loc, { anchor: (17, 17), enableHoverStyle: true, draggable: false, title: sites[i].Name, subTitle: sites[i].Address });

                (function attachEventHandlers(site) {
                    Microsoft.Maps.Events.addHandler(pin, 'click', function () {
                        SharedStateService.setSelected("Site", site);
                        SharedStateService.setSelected("SiteID", site.SiteID);
                        $scope.$apply(function () { $location.path("/Album") })
                    });
                })(sites[i], $scope, $location)

                pushpinCollection.add(pin);
                arrayOfMsftLocs.push(loc)
            }
            $scope.mapInstance.layers.insert(pushpinCollection);

            var selectedSiteID = SharedStateService.getSelectedID("Site")

            if (selectedSiteID == "null" || selectedSiteID == null) {
                var viewRect = Microsoft.Maps.LocationRect.fromLocations(arrayOfMsftLocs);
                $scope.mapInstance.setView({ bounds: viewRect });
                SharedStateService.setSelected("Site", $scope.MapRecord.Sites[0]);
            }
            else {
                var selectedSiteID = SharedStateService.getSelectedID("Site");
                var selectedSite = null;
                for (var i = 0; i < $scope.MapRecord.Sites.length; i++) {
                    if ($scope.MapRecord.Sites[i].SiteID == selectedSiteID) {
                        selectedSite = $scope.MapRecord.Sites[i];
                        break;
                    }

                }
                var loc = new Microsoft.Maps.Location(selectedSite.Latitude, selectedSite.Longitude)
                $scope.mapInstance.setView({ center: loc, zoom: 19 });
            }


            $scope.systemMessage.loadComplete = true;
     

        //Microsoft.Maps.Events.addHandler($scope.mapInstance, "mousemove", function (e) {
        //        // get the HTML DOM Element that represents the Map
        //        var mapElem = $scope.mapInstance.getRootElement();
        //        if (e.targetType === "map") {
        //            // Mouse is over Map
        //         //   mapElem.style.cursor = "crosshair";
        //        } else {
        //            // Mouse is over Pushpin, Polyline, Polygon
        //            mapElem.style.cursor = "pointer";
        //        }
        //    });

    }

    $scope.afterLoaded = function () {
        if ($http.pendingRequests.length > 0) {
            $timeout($scope.afterRender); // Wait for all templates to be loaded
        }
        else {
            if ($scope.mapInstance == null) {
                $scope.mapInstance = new Microsoft.Maps.Map(document.getElementById('bingMapRaw'), {
                    credentials: 'AnDSviAN7mqxZu-Dv4y0qbzrlfPvgO9A-MblI08xWO80vQTWw3c6Y6zfuSr_-nxw',
                    mapTypeId: "a",
                  //  center: new Microsoft.Maps.Location(51.50632, -0.12714),
                    showTermsLink: false,
                    enableClickableLogo: false
                   
                });
            }
            $scope.loadMaps();
        }
    };


    $scope.loadMaps = function () {
        var cachedMap = SharedStateService.Repository.get("Maps");
        if (cachedMap.length==0 || cachedMap.MemberID != SharedStateService.getAuthenticatedMemberID() ) 
        {
            DataTransportService.getMaps(SharedStateService.getAuthenticatedMemberID() ).then(
                function (result) {
                    $scope.MapRecord = result.data;
                    SharedStateService.setSelected("Map", $scope.MapRecord);
                    SharedStateService.Repository.put('Maps', result.data);
                    SharedStateService.setSelected("Site", null);// clear any previous settings
                    if ($scope.MapRecord.Sites.length > 0) {
                        $scope.drawSites();
                    }                     
                },
                function (error) {
                    $scope.systemMessage.text = "error loading map data";
                    $scope.systemMessage.activate();
                }
            )// end then
        }
        else 
        {
            var selectedMapID = SharedStateService.getSelectedID("Map")
                            if (selectedMapID != null && (cachedMap.MapID == selectedMapID))
                            {
                                $scope.MapRecord = cachedMap;
                                if ($scope.MapRecord.Sites.length > 0)
                                    $scope.drawSites();
                            }
                            else// we selected a map from the map list and now need to load its sites and put it in the repository
                            {
                                        DataTransportService.getMapByID(selectedMapID).then(
                                            function (result) {
                                                $scope.MapRecord = result.data;
                                                SharedStateService.Repository.put('Maps', result.data);
                                                SharedStateService.setSelected("Site",null)
                                                if ($scope.MapRecord.Sites.length > 0)
                                                    $scope.drawSites();

                                            },
                                            function (error) {
                                                $scope.systemMessage.text = "error loading selected map";
                                                $scope.systemMessage.activate();
                                            }
                                            )
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
            SharedStateService.setSelected("Site", siteRecord);
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
        site.MemberID = SharedStateService.getAuthenticatedMemberID();
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
                SharedStateService.setSelected("Site", siteRecord);
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


   


    // the kickoff
    $scope.afterLoaded();

});