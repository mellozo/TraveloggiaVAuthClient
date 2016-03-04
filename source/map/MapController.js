angularTraveloggia.controller('MapController', function (MapService,SharedStateService,$scope,$location,DataTransportService)
{
    var VM = this;
    VM.MapRecord = {};
    $scope.mapdivstyle = MapService.setMapSize();
    VM.map = MapService.initMap();


    if (SharedStateService.Repository.get('Maps') == null) {

        DataTransportService.getMaps(SharedStateService.authenticatedMember.MemberID).then(
            function (result) {
                VM.MapRecord = result.data[0];
               // alert("got the maps")
                SharedStateService.Repository.put('Maps', result.data);
                SharedStateService.Repository.put('Sites', VM.MapRecord.Sites)
                VM.drawSites(VM.MapRecord.Sites)
            },
            function (error) {
                $scope.systemMessage.text = "error loading map data";
                $scope.systemMessage.activate();
            }
        )// end then
    }// end if Repository is empty



   
  
    VM.drawSites = function (sites) {
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < sites.length; i++)
        {
            var marker = new google.maps.Marker({
                map: VM.map,
                draggable: false,
                //  animation: google.maps.Animation.DROP,
                position: { lat: sites[i].Latitude, lng: sites[i].Longitude }
            });

            (function attachEventHandler(siteID) {
                marker.addListener('click', function () {
                    SharedStateService.Selected.SiteID = siteID;
                    $scope.$apply(function () { $location.path("/Album/" + siteID) })
                });

            })(sites[i].SiteID, $scope, $location)

            var latLong = new google.maps.LatLng(sites[i].Latitude, sites[i].Longitude);
            bounds.extend(latLong);
        }

        VM.map.fitBounds(bounds);
    }


    //else {
    //    VM.MapRecord = SharedStateService.Repository.get('MapList')[0];
    //    if (VM.MapRecord.Sites.length > 0)
    //    {
    //        var sites = VM.MapRecord.Sites
    //        try {
    //            VM.drawSites(sites);
    //        }
    //        catch (error) {
    //            $scope.systemMessage.text = "error " + error.data.Message;
    //            $scope.systemMessage.activate();
    //        }
       
    //    }
            
    //}








    VM.getLocation = function(){
        navigator.geolocation.getCurrentPosition(function (pos) {

            VM.createSiteRecord(pos.coords.latitude, pos.coords.longitude);

            $scope.$apply(function(){
                var geolocate = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                VM.map.setCenter(geolocate);
                VM.addMarker(pos.coords.latitude, pos.coords.longitude);
                VM.map.setZoom(14);
            });
         
             
        });
    }


    VM.addMarker = function (latitude,longitude,title) {
        var latlng = { lat:latitude,lng:longitude};
       
            var marker = new google.maps.Marker({
                position: latlng,
                map: VM.map,
                title: title
            });
      
        

    }

   

    VM.createSiteRecord=function(lat, lng){
        var site = new Site();
        site.MapID = VM.MapRecord.MapID;
        site.MemberID = SharedStateService.authenticatedMember.MemberID;
        site.Latitude = lat;
        site.Longitude = lng;
      // SharedStateService.currentSite = site;
        var dirtyArray = SharedStateService.Repository.get('unsavedSites');
        dirtyArray.push(site);
        SharedStateService.Repository.put('unsavedSites', dirtyArray);



    }

    VM.storeMapExtent= function(){
        var googleBounds = VM.map.getBounds();
        var sw = googleBounds.getSouthWest();
        var ne = googleBounds.getNorthEast();

        VM.MapRecord.MinX = sw.lng();
        VM.MapRecord.MaxX = ne.lng();
        VM.MapRecord.MinY = sw.lat();
        VM.MapRecord.MaxY = ne.Lat();

    }

// to do this is an optimization not using this yet
    //$scope.$on('$locationChangeStart', function (event, next, current) {
    //    VM.storeMapExtent();
    //});



    VM.getCrossHairCursor = function () {
            $scope.map.setOptions({ draggableCursor: 'crosshair' });
    }
    
});