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
            $location.path("/Map").search({}) ;
        }
    }

// goAlbum
    $scope.navigateWindowTwo = function () {
        if ($scope.preview.windowTwo == "album/AlbumPreview.html") {
            $scope.preview.windowTwo= "map/MapPreview.html";
            $scope.preview.windowOne = "site/SitePreview.html";
            $scope.preview.windowThree = "journal/JournalPreview.html";
            $location.path("/Album").search({});
        }
       else if ($scope.preview.windowTwo == "map/MapPreview.html") {
           $scope.preview.windowOne = "site/SitePreview.html";
           $scope.preview.windowTwo = "album/AlbumPreview.html";
           $scope.preview.windowThree = "journal/JournalPreview.html";
           $location.path("/Map").search({});
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
            $location.path("/Map").search({});
       }
    }


    $scope.selectSite = function (site) {
        $scope.selectedSite = site;
        SharedStateService.setSelected("Site", site);
        var currentpath = $location.path();
        $location.path(currentpath).search( {"ZoomIn":"true"});
    }


    $scope.goMap = function () {
        $scope.preview.windowOne = "site/SitePreview.html";
        $scope.preview.windowTwo = "album/AlbumPreview.html";
        $scope.preview.windowThree = "journal/JournalPreview.html";
        $location.path("/Map").search({  }) ;
    }

    $scope.goMapFirstTime = function () {
        $scope.preview.windowOne = "site/SitePreview.html";
        $scope.preview.windowTwo = "album/AlbumPreview.html";
        $scope.preview.windowThree = "journal/JournalPreview.html";
        $location.path("/Map").search({"ZoomOut": "true"});
    }

    $scope.goMapList = function () {
        $location.path("/MapList").search({ "ZoomOut": "true" });
        $scope.preview.windowOne = "map/MapPreview.html";
        $scope.preview.windowTwo = "album/AlbumPreview.html";
        $scope.preview.windowThree = "journal/JournalPreview.html";
        
    }


    $scope.goSiteList = function () {
        $location.path("/SiteList");
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


    // the kickoff
    loadSites();


})