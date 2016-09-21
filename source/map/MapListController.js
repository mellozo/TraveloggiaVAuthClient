angularTraveloggia.controller("MapListController", function (SharedStateService, $scope, $location, DataTransportService,$window) {


    $scope.selectedState = {
        addSelected: false,
        editSelected: false,
        deleteSelected:  false,
        siteSelected: false,
        facebookSelected:  false,
        emailSelected:  false
    }

    $scope.selectedMap = {};


    $scope.switchMap = function (map) {
        try {

            SharedStateService.setSelected("Map", map);
            SharedStateService.Repository.put("Sites", []);
            SharedStateService.Repository.put("Map", null);
            SharedStateService.Repository.put("Journals", []);
            SharedStateService.Repository.put("Photos", [])


        }
        catch (exception) {
          //  alert("shit")
        }
           
       // var selectedMap = map;
     
    }


    $scope.switchAndGo = function (map) {
        SharedStateService.setSelected("Map", map);
        SharedStateService.Repository.put("Sites", []);
        SharedStateService.Repository.put("Map", null);
        SharedStateService.Repository.put("Journals", []);
        SharedStateService.Repository.put("Photos", [])
        $scope.goMapFirstTime();


    }

    var getPreviewPhoto = function () {
        var pic = SharedStateService.Selected.Site.Photos[0];
        var photoURL = "http://www.traveloggia.pro/image/compass.gif";
        var rawURI = "";
        var imageServer1 = "https://s3-us-west-2.amazonaws.com";
        var imageServer2 = "http://www.traveloggia.net";
        if (pic != null) {
            var imagePath = SharedStateService.getAuthenticatedMemberID() + "/" + SharedStateService.getSelectedMapName() + "/";

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



    var createFBFeedURL = function () {
        var MapID = SharedStateService.getSelectedID("Map");
        var imageURL = getPreviewPhoto();

        var url = 'http://www.facebook.com/dialog/feed?app_id=144089425668875' +
          '&link=' +"http://www.traveloggia.pro?MapID=" +MapID +
          '&picture=' + imageURL +
         // '&name=' + encodeURIComponent(FBVars.fbShareName) +
          '&caption= viewmap' + 
       //   '&description=' + encodeURIComponent(FBVars.fbShareDesc) +
       //   '&redirect_uri=' + FBVars.baseURL + 'PopupClose.html' +
          '&display=popup';

        return url;
    }


    $scope.facebook = function () {
        var MapID = SharedStateService.getSelectedID("Map");
        var MapName = SharedStateService.getSelectedMapName();
        var imageURL = getPreviewPhoto();
        var params = {};
      //  params['message'] = 'Check out my map ' + MapName;
        params['name'] = MapName;
        params['description'] = 'check out my map! ' ;
        params['link'] = 'http://localhost:53382/?MapID='+MapID;
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
        //var url = createFBFeedURL();
        //          $window.open(url, 
        //                'feedDialog', 
        //                'toolbar=0,status=0,width=626,height=436'
        //    ); 
        //}

     

        //$window.FB.ui({
        //    method: 'feed',
        //    link: "http://www.traveloggia.pro?MapID=" +MapID,
        //    app_id: '144089425668875',
        //    picture: imageURL,
        //    caption: 'view map'
        //    //,
        // //   description:'one two three'


        //}, function (response) {
        //    // Debug response (optional)
        //    alert("map has been shared on facebook")
        //});
  //  }

  
var loadMapList = function () {
        var cachedMapList = SharedStateService.Repository.get("MapList");
        if (cachedMapList == null || cachedMap.MemberID != SharedStateService.getAuthenticatedMemberID()) {
            DataTransportService.getMapList(SharedStateService.getAuthenticatedMemberID()).then(
                function (result) {
                    $scope.MapList = result.data;
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


  
    // the kickoff
   loadMapList();





})