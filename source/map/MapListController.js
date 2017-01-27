"use strict"
angularTraveloggia.controller("MapListController", function (SharedStateService, $scope, $location, DataTransportService, $window, $timeout) {

    $scope.selectedState = {
        addSelected: false,
        editSelected: false,
        deleteSelected:  false,
        siteSelected: false,
        facebookSelected:  false,
        emailSelected: false,
        linkSelected:false
    }

  
    $scope.ConfirmCancel.isShowing = false;
  

    $scope.switchMap = function (map) {
        if ( $scope.selectedMap == null || ($scope.selectedMap.MapID != map.MapID) ){
            $scope.selectedMap = map;      
            SharedStateService.setSelectedAsync("MapListItem", map);
            SharedStateService.clearMap();
        }
    }


    $scope.switchAndGo = function (map) {
        $scope.switchMap(map);
        $timeout($scope.goMapFirstTime(), 5000);
    }


    $scope.selecteMap = {}


    var updateImagePath = function () {
        if (SharedStateService.getItemFromCache("Map") == null)
            return;
        var mapName = SharedStateService.getItemFromCache("Map").MapName;
        var mapID = SharedStateService.getItemFromCache("Map").MapID
        $scope.oldImagePath = "http://www.traveloggia.net/upload/" + SharedStateService.getAuthenticatedMemberID() + "/" + mapName + "/";
        $scope.imagePath = SharedStateService.getAuthenticatedMemberID() + "/" + mapID + "/";
    }


    var getImageURL = function (pic) {
        if (pic == null)
            return;
        updateImagePath();
        var theImageURL = (pic.StorageURL != null) ? $scope.imageServer + $scope.imagePath + pic.FileName : $scope.oldImagePath + pic.FileName;
        return theImageURL;
    }






    var getPreviewPhoto = function () {
        var selectedPhoto = SharedStateService.getItemFromCache("Photo");
        var pic = "/images/defaultSplash.jpg";
        if (selectedPhoto != null)
            pic = selectedPhoto;
        else {
            var picList = SharedStateService.getItemFromCache("Photos")
            if (picList.length >0)
            pic = picList[0];
        }
       
        $scope.oldImagePath = "http://www.traveloggia.net/upload/" + SharedStateService.getAuthenticatedMemberID() + "/" + $scope.selectedMap.MapName + "/";
        $scope.imagePath = SharedStateService.getAuthenticatedMemberID() + "/" + $scope.selectedMap.MapID + "/";
        var theImageURL = (pic.StorageURL != null) ? "https://s3-us-west-2.amazonaws.com/traveloggia-guests/" + $scope.imagePath + pic.FileName : $scope.oldImagePath + pic.FileName;
         return theImageURL;
    }


    $scope.sendEmail = function () {
        $window.open('mailto:?subject=' +$scope.selectedMap.MapName +'&body=Sharing a link to my map http://www.traveloggia.pro?MapID=' + $scope.selectedMap.MapID);
  }


    $scope.toggleLink = function () {
      $scope.selectedState.linkSelected = ($scope.selectedState.linkSelected == true) ? false : true;
  }


    $scope.facebook = function () {
        var MapID = $scope.selectedMap.MapID;
        var MapName = $scope.selectedMap.MapName;
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

                    $scope.$apply(function(){
                        $scope.systemMessage.text = "map posted to facebook ";
                        $scope.systemMessage.activate();


                    })
                   



                });
        }, {
            scope: 'publish_actions',
            enable_profile_selector:true
        });

        };
    


    var getSelectedMap = function () {
       $scope.selectedMap = SharedStateService.getItemFromCache("Map")
        loadMapList();
    }

    var loadMapList = function () {
        var cachedMapList =SharedStateService.getItemFromCache("MapList")
        if (cachedMapList == null || (cachedMapList[0].MemberID != SharedStateService.getAuthenticatedMemberID()))
            fetchMapList();
        else {
            $scope.MapList = cachedMapList;           
        }
    }


    var fetchMapList = function () {
        DataTransportService.getMapList(SharedStateService.getAuthenticatedMemberID()).then(
                    function (result) {
                        SharedStateService.setSelectedAsync("MapList", result.data);
                        $scope.MapList = result.data;
                    
                    },
                    function (error) {
                        $scope.systemMessage.text = "error loading maps";
                        $scope.systemMessage.activate();
                    } )
    }


    $scope.showMapEditWindow = function (action) {
        if (action == "add") {
            $scope.selectedState.addSelected = true;
            createMap();
        }
        else if (action=="edit")
            $scope.selectedState.editSelected = true;
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


    $scope.confirmDelete = function () {
        $scope.ConfirmCancel.question = "Delete " + $scope.selectedMap.MapName + " ?";
        $scope.ConfirmCancel.ccConfirm = deleteMap;
        $scope.ConfirmCancel.ccCancel = dismiss;
        $scope.ConfirmCancel.isShowing = true;
    }


    var dismiss = function () {
        $scope.ConfirmCancel.isShowing = false;
    }
   

    var deleteMap = function () {
        DataTransportService.deleteMap($scope.selectedMap.MapID).then(
            function (result) {
                SharedStateService.deleteFromCacheAsync("MapList", "MapID", $scope.selectedMap.MapID)
                SharedStateService.clearAll();
                dismiss();
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
                    SharedStateService.addToCacheAsync("MapList", result.data);
                    SharedStateService.setSelectedAsync("MapListItem", result.data);
                    SharedStateService.setSelectedAsync("Map", result.data);
                    SharedStateService.clearMapChildren();
                    $scope.systemMessage.text = "map was added successfully";
                    $scope.systemMessage.activate();
                    $timeout($scope.goMapFirstTime(), 1000);
               
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
                    SharedStateService.setSelectedAsync("Map", $scope.selectedMap);
                    SharedStateService.updateCacheAsync("MapList", "MapID", $scope.selectedMap.MapID, $scope.selectedMap) 
                    loadMapList();
                    $scope.systemMessage.text = "map was updated successfully";
                    $scope.systemMessage.activate();
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
        getSelectedMap();
    }


    //kickoff

    getSelectedMap(); 


})