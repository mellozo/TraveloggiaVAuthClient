angularTraveloggia.controller('MapController', function (SharedStateService, $window, $route, $scope, $location, DataTransportService,$timeout,$http,debounce) {
    $scope.stateMachine = {
        state: SharedStateService.getAuthorizationState()
    }

    $scope.selectedState = {
        editSelected:false
    }

    var clickHandler = null;

    //safari no likey viewport units
    var vpHeight = $window.document.documentElement.clientHeight;
    var vpWidth = $window.document.documentElement.clientWidth;
    $scope.mapStyle = {
        "height": vpHeight,
       "width":vpWidth
    }
    var pushpinCollection = null;
    $scope.dialogIsShowing = false;
    $scope.searchAddress = null;
    $scope.confirmCancelQuestion = "Save location permanently to map?";


// INIT SEQUENCE
    $scope.drawSites = function () {
        var sites = $scope.MapRecord.Sites;
      
    
        var arrayOfMsftLocs = [];
        pushpinCollection = new Microsoft.Maps.Layer();

        for (var i = 0; i < sites.length; i++) {
            var loc = new Microsoft.Maps.Location(sites[i].Latitude, sites[i].Longitude)
            var pin = new Microsoft.Maps.Pushpin(loc, { anchor: (17, 17), enableHoverStyle: true, draggable: false, title: sites[i].Name, subTitle: sites[i].Address });

            (function attachEventHandlers(site) {
                Microsoft.Maps.Events.addHandler(pin, 'click', function () {
                    SharedStateService.setSelected("Site", site);
                    $scope.$apply(function () { $location.path("/Album") })
                });
            })(sites[i], $scope, $location)

          //  pushpinCollection.add(pin);
            arrayOfMsftLocs.push(loc);
            $scope.mapInstance.entities.push(pin);
        }

    //    $scope.mapInstance.layers.insert(pushpinCollection);

        var selectedSiteID = SharedStateService.getSelectedID("Site")
        if (selectedSiteID == "null" || selectedSiteID == null) {
            var viewRect = Microsoft.Maps.LocationRect.fromLocations(arrayOfMsftLocs);
            $scope.mapInstance.setView({ bounds: viewRect });
            if (selectedSiteID == "null" || selectedSiteID == null)
            SharedStateService.setSelected("Site", $scope.MapRecord.Sites[0]);
        }
        else {
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
    }

    $scope.loadMaps = function () {
     
        var cachedMap = SharedStateService.Repository.get("Map");
        if ( cachedMap==null || cachedMap.MemberID != SharedStateService.getAuthenticatedMemberID() ) 
        {
            DataTransportService.getMaps(SharedStateService.getAuthenticatedMemberID() ).then(
                function (result) {
                    $scope.MapRecord = result.data;
                    SharedStateService.setSelected("Map", $scope.MapRecord);
                    SharedStateService.Repository.put('Map', result.data);                   
                    SharedStateService.setSelected("Site", null);// clear any previous settings
                    if ($scope.MapRecord.Sites.length > 0) {
                        SharedStateService.Repository.put("Sites", $scope.MapRecord.Sites);
                        $scope.drawSites();
                       
                    }
                    else
                        $scope.systemMessage.loadComplete = true;
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
                            if (selectedMapID != null && cachedMap != null && (cachedMap.MapID == selectedMapID))
                            {
                                $scope.MapRecord = cachedMap;
                                if ($scope.MapRecord.Sites.length > 0)
                                    $scope.drawSites();
                                else
                                    $scope.systemMessage.loadComplete = true;
                            }
                            else// we selected a map from the map list and now need to load its sites and put it in the repository
                            {
                                        DataTransportService.getMapByID(selectedMapID).then(
                                            function (result) {
                                                $scope.MapRecord = result.data;
                                                SharedStateService.Repository.put('Map', result.data);
                                                SharedStateService.setSelected("Site",null)
                                                if ($scope.MapRecord.Sites.length > 0)
                                                    $scope.drawSites();
                                                else
                                                    $scope.systemMessage.loadComplete = true;

                                            },
                                            function (error) {
                                                $scope.systemMessage.text = "error loading selected map";
                                                $scope.systemMessage.activate();
                                            }
                                            )
                            }

              
        }               
    }

    $scope.afterLoaded = function () {
        if ($http.pendingRequests.length > 0) {
            $timeout($scope.afterLoaded); // Wait for all templates to be loaded
        }
        else {
            // for some creepy angular type reason this code is re-entrant when you navigate back to the map
            // after the initial load, when it is not re-entrant :(
            if ($scope.mapInstance == null) {
                try {
                    $scope.mapInstance = new Microsoft.Maps.Map(document.getElementById('bingMapRaw'), {
                        credentials: 'AnDSviAN7mqxZu-Dv4y0qbzrlfPvgO9A-MblI08xWO80vQTWw3c6Y6zfuSr_-nxw',
                        mapTypeId: "r",
                        showLocateMeButton: false,
                        //  center: new Microsoft.Maps.Location(51.50632, -0.12714),
                        showTermsLink: false,
                        enableClickableLogo: false
                    });

                    if ($scope.mapInstance != null)
                        $scope.loadMaps();
                    else
                        $timeout($scope.afterLoaded);

                }
                catch (error) {
                    $timeout($scope.afterLoaded);

                }
            }
        }
    };

    //ADD CURRENT LOCATION
    $scope.getLocation = function () {
        $scope.systemMessage.text = "working...";
        $scope.systemMessage.activate();
        navigator.geolocation.getCurrentPosition(function (pos) {
            $scope.systemMessage.dismiss();
                addLocation(pos.coords);
             
            });

    }


    var addLocation = function (pos) {
        var siteRecord = createSiteRecord(pos.latitude, pos.longitude);
        SharedStateService.setSelected("Site", siteRecord);
        $scope.$apply(function () {
            var currentPosition = new Microsoft.Maps.Location(pos.latitude, pos.longitude);
            var marker = createMarker(pos.latitude, pos.longitude);
            if (pushpinCollection == null) {
                pushpinCollection = new Microsoft.Maps.Layer();
                $scope.mapInstance.layers.insert(pushpinCollection);
            }
            pushpinCollection.add(marker);

            $scope.mapInstance.setView({ center: currentPosition, zoom: 16 })

            if (SharedStateService.getAuthorizationState() == "CAN_EDIT")
                $scope.dialogIsShowing = true;

         
        });


    }

    var createSiteRecord = function (lat, lng) {
        var site = new Site();
        site.MapID = $scope.MapRecord.MapID;
        site.MemberID = SharedStateService.getAuthenticatedMemberID();
        site.Latitude = lat;
        site.Longitude = lng;
        return site;
    }

    var createMarker = function (latitude, longitude) {
        var loc = new Microsoft.Maps.Location(latitude, longitude)
        var pin = new Microsoft.Maps.Pushpin(loc, { anchor: (17, 17), enableHoverStyle: true, draggable: false });
        return pin;
    }

    $scope.dismiss = function () {
        $scope.dialogIsShowing = false;
    }

    $scope.saveCurrentLocation = function () {
        $location.path("/Site");
    }

    setView = function () {
        SharedStateService.setSelected("Site", $scope.MapRecord.Sites[0]);
    }

  // CLICK TO ADD LOCATION
    $scope.enterEdit = function () {
        // add crosshair cursor
        $scope.selectedState.editSelected = true;
       // angular.element("#bingMapRaw").style.cursor = "crosshair";
     clickHandler =   Microsoft.Maps.Events.addHandler($scope.mapInstance, "click", function (e) {

            if (e.targetType === "map") {
                // Mouse is over Map
                var loc = e.location;
                addLocation(loc)
                exitEdit();
            } else {
                // Mouse is over Pushpin, Polyline, Polygon
              
            }
        });
    }

    var exitEdit = function () {
        $scope.selectedState.editSelected = false;
        Microsoft.Maps.Events.removeHandler(clickHandler);
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


   
      var redraw = debounce(500,function () {
          console.log("debounced resize")
        
      });
       
  

    // the kickoff
      $scope.afterLoaded();

   // $window.addEventListener("resize", redraw)

}); 