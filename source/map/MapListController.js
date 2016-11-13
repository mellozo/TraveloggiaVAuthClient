angularTraveloggia.controller("MapListController", function (SharedStateService, $scope, $location, DataTransportService,$window) {


    $scope.selectedState = {
        addSelected: false,
        editSelected: false,
        deleteSelected:  false,
        siteSelected: false,
        facebookSelected:  false,
        emailSelected: false,
        linkSelected:false
    }

    $scope.selectedMap = {
        MapID: SharedStateService.getSelectedID("Map"),
        MapName:SharedStateService.getSelectedMapName()
    }


    $scope.switchMap = function (map) {
        SharedStateService.setSelected("Site", null);
        SharedStateService.setSelected("Journal", null);
        $scope.selectedMap = map;
            SharedStateService.setSelected("Map", map);
            SharedStateService.Repository.put("Sites", []);
            SharedStateService.Repository.put("Map", null);
            SharedStateService.Repository.put("Journals", []);
            SharedStateService.Repository.put("Photos", [])
    }


    $scope.switchAndGo = function (map) {
        $scope.switchMap(map);
        $scope.goMapFirstTime();
    }



    var getPreviewPhoto = function () {
        var pic = SharedStateService.Selected.Site.Photos[0];
        var photoURL = "http://www.traveloggia.pro/image/compass.gif";
        var rawURI = "";
        var imageServer1 = "https://s3-us-west-2.amazonaws.com";
        var imageServer2 = "http://www.traveloggia.net";
        var mapName = SharedStateService.getSelectedMapName();
        var safeName = $window.encodeURIComponent(mapName)
        if (pic != null) {
            var imagePath = SharedStateService.getAuthenticatedMemberID() + "/" + safeName + "/";
            if (pic.StorageURL != null) {
                rawURI = "/traveloggia-guests/" + imagePath + pic.FileName;
                photoURL = imageServer1 + rawURI;
            }
            else {
                rawURI = "/upload/" + imagePath + pic.FileName;
                photoURL = imageServer2 + rawURI;
            }
        }
        return photoURL;
    }

  $scope.sendEmail = function () {

        $window.open('mailto:?body=Sharing a link to my map http://www.traveloggia.pro?MapID='+$scope.selectedMap.MapID);
    }

    $scope.facebook = function () {
        var MapID = SharedStateService.getSelectedID("Map");
        var MapName = SharedStateService.getSelectedMapName();
        var imageURL = getPreviewPhoto();
        var params = {};
      //  params['message'] = 'Check out my map ' + MapName;
        params['name'] = MapName;
        params['description'] = 'check out my map! ' ;
        params['link'] = 'http://www.traveloggia.pro/?MapID='+MapID;
        params['picture'] = imageURL;
        params['picture.height'] = 250;
        params['caption'] = 'made with Traveloggia';
        $window.FB.login(function (response) {
            var x = response;
            if(response.status=="connected")
            // Note: The call will only work if you accept the permission request
            $window.FB.api('/me/feed', 'post', params,
                function (response) {
                    var y = response;
                });
        }, { scope: 'publish_actions' });

        };
    

    var loadMapList = function () {
            var cachedMapList = SharedStateService.Repository.get("MapList");
            if (cachedMapList == null || cachedMapList[0].MemberID != SharedStateService.getAuthenticatedMemberID()) {
                DataTransportService.getMapList(SharedStateService.getAuthenticatedMemberID()).then(
                    function (result) {
                        $scope.MapList = result.data;
                        SharedStateService.Repository.put("MapList", result.data);
                        if (SharedStateService.getSelectedID("Map") != null)
                            $scope.selectedMap.MapID = SharedStateService.getSelectedID("Map");
                    },
                    function (error) {
                        $scope.systemMessage.text = "error loading maps";
                        $scope.systemMessage.activate();
                    }
                )// end then
            }
            else {
                    $scope.MapList = SharedStateService.Repository.get('MapList');
            }
        }


 

    $scope.showMapEditWindow = function (action) {
        if (action == "add") {
            $scope.selectedState.addSelected = true;
            createMap();
        }
        else if (action=="edit")
            $scope.selectedState.editSelected = true;
    }

    $scope.toggleLink = function () {
        $scope.selectedState.linkSelected = ($scope.selectedState.linkSelected == true) ? false : true;
    }

  


    $scope.editMap = function () {
       
        if  ( parseInt($scope.selectedMap.MapID) <= 6088)
        {
            $scope.systemMessage.text = "map name may not be edited";
            $scope.systemMessage.activate();
        }
        else
        $scope.showMapEditWindow("edit")

    }



    var createMap = function () {
        var anotherMap = new Map();
        anotherMap.MemberID = SharedStateService.getAuthenticatedMemberID();
        $scope.selectedMap = anotherMap;
    }

     $scope.deleteMap = function () {
        DataTransportService.deleteMap($scope.selectedMap.MapID).then(
            function (result) {
                SharedStateService.deleteFromCache("MapList", "MapID", $scope.selectedMap.MapID);
                loadMapList();
                $scope.systemMessage.text = "map deleted successfully";
                $scope.systemMessage.activate();
            },
            function (error) {
                $scope.systemMessage.text = "error deleting map";
                $scope.systemMessage.activate();

            })

    }


    $scope.saveMapEdit = function () {
        if ($scope.selectedMap.MapID == null) {

            $scope.selectedState.addSelected = false;
            DataTransportService.addMap($scope.selectedMap).then(
                function (result) {
                    // to do make a shared util method to add to the cache as we are doing for delete
                    var maplist = SharedStateService.Repository.get("MapList");
                    maplist.splice(0,0,result.data);
                    SharedStateService.Repository.put("MapList", maplist);

                    SharedStateService.setSelected("Map", result.data);
                    SharedStateService.setSelected("Site", null)
                    SharedStateService.Repository.put("Sites", []);
                    SharedStateService.Repository.put("Map", result.data);
                    SharedStateService.Repository.put("Journals", []);
                    SharedStateService.Repository.put("Photos", [])
                    $scope.systemMessage.text = "map was added successfully";
                    $scope.systemMessage.activate();
                    $scope.goMapFirstTime();

                },
                    function (error) {
                        $scope.systemMessage.text = "error adding map";
                        $scope.systemMessage.activate();
                    })
        }
        else if ($scope.selectedMap.MapID != null) {
            $scope.selectedState.editSelected = false;
            DataTransportService.updateMap($scope.selectedMap).then(
                function (result) {
                    SharedStateService.setSelected("Map", result.data);
                    SharedStateService.updateCache("MapList", "MapID", $scope.selectedMap.MapID, $scope.selectedMap)
                    $scope.systemMessage.text = "map was updated successfully";
                    $scope.systemMessage.activate();
                    // refresh map list somehow
                },
                    function (error) {
                        $scope.systemMessage.text = "error updating map";
                        $scope.systemMessage.activate();
                    })
        }
    }


    $scope.cancelMapEdit = function () {
        $scope.selectedState.addSelected = false;
        $scope.selectedState.editSelected = false;
        if (SharedStateService.getSelectedID("Map") != null)
            $scope.selectedMap.MapID = SharedStateService.getSelectedID("Map");
    }



  
    // the kickoff
   loadMapList();





})