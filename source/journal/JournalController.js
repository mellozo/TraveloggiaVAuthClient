

angularTraveloggia.controller('JournalController', function (DataTransportService, $scope,SharedStateService,$location,$route) 
{


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
                SharedStateService.Repository.put('Maps', result.data);
                SharedStateService.Repository.put('Sites', MapRecord.Sites)
            },
        function(error){
            $scope.systemMessage.text = "error fetching journals" + error.data.Message;
            $scope.systemMessage.activate();
        }

            )
 }
      

    $scope.Site = SharedStateService.Selected.Site;
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
    if (existingJournals.length > 0 && existingJournals[0].SiteID == SharedStateService.Selected.Site.SiteID )
    {
        $scope.JournalEntries = SharedStateService.Repository.get('Journals')
        if ($scope.JournalEntries.length > 0) 
            $scope.Journal = $scope.JournalEntries[0];
        else
            $scope.addNew();
    }
    else
    {
        DataTransportService.getJournals(SharedStateService.Selected.SiteID).then(
                    function (result) {
                        $scope.JournalEntries = result.data;
                        if ($scope.JournalEntries.length > 0) {
                            SharedStateService.Repository.put("Journals", result.data);
                            $scope.Journal = $scope.JournalEntries[0];
                        }
                        else{
                          
                                $scope.addNew();

                        }
                           

                    },
                    function (error) {
                        $scope.systemMessage.text = "error fetching journals" + error.data.Message;
                        $scope.systemMessage.activate();
                    });

    }


    $scope.$watch(
        function (scope) {
            return SharedStateService.Selected.SiteID
        },
        function (newValue, oldValue) {
            if (newValue != oldValue)
            {
                //$scope.Site = SharedStateService.Selected.Site;
                DataTransportService.getJournals(newValue).then(
                 function (result) {
                     SharedStateService.Repository.put("Journals", result.data);
                     $scope.JournalEntries = result.data;
                     if ($scope.JournalEntries.length > 0) {
                         SharedStateService.Repository.put("Journals", result.data);
                         $scope.Journal = $scope.JournalEntries[0];
                     }
                     else
                         $scope.addNew();
                 },
                function (error) {
                    $scope.systemMessage.text = "error fetching journals" + error.data.Message;
                    $scope.systemMessage.activate();
                });
            }
        });


    // upon tab change
    $scope.loadContent = function (index) {
            $scope.Journal = $scope.JournalEntries[index];
            $scope.journalIndex = index;
    }

    $scope.addNew = function () {
        if (SharedStateService.readOnlyUser == false)
            $scope.action = "create";

        var journal = new Journal();
        journal.SiteID = SharedStateService.Selected.SiteID;
        var recordDate = new Date(Date.now());
        journal.JournalDate = recordDate.toLocaleDateString();
        journal.MemberID = SharedStateService.authenticatedMember.MemberID;
        $scope.Journal = journal;        
    }

    $scope.saveJournal = function () {
        if ($scope.action=="create")
            DataTransportService.addJournal($scope.Journal).then(
                function (result) {
                    $scope.systemMessage.text = "new journal was saved successfully";
                    $scope.systemMessage.activate();
                    $scope.action = "read";
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
                },
                function (error) {
                    $scope.systemMessage.text = "error saving journal " + error.data.Message;
                    $scope.systemMessage.activate();
                });

       

    }

    $scope.editJournal = function () {

        if (SharedStateService.readOnlyUser == true) {
            $scope.systemMessage.text = "sign in to edit content";
            $scope.systemMessage.activate();
        }
        else
            $scope.action = "edit";
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
                    $scope.action = "read";
                },
                function (error) {
                    $scope.systemMessage.text = "error deleteing journal " + error.data.Message;
                    $scope.systemMessage.activate();
                });

       
    }

    $scope.cancelJournal = function () {
         $scope.Journal = $scope.JournalEntries[$scope.journalIndex];


    }


 });

        //$scope.taOptions.toolbar = [
        //   ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
        //   ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
        //   ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
        //   ['html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
        // ];
