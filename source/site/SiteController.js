angularTraveloggia.controller('SiteController', function (SharedStateService,DataTransportService,$scope,$location,$window) {


    var VM = this;
    VM.SiteList = SharedStateService.Repository.get('Sites');
    VM.Site = SharedStateService.Selected.Site;

    $scope.stateMachine = {
        state: SharedStateService.getAuthorizationState()
    }
  //  $scope.editMode = (SharedStateService.readOnlyUser == false) ? true : false;




    VM.ArrivalDatePickerIsOpen = false;
    VM.DepartureDatePickerIsOpen = false;
    VM.ArrivalDatePickerOpen = function ($event) {
        if ($event) {
            $event.preventDefault();
            $event.stopPropagation(); // This is the magic
        }
        this.ArrivalDatePickerIsOpen = true;
    };

    VM.DepartureDatePickerOpen = function ($event) {
        if ($event) {
            $event.preventDefault();
            $event.stopPropagation(); // This is the magic
        }
        this.DepartureDatePickerIsOpen = true;
    };

  

    VM.saveSite = function () {
     //   VM.cleanupDates();
     //   if (SharedStateService.readOnlyUser == false) {
            if (VM.Site.SiteID == null)
                VM.addSite();
            else
                VM.updateSite();
       // }
        //else {
        //    $scope.systemMessage.text = "Not authorized to edit content"
        //    $scope.systemMessage.activate();
        //}
 
    }

    VM.cleanupDates = function () {
        if (VM.Site.Arrival != null) {
            var momentCleanedDate = moment(VM.Site.Arrival)
            VM.Site.Arrival = momentCleanedDate.format('MM-DD-YYYY');

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
        DataTransportService.updateSite(VM.Site).then(
                     function (result) {
                         $scope.systemMessage.text = "Location edits saved successfully";
                         $scope.systemMessage.activate();
                     },
                     function (error) {
                         $scope.systemMessage.text = "Error saving location";
                         $scope.systemMessage.activate();
                         //to do log error
                     }
         );

    }

    VM.deleteSite = function () {
       
        DataTransportService.deleteSite(VM.Site.SiteID).then(
            function (result) {
                $scope.systemMessage.text = "Location deleted successfully";
                $scope.systemMessage.activate();
            },
            function (error) {
                $scope.systemMessage.text = "Error deleteing location";
                $scope.systemMessage.activate();
            }

            )

    }


    $scope.$watch(
       function (scope) {
           if (SharedStateService.Selected.Site != null)
               return SharedStateService.Selected.Site.SiteID;
       },
       function (newValue, oldValue) {
           if (newValue != null && newValue != oldValue) {
               VM.Site = SharedStateService.Selected.Site;
           }
       });

})