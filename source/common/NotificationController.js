angularTraveloggia.controller("NotificationController", function ($scope,$location,$window) {

    // demonstrating use of inherited scope via nested controllers
    // even though some people think this is a big no no
    var isMapPage = ($location.path() == "/Map" || $location.path() == "/") ? true : false;

    var fortyVPHeight = $window.innerHeight * .4
   

    $scope.systemMessage = {
        cover: false,
        text: "",
        dismiss: function(){
            this.cover = false;
        },
        activate:function(){
            this.cover=true;
        },
        loadComplete:isMapPage?false:true
    };


  





});