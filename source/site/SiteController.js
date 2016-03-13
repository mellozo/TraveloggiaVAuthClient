angularTraveloggia.controller('SiteController', function (SharedStateService,DataTransportService) {

    var VM = this;
    VM.Site = SharedStateService.liveSite;


    VM.saveSite = function () {
        var siteList = SharedStateService.Repository.get('Sites');
        siteList.push(VM.Site);
        SharedStateService.Repository.put('Sites', siteList);

        DataTransportService.addSite(VM.Site).then(
        function (result) {
            $scope.systemMessage.text = "Location saved successfully"
            $scope.systemMessage.activate();
        },
        function (error) {
            $scope.systemMessage.text = "Error saving location";
            $scope.systemMessage.activate();
            //to do log error
        }
        );
       
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