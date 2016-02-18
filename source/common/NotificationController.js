angularTraveloggia.controller("NotificationController", function ($scope, SharedState) {

  

    $scope.systemMessage = "you suck"
    $scope.systemMessageStyle = { "display": "none" };

    $scope.showSystemMessage = function (message) {
        $scope.systemMessageStyle = { "display": "inline-block" };
        $scope.systemMessage = message;
    }



   

    $scope.dismissSystemMessage = function () {
        $scope.systemMessageStyle = { "display": "none" };
    }








});