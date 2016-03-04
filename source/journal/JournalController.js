

angularTraveloggia.controller('JournalController', function (DataTransportService, $scope,SharedStateService,$location,$route) {


    $scope.JournalEntries = SharedStateService.Repository.get("Journals");
    if ($scope.JournalEntries.length == 0 )
        DataTransportService.getJournals(SharedStateService.Selected.SiteID).then(
            function (result) {
                $scope.JournalEntries = result.data;
                if ($scope.JournalEntries.length > 0)
                {
                    $scope.loadContent(0);
                    SharedStateService.Repository.put("Journals",result.data);
                }
                   
            },
            function (error) { }
            );

    $scope.thewords = "you really really suck"

  
    var editable = SharedStateService.Repository.get('liveJournal')
    if (editable != null)
        $scope.liveJournal = editable;
  
  
    $scope.toolbarOptions = "[['h1', 'h2', 'h3'],['bold', 'italics', 'underline','clear'],  ['html',  'insertLink' ]]"

    $scope.loadContent = function (index) {
        if ($scope.JournalEntries.length > 0 && index != null)
            $scope.thewords = $scope.JournalEntries[index].Text;
        $scope.liveJournal = $scope.JournalEntries[index];
    }

    $scope.addNew = function () {
        var journal = new Journal();
        journal.SiteID = SharedStateService.Selected.SiteID;
        var recordDate = new Date(Date.now());
        journal.JournalDate = recordDate.toLocaleDateString();
        journal.MemberID = SharedStateService.authenticatedMember.MemberID;
        SharedStateService.Repository.put('liveJournal',journal)
        $location.path("/JournalEdit");
    }

    $scope.saveJournal = function () {
  
        if ($scope.liveJournal.JournalID == null)// its create
            DataTransportService.addJournal($scope.liveJournal).then(
                function (result) {
                    $scope.systemMessage.text = "new journal was saved successfully";
                    $scope.systemMessage.activate();
                },
                function (error) {
                    $scope.systemMessage.text = "error saving journal" + error.data.Message;
                    $scope.systemMessage.activate();
                }
                );
        else // its update
            DataTransportService.updateJournal($scope.liveJournal).then(
                function (result) {
                    $scope.systemMessage.text = "journal edit was saved successfully";
                    $scope.systemMessage.activate();
                },
                function (error) {
                    $scope.systemMessage.text = "error saving journal" + error.data.Message;
                    $scope.systemMessage.activate();
                }
                );

    }

    $scope.editJournal = function () {
        SharedStateService.Repository.put('liveJournal', $scope.liveJournal)
        $location.path("/JournalEdit");

    }

   //$scope.taOptions.toolbar = [
   //   ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
   //   ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
   //   ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
   //   ['html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
   // ];



});

