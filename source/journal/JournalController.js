

angularTraveloggia.controller('JournalController', function (DataTransportService,canEdit,readOnly,isEditing, $scope,SharedStateService,$location,$route,$timeout,$window,debounce) 
{

    $scope.stateMachine = {
            state:SharedStateService.getAuthorizationState()
            }
    

    var toolbarHeight = 62;//$window.document.getElementById("toolbarRow");
    var viewFrameHeight = $scope.reliableHeight - toolbarHeight;
    $scope.scrollWindowStyle = {
        "height": viewFrameHeight,
        "max-height":viewFrameHeight
    }
    // this is if we are redirecting from html5.traveloggia.net which doesnt have its own journal page
    if ($location.search().MapID != null)
    {
        var mapid = $location.search().MapID;
        var siteid = $location.search().SiteID;
        SharedStateService.readOnlyUser = true;
        SharedStateService.Selected.SiteID = siteid;
        $location.search('MapID', null);
        $location.search('SiteID', null);

        DataTransportService.getMap(mapid).then(
            function (result) {
              var MapRecord = result.data[0];
                SharedStateService.Selected.Map =MapRecord;
                SharedStateService.Repository.put('Map', result.data);
                SharedStateService.Repository.put('Sites', MapRecord.Sites)
            },
        function(error){
            $scope.systemMessage.text = "error fetching journals" + error.data.Message;
            $scope.systemMessage.activate();
        } )
    }
      

  //  $scope.Site = SharedStateService.Selected.Site;

    $scope.JournalEntries = [];
    if (SharedStateService.readOnlyUser == true)
        $scope.canEdit = false;
    else
        $scope.canEdit = true;

    $scope.action = "read";
    $scope.Journal = null;
    $scope.journalIndex = 0;

    // initialize 
    var existingJournals = SharedStateService.Repository.get('Journals');
    if (existingJournals.length > 0 && existingJournals[0].SiteID == SharedStateService.getSelectedID("Site") )
    {
        $scope.JournalEntries = SharedStateService.Repository.get('Journals')
        if ($scope.JournalEntries.length > 0) 
            $scope.Journal = $scope.JournalEntries[0];
       // else
           // $scope.addNew();
    }
    else
    {
        if(SharedStateService.getSelectedID("Site") != null  && SharedStateService.getSelectedID("Site") != "null")
        DataTransportService.getJournals(SharedStateService.getSelectedID("Site")).then(
                    function (result) {
                        $scope.JournalEntries = result.data;
                        if ($scope.JournalEntries.length > 0) {
                            SharedStateService.Repository.put("Journals", result.data);
                            $scope.Journal = $scope.JournalEntries[0];
                        }
                        //else {
                        //    if(SharedStateService.authorizationState == canEdit)
                        //        $scope.addNew();
                        //}
                    },
                    function (error) {
                        $scope.systemMessage.text = "error fetching journals" ;
                        $scope.systemMessage.activate();
                    });
    }


    var journalRedraw = debounce(500, function () {
        if ($location.path() != "/Journal")
            return;
        $window.location.reload();
    });


    if ($scope.Capabilities.cantResize == false)
        $window.addEventListener("resize", journalRedraw)





    $scope.$watch(
        function (scope) {
         if(SharedStateService.Selected.Site != null)
            return SharedStateService.Selected.Site.SiteID;
        },
        function (newValue, oldValue) {
            if (newValue !=null && newValue != oldValue)
            {
                //$scope.Site = SharedStateService.Selected.Site;
                if (SharedStateService.getAuthorizationState() == 'IS_EDITING')
                {
                    SharedStateService.setAuthorizationState(canEdit);
                    $scope.stateMachine.state = canEdit;
                }
                    
                DataTransportService.getJournals(newValue).then(
                 function (result) {
                     SharedStateService.Repository.put("Journals", result.data);
                     $scope.JournalEntries = result.data;
                     if ($scope.JournalEntries.length > 0) {
                         SharedStateService.Repository.put("Journals", result.data);
                         $scope.Journal = $scope.JournalEntries[0];
                     }
                     else
                         $scope.Journal = null;
                 },
                function (error) {
                    $scope.systemMessage.text = "error fetching journals" + error.data.Message;
                    $scope.systemMessage.activate();
                });
            }
        });


    // upon tab change
    $scope.loadContent = function (index) {
        angular.element("#menuToggle").click();
            $scope.Journal = $scope.JournalEntries[index];
            $scope.journalIndex = index;
    }


    $scope.addNew = function () {
        var journal = new Journal();
        journal.SiteID = SharedStateService.getSelectedID("Site");
        var recordDate = new Date(Date.now());
        journal.JournalDate = recordDate.toLocaleDateString();
        journal.MemberID = SharedStateService.getAuthenticatedMemberID();
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
                    $scope.JournalEntries.push(result.data);
                    $scope.journalIndex = $scope.JournalEntries.length - 1;
                    $scope.Journal = $scope.JournalEntries[$scope.journalIndex];
              
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


    $scope.deleteJournal = function () {
        DataTransportService.deleteJournal($scope.Journal.JournalID).then(
                function (result) {
                    $scope.JournalEntries.splice($scope.journalIndex, 1);
                    if($scope.journalIndex != 0)
                    $scope.journalIndex = $scope.journalIndex -1;
                    $scope.Journal = $scope.JournalEntries[$scope.journalIndex];
                    SharedStateService.Repository.put("Journals", $scope.JournalEntries);
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


    $scope.cancelJournal = function () {
         $scope.Journal = $scope.JournalEntries[$scope.journalIndex];
         SharedStateService.setAuthorizationState(canEdit);
         $scope.stateMachine.state = canEdit;

    }


 });

        //$scope.taOptions.toolbar = [
        //   ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
        //   ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
        //   ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
        //   ['html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
        // ];
