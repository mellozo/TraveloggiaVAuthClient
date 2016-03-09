angularTraveloggia.controller('SiteController', function (SharedStateService) {

    var VM = this;
    VM.Site = SharedStateService.liveSite;


    VM.saveSite = function () {

    SharedStateService.Repository.get('Sites').push(VM.Site)
    SharedStateService.unsavedSites.push(VM.Site);


    }



})