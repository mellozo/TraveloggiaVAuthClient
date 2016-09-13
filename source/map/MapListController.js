angularTraveloggia.controller("MapListController", function (SharedStateService, $scope, $location, DataTransportService) {


    $scope.selectedState = {
        addSelected: false,
        editSelected: false,
        deleteSelected:  false,
        siteSelected: false,
        facebookSelected:  false,
        emailSelected:  false
    }

    $scope.selectedMap = null;

    $scope.selectMap=function(map){
        $scope.selectedMap= map;
    }

    $scope.shareFaceBook = function () {


    }


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


    $scope.switchMap = function (index) {
        var selectedMap = $scope.MapList[index];
        SharedStateService.setSelected("Map", selectedMap);
        SharedStateService.Repository.put("Sites", []);
        SharedStateService.Repository.put("Map", null);
        SharedStateService.Repository.put("Journals", []);
        SharedStateService.Repository.put("Photos",[])
        $location.path("/Map");
    }


    $scope.loadMapList();





})