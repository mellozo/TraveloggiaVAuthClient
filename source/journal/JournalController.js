

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
      

    $scope.JournalEntries = [];  
    $scope.Journal = null;
    $scope.journalIndex = 0;

    // initialize 
    $scope.JournalEntries = SharedStateService.getItemFromCache('Journals')
   
    if ($scope.JournalEntries != null && $scope.JournalEntries.length > 0) 
   {
        $scope.Journal = $scope.JournalEntries[0];
    }
    else
    {
       
        if(SharedStateService.getItemFromCache("Site") != null  && SharedStateService.getItemFromCache("Site") != "null")
        DataTransportService.getJournals(SharedStateService.getItemFromCache("Site").SiteID).then(
                    function (result) {
                        $scope.JournalEntries = result.data;
                        if ($scope.JournalEntries.length > 0) {
                            SharedStateService.setSelectedAsync("Journals", result.data);
                            $scope.Journal = $scope.JournalEntries[0];
                        }
                    },
                    function (error) {
                        $scope.systemMessage.text = "error fetching journals" ;
                        $scope.systemMessage.activate();
                    });
    }




    // upon tab change
    $scope.loadContent = function (index) {
        angular.element("#menuToggle").click();
            $scope.Journal = $scope.JournalEntries[index];
            $scope.journalIndex = index;
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
        $scope.stateMachine.state = isEditing;
    }


    $scope.saveJournal = function () {
        if ($scope.Journal.JournalID == null)
            DataTransportService.addJournal($scope.Journal).then(
                function (result) {
                    $scope.systemMessage.text = "new journal was saved successfully";
                    $scope.systemMessage.activate();
                    $scope.action = "read";
                    SharedStateService.setAuthorizationState(canEdit);
                    $scope.stateMachine.state = canEdit;
                    SharedStateService.addToCacheAsync("Journals", result.data);
                    $scope.JournalEntries = SharedStateService.getItemFromCache("Journals")
              
                },
                function (error) {
                    $scope.systemMessage.text = "error saving journal " + error.data.Message;
                    $scope.systemMessage.activate();
                }
                );
        else // its update
            DataTransportService.updateJournal($scope.Journal).then(
                function (result) {
                    $scope.systemMessage.text = "journal edit was saved successfully";
                    $scope.systemMessage.activate();
                    $scope.action = "read";
                    SharedStateService.setAuthorizationState(canEdit);
                    $scope.stateMachine.state = canEdit;
                },
                function (error) {
                    $scope.systemMessage.text = "error saving journal " + error.statusText;
                    $scope.systemMessage.activate();
                });
    }


    $scope.editJournal = function () {
            $scope.action = "edit";
            SharedStateService.setAuthorizationState(isEditing);
            $scope.stateMachine.state = isEditing;
    }


    var deleteJournal = function () {
        $scope.ConfirmCancel.isShowing = false;
        DataTransportService.deleteJournal($scope.Journal.JournalID).then(
                function (result) {
                    SharedStateService.deleteFromCacheAsync("Journals","JournalID",$scope.Journal.JournalID)
                    $scope.JournalEntries = SharedStateService.getItemFromCache("Journals");
                    SharedStateService.setSelectedAsync("Journal",null)
                    $scope.Journal = null;
                    $scope.systemMessage.text = "journal deleted successfully";
                    $scope.systemMessage.activate();
                 //   $scope.action = "read"; deprecated
                    SharedStateService.setAuthorizationState(canEdit);
                    $scope.stateMachine.state = canEdit;
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
         $scope.Journal = $scope.JournalEntries[$scope.journalIndex];
         SharedStateService.setAuthorizationState(canEdit);
         $scope.stateMachine.state = canEdit;

    }






    $scope.$watch(
        function (scope) {
            var value = SharedStateService.getItemFromCache("Site");
            return (value != null) ? value.SiteID : null;
        },
        function (newValue, oldValue) {
            if (newValue != oldValue) 
            {
                if (newValue != null){
                    DataTransportService.getJournals(newValue).then(
                     function (result) {
                         $scope.JournalEntries = result.data;
                         if ($scope.JournalEntries.length > 0) {
                             SharedStateService.Repository.put("Journals", result.data);
                             $scope.Journal = $scope.JournalEntries[0];
                         }
                     },
                     function (error) {
                         $scope.systemMessage.text = "error fetching journals" + error.data.Message;
                         $scope.systemMessage.activate();
                     });
                }
                else {
                    SharedStateService.setSelectedAsync("Journals",null);
                    SharedStateService.setSelectedAsync("Journal", null);
                    $scope.Journal = null;
                    $scope.JournalEntries = null;
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
