

angularTraveloggia.controller('JournalController', function (DataTransportService,canEdit,readOnly,isEditing, $scope,SharedStateService,$location,$route,$timeout,$window,debounce) 
{
   
    $scope.stateMachine = {
            state:SharedStateService.getAuthorizationState()
    }
 
    // this is if we are redirecting from html5.traveloggia.net which doesnt have its own journal page
    if ($location.search().SiteID!= null)
    {
        var mapid = $location.search().MapID;
        var siteid = $location.search().SiteID;
        SharedStateService.readOnlyUser = true;
        // to do this will need a call to the DB
        SharedStateService.Selected.SiteID = siteid;
        $location.search('MapID', {});
        $location.search('SiteID', {});

        DataTransportService.getMap(mapid).then(
            function (result) {
              var MapRecord = result.data[0];
              SharedStateService.setSelectedAsync("Map", MapRecord);
            },
        function(error){
            $scope.systemMessage.text = "error fetching journals with mapid " + error.data.Message;
            $scope.systemMessage.activate();
        } )
    }
      

    var clearJournals = function () {
        SharedStateService.setSelectedAsync("Journals", null);
        SharedStateService.setSelectedAsync("Journal", null);
        $scope.Journal = null;
        $scope.JournalEntries = null;

        }


    var fetchJournals = function (siteID) {    
        DataTransportService.getJournals(siteID).then(
                    function (result) {
                        if (result.data.length > 0) {
                            $scope.Journal = result.data[0];
                            SharedStateService.setSelectedAsync("Journal", $scope.Journal)
                            $scope.JournalEntries = result.data;
                            SharedStateService.setSelectedAsync("Journals", result.data);
                        }
                    },
                    function (error) {
                        $scope.systemMessage.text = "error fetching journals";
                        $scope.systemMessage.activate();
                    });
     
}

   



    // upon tab change
    $scope.loadContent = function (index) {
        angular.element("#menuToggle").click();
            $scope.Journal = $scope.JournalEntries[index];
           SharedStateService.setSelectedAsync("Journal",$scope.Journal)
    }


    $scope.addNew = function () {
        var journal = new Journal();
        journal.SiteID = SharedStateService.getItemFromCache("Site").SiteID;
        var recordDate = new Date(Date.now());
        journal.JournalDate = recordDate.toLocaleDateString();
        journal.MemberID = SharedStateService.getAuthenticatedMemberID();
        journal.Title = null;
        $scope.Journal = journal;
        SharedStateService.setAuthorizationState(isEditing);
    }


    $scope.saveJournal = function () {
        if ($scope.Journal.JournalID == null)
            DataTransportService.addJournal($scope.Journal).then(
                function (result) {
                    $scope.Journal = result.data;
                    $scope.action = "read";
                    SharedStateService.setAuthorizationState(canEdit);
                    SharedStateService.addToCacheAsync("Journals", result.data);
                    SharedStateService.setSelectedAsync("Journal", result.data);
                    $scope.JournalEntries = SharedStateService.getItemFromCache("Journals")
                    $scope.systemMessage.text = "new journal was saved successfully";
                    $scope.systemMessage.activate();
                },
                function (error) {
                    $scope.systemMessage.text = "error saving journal " + error.data.Message;
                    $scope.systemMessage.activate();
                }
                );
        else // its update
            DataTransportService.updateJournal($scope.Journal).then(
                function (result) {
                    $scope.action = "read";
                    SharedStateService.setAuthorizationState(canEdit);
                    SharedStateService.updateCacheAsync("Journals", "JournalID", $scope.Journal.JournalID, $scope.Journal);
                    SharedStateService.setSelectedAsync("Journal", result.data);
                    $scope.JournalEntries = SharedStateService.getItemFromCache("Journals");
                    $scope.systemMessage.text = "journal edit was saved successfully";
                    $scope.systemMessage.activate();
                },
                function (error) {
                    $scope.systemMessage.text = "error saving journal " + error.statusText;
                    $scope.systemMessage.activate();
                });
    }


    $scope.editJournal = function () {
            $scope.action = "edit";
            SharedStateService.setAuthorizationState(isEditing);
    }


    var deleteJournal = function () {
        $scope.ConfirmCancel.isShowing = false;
        DataTransportService.deleteJournal($scope.Journal.JournalID).then(
                function (result) {                    
                    SharedStateService.deleteFromCacheAsync("Journals","JournalID",$scope.Journal.JournalID)
                    $scope.JournalEntries = SharedStateService.getItemFromCache("Journals");
                    SharedStateService.setSelectedAsync("Journal",null)
                    $scope.Journal = null;
                    SharedStateService.setAuthorizationState(canEdit);
                    $scope.systemMessage.text = "journal deleted successfully";
                    $scope.systemMessage.activate();

                },
                function (error) {
                    $scope.systemMessage.text = "error deleteing journal " + error.data.Message;
                    $scope.systemMessage.activate();
                });
    }




    //ConfirmCancel Handlers
    var dismiss = function () {
        $scope.ConfirmCancel.isShowing = false;
    }

    $scope.confirmDeleteJournal = function () {
        $scope.ConfirmCancel.isShowing = true;
    }


    if ($location.path() == "/Journal") {
        $scope.ConfirmCancel.question = "Delete Selected Journal ?";
        $scope.ConfirmCancel.ccCancel = dismiss;
        $scope.ConfirmCancel.ccConfirm = deleteJournal;
    }


    $scope.cancelJournal = function () {
         $scope.Journal = SharedStateService.getItemFromCache("Journal")
         SharedStateService.setAuthorizationState(canEdit);
    }



    $scope.$watch(
        function (scope) {
            var value = SharedStateService.getAuthorizationState();
            return value;
        },
        function (newValue, oldValue) {
            if (newValue != oldValue) {
                $scope.stateMachine.state = newValue;
            }
        });



    $scope.$watch(
        function (scope) {
            var value = SharedStateService.getItemFromCache("Site");
            if (value == "null")
                value =null;
            return (value != null) ? value.SiteID : null;
        },
        function (newValue, oldValue) {
            if (newValue != oldValue) 
            {
                if (newValue != null)
                fetchJournals(newValue);
                else
                clearJournals();
            }
            else {
                if ($scope.JournalEntries == null) {
                    $scope.JournalEntries = SharedStateService.getItemFromCache('Journals');
                    var selectedJournal = SharedStateService.getItemFromCache("Journal");
                    if(selectedJournal != null)
                        $scope.Journal = selectedJournal
                    else
                    {
                        $scope.Journal = $scope.JournalEntries[0];
                        SharedStateService.setSelectedAsync("$scope.Journal")

                    }
            }
                    
            }
              
          
        });






});














        //$scope.taOptions.toolbar = [
        //   ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
        //   ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
        //   ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
        //   ['html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
        // ];
