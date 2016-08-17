angularTraveloggia.controller('ToolbarController',  function (SharedStateService,DataTransportService,$scope,$location,$window,$http,$timeout) {

 

    $scope.selectedState = {
        mapSelected: $location.path() == "/Map" ? true:false,
        albumSelected: $location.path() == "/Album" ? true : false,
        journalSelected: $location.path() == "/Journal" ? true : false,
        siteSelected: $location.path() == "/Site" ? true : false,
        maplistSelected: $location.path() == "/MapList" ? true : false,
        sitelistSelected:$location.path()=="/SiteList"?true:false
    }

    var VM = this;
    VM.selectedSite = {
        name:""
    }
    VM.SiteList = [];

    var cachedSites =  SharedStateService.Repository.get('Sites');
    if (cachedSites != null && cachedSites.length > 0 )
        VM.SiteList = cachedSites;
    else {
        var selectedMapID = SharedStateService.getSelectedID("Map")
        if(selectedMapID != null)
        DataTransportService.getMapByID(selectedMapID).then(
                    function (result) {
                        
                        SharedStateService.setSelected("Map", result.data);
                        SharedStateService.Repository.put('Map', result.data);
                        if (result.data.Sites.length > 0) {
                            SharedStateService.Repository.put("Sites", result.data.Sites)
                            VM.SiteList = result.data.Sites;
                        }
                    },
                    function (error) {

                    }
            );
    }


    var selectedSiteID = SharedStateService.getSelectedID("Site");

    if(selectedSiteID != null)
    for (var i = 0; i < VM.SiteList.length; i++) {
        if (VM.SiteList[i].SiteID == selectedSiteID) {
            VM.selectedSite = VM.SiteList[i];
            //break;
        }
    }



    VM.selectSite = function (index) {
        var selectedSite = VM.SiteList[index];
        VM.selectedSite = selectedSite;
        SharedStateService.setSelected("Site", selectedSite);
       
    }

    

    VM.goJournal = function () {
        $location.path("/Journal");
    }

    VM.goAlbum = function () {
        $location.path("/Album");
    }

    VM.goMap = function () {
        $location.path("/Map")
    }

    VM.goSite = function () {
        $location.path("/Site");
    }

    VM.goSiteList = function () {
        $location.path("/SiteList");
    }

    VM.goMapList = function () {
        $location.path("/MapList");
    }



    // loading the data if they change sites but stay on the page
    $scope.$watch(
        function (scope) {
            if (SharedStateService.Selected.Site != null)
                return SharedStateService.Selected.Site.SiteID;
        },
        function (newValue, oldValue) {
            if (newValue != null && newValue != oldValue) {
                for (var i = 0; i < VM.SiteList.length; i++) {
                    if (VM.SiteList[i].SiteID == newValue)
                        VM.selectedSite = VM.SiteList[i];
                    break;
                }

            }

        });


})