
angularTraveloggia.controller('MapController', function (SharedStateService, canEdit, readOnly, isEditing, $window, $route,$routeParams, $scope, $location, DataTransportService, $timeout, $http, $rootScope) {

    $scope.stateMachine = {
        state: SharedStateService.getAuthorizationState()
    }

    $scope.$on("softIsHere", function (event, data) {
        afterLoaded();
    })

    
    $scope.$on("searchClicked", function (event, data) {
        $scope.selectedState.searchSelected = true;
    });


    $scope.selectedState = {
        editSelected: false,
        searchSelected:false
    }

    var mapClickHandler = null; 
    var pushpinCollection = null;

    $scope.Search = {
        Address:null
    }

  
  

    // INIT SEQUENCE

    var clearSites = function () {
        removePins();
    }

    var removePins = function () {
        var map = getMapInstance();
        if (map == null)
            return;
        else if (map!= null && map.entities != null) {
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
            console.log("map or entities is null removing pins ??? waiting 800")
            $timeout(function ()
            { removePins() }, 800)
        }
    }

    var getMapInstance = function () {
        var map = null;
        if (($location.path() != "/MapList") && ($location.path() == "/" || $location.path().indexOf("/Map") == 0)) {
            map = $scope.mapInstance;
        }
        else if ($window.innerWidth > 768) {
            map = $scope.previewMap;
        }
        return map;
    }
 
    var setBounds = function (arrayOfMsftLocs) {
        $scope.systemMessage.loadComplete = true;
        var viewRect = Microsoft.Maps.LocationRect.fromLocations(arrayOfMsftLocs);   
        $timeout(
            function () {
                $scope.mapInstance.setView({ bounds: viewRect, padding: 30 })
              
            },1000);
    }

    var setCenter = function (selectedSite) {
         $scope.systemMessage.loadComplete = true;
        var map = getMapInstance();
        if (selectedSite != null) {
            var loc = new Microsoft.Maps.Location(selectedSite.Latitude, selectedSite.Longitude)
            if (map == null)
                console.log("map is null inside draw sites trying to set view on selected site")
            else {
                $timeout(function () {
                    map.setView({ center: loc, zoom: 17 });
         
                });

            }
               
        }

    }

    var pushPin = function (pin) {
        var map = getMapInstance();
        if (map.entities != null)
            map.entities.push(pin);
        else {
            console.log("map.entities is null waiting 300")
            $timeout(function () {
                pushPin(pin)
            }, 300)
        }
    }

    var drawPreviewSite = function () {
        var map = $scope.previewMap;
        if ($scope.previewMap == null)
            preparePreviewMap();

        localforage.getItem("Site", function (error, value) {
            if (error == null) {
                var selectedSite = value;
                if ($location.path() != "/Site" && selectedSite == null)// if loading from a shared link)
                {
                    selectedSite = $scope.MapRecord.Sites[0];
                    SharedStateService.setSelectedAsync("Site", selectedSite);
                }
                var loc = new Microsoft.Maps.Location(selectedSite.Latitude, selectedSite.Longitude);
                var pin = new Microsoft.Maps.Pushpin(loc, { anchor: (17, 17), enableHoverStyle: true, draggable: false, title: selectedSite.Name, subTitle: selectedSite.Address });
                pushPin(pin);
                setCenter(selectedSite);

            }
        })

    }

    var drawSites = function () {
        var map = $scope.mapInstance;
        var sites = $scope.MapRecord.Sites;
        var arrayOfMsftLocs = [];
        var isDraggable = (SharedStateService.getAuthorizationState() == "CAN_EDIT" && ($scope.Capabilities.currentDevice.deviceType == null || $scope.Capabilities.currentDevice.deviceType == "tablet")) ? true : false;
        for (var i = 0; i < sites.length; i++) {
            var loc = new Microsoft.Maps.Location(sites[i].Latitude, sites[i].Longitude)
            var pin = new Microsoft.Maps.Pushpin(loc, { anchor: (17, 17), enableHoverStyle: true, draggable: isDraggable, title: sites[i].Name, subTitle: sites[i].Address });
            (
                function attachEventHandlers(site) {
                    Microsoft.Maps.Events.addHandler(pin, 'click', function () {
                        $scope.$apply(function () {
                            localforage.setItem("Site", site, function (err) {
                                $scope.goAlbum();
                            })
                            $scope.goAlbum();
                        })
                    });

                    Microsoft.Maps.Events.addHandler(pin, 'mouseover', function () {
                        $scope.$apply(function () {
                            SharedStateService.setSelectedAsync("Site", site);

                        });
                    });

                    if (isDraggable == true) {
                        Microsoft.Maps.Events.addHandler(pin, 'dragend', function (e) {
                            $scope.$apply(
                            function () {
                                SharedStateService.setSelectedAsync("Site", site);
                                var loc = e.location;
                                $scope.editLocation(loc, site)
                            })
                        });
                    }

                })(sites[i], $scope, $location)

            // used to calculate bounding rect
            arrayOfMsftLocs.push(loc);

            pushPin(pin);

        }


        var searchObject = $location.search();

        localforage.getItem("Site", function (err, value) {
            var selectedSite = value;
            if (selectedSite == null || searchObject["ZoomOut"] == "true")// if loading from a shared link)
            {
                setBounds(arrayOfMsftLocs);
                SharedStateService.setSelectedAsync("Site", $scope.MapRecord.Sites[0]);
            }
            else {
                setCenter(selectedSite)
            }
        });
    }

    var loadDefaultMap = function () {
            DataTransportService.getMaps(SharedStateService.getAuthenticatedMemberID() ).then(
                function (result) {
                    $scope.MapRecord = result.data;
                    SharedStateService.setSelectedAsync("Map", $scope.MapRecord);               
                    SharedStateService.setSelectedAsync("Site", null);// clear any previous settings
                    if ($scope.MapRecord.Sites.length > 0) {                    
                        localforage.setItem("Sites", $scope.MapRecord.Sites, function (err) {
                            drawSites();
                        })
                                           
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
     
    var reloadMap = function (chachedMap) {
        var map = getMapInstance();
        $scope.MapRecord = chachedMap;
        if ($scope.MapRecord.Sites.length > 0)
        {
            if(map.name ==="MainMap")
                drawSites();
            else if(map.name==="PreviewMap")
                drawPreviewSite();
        }
        else
            $scope.$apply(function () {
                $scope.systemMessage.loadComplete = true;

            })
           
    }

    var getMapByID = function (selectedMapID) {

      // to do store all the maps as we get them, - whats bad is they will never be refreshed unless check first for updates so...
     //   var cachedMap = SharedStateService.getItemFromCache("Maps","MapID",selectedMapID, callback)


        DataTransportService.getMapByID(selectedMapID).then(
          function (result) {
              //if (mapID != null)// this is passed by a query string param on a shareable link
              //{
              //    // move this to shared state service get auth
              //    //- ie handling if there is a query string param should set auth once
              //    SharedStateService.setAuthorizationState(readOnly);
              //    SharedStateService.setAuthenticatedMember({ MemberID: result.data.MemberID });
              //}

          $scope.MapRecord = result.data;
          SharedStateService.setSelectedAsync("Map", result.data);
          if ($scope.MapRecord.Sites.length > 0) {
              SharedStateService.setSelectedAsync("Sites", $scope.MapRecord.Sites);
              $scope.$emit("sitesLoaded")
              //// if we are reloading a page from the same session selectedSite is saved
                 
              drawSites();
          }
          else {
              $scope.systemMessage.loadComplete = true;
          }
      },
          function (error) {
              $scope.systemMessage.text = "error loading selected map";
              $scope.systemMessage.activate();
          })
    }

    var parseQueryString = function () {
        var mapID = null;
        var searchObject = $window.location.search;
        if (searchObject != "") {
            var searchParams = searchObject.substr(1, searchObject.length)
            if ((searchParams.split("=")[0]) == "MapID") {
                mapID = searchParams.split("=")[1];
            }
        }
        return mapID;
    }


    var loadSelectedMap = function (mapID) {
        getMapByID(mapID)
    }


// branch for different types of load
    var loadMap = function () {
        $scope.systemMessage.loadComplete = false;
         var requestedMap = parseQueryString();
         var cachedMap = null;
         var selectedMapID = $routeParams.mapID;


         localforage.getItem("Map", function (error, value) {
             cachedMap = value;
                if (requestedMap != null && cachedMap == null)
                    loadSelectedMap(requestedMap);
                else if (cachedMap == null && (selectedMapID == null || selectedMapID == "null"))
                    loadDefaultMap();
                else if (cachedMap == null && selectedMapID != null)
                    loadSelectedMap(selectedMapID);
                else if (cachedMap != null && selectedMapID !== null && cachedMap.MapID == selectedMapID)
                    reloadMap(cachedMap);
                else if (cachedMap != null && selectedMapID != null && cachedMap.MapID != selectedMapID)
                    loadSelectedMap(selectedMapID);
                else if (cachedMap != null && selectedMapID == null)
                    reloadMap(cachedMap);
         })

    }


    var preparePreviewMap = function (previewDiv) {
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
             enableClickableLogo: false,
             showCopyright: false,
             showLogo: false,
             showScalebar: false,
             showDashboard:false
         });

         $scope.previewMap.name = "PreviewMap";

         if ($scope.previewMap != null)// of course its not, just checking
            loadMap();
     }
     else {
         console.log("calling prepare preview because microsoft is null waiting 1000")
         $timeout(function () {
             preparePreviewMap();
         }, 1000)
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
                 enableClickableLogo: false,
                 showCopyright: false,
                 showLogo: false,
                 showBreadcrumb:true
             });

             $scope.mapInstance.name = "MainMap";

             if ($scope.mapInstance != null)// of course its not, just checking
                 loadMap();
         }
         else {
            console.log("calling prepare main map microsoft is null waiting 1000")
             $timeout(function () {
                 prepareMainMap();
             }, 1000)
         }// end bing is loaded yet


     }

 }


    var afterLoaded = function () {
        try {
           
         var x = (Microsoft != null)// map control not loaded yet - the problem is sometimes the map loades before angular  and sometimes angular loades before the map :(
        // if ($http.pendingRequests.length > 0) {
          //   $timeout(afterLoaded, 800); // this ends up waiting for images which dont need to be waited for
         //}
         //else {
             if ($location.path() != "/MapList" && $location.path().indexOf("/Map")==0 || $location.path() == "/") {
                 if ($scope.mapInstance == null)
                     prepareMainMap();
                 else
                     loadMap();               
             }
             else  {
                 if ($scope.previewMap == null)
                     preparePreviewMap();
                 else
                     loadMap();
             }
         }
    // }
     catch (error) {
        console.log("msft bing map v8 was null waiting 1000")
        $timeout(waitAndReload, 1000); 
     }

  
  };


    var waitAndReload = function () {
        try{
            if (Microsoft != null)
               afterLoaded()
        }
        catch (error) {
            $window.location.reload();
        }
    }


