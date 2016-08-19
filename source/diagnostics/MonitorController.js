angularTraveloggia.controller("MonitorController", function ($scope,DataTransportService,SharedStateService,$window) {




    $scope.submitIssue=function(){

        var deviceWithIssue = $scope.Capabilities.currentDevice;
        deviceWithIssue.windowInnerHeight = $window.innerHeight;
        deviceWithIssue.windowInnerWidth = $window.innerWidth;
        deviceWithIssue.documentElementClientHeight = $window.document.documentElement.clientHeight;
        deviceWithIssue.documentElementClientWidth = $window.document.documentElement.clientWidth;
        deviceWithIssue.MemberID = SharedStateService.getAuthenticatedMemberID();


        DataTransportService.addDevice(deviceWithIssue).then(
            function (result) {
                $scope.systemMessage.text = "device information has been recorded";
                $scope.systemMessage.activate();
            },
            function (error) {
                $scope.systemMessage.text = "error sending device information";
                $scope.systemMessage.activate();
            })

    }


})