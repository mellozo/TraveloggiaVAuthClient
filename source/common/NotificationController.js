angularTraveloggia.controller("NotificationController", function ($scope, $location, $window) {



    // demonstrating use of inherited scope via nested controllers
    // even though some people think this is a big no no
    var isMapPage = ($location.path() == "/Map" || $location.path() == "/") ? true : false;

    var fortyVPHeight = $window.innerHeight * .4
   
    var userAgentParser = new UAParser();
    var result = userAgentParser.getResult();
    $scope.Capabilities = {
        alreadyKnowsHow: false
    } 
    if( result.browser.name != null && result.browser.version != null)
   $scope.Capabilities.alreadyKnowsHow = (result.browser.name=="Mobile Safari" && result.browser.version=="9.0")? true:false;



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