﻿angularTraveloggia.controller("NotificationController", function ($scope, $location, $window,$timeout,$rootScope) {


    $window.beHappy = function () {
      $scope.$broadcast("softIsHere")
    }

//called at the end of this page
    $scope.setDimensions = function () {
        $scope.reliableHeight = $window.innerHeight;
        $scope.reliableWidth = $window.innerWidth;
        $scope.toolbarHeight = 66;// $window.document.getElementById("toolbarRow").offsetHeight;
        var viewFrameHeight = $scope.reliableHeight - $scope.toolbarHeight;
        var viewFrameWidth = $window.document.getElementById("viewFrame").clientWidth;

        $scope.previewPaneStyle = {
            "height":( ($scope.reliableHeight -12  )* .33) -20// .31
        }

        $scope.tableStyle = {
            "height": $scope.reliableHeight
        }

        $scope.previewStyle = {
            "height": $scope.reliableHeight,
            "max-height": $scope.reliableHeight,
        }
        $scope.scrollWindowStyle = {
            "height": viewFrameHeight,
            "max-height": viewFrameHeight
        }

        $scope.windowOneStyle = {
            "max-height": Math.round(($scope.reliableHeight - 36) * .33) - 12,
            "max-width": viewFrameWidth-32
        }

        $timeout($scope.setMapStyle());
    }



  $scope.setMapStyle = function () {
        var vpHeight = $scope.reliableHeight - $scope.toolbarHeight;
        var vpWidth = $scope.reliableWidth
        if (vpWidth > 768)
            vpWidth = vpWidth * .7;

        var viewFrameWidth = $window.document.getElementById("viewFrame").clientWidth;



        var previewMapHeight = $scope.reliableHeight * .31;//(($window.document.getElementById("previewFrame").offsetHeight - 36) * .33) - 8;
        var previewMapWidth = ($scope.reliableWidth * .31) - 32;//$window.document.getElementById("previewFrame").offsetWidth - 24;

        $scope.mapStyle = {
            "height": vpHeight,
            "width": viewFrameWidth 
        }
        $scope.previewMapStyle = {
            "height": ( ($scope.reliableHeight -12  )* .33) -28,
            "width": previewMapWidth
        }
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
        var browserNumber =  parseInt(result.browser.version)
        $scope.Capabilities.alreadyKnowsHow = (result.browser.name == "Mobile Safari" && browserNumber>= 9) ? true : false;
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


  
    // kickoff
    $scope.setDimensions();




});