angularTraveloggia.controller('MapController', function (SharedStateService, $scope, $location, DataTransportService,$timeout) {


    if($scope.mapInstance == null)
    $scope.mapInstance = new Microsoft.Maps.Map(document.getElementById('bingMapRaw'), {
        credentials: 'AnDSviAN7mqxZu-Dv4y0qbzrlfPvgO9A-MblI08xWO80vQTWw3c6Y6zfuSr_-nxw',
      //  center: new Microsoft.Maps.Location(51.50632, -0.12714),
        mapTypeId: Microsoft.Maps.MapTypeId.aerial,
        zoom: 10
    }
    );

    //$timeout(function () {

    //    var mapContainer = angular.element("#bingMapRaw");
    //    mapContainer.attribute

    //}, 0);

    //$scope.mapOptions = {
      
    //    zoom: 6,
    //    mapType: 'a',
    //    options: {
    //        //disablePanning: true,
    //        //disableZooming:true
    //    }
    //};
    //$scope.onMapReady = function(map) {
    //    //This will return (0,0) because we havn't set the center yet
    //    console.log('Map loaded with center:' + map.getCenter());
    //}





    $scope.dialogIsShowing = false;

    $scope.searchAddress = null;

    $scope.confirmCancelQuestion = "Save location permanently to map?";

    $scope.dismiss = function () {
        $scope.dialogIsShowing = false;
    }


    $scope.drawSites = function (sites) {
        var arrayOfMsftLocs = [];
        for (var i = 0; i < sites.length; i++) 
        {

            var loc = new Microsoft.Maps.Location(sites[i].Latitude, sites[i].Longitude)
         
            var pin = new Microsoft.Maps.Pushpin(loc, { draggable: false });
         
            (function attachEventHandlers(site) {

                pin.text = site.Name;
                var pinInfobox = new Microsoft.Maps.Infobox(loc,
                    {
                        visible: false,
                        offset: new Microsoft.Maps.Point(20, 20),
                        title: site.Name,
                        description:site.Address
                    });
              
                 
                // Add handler for the pushpin click event.
                Microsoft.Maps.Events.addHandler(pin, 'mouseover', function () {
                    pinInfobox.setOptions({ visible: true });
                });

                // Hide the infobox when the map is moved.
                Microsoft.Maps.Events.addHandler(pin, 'mouseout', function () {
                    pinInfobox.setOptions({ visible: false });
                });

                Microsoft.Maps.Events.addHandler(pin, 'click', function () {
                    SharedStateService.setSelected("Site", site);
                    SharedStateService.setSelected("SiteID",site.SiteID);
                    $scope.$apply(function () { $location.path("/Album") })
                });

                $scope.mapInstance.entities.push(pinInfobox);

            })(sites[i],$scope,$location)

            $scope.mapInstance.entities.push(pin);
            arrayOfMsftLocs.push(loc)
        }

        var viewRect = Microsoft.Maps.LocationRect.fromLocations(arrayOfMsftLocs);
        $scope.mapInstance.setView({ bounds: viewRect });

        Microsoft.Maps.Events.addHandler($scope.mapInstance, "mousemove", function (e) 
        {
                // get the HTML DOM Element that represents the Map
                var mapElem = $scope.mapInstance.getRootElement();
                if (e.targetType === "map") {
                    // Mouse is over Map
                 //   mapElem.style.cursor = "crosshair";
                } else {
                    // Mouse is over Pushpin, Polyline, Polygon
                    mapElem.style.cursor = "pointer";
                }
            });

    }


  


    $scope.loadMaps = function () {
  
        var cachedMaps = SharedStateService.Repository.get("Maps");
        if (cachedMaps.length==0 || cachedMaps[0].MemberID != SharedStateService.getAuthenticatedMemberID() ) {
            DataTransportService.getMaps(SharedStateService.getAuthenticatedMemberID() ).then(
                function (result) {
                    $scope.MapRecord = result.data[0];
                    SharedStateService.setSelected("Map", $scope.MapRecord);
                    SharedStateService.Repository.put('Maps', result.data);
                    SharedStateService.Repository.put('Sites', $scope.MapRecord.Sites)
                    if ($scope.MapRecord.Sites.length > 0) {
                        SharedStateService.setSelected("Site", $scope.MapRecord.Sites[0]);
                        $scope.drawSites($scope.MapRecord.Sites)
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
            SharedStateService.setSelected("Map", $scope.MapRecord);         
            if ($scope.MapRecord.Sites.length > 0) {
                var sites = $scope.MapRecord.Sites
                if(SharedStateService.Selected.SiteID == null)
                   SharedStateService.setSelected("Site", $scope.MapRecord.Sites[0]);
                else
                {
                    for (var i = 0; i < $scope.MapRecord.Sites.length; i++) {//?
                        if($scope.MapRecord.Sites[i].SiteID == SharedStateService.Selected.SiteID)
                            SharedStateService.Selected.Site = $scope.MapRecord.Sites[i];
                        break;

                    }

                }
                try {
                    $scope.drawSites(sites);
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

    $scope.$watch(
       function (scope) {
           return SharedStateService.getAuthenticatedMemberID();
       },
       function (newValue, oldValue){
           if  (newValue != oldValue)
               $scope.loadMaps();
      }
    );
    
  //  $scope.$watch(
  //   function (scope) {
        
  //           return SharedStateService.getSelectedID("Map");
  //   },
  //   function (newValue, oldValue) {
  //       if (oldValue != null && (newValue != oldValue))
  //           $scope.loadMaps($scope.mapInstance);
  //   }
  //);


    // the kickoff
   $scope.loadMaps();


});