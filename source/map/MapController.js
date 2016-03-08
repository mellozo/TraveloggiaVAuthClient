angularTraveloggia.controller('MapController', function (SharedStateService,$scope,$location,DataTransportService)
{

    $scope.MapRecord = {};


   $scope.drawSites = function (sites, map) {
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < sites.length; i++) {
            var marker = new google.maps.Marker({
                map: map,
                draggable: false,
                //  animation: google.maps.Animation.DROP,
                position: { lat: sites[i].Latitude, lng: sites[i].Longitude }
            });

            (function attachEventHandler(siteID) {
                marker.addListener('click', function () {
                    SharedStateService.Selected.SiteID = siteID;
                    SharedStateService.center = $scope.googleMap.getCenter();
                    SharedStateService.zoom = $scope.googleMap.getZoom();
                    $scope.$apply(function () { $location.path("/Album") })
                });

            })(sites[i].SiteID, $scope, $location)

            var latLong = new google.maps.LatLng(sites[i].Latitude, sites[i].Longitude);
            bounds.extend(latLong);
        }

        map.fitBounds(bounds);
        
    }


   $scope.loadMaps = function () {
       if (SharedStateService.Repository.get("Maps") == null) {
           DataTransportService.getMaps(SharedStateService.authenticatedMember.MemberID).then(
               function (result) {
                   $scope.MapRecord = result.data[0];
                 
                   SharedStateService.Repository.put('Maps', result.data);
                   SharedStateService.Repository.put('Sites', $scope.MapRecord.Sites)
                   $scope.drawSites($scope.MapRecord.Sites, $scope.googleMap)
               },
               function (error) {
                   $scope.systemMessage.text = "error loading map data";
                   $scope.systemMessage.activate();

               }
           )// end then
       }
       else {
           $scope.MapRecord = SharedStateService.Repository.get('Maps')[0];
           if ($scope.MapRecord.Sites.length > 0) {
               var sites = $scope.MapRecord.Sites
               try {
                   $scope.drawSites(sites, $scope.googleMap);
               }
               catch (error) {
                   $scope.systemMessage.text = "error " + error.data.Message;
                   $scope.systemMessage.activate();
               }
           }
       }
   }
   


    //$scope.getLocation = function(){
    //    navigator.geolocation.getCurrentPosition(function (pos) {
    //        $scope.createSiteRecord(pos.coords.latitude, pos.coords.longitude);
    //        $scope.$apply(function(){
    //            var geolocate = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    //           $scope.googleMap.setCenter(geolocate);
    //           $scope.addMarker(pos.coords.latitude, pos.coords.longitude);
    //            $scope.googleMap.setZoom(14);
    //        });
    //    });
    //}


    //$scope.addMarker = function (latitude,longitude,title) {
    //    var latlng = { lat:latitude,lng:longitude};
    //        var marker = new google.maps.Marker({
    //            position: latlng,
    //            map: $scope.googleMap,
    //            title: title
    //        });
    //}

   

    //$scope.createSiteRecord=function(lat, lng){
    //    var site = new Site();
    //    site.MapID =$scope.MapRecord.MapID;
    //    site.MemberID = SharedStateService.authenticatedMember.MemberID;
    //    site.Latitude = lat;
    //    site.Longitude = lng;
    //  // SharedStateService.currentSite = site;
    //    var dirtyArray = SharedStateService.Repository.get('unsavedSites');
    //    dirtyArray.push(site);
    //    SharedStateService.Repository.put('unsavedSites', dirtyArray);
    //}

//    VM.storeMapExtent= function(){
//        var googleBounds = VM.map.getBounds();
//        var sw = googleBounds.getSouthWest();
//        var ne = googleBounds.getNorthEast();

//        VM.MapRecord.MinX = sw.lng();
//        VM.MapRecord.MaxX = ne.lng();
//        VM.MapRecord.MinY = sw.lat();
//        VM.MapRecord.MaxY = ne.Lat();

//    }

//// to do this is an optimization not using this yet
//    //$scope.$on('$locationChangeStart', function (event, next, current) {
//    //    VM.storeMapExtent();
//    //});



//    VM.getCrossHairCursor = function () {
//            $scope.map.setOptions({ draggableCursor: 'crosshair' });
//    }
    
});