//WATCH SITE ID
  $scope.$watch(
      function (scope) {
          localforage.getItem("Site", function (error, value) {
              if (error == null)
                  return value;
          })
      },
      function (newValue, oldValue) {
          if (newValue != oldValue && newValue.MapID == oldValue.mapID)
          {
              if (($location.path() != "/MapList") && $location.path() != "/" && ($location.path().indexOf("/Map")  != 0)) {
                  clearSites();
                  if (newValue != null)
                    drawPreviewSite();
              }
          
          }
         
      });


//WATCH MAP ID
  $scope.$watch(
      function (scope) {
          localforage.getItem("MapListItem", function (error, value) {
              if (error == null)
                  return value.MapID;
          })
      },
      function (newValue, oldValue) {
          if ($location.path() == "/MapList" && newValue != null && newValue != oldValue) {
              clearSites();
              $timeout(loadSelectedMap(newValue.MapID),1000);
          }

      });




/******MAP EDITING ************************************************/

  $scope.toggleEdit = function () {
      // add crosshair cursor
      $scope.selectedState.editSelected = ($scope.selectedState.editSelected == false) ? true : false;
      // angular.element("#bingMapRaw").style.cursor = "crosshair";
      if ($scope.selectedState.editSelected == true){
          mapClickHandler = Microsoft.Maps.Events.addHandler($scope.mapInstance, "click", function (e) {
              if (e.targetType === "map") {
                  // Mouse is over Map
                  var loc = e.location;
                  addLocation(loc)
                  $scope.toggleEdit();
              } else {
                  // Mouse is over Pushpin, Polyline, Polygon
              }
          });
      }
      else {
          Microsoft.Maps.Events.removeHandler(mapClickHandler);
      }
  }

    // CURRENT LOCATION
  $scope.getLocation = function () {

      var geo_options = {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 2000
      };

        $scope.systemMessage.text = "working...";
        $scope.systemMessage.activate();
        navigator.geolocation.getCurrentPosition(function (pos) {
            $scope.systemMessage.dismiss();
                addLocation(pos.coords);
        }, 
        function (error) {
        
            if( error.code ==2){
                $scope.systemMessage.text = "reload and try again";
                $scope.systemMessage.activate();
                console.log("navigator geo loation not working" + error.message)            
            }
            else {
                $scope.systemMessage.text = error.message;
                console.log(error.message)
            }
             
        },
        geo_options
            );
    }

    var addLocation = function (pos) {      
        $scope.$apply(function ()
        {
            var siteRecord = createSiteRecord(pos.latitude, pos.longitude);
            SharedStateService.setSelectedAsync("Site", siteRecord);
            var currentPosition = new Microsoft.Maps.Location(pos.latitude, pos.longitude);
            var marker = createMarker(pos.latitude, pos.longitude);
            if (pushpinCollection == null) {
                pushpinCollection = new Microsoft.Maps.Layer();
                $scope.mapInstance.layers.insert(pushpinCollection);
            }
            pushpinCollection.add(marker);
            $scope.mapInstance.setView({ center: currentPosition, zoom: 16 })
        });
        reverseGeocode(pos.latitude, pos.longitude);
    }



    /***************EDIT LOCATION**********************/


     $scope.editLocation = function (pos,siteRecord) {
            siteRecord.Latitude = pos.latitude;
            siteRecord.Longitude = pos.longitude;
            reverseGeocode(pos.latitude, pos.longitude);
    }

    var createSiteRecord = function (lat, lng) {
        var site = new Site();
        site.SiteID = 0;
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

    var reverseGeocode = function (lat, long) {
      SharedStateService.getSearchManager().then(function () {
          var geocoder = new Microsoft.Maps.Search.SearchManager($scope.mapInstance);
          var reverseGeocodeRequestOptions = {
              location: new Microsoft.Maps.Location(lat, long),
              callback: function (answer, userData) {
                   var site = SharedStateService.Selected.Site;
                   site.Address = answer.address.formattedAddress;

                  if(site.SiteID == 0)// its a new location
                   $scope.$apply(function () {
                       if (SharedStateService.getAuthorizationState() == "CAN_EDIT")
                           $scope.ConfirmCancel.isShowing = true;
                   })
                   else // we moved an existing location
                  {
                      DataTransportService.updateSite(site).then(
                          function (result) {
                              SharedStateService.updateCache("Sites", "SiteID", result.data.SiteID, result.data);
                              $scope.systemMessage.text = "Location has been updated";
                              $scope.systemMessage.activate();
                              $scope.$apply();
                          },
                          function (error) {
                              $scope.systemMessage.text = "error loading map data";
                              $scope.systemMessage.activate();
                          })
                  }
              }
          };
          // make the call files are loaded
          geocoder.reverseGeocode(reverseGeocodeRequestOptions);
      });
      
    }

  
  
/****SEARCH****************************************/

    $scope.geocodeAddress = function () {
        var geocoder = SharedStateService.getSearchManager().then(
            function (data) 
            {
               $scope.selectedState.searchSelected= false
                var    searchManager = new Microsoft.Maps.Search.SearchManager($scope.mapInstance);
              
                var requestOptions = {
                    where: $scope.Search.Address,
                    callback: function (answer, userData) {
                        $scope.mapInstance.setView({ center: answer.results[0].location, zoom: 12 });
                        $scope.mapInstance.entities.push(new Microsoft.Maps.Pushpin(answer.results[0].location));
                        var thePlace = answer.results[0]
                        var lat = thePlace.location.latitude;
                        var lng = thePlace.location.longitude;
                        var siteRecord = createSiteRecord(lat, lng);
                        siteRecord.Address = thePlace.address.formattedAddress;
                        siteRecord.Name = thePlace.Name;
                        SharedStateService.setSelectedAsync("Site", siteRecord);
                        if (SharedStateService.getAuthorizationState() == 'CAN_EDIT')
                            $scope.ConfirmCancel.isShowing = true;
                        
                        $scope.Search.Address = null;
                        $scope.$apply();
                    }// end callback;

                }// end request options

                searchManager.geocode(requestOptions);

            },// end if the module loaded
            function (error) {
                $scope.systemMessage.text = "error enabling search";
                $scope.systemMessage.activate();

            } );

        };
       

   
    
    //ConfirmCancel Handlers
    var dismiss = function () {
        $scope.ConfirmCancel.isShowing = false;
    }

    var saveCurrentLocation = function () {
        $scope.ConfirmCancel.isShowing = false;
        $location.path("/Site");
    }


    if ($location.path() == "/" || $location.path().indexOf("/Map") ==0){
        $scope.ConfirmCancel.question = "Save location permanently to map?";
        $scope.ConfirmCancel.ccCancel = dismiss;
        $scope.ConfirmCancel.ccConfirm = saveCurrentLocation;
    }




    // the kickoff
   afterLoaded();

   

}); 