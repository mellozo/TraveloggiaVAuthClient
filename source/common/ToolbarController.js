angularTraveloggia.controller('ToolbarController',  function (SharedStateService,DataTransportService,$rootScope, $scope,$location,$window,$http,$timeout,$templateCache) {

    $scope.preview = {
        windowOne: "site/SitePreview.html",
        windowTwo: "album/AlbumPreview.html",
        windowThree: "journal/JournalPreview.html"
    }

/*****Navigation handlers********/
    // go Site
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

// goAlbum
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

//goJournal
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

    $scope.goMap = function () {
        $scope.preview.windowOne = "site/SitePreview.html";
        $scope.preview.windowTwo = "album/AlbumPreview.html";
        $scope.preview.windowThree = "journal/JournalPreview.html";
        $location.path("/Map");
    }

    $scope.goMapList = function () {
        $location.path("/MapList");
        //to do: show bounding rect on map preview
        $scope.preview.windowOne = "map/MapPreview.html";
        $scope.preview.windowTwo = "album/AlbumPreview.html";
        $scope.preview.windowThree = "journal/JournalPreview.html";
    }


    $scope.goSiteList = function () {
        $location.path("/SiteList");
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