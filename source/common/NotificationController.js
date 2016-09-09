angularTraveloggia.controller("NotificationController", function ($scope, $location, $window) {

    $scope.reliableHeight = $window.innerHeight;
    $scope.reliableWidth = $window.document.documentElement.clientWidth;

    $scope.previewPaneStyle = {
        "height":$scope.reliableHeight *.32
    }
 
   
    $scope.tableStyle = {
        "height": $scope.reliableHeight
       
    }

    $scope.previewStyle = {
        "height": $scope.reliableHeight,
        "max-height": $scope.reliableHeight,
       
    }

  

    // demonstrating use of inherited scope via nested controllers
    // even though some people think this is a big no no
    var isMapPage = ($location.path() == "/Map" || $location.path() == "/") ? true : false;

    var fortyVPHeight = $window.innerHeight * .4
   
    var userAgentParser = new UAParser();
    var result = userAgentParser.getResult();
    var device = new Device();
    device.osName = result.os.name;
    device.osVersion = result.os.version;
    device.browserName = result.browser.name;
    device.browserVersion = result.browser.version;
    device.engineName = result.engine.name;
    device.engineVersion = result.engine.version;
    device.deviceModel = result.device.model;
    device.deviceType = result.device.type;
    device.deviceVendor = result.device.vendor;
    

    $scope.Capabilities = {
        height:$scope.reliableHeight,
        alreadyKnowsHow: false,
        currentDevice: device,
        cantResize:false
    }

    if (result.browser.name != null && result.browser.version != null) {
        $scope.Capabilities.alreadyKnowsHow = (result.browser.name == "Mobile Safari" && result.browser.version == "9.0") ? true : false;
    }

    if (result.os !== null && result.browser != null) {
        $scope.Capabilities.cantResize = (result.os.name == "Windows Phone" && result.browser.version == "11.0") ? true : false;
    }


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