angularTraveloggia.controller('SiteController', function (SharedStateService,DataTransportService) {

    var VM = this;
    VM.Site = SharedStateService.liveSite;


    VM.saveSite = function () {

        SharedStateService.Repository.get('Sites').push(VM.Site)

        DataTransportService.addSite(siteRecord).then(
        function (result) {
            $scope.systemMessage.text = "Location saved successfully"
        },
        function (error) {
            $scope.systemMessage.text = "Error saving location";
            //to do log error
        }
        );
        $scope.systemMessage.activate();
       // SharedStateService.unsavedSites.push(VM.Site);
    }

    VM.updateSite = function () {
        DataTransportService.updateSite(siteRecord).then(
                     function (result) {
                         $scope.systemMessage.text = "Location saved successfully";
                         $scope.systemMessage.activate();
                     },
                     function (error) {
                         $scope.systemMessage.text = "Error saving location";
                         $scope.systemMessage.activate();
                         //to do log error
                     }
         );

    }


})