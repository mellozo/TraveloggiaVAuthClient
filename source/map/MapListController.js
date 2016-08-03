angularTraveloggia.controller("MapListController", function (SharedStateService, $scope, $location, DataTransportService) {


    $scope.loadMapList = function () {
        var cachedMapList = SharedStateService.Repository.get("MapList");
        if (cachedMapList == null || cachedMap.MemberID != SharedStateService.getAuthenticatedMemberID()) {
            DataTransportService.getMapList(SharedStateService.getAuthenticatedMemberID()).then(
                function (result) {
                    $scope.MapList = result.data;
                },
                function (error) {
                    $scope.systemMessage.text = "error loading maps";
                    $scope.systemMessage.activate();
                }
            )// end then
        }
        else {
                $scope.MapList = SharedStateService.Repository.get('MapList');
        }
    }


    $scope.selectMap = function (index) {
        var selectedMap = $scope.MapList[index];
        SharedStateService.setSelected("Map", selectedMap)
        $location.path("/Map");
    }


    $scope.loadMapList();





})