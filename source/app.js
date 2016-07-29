


var angularTraveloggia = angular.module("AngularTraveloggia", ["ngRoute", 'ngCookies', 'textAngular', 'angulartics', 'angulartics.google.analytics'])

//angularTraveloggia.config(['angularBingMapsProvider', function (angularBingMapsProvider) {
//    angularBingMapsProvider.setDefaultMapOptions({
//        credentials: 'AnDSviAN7mqxZu-Dv4y0qbzrlfPvgO9A-MblI08xWO80vQTWw3c6Y6zfuSr_-nxw',
//        enableClickableLogo: false
//    });
//    angularBingMapsProvider.bindCenterRealtime(false);
//}]);

// consider file path from the start page AngularMain.html

angularTraveloggia.config(['$routeProvider', function ($routeProvider, $analyticsProvider) {
    $routeProvider
        .when('/', {
          // templateUrl: 'site/Site.html'
         templateUrl: 'map/Map.html'      
      
        })

         .when('/Test', {
          templateUrl:'common/TestPage.html'
         })


        .when('/SignIn', {
          templateUrl: 'signin/SignIn.html'          
        })

        .when('/CreateAccount', {
            templateUrl: 'signin/SignIn.html',
            isCreate:true
        })

        .when('/Map', {
            templateUrl: 'map/Map.html',
            controller:'MapController'
        })

           .when('/Site', {
               templateUrl: 'site/Site.html',
               controller: 'SiteController'
           })

// just to demonstrate use of resolve in routing
// you must specify controller here - not optional as in html binding
// note resolve = {} and the object has string property and promise value 
         .when('/Album', {
             templateUrl: 'album/Album.html',
             controller: 'AlbumController'
         })

           .when('/Photo', {
               templateUrl: 'album/Photo.html',
               controller: 'AlbumController'            
           })

          .when('/Journal', {
              templateUrl: 'journal/Journal.html'
          })

        .when('/JournalEdit', {
            templateUrl: 'journal/JournalEditCreate.html'
        })

        .when('/MapList', {
            templateUrl: 'map/MapList.html',
            controller: 'MapController'
       
        })

    .when('/SiteList', {
        templateUrl: 'site/SiteList.html',
        controller: 'SiteController'
       
    });
  }
]);

angularTraveloggia.constant("readOnly", "READ_ONLY");
angularTraveloggia.constant("canEdit", "CAN_EDIT");
angularTraveloggia.constant("isEditing", "IS_EDITING")

angularTraveloggia.directive('onLoad', ['$parse', function ($parse) {
     return {
         restrict: 'A',
         link: function (scope, elem, attrs) {
             var fn = $parse(attrs.onLoad);
             elem.on('load', function (event) {
                 scope.$apply(function () {
                     fn(scope, { $event: event });
                 });
             });
         }
     };
 }]);

