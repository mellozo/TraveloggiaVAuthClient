angularTraveloggia.controller('SiteController', function (SharedStateService,DataTransportService,$scope,$location) {

    var VM = this;
    VM.Site = SharedStateService.Selected.Site;


    VM.saveSite = function () {
        if (SharedStateService.readOnlyUser == false) {
            if (VM.Site.SiteID == null)
                VM.addSite();
            else
                VM.updateSite();
        }
        else {
            $scope.systemMessage.text = "Not authorized to edit content"
            $scope.systemMessage.activate();
        }
 
    }

    VM.addSite = function () {
        DataTransportService.addSite(VM.Site).then(
        function (result) {
            var cachedSites = SharedStateService.Repository.get('Sites');
            cachedSites.push(result.data);
            SharedStateService.Repository.put('Sites', cachedSites);
            SharedStateService.Selected.Site = result.data;
            SharedStateService.Selected.SiteID = result.data.SiteID;
            // invalidate cache of child records
            SharedStateService.Repository.put('Photos', []);
            SharedStateService.Repository.put('Journals', []);
            $scope.systemMessage.text = "Location saved successfully"
            $scope.systemMessage.activate();
            $location.path("/Album");
        },
        function (error) {
            $scope.systemMessage.text = "Error saving location";
            $scope.systemMessage.activate();
            //to do log error
        }
        );


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


    $scope.$watch(
       function (scope) {
           return SharedStateService.Selected.SiteID;
       },
       function (newValue, oldValue) {
           if (newValue != oldValue)
               VM.Site = SharedStateService.Selected.Site;
       });

})