angularTraveloggia.controller('ToolbarController',  function (SharedStateService,DataTransportService,$rootScope, $scope,$location,$window,$http,$timeout,$templateCache) {

  
    $scope.$on("sitesLoaded", function (event, data) {
        loadSites();
    })

    $scope.preview = {
        windowOne: "",
        windowTwo: "",
        windowThree:""
    }

    $scope.Swap = {
        Map:true
    }


   
    $scope.$on(
                   "$routeChangeSuccess",
                   function handleRouteChangeEvent(event) {

                       // show search on map page
                       if ($location.path() == "/" || $location.path() == "/Map")
                           $scope.Swap.Map = true;
                       else
                           $scope.Swap.Map = false;



                       if ($window.innerWidth <=768) {
                           $scope.preview.windowOne = "";
                           $scope.preview.windowTwo = "";
                           $scope.preview.windowThree = "";

                        
                       }
                       else {
                           switch ($location.path()) {

                               case "/Map":
                                   $scope.preview.windowOne = "site/SitePreview.html";
                                   $scope.preview.windowTwo = "album/AlbumPreview.html";
                                   $scope.preview.windowThree = "journal/JournalPreview.html";
                                   break;

                               case "/MapList":
                                   $scope.Swap.Map = false;
                                   $scope.preview.windowOne = "map/MapPreview.html";
                                   $scope.preview.windowTwo = "album/AlbumPreview.html";
                                   $scope.preview.windowThree = "journal/JournalPreview.html";
                                   break;

                               case "/Album":
                               case "/Photo":
                                   $scope.Swap.Map = false;
                                   $scope.preview.windowOne = "map/MapPreview.html";
                                   $scope.preview.windowTwo = "site/SitePreview.html";
                                   $scope.preview.windowThree = "journal/JournalPreview.html";
                                   break;
                               case "/Site":
                                   $scope.Swap.Map = false;
                                   $scope.preview.windowOne = "map/MapPreview.html";
                                   $scope.preview.windowTwo = "album/AlbumPreview.html";
                                   $scope.preview.windowThree = "journal/JournalPreview.html";
                                   break;
                               case "/Journal":
                                   $scope.Swap.Map = false;
                                   $scope.preview.windowOne = "map/MapPreview.html";
                                   $scope.preview.windowTwo = "album/AlbumPreview.html";
                                   $scope.preview.windowThree = "site/SitePreview.html";
                                   break;

                               default:
                                   $scope.Swap.Map = true;
                                   $scope.preview.windowOne = "site/SitePreview.html",
                                    $scope.preview.windowTwo = "album/AlbumPreview.html",
                                    $scope.preview.windowThree = "journal/JournalPreview.html"
                           }

                       }

                        
                   }
               );




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

        if (currentpath == "/Photo")
            currentpath = "/Album"
        $location.path(currentpath).search({ });
       // $location.path(currentpath).search( {"ZoomIn":"true"});
    }


    $scope.goMap = function () {
        $location.path("/Map").search({  }) ;
    }



    $scope.openSearch=function(){
        $scope.$broadcast("searchClicked")

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
                    break;
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