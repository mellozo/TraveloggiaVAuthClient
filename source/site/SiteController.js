angularTraveloggia.controller('SiteController', function (SharedStateService,DataTransportService,$scope,$location,$window,debounce) {


    $window.dropIt = function(ctrl) {
        if ($("#" + ctrl)[0]._flatpickr == null)
            $("#" + ctrl).flatpickr(
                      {
                          enableTime: true,
                          allowInput: false,
                         // dateFormat: 'M j Y  h:i',
                          dateFormat: 'm /d /Y  h:i',
                          onChange: function (selectedDates, dateStr, instance) {
                              setDateTime(dateStr, ctrl)
                          }
                      });

        $("#"+ctrl)[0]._flatpickr.toggle();
          
    }

    // sorry this is so hideous but angular monster digests the control
    // entirely directives wont help
    $window.setDateTime = function (strDate, prop) {
        if (VM.Site == null)
            return;
        $scope.$apply(function () {
            switch (prop) {
                case "Arrival":
                    VM.Site.Arrival = strDate;
                    break;
                case "Departure":
                    VM.Site.Departure = strDate;
                    break;
            }
        })
    }
  


    if ($location.path() == "/Site") {
        $scope.ConfirmCancel.question = "Delete Selected Location ?";
        $scope.ConfirmCancel.ccCancel = dismiss;
        $scope.ConfirmCancel.ccConfirm = deleteSite;
    }

    $scope.stateMachine = {
        state: SharedStateService.getAuthorizationState()
    }


    $scope.makeDate=function(strDate){
        if(strDate != null)
        return new Date(strDate);
    }

    $scope.updateModel=function(event){
        var el = event.target;
    }
   



    var makeDates = function (site) {
        if (site.Arrival != null)
            site.Arrival = new Date(site.Arrival);

        if (site.Departure != null)
            site.Departure = new Date(site.Departure)

    }



    var VM = this;
  
    VM.Site =SharedStateService.getItemFromCache("Site");
    if(VM.Site != null)
        makeDates(VM.Site)

 
    var fetchSiteByID = function () {
        DataTransportService.getSiteByID(siteID).then(
    function (result) {
        VM.Site = result.data;
        makeDates(VM.Site)
    },
    function (error) {
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
            SharedStateService.addToCacheAsync("Sites", result.data, function () {
                SharedStateService.setSelectedAsync("Site", result.data);
                // invalidate cache of child records
                SharedStateService.clearSiteChildren();
                $scope.systemMessage.text = "Location saved successfully"
                $scope.systemMessage.activate();
                $location.path("/Album");
            })
           
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
                         SharedStateService.updateCacheAsync("Sites", "SiteID", VM.SiteID, VM.Site, function (error) {
                             if (error == null) {
                                
                                 $scope.systemMessage.text = "Location edits saved successfully";
                                 $scope.systemMessage.activate();
                             }
                         })
                     },
                     function (error) {
                         $scope.systemMessage.text = "Error saving location";
                         $scope.systemMessage.activate();
                     }
         );
    }


    var deleteSite = function () {
        $scope.ConfirmCancel.isShowing = false;
        DataTransportService.deleteSite(VM.Site.SiteID).then(
            function (result) {
                SharedStateService.deleteFromCacheAsync("Sites", "SiteID", VM.Site.SiteID, function () {
                    SharedStateService.setSelectedAsync("Site", null)
                    SharedService.clearSiteChildren();
                    $scope.systemMessage.text = "Location deleted successfully";
                    $scope.systemMessage.activate();
                    VM.Site = null;
                })
              
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




    VM.openURL = function () {
        if(VM.Site != null && VM.Site.URL != null)
        $window.open(VM.Site.URL)
    }

    VM.sendEmail = function () {
        $window.open('mailto:'+VM.Site.Email);
    }







    $scope.$watch(
       function (scope) {
           var value = SharedStateService.getItemFromCache("Site");
           return value;
       },
       function (newValue, oldValue) {
           if ( newValue != oldValue) {
               VM.Site = newValue
           }
       },true);

})