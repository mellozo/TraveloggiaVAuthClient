
angularTraveloggia.controller('MapController', function (SharedStateService, canEdit, readOnly, isEditing, $window, $route, $scope, $location, DataTransportService, $timeout, $http, debounce,$rootScope) {

    $scope.stateMachine = {
        state: SharedStateService.getAuthorizationState()
    }

    $scope.$on("softIsHere", function (event, data) {
       afterLoaded();
    })
  
    $scope.selectedState = {
        editSelected:false
    }

    var clickHandler = null; 
    var pushpinCollection = null;
    $scope.dialogIsShowing = false;
    $scope.searchAddress = null;
    $scope.confirmCancelQuestion = "Save location permanently to map?";


    // INIT SEQUENCE

    var clearSites = function () {
        removePins();
    }


    var removePins = function () {
        var map = null;
        if ($location.path() == "/" || $location.path() == "/Map")
            map = $scope.mapInstance;
        else
            map = $scope.previewMap;

        if (map!= null && map.entities != null) {
            var max = map.entities.getLength() - 1;
            for (var i = max ; i > -1; i--) {
                var pushpin = map.entities.get(i);
                if (pushpin instanceof Microsoft.Maps.Pushpin) {
                    map.entities.removeAt(i);
                }
            }
        }

        else
        {
            console.log("map or entities is null removing pins ??? waiting 1000")
            $timeout(function ()
            { removePins() }, 1000)
        }
            


    }



    var drawPreviewSite= function () {
        var map = $scope.previewMap;
        if ($scope.previewMap == null)
            preparePreviewMap();
        var selectedSiteID = SharedStateService.getSelectedID("Site");
        var selectedSite = null;
        if ($location.path() !="/Site" && (selectedSiteID == "null" || selectedSiteID == null))// if loading from a shared link)
        {
            selectedSite= $scope.MapRecord.Sites[0];
            SharedStateService.setSelected("Site",selectedSite);
        }

        for (var i = 0; i < $scope.MapRecord.Sites.length; i++) 
        {
            if ($scope.MapRecord.Sites[i].SiteID == selectedSiteID) {
                selectedSite = $scope.MapRecord.Sites[i];
                break;
            }
        }

        var loc = new Microsoft.Maps.Location(selectedSite.Latitude, selectedSite.Longitude);
        var pin = new Microsoft.Maps.Pushpin(loc, { anchor: (17, 17), enableHoverStyle: true, draggable: false, title: selectedSite.Name, subTitle: selectedSite.Address });
        pushPin(pin);
        map.setView({ center: loc, zoom: 17 });
        $scope.systemMessage.loadComplete = true;
    }


    var drawSites = function () {
        var map = null;
        if ($location.path() == "/" || $location.path() == "/Map")
            map = $scope.mapInstance;
        else
            drawPreviewSite();

        var sites = $scope.MapRecord.Sites;
        var arrayOfMsftLocs = [];
        for (var i = 0; i < sites.length; i++)
        {
            var loc = new Microsoft.Maps.Location(sites[i].Latitude, sites[i].Longitude)
            var pin = new Microsoft.Maps.Pushpin(loc, { anchor: (17, 17), enableHoverStyle: true, draggable: false, title: sites[i].Name, subTitle: sites[i].Address });

            (function attachEventHandlers(site) {
                Microsoft.Maps.Events.addHandler(pin, 'click', function () {
                    $scope.$apply(function () {// $location.path("/Album")
                        SharedStateService.setSelected("Site", site);
                        $scope.goAlbum();
                        })
                });

                Microsoft.Maps.Events.addHandler(pin, 'mouseover', function () {
                    $scope.$apply(function () {
                        SharedStateService.setSelected("Site", site);
                    });
                });
            })(sites[i], $scope, $location)

            // used to calculate bounding rect
            arrayOfMsftLocs.push(loc);

            pushPin(pin);
       
        }






        var viewRect = Microsoft.Maps.LocationRect.fromLocations(arrayOfMsftLocs);
        var selectedSiteID = SharedStateService.getSelectedID("Site")
        var searchObject = $location.search();
        var selectedSite = null;

        if (selectedSiteID == "null" || selectedSiteID == null || searchObject["ZoomOut"] == "true" )// if loading from a shared link)
        {
           map.setView({ bounds: viewRect, padding: 30 });
           if (selectedSiteID == "null" || selectedSiteID == null) {
               selectedSite =$scope.MapRecord.Sites[0]
               SharedStateService.setSelected("Site",selectedSite );
           }
               
        }
        else {
            for (var i = 0; i < $scope.MapRecord.Sites.length; i++) {
                if ($scope.MapRecord.Sites[i].SiteID == selectedSiteID) {
                    selectedSite = $scope.MapRecord.Sites[i];
                    break;
                }
            }


                if (selectedSite != null) {
                    var loc = new Microsoft.Maps.Location(selectedSite.Latitude, selectedSite.Longitude)
                    map.setView({ center: loc, zoom: 17 });

                }
         
        }
        $scope.systemMessage.loadComplete = true;
    }


    var pushPin = function (pin) {
        var map = null;
        if ($location.path() == "/" || $location.path() == "/Map")
            map = $scope.mapInstance;
        else
            map = $scope.previewMap;
        if (map.entities != null)
            map.entities.push(pin);
        else {
            console.log("map.entities is null waiting 100")
            $timeout(function () {
                pushPin(pin)
            }, 100)
        }
    }


    var loadDefaultMap = function () {
            DataTransportService.getMaps(SharedStateService.getAuthenticatedMemberID() ).then(
                function (result) {
                    $scope.MapRecord = result.data;
                    SharedStateService.setSelected("Map", $scope.MapRecord);
                    SharedStateService.Repository.put('Map', result.data);                   
                    SharedStateService.setSelected("Site", null);// clear any previous settings
                    if ($scope.MapRecord.Sites.length > 0) {
                        SharedStateService.Repository.put("Sites", $scope.MapRecord.Sites);
                        drawSites();                        
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
  
    
    var reloadMap = function () {
        var cachedMap = SharedStateService.Repository.get("Map");
        $scope.MapRecord = cachedMap;
        var cachedSites = SharedStateService.Repository.get("Sites");
        $scope.MapRecord.Sites = cachedSites;
        if (cachedSites.length > 0)
            drawSites();
        else
            $scope.systemMessage.loadComplete = true;
    }


    var loadSelectedMap = function (mapID) {
      var selectedMapID=null;
      if (mapID == null)
          selectedMapID = SharedStateService.getSelectedID("Map")
      else
          selectedMapID = mapID;
        DataTransportService.getMapByID(selectedMapID).then(
            function (result) {
                if (mapID != null)// this is passed by a query string param on a shareable link
                {
                    SharedStateService.setAuthorizationState(readOnly);
                    SharedStateService.setAuthenticatedMember({ MemberID: result.data.MemberID });
                    SharedStateService.setSelected("Map", result.data);
                    SharedStateService.Repository.put("Sites", []);
                    SharedStateService.Repository.put("Map", null);
                    SharedStateService.Repository.put("Journals", []);
                    SharedStateService.Repository.put("Photos", [])
                }

                $scope.MapRecord = result.data;
                SharedStateService.Repository.put('Map', result.data);
                SharedStateService.setSelected("Site", null)             
                if ($scope.MapRecord.Sites.length > 0)
                    $timeout(function () {
                        drawSites();
                    },1000) 
                else
                {
                    var currentPosition = new Microsoft.Maps.Location(0, 0);
                    $scope.mapInstance.setView({ center: currentPosition, zoom: 1 })
                    $scope.systemMessage.loadComplete = true;
                }
            },
            function (error) {
                $scope.systemMessage.text = "error loading selected map";
                $scope.systemMessage.activate();
            }
            )
}


    var loadMap = function () {
     var requestedMap = null;
     var mapID = null;
        var searchObject = $window.location.search;
        if (searchObject != "") {
            var searchParams = searchObject.substr(1, searchObject.length)
            if ((searchParams.split("=")[0]) == "MapID") {
                mapID = searchParams.split("=")[1];
            }
                
        }
       
        if (mapID != null)
            requestedMap = mapID;

        var cachedMap = SharedStateService.Repository.get("Map");
        var selectedMapID = SharedStateService.getSelectedID("Map");
        if (requestedMap != null && cachedMap==null)
            loadSelectedMap(requestedMap);
       else if (cachedMap == null && (selectedMapID == null || selectedMapID =="null"))
            loadDefaultMap();
        else if (cachedMap == null && selectedMapID != null)
            loadSelectedMap();
        else if (cachedMap != null && selectedMapID !== null && cachedMap.MapID == selectedMapID)
            reloadMap();
        else if (cachedMap != null && selectedMapID != null && cachedMap.MapID != selectedMapID)
            loadSelectedMap();
    }


    var redraw = debounce(800, function () {
     console.log("debounced resize on map page");
     if ($location.path() != "/Map" && $location.path() != "/")
         return;
     // this sizes the outer container defined in notification controller the base container
     $scope.setDimensions();
          // when in doubt use a timeout :(
        $timeout(afterLoaded(),1000);
 });


    var preparePreviewMap = function ( previewDiv ) {
     var mapEl = $window.document.getElementById("bingPreviewMap")
     var mapType = "a"
     if ($scope.Capabilities.currentDevice.deviceType == "mobile")
         mapType = "r";
   
     if (Microsoft != null && Microsoft.Maps != null && mapEl != null)
     {
         $scope.previewMap = new Microsoft.Maps.Map(mapEl, {
             credentials: 'AnDSviAN7mqxZu-Dv4y0qbzrlfPvgO9A-MblI08xWO80vQTWw3c6Y6zfuSr_-nxw',
             mapTypeId: mapType,
             showLocateMeButton: false,
             showTermsLink: false,
             enableClickableLogo: false
         });

         if ($scope.previewMap != null)// of course its not, just checking
            loadMap();
     }
     else {
         console.log("calling prepare previewbecause microsoft is null waiting 3000")
         $timeout(function () {
             preparePreviewMap();
         }, 3000)
     }// end bing is loaded yet




 }


    var prepareMainMap = function () {
     if ($scope.mapInstance == null) {
         var mapEl = null;
         var mapType = "a"
         if ($scope.Capabilities.currentDevice.deviceType == "mobile")
             mapType = "r";
         mapEl = $window.document.getElementById("bingMapRaw")
         if (Microsoft != null && Microsoft.Maps != null && mapEl != null) {
             $scope.mapInstance = new Microsoft.Maps.Map(mapEl, {
                 credentials: 'AnDSviAN7mqxZu-Dv4y0qbzrlfPvgO9A-MblI08xWO80vQTWw3c6Y6zfuSr_-nxw',
                 mapTypeId: mapType,
                 showLocateMeButton: false,
                 showTermsLink: false,
                 enableClickableLogo: false
             });

             if ($scope.mapInstance != null)// of course its not, just checking
                 loadMap();
         }
         else {
             console.log("calling prepare main map microsoft is null waiting 3000")
             $timeout(function () {
                 prepareMainMap();
             }, 3000)
         }// end bing is loaded yet


     }

 }


    var afterLoaded = function () {
     try{
         var x = (Microsoft != null)// map control not loaded yet - the problem is sometimes the map loades before angular
         // and sometimes angular loades before the map :(
         if ($http.pendingRequests.length > 0) {
             $timeout(afterLoaded, 200); // Wait for all templates to be loaded
         }
         else {
             if ($location.path() == "/Map" || $location.path() == "/") {

                 if ($scope.mapInstance == null)
                    prepareMainMap();
             }
             else if ($location.path() != "/Map" && $location.path() != "/") {
                 if ($scope.previewMap == null)
                    preparePreviewMap();
             }
         }
     }
     catch (error) {
         console.log("microsoft was null waiting 400")
         $timeout($scope.afterLoaded,400); // Wait for all templates to be loaded
     }

  
  };




  $scope.$watch(
      function (scope) {
          if (SharedStateService.Selected.Site != null)
              return SharedStateService.Selected.Site.SiteID;
      },
      function (newValue, oldValue) {
          if (newValue != null && newValue != "null" && newValue != oldValue)
          {
              if (($location.path() != "/MapList") && $location.path() != "/" && $location.path() != "/Map") {
                  clearSites();
                  drawPreviewSite();
              }
          }
          else if (newValue == null) {
              if (($location.path() != "/MapList") && $location.path() != "/" && $location.path() != "/Map") {
                  clearSites();
                 
              }

          }
      });



    // loading the data if they change sites but stay on the page
  $scope.$watch(
      function (scope) {
          if (SharedStateService.Selected.Map != null)
              return SharedStateService.Selected.Map.MapID;
      },
      function (newValue, oldValue) {
          if ($location.path() == "/MapList" && newValue != null && newValue != oldValue) {
              clearSites();
              $timeout(loadSelectedMap(newValue),1000);
          }

      });




/******MAP EDITING ************************************************/

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
      
        $scope.$apply(function () {
            var siteRecord = createSiteRecord(pos.latitude, pos.longitude);
            SharedStateService.setSelected("Site", siteRecord);


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
        var geocoder = SharedStateService.getSearchManager().then(
            function (data) 
            {
                if(data = "ok")
                var    searchManager = new Microsoft.Maps.Search.SearchManager($scope.mapInstance);
                var address = $scope.searchAddress;
                var requestOptions = {
                    where: $scope.searchAddress,
                    callback: function (answer, userData) {
                        $scope.mapInstance.setView({ center: answer.results[0].location, zoom: 12 });
                        $scope.mapInstance.entities.push(new Microsoft.Maps.Pushpin(answer.results[0].location));
                        var thePlace = answer.results[0]
                        var lat = thePlace.location.latitude;
                        var lng = thePlace.location.longitude;
                        var siteRecord = createSiteRecord(lat, lng);
                        siteRecord.Address = thePlace.address.formattedAddress;
                        siteRecord.Name = thePlace.Name;
                        SharedStateService.setSelected("Site", siteRecord);
                        if (SharedStateService.getAuthorizationState() == 'CAN_EDIT')
                            $scope.dialogIsShowing = true;
                        angular.element('#searchPanel .in').collapse('hide');
                        $scope.searchAddress = "";
                        $scope.$apply();
                    }// end callback;

                }// end request options

                searchManager.geocode(requestOptions);

            },// end if the module loaded
            function (error) {
                

            } );
  

        var x = 1;
        };
       


//else {
//                alert('Geocode was not successful for the following reason: ' + status);
//            }
//        });
//    }








    // the kickoff
    afterLoaded();

    if($scope.Capabilities.cantResize == false)
        $window.addEventListener("resize", redraw)

}); 