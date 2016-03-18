angularTraveloggia.controller('ToolbarController',  function (SharedStateService,$location) {


    var VM = this;

    VM.SiteList = SharedStateService.Repository.get('Sites')

    VM.selectSite = function (index) {
        var selectedSite = VM.SiteList[index];
        SharedStateService.Selected.Site = selectedSite;
        SharedStateService.Selected.SiteID = selectedSite.SiteID;
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
        $location.path("/Site")
    }

})