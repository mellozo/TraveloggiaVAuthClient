angularTraveloggia.controller('ToolbarController',  function (SharedStateService,DataTransportService,$rootScope, $scope,$location,$window,$http,$timeout,$templateCache) {

  
    $scope.preview = {
        windowOne: "",
        windowTwo: "",
        windowThree:""
    }

   
    $scope.$on(
                   "$routeChangeSuccess",
                   function handleRouteChangeEvent(event) {

                       switch ($location.path()) {

                           case "/Map":
                               $scope.preview.windowOne = "site/SitePreview.html";
                               $scope.preview.windowTwo = "album/AlbumPreview.html";
                               $scope.preview.windowThree = "journal/JournalPreview.html";
                               break;

                           case "/MapList":
                               $scope.preview.windowOne = "map/MapPreview.html";
                               $scope.preview.windowTwo = "album/AlbumPreview.html";
                               $scope.preview.windowThree = "journal/JournalPreview.html";
                               break;

                           case "/Album":
                               $scope.preview.windowTwo = "site/SitePreview.html";
                               $scope.preview.windowOne="map/MapPreview.html";
                               $scope.preview.windowThree = "journal/JournalPreview.html";
                               break;
                           case "/Site":
                               $scope.preview.windowOne ="map/MapPreview.html";
                               $scope.preview.windowTwo = "album/AlbumPreview.html";
                               $scope.preview.windowThree = "journal/JournalPreview.html";
                               break;
                           case "/Journal":
                               $scope.preview.windowThree = "site/SitePreview.html";
                               $scope.preview.windowTwo = "album/AlbumPreview.html";
                                  $scope.preview.windowOne = "map/MapPreview.html";
                               break;
                       
                           default:
                               $scope.preview.windowOne = "site/SitePreview.html",
                                $scope.preview.windowTwo = "album/AlbumPreview.html",
                                $scope.preview.windowThree = "journal/JournalPreview.html"
                       }


                   }
               );



    $scope.announce = function () {
        var mapPreviewDiv = $window.document.getElementById("bingPreviewMap")
        if (mapPreviewDiv != null)
       $scope.$broadcast("previewFrameLoaded", mapPreviewDiv)
    }

/*****Navigation handlers********/
    // go Site
    $scope.goSite = function () {
        $location.path("/Site")
    }

    //// goAlbum
    $scope.goAlbum = function () {
        $location.path("/Album")
    }

    $scope.goJournal = function () {
        $location.path("/Journal")
    }


    $scope.selectSite = function (site) {
        $scope.selectedSite = site;
        SharedStateService.setSelected("Site", site);
        var currentpath = $location.path();
        $location.path(currentpath).search( {"ZoomIn":"true"});
    }


    $scope.goMap = function () {
        $location.path("/Map").search({  }) ;
    }

    $scope.goMapFirstTime = function () {
        $location.path("/Map").search({"ZoomOut": "true"});
    }

    $scope.goMapList = function () {
        if ($window.location.search.indexOf("MapID")== -1)
            $location.path("/MapList")
        else
        {
           
            var plainold = $window.location.href.split("?")[0]
            plainold = plainold + "#/MapList";
            $window.location.replace(plainold);
        }
    
        
      
    }


   

    var loadSites = function () {
        var cachedSites = SharedStateService.Repository.get('Sites');
        if (cachedSites != null && cachedSites.length > 0)
            $scope.SiteList = cachedSites;
        else {
            var selectedMapID = SharedStateService.getSelectedID("Map")
            if (selectedMapID != null)
                DataTransportService.getMapByID(selectedMapID).then(
                            function (result) {
                                SharedStateService.setSelected("Map", result.data);
                                SharedStateService.Repository.put('Map', result.data);
                                if (result.data.Sites.length > 0) {
                                    SharedStateService.Repository.put("Sites", result.data.Sites)
                                    $scope.SiteList = result.data.Sites;
                                    updateSelectedSite();
                                }
                            },
                            function (error) {

                            }
                    );
        }
    }



    var updateSelectedSite = function () {
        var selectedSiteID = SharedStateService.getSelectedID("Site");
        if (selectedSiteID != null)
            for (var i = 0; i < $scope.SiteList.length; i++) {
                if ($scope.SiteList[i].SiteID == selectedSiteID) {
                    $scope.selectedSite = $scope.SiteList[i];
                    //break;
                }
            }


    }

 



  


    // loading the data if they change sites but stay on the page
    $scope.$watch(
        function (scope) {
            if (SharedStateService.Selected.Site != null)
                return SharedStateService.Selected.Site.SiteID;
        },
        function (newValue, oldValue) {
            if (newValue != null && newValue != oldValue) {
                loadSites();
            }

        });



})