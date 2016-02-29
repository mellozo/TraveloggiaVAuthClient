

angularTraveloggia.controller('JournalController', function (DataTransportService, $scope,SharedStateService) {


    $scope.JournalEntries = [];
    $scope.thewords = "you really really suck"
    $scope.readOnly = true;
    $scope.toolbarOptions = "[ ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote']]"

    DataTransportService.getJournals(SharedStateService.Selected.SiteID).then(
        function (result) {
            $scope.JournalEntries = result.data;
            if ($scope.JournalEntries.length > 0)
                $scope.thewords = $scope.JournalEntries[0].Text;
        },
        function (error) { }
        );
   

    $scope.loadContent = function (index) {
        if ($scope.JournalEntries.length > 0 && index != null)

        $scope.thewords = $scope.JournalEntries[index].Text;
    }

    $scope.addNew = function () {
        $scope.readOnly = false;
        $scope.thewords = "";
    //    $scope.toolbarOptions=[['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
    //  ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
    //  ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
    //  ['html', 'insertImage', 'insertLink', 'insertVideo' ]
    //]


    }

   //$scope.taOptions.toolbar = [
   //   ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
   //   ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
   //   ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
   //   ['html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
   // ];


    //   var myEditor = new dhtmlXEditor("editorObj");

    //})



});

