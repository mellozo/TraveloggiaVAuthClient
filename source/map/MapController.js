
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

    var arrayOfHandlerHandles = [];

    $scope.Search = {
        Address:null
    }
 
    // INIT SEQUENCE

    var clearSites = function () {
        removeHandlers();
        removePins();
    }

    var removeHandlers = function () {
      
        for (var i = 0; i < arrayOfHandlerHandles.length; i++) {
            var handlerID = arrayOfHandlerHandles[i]
            Microsoft.Maps.Events.removeHandler(handlerID)
        }


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
            if (map == null) {
                prepareMainMap();
                return null;

            }
        }
        else if ($window.innerWidth > 768) {
            map = $scope.previewMap;
            if (map == null)
            {
                preparePreviewMap();
                return null;

            }
        }
        return map;
    }
 
    var setBounds = function (arrayOfMsftLocs) {
    
        var map = getMapInstance();
        var viewRect = Microsoft.Maps.LocationRect.fromLocations(arrayOfMsftLocs);   
        $timeout(function () {
            $scope.systemMessage.loadComplete = true;
            map.setView({ bounds: viewRect, padding: 30 })
        },1000);
    
    }

    var setCenter = function (selectedSite) {
        var map = getMapInstance();
        if (selectedSite != null) {
            var loc = new Microsoft.Maps.Location(selectedSite.Latitude, selectedSite.Longitude)
            if (map == null)
                console.log("map is null inside draw sites trying to set view on selected site")
            else {
              
                $timeout(function ()
                {
                    $scope.systemMessage.loadComplete = true;
                    map.setView({ center: loc, zoom: 17 });
                }
                );
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
        arrayOfHandlerHandles = [];
        var map = $scope.previewMap;
        if ($scope.previewMap == null)
            preparePreviewMap();

        var selectedSite = SharedStateService.getItemFromCache("Site");
        if ($location.path() != "/Site" && selectedSite == null)// if loading from a shared link)
        {
            selectedSite = $scope.MapRecord.Sites[0];
            SharedStateService.setSelectedAsync("Site", selectedSite);
        }

        if (selectedSite != null) {
            var loc = new Microsoft.Maps.Location(selectedSite.Latitude, selectedSite.Longitude);
            var pin = new Microsoft.Maps.Pushpin(loc, { anchor: (17, 17), enableHoverStyle: true, draggable: false, title: selectedSite.Name, subTitle: selectedSite.Address });
            pushPin(pin);
            setCenter(selectedSite);
        }
        else
        {

            map.setView({ zoom: 1});
        }
        
       
    }

    var drawSites = function () {
        var map = $scope.mapInstance;
        var sites = $scope.MapRecord.Sites;
        var arrayOfMsftLocs = [];
        arrayOfHandlerHandles=[]
        var isDraggable = (SharedStateService.getAuthorizationState() == "CAN_EDIT" && ($scope.Capabilities.currentDevice.deviceType == null || $scope.Capabilities.currentDevice.deviceType == "tablet")) ? true : false;
        for (var i = 0; i < sites.length; i++) {
            var loc = new Microsoft.Maps.Location(sites[i].Latitude, sites[i].Longitude)
            var pin = new Microsoft.Maps.Pushpin(loc, { anchor: (17, 17), enableHoverStyle: true, draggable: isDraggable, title: sites[i].Name, subTitle: sites[i].Address });
            (
                function attachEventHandlers(site) {
                    var handleClick=   Microsoft.Maps.Events.addHandler(pin, 'click', function () {
                        $scope.$apply(function () {
                            SharedStateService.setSelectedAsync("Site", site)
                            $scope.goAlbum();
                        })
                    });

                    arrayOfHandlerHandles.push(handleClick)

                    var handleMouseOver = Microsoft.Maps.Events.addHandler(pin, 'mouseover', function () {
                        $scope.$apply(function () {
                            SharedStateService.setSelectedAsync("Site", site);
                        });
                    });

                    arrayOfHandlerHandles.push(handleMouseOver);

                    if (isDraggable == true)
                    {
                         var handleDrag =   Microsoft.Maps.Events.addHandler(pin, 'dragend', function (e) {
                                $scope.$apply(
                                function () {
                                    SharedStateService.setSelectedAsync("Site", site);
                                    var loc = e.location;
                                    $scope.editLocation(loc, site)
                                })
                         });

                         arrayOfHandlerHandles.push(handleDrag);

                    }

            }

            )(sites[i], $scope, $location)

            // used to calculate bounding rect
            arrayOfMsftLocs.push(loc);

            pushPin(pin);

        }//  end for loop of sites

        var searchObject = $location.search();
        var selectedSite = SharedStateService.getItemFromCache("Site");
        $scope.$emit("sitesLoaded")
        if (selectedSite == null || selectedSite=="null" || searchObject["ZoomOut"] == "true")// if loading from a shared link)
        {
            setBounds(arrayOfMsftLocs);
            SharedStateService.setSelectedAsync("Site", $scope.MapRecord.Sites[0]);
            
        }
        else {
            setCenter(selectedSite)
        }

       
    }

    var loadDefaultMap = function () {
            DataTransportService.getMaps(SharedStateService.getAuthenticatedMemberID() ).then(
                function (result) {
                    $scope.MapRecord = result.data;
                    if ($scope.MapRecord.CrowdSourced == true)
                        SharedStateService.setAuthorizationState("CAN_EDIT")
                    SharedStateService.setSelectedAsync("Map", $scope.MapRecord);               
                    SharedStateService.setSelectedAsync("Site", null);// clear any previous settings
                    if ($scope.MapRecord.Sites != null && $scope.MapRecord.Sites.length >0) {                    
                       
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
     
    var reloadMap = function (cachedMap) {
        var map = getMapInstance();
        $scope.MapRecord = cachedMap;
        if ($scope.MapRecord.Sites != null && $scope.MapRecord.Sites.length > 0)
        {
            if(map.name =="MainMap")
                drawSites();
            else if(map.name=="PreviewMap")
                drawPreviewSite();
        }
        else
          $scope.systemMessage.loadComplete = true;

           
    }

    var getMapByID = function (selectedMapID,readOnly) {
        var map = getMapInstance();
        if (map == null)
            return;
        DataTransportService.getMapByID(selectedMapID).then(
          function (result) {

              if (readOnly != null && readOnly == true) {
                  SharedStateService.setAuthorizationState(readOnly);
                  SharedStateService.setAuthenticatedMember({ MemberID: result.data.MemberID });
              }
         
        
          $scope.MapRecord = result.data;
          SharedStateService.setSelectedAsync("Map", result.data);
          SharedStateService.setSelectedAsync("Site", null);// clear any previous settings
          if ($scope.MapRecord.Sites != null && $scope.MapRecord.Sites.length > 0) {
              if (map.name == "MainMap")
                  drawSites();
              else if (map.name == "PreviewMap")
                  drawPreviewSite();
          }
          else{
            map.setView({ zoom: 1});
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
     
        getMapByID(mapID, null)
    }


    var loadReadOnlyMap = function (mapID) {

        var readOnly = true;
        getMapByID(mapID, readOnly)

    }

    var getSelectedMapID=function(){
         var MapID = null
         var Item =SharedStateService.getItemFromCache("MapListItem");
            if(Item != null)
                 MapID=Item.MapID;
         return MapID;
    }


// branch for different types of load
    var loadMap = function () {
        $scope.systemMessage.loadComplete = false;
        var requestedMap = parseQueryString();
        if (requestedMap != null) 
            SharedStateService.setSelectedAsync("GuestLogin", true)
       
        var guestLogin=SharedStateService.getItemFromCache("GuestLogin")
        var selectedMapID = getSelectedMapID();
        var cachedMap = SharedStateService.getItemFromCache("Map")
        
        if (requestedMap != null  )
            loadReadOnlyMap(requestedMap);
        else if(selectedMapID != null && guestLogin==true)
            loadReadOnlyMap(selectedMapID);
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
             if ($location.path() =="/Map" || $location.path() == "/") {
                 if ($scope.mapInstance == null)
                     prepareMainMap();
                 else
                     loadMap();               
             }
             else  {
                 if ($scope.previewMap == null && $window.innerWidth > 769)
                     preparePreviewMap();
                 else
                     loadMap();
             }
         }
    // }
     catch (error) {
        console.log("msft bing map v8 was null waiting 2000")
        $timeout(waitAndReload, 5000); 
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
          var value = SharedStateService.getItemFromCache("Site");
          return (value != null) ? value.SiteID : null;
      },
      function (newValue, oldValue) {
          if (newValue != oldValue )
          {
              if (($location.path() != "/MapList") && $location.path() != "/" && $location.path()!="/Map") {
                  clearSites();
                  if (newValue != null)
                    drawPreviewSite();
              }
              else if ($location.path() == "/Map" || $location.path()=="/") {
                  var selectedSite = SharedStateService.getItemFromCache("Site");
                  if (selectedSite != null) {
                      var loc = new Microsoft.Maps.Location(selectedSite.Latitude, selectedSite.Longitude);
                      setCenter(selectedSite);
                  }
               
              }
          }
      });



    //WATCH MAP ID
  $scope.$watch(
      function (scope) {
          var value = SharedStateService.getItemFromCache("MapListItem");
          return (value != null) ? value.MapID : null;
      },
      function (newValue, oldValue) {
          if (newValue != oldValue) {
              clearSites();
              if (newValue != null)
                  $timeout(loadSelectedMap(newValue), 1000);
              else
                  $timeout(function () {
                      $scope.previewMap.setView({ zoom: 1});

                  });
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
                   var site = SharedStateService.getItemFromCache("Site")
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
                              // this is some smelly code because we are using Map.Sites rather than making it a separate collection
                              var selectedMap = SharedStateService.getItemFromCache("Map");
                              SharedStateService.setSelectedAsync("Sites", selectedMap.Sites);
                              SharedStateService.updateCacheAsync("Sites", "SiteID", VM.SiteID, VM.Site)
                              var updatedSites = SharedStateService.getItemFromCache("Sites")
                              selectedMap.Sites = updatedSites;
                              SharedStateService.setSelectedAsync("Map", selectedMap)
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
    var dismissSave = function () {
        $scope.ConfirmCancel.isShowing = false;
    }

    var saveCurrentLocation = function () {
        $scope.ConfirmCancel.isShowing = false;
        $location.path("/Site");
    }


    if ($location.path() == "/" || $location.path().indexOf("/Map") ==0){
        $scope.ConfirmCancel.question = "Save location permanently to map?";
        $scope.ConfirmCancel.ccCancel = dismissSave;
        $scope.ConfirmCancel.ccConfirm = saveCurrentLocation;
    }




    // the kickoff
   afterLoaded();

   

}); 