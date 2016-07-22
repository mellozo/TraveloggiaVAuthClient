angularTraveloggia.controller('ToolbarController',  function (SharedStateService,$scope,$location,$window,$http,$timeout) {

    $scope.Diagnostics={
        innerHeight: $window.innerHeight,
        innerWidth: $window.innerWidth,
        buttonWidth:null,
        vpHeight: null,
        toolButtonStyle: {
            'width': '17%',
            'height': 'auto',
            'max-width': '62px'//,
            //'outline':'dotted 2px red'
        }


    }


    $scope.selectedState = {
        mapSelected: $location.path() == "/Map" ? true:false,
        albumSelected: $location.path() == "/Album" ? true : false,
        journalSelected: $location.path() == "/Journal" ? true : false,
        siteSelected: $location.path() == "/Site" ? true : false,
        maplistSelected: $location.path() == "/MapList" ? true : false,
        sitelistSelected:$location.path()=="/SiteList"?true:false
    }

    var VM = this;




    // this is an actual utility function 
   VM.debounce= function (func, wait, immediate) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };


   $scope.afterLoadAndRender = function () {
       if ($http.pendingRequests.length > 0) {
           $timeout($scope.afterLoadAndRender); // Wait for all templates to be loaded
       }
       else {
     // 
           //var w = angular.element($window);
           //w.bind('resize', VM.debounce($scope.redrawData,40));
           //$scope.redrawData();
       }
   };


   $scope.redrawData = function () {
       $scope.Diagnostics.innerHeight = $window.innerHeight;
       $scope.Diagnostics.innerWidth = $window.innerWidth;

       var x = ( 16 * $window.innerWidth )/ 100;
       var buttonWidth = Math.round(x);
       buttonWidth = (buttonWidth < 62) ? buttonWidth : 62;
       buttonWidth = buttonWidth + "px";
       
       $scope.Diagnostics.toolButtonStyle = {
           'max-width': buttonWidth,
           'height': 'auto',
           'margin': '0px',
           'padding':'0px'
       }

       $scope.Diagnostics.buttonWidth = buttonWidth;
       $scope.$digest();
    
   }

    VM.SiteList = SharedStateService.Repository.get('Sites')

    VM.selectSite = function (index) {
        var selectedSite = VM.SiteList[index];
        SharedStateService.Selected.Site = selectedSite;
        SharedStateService.Selected.SiteID = selectedSite.SiteID;
    }

    VM.beNice = function () {
        x = y
    }

    VM.goJournal = function () {
        $location.path("/Journal");
    }

    VM.goAlbum = function () {
        $location.path("/Album");
    }

    VM.goMap = function () {
        $location.path("/Map")
    }

    VM.goSite = function () {
        $location.path("/Site")
    }

    VM.goSiteList = function () {
        $location.path("/SiteList")
    }


    $scope.afterLoadAndRender();

})