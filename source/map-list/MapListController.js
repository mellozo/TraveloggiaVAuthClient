angularTraveloggia.controller('MapListController', function (DataFactory,$rootScope) {

    var VM = this;

    VM.MapList = [];


    VM.LoadMaps = function(){
        DataFactory.getMaps().then(
            function (result) {
                VM.MapList = result.data;
            },
            function (error) {
                alert("you suck")
                //todo - move logging to its own service
            }
        );

    }


    //if (VM.MapList.length == 0)
    //    VM.LoadMaps();


});