angularTraveloggia.controller('SiteController', function (SharedStateService,DataTransportService,$scope,$location,$window,debounce) {

  
    var VM = this;


    $scope.stateMachine = {
        state: SharedStateService.getAuthorizationState()
    }


    // sorry this is so hideous but angular monster digests the control
    // entirely directives wont help
    $window.setDateTime = function (strDate, prop) {
        if (VM.Site == null)
            return;

        switch (prop) {
            case "Arrival":
                VM.Site.Arrival = strDate;
                break;
            case "Departure":
                VM.Site.Departure = strDate;
                break;
        }
        $scope.$apply();
    }
   


    VM.Site = SharedStateService.Selected.Site;


    if (VM.Site == null) {
        var siteID = SharedStateService.getSelectedID("Site");
        if(siteID != null && siteID != "null")
        DataTransportService.getSiteByID(siteID).then(
            function (result)
            {
                VM.Site = result.data;
            },
            function (error)
            {
                $scope.systemMessage.text = "error reloading site data"
                $scope.systemMessage.activate();
            })


    }


    VM.saveSite = function () {
        if (VM.Site.SiteID == 0)
            VM.addSite();
        else
            VM.updateSite();
    }
 

    VM.addSite = function () {
        VM.Site.SiteID = null;
        DataTransportService.addSite(VM.Site).then(
        function (result) {
            var cachedSites = SharedStateService.Repository.get('Sites');
            cachedSites.push(result.data);
            SharedStateService.Repository.put('Sites', cachedSites);
            SharedStateService.setSelected("Site", result.data);
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


    var deleteSite = function () {
        $scope.ConfirmCancel.isShowing = false;
        DataTransportService.deleteSite(VM.Site.SiteID).then(
            function (result) {
                SharedStateService.deleteFromCache("Sites", "SiteID", VM.Site.SiteID);
                SharedStateService.setSelected("Site",null)
                $scope.systemMessage.text = "Location deleted successfully";
                $scope.systemMessage.activate();
                VM.Site = null;
            },
            function (error) {
                $scope.systemMessage.text = "Error deleteing location";
                $scope.systemMessage.activate();
            }

            )
    }


    //ConfirmCancel Handlers
    var dismiss = function () {
        $scope.ConfirmCancel.isShowing = false;
    }

    VM.confirmDeleteSite = function () {
        $scope.ConfirmCancel.isShowing = true;
    }


    if ($location.path() == "/Site") {
        $scope.ConfirmCancel.question = "Delete Selected Location ?";
        $scope.ConfirmCancel.ccCancel = dismiss;
        $scope.ConfirmCancel.ccConfirm = deleteSite;
    }





    VM.openURL = function () {
        if(VM.Site != null && VM.Site.URL != null)
        $window.open(VM.Site.URL)
    }

    VM.sendEmail = function () {
        $window.open('mailto:'+VM.Site.Email);
    }







    $scope.$watch(
       function (scope) {
           if (SharedStateService.Selected.Site != null)
               return SharedStateService.Selected.Site.Latitude;
           else
               return SharedStateService.Selected.Site;
       },
       function (newValue, oldValue) {
           if ( newValue != oldValue) {
               VM.Site = SharedStateService.Selected.Site;
           }
       });

})