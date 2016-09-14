angularTraveloggia.controller('ToolbarController',  function (SharedStateService,DataTransportService,$rootScope, $scope,$location,$window,$http,$timeout,$templateCache) {


    $scope.updateTime = Date.now();
// to do check current url to set this
    $scope.preview = {
        windowOne: "site/SitePreview.html",
        windowTwo: "album/AlbumPreview.html",
        windowThree: "journal/JournalPreview.html"
    }
  

    $scope.navigateWindowOne = function () {
        if ($scope.preview.windowOne == "site/SitePreview.html") {
            $scope.preview.windowOne = "map/MapPreview.html";
            $scope.preview.windowTwo = "album/AlbumPreview.html";
            $scope.preview.windowThree = "journal/JournalPreview.html";
         
            $location.path("/Site")
        }
        else if ($scope.preview.windowOne == "map/MapPreview.html") {
            $scope.preview.windowOne = "site/SitePreview.html";
            $scope.preview.windowTwo = "album/AlbumPreview.html";
            $scope.preview.windowThree = "journal/JournalPreview.html";
        
            $location.path("/Map")
        }


    }

    $scope.navigateWindowTwo = function () {
        if ($scope.preview.windowTwo == "album/AlbumPreview.html") {
            $scope.preview.windowTwo= "map/MapPreview.html";
            $scope.preview.windowOne = "site/SitePreview.html";
            $scope.preview.windowThree = "journal/JournalPreview.html";
            $location.path("/Album")
        }
       else if ($scope.preview.windowTwo == "map/MapPreview.html") {
           $scope.preview.windowOne = "site/SitePreview.html";
           $scope.preview.windowTwo = "album/AlbumPreview.html";
           $scope.preview.windowThree = "journal/JournalPreview.html";
            $location.path("/Map");
       }

    }

    $scope.navigateWindowThree = function () {
        if ($scope.preview.windowThree == "journal/JournalPreview.html") {
            $scope.preview.windowThree = "map/MapPreview.html";
            $scope.preview.windowOne = "site/SitePreview.html";
            $scope.preview.windowTwo = "album/AlbumPreview.html";        
            $location.path("/Journal");
        }
       else if ($scope.preview.windowThree == "map/MapPreview.html") {
            $scope.preview.windowOne = "journal/JournalPreview.html";
            $scope.preview.windowTwo = "album/AlbumPreview.html";
            $scope.preview.windowThree = "journal/JournalPreview.html";
            $location.path("/Map")
       }

  
    }



 
   $scope.selectedSite = {
        name:""
    }
    $scope.SiteList = [];

    var cachedSites =  SharedStateService.Repository.get('Sites');
    if (cachedSites != null && cachedSites.length > 0 )
        $scope.SiteList = cachedSites;
    else {
        var selectedMapID = SharedStateService.getSelectedID("Map")
        if(selectedMapID != null)
        DataTransportService.getMapByID(selectedMapID).then(
                    function (result) {
                        
                        SharedStateService.setSelected("Map", result.data);
                        SharedStateService.Repository.put('Map', result.data);
                        if (result.data.Sites.length > 0) {
                            SharedStateService.Repository.put("Sites", result.data.Sites)
                            $scope.SiteList = result.data.Sites;
                        }
                    },
                    function (error) {

                    }
            );
    }


    var selectedSiteID = SharedStateService.getSelectedID("Site");

    if(selectedSiteID != null)
    for (var i = 0; i < $scope.SiteList.length; i++) {
        if ($scope.SiteList[i].SiteID == selectedSiteID) {
            $scope.selectedSite = $scope.SiteList[i];
            //break;
        }
    }



    $scope.selectSite = function (index) {
        var selectedSite = $scope.SiteList[index];
        $scope.selectedSite = selectedSite;
        SharedStateService.setSelected("Site", selectedSite);
       
    }

    

  $scope.goJournal = function () {
    
          $scope.preview.windowThree = "map/MapPreview.html";// + $scope.updateTime;
          $scope.preview.windowOne = "site/SitePreview.html";// + $scope.updateTime;
          $scope.preview.windowTwo = "album/AlbumPreview.html";//+ $scope.updateTime;
       //   $location.path("/Journal");
     
   
    }

  $scope.goAlbum = function () {
        $scope.preview.windowTwo = "map/MapPreview.html?barf="+$scope.updateTime;
        $scope.preview.windowOne = "site/SitePreview.html";
        $scope.preview.windowThree = "journal/JournalPreview.html";
        $location.path("/Album");
        //  $scope.$apply();
    }

  $scope.goMap = function () {
        $scope.preview.windowOne = "site/SitePreview.html";
        $scope.preview.windowTwo = "album/AlbumPreview.html";
        $scope.preview.windowThree = "journal/JournalPreview.html";
        $location.path("/Map");
       //$scope.$apply();
    }

  $scope.goSite = function () {
        $scope.preview.windowOne = "map/MapPreview.html";
        $scope.preview.windowTwo = "album/AlbumPreview.html";
        $scope.preview.windowThree = "journal/JournalPreview.html";
        $location.path("/Site");
      //  $scope.$apply();
    }

  $scope.goSiteList = function () {
        $location.path("/SiteList");
    }

  $scope.goMapList = function () {
        $location.path("/MapList");
        $scope.preview.windowOne = "map/MapPreview.html";
        $scope.preview.windowTwo = "album/AlbumPreview.html";
        $scope.preview.windowThree = "journal/JournalPreview.html";
      //  $scope.$apply();
    }



    // loading the data if they change sites but stay on the page
    $scope.$watch(
        function (scope) {
            if (SharedStateService.Selected.Site != null)
                return SharedStateService.Selected.Site.SiteID;
        },
        function (newValue, oldValue) {
            if (newValue != null && newValue != oldValue) {
                for (var i = 0; i < $scope.SiteList.length; i++) {
                    if ($scope.SiteList[i].SiteID == newValue)
                        $scope.selectedSite = $scope.SiteList[i];
                    break;
                }

            }

        });


})