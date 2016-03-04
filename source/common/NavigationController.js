angularTraveloggia.controller('NavigationController',  function (SharedStateService,$location) {


    var VM = this;

    VM.SiteList = SharedStateService.Repository.get('Sites')

    VM.selectSite = function (index) {
        var selectedSite = VM.SiteList[index];
        SharedStateService.Selected.SiteID = selectedSite.SiteID;

    }

    VM.goJournal = function () {
        $location.path("/Journal");
    }


})