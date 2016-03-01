

angularTraveloggia.controller('JournalController', function (DataTransportService, $scope,SharedStateService,$location) {


    $scope.JournalEntries = SharedStateService.Repository.get("Journals");
    if ($scope.JournalEntries.length == 0)

        DataTransportService.getJournals(SharedStateService.Selected.SiteID).then(
            function (result) {
                $scope.JournalEntries = result.data;
                if ($scope.JournalEntries.length > 0)
                {
                    $scope.thewords = $scope.JournalEntries[0].Text;
                    SharedStateService.Repository.put("Journals",result.data);
                }
                   
            },
            function (error) { }
            );

    $scope.thewords = "you really really suck"

    var journal = new Journal();
    journal.SiteID = SharedStateService.Selected.SiteID;
    var recordDate = new Date(Date.now());
    journal.JournalDate = recordDate.toLocaleDateString();
    journal.MemberID = SharedStateService.authenticatedMember.MemberID;
   
    $scope.liveJournal = journal;
  
    $scope.toolbarOptions = "[['h1', 'h2', 'h3'],['bold', 'italics', 'underline','clear'],  ['html',  'insertLink' ]]"

    $scope.loadContent = function (index) {
        if ($scope.JournalEntries.length > 0 && index != null)
        $scope.thewords = $scope.JournalEntries[index].Text;
    }

    $scope.addNew = function () {
        $scope.thewords = "";
        $location.path("/JournalEdit");
        
   


    }

    $scope.saveJournal = function () {
        $scope.liveJournal.Text = $scope.thewords;

        DataTransportService.addJournal($scope.liveJournal).then(
            function (result) {

            },
            function (error) {
                $scope.systemMessage.text = "error saving journal" + error.data.Message;

                $scope.systemMessage.activate();
            }

            );

    }

   //$scope.taOptions.toolbar = [
   //   ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
   //   ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
   //   ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
   //   ['html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
   // ];



});

