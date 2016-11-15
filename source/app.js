


var angularTraveloggia = angular.module("AngularTraveloggia", ["ngRoute", 'ngCookies', 'textAngular', 'rt.debounce', 'angulartics', 'angulartics.google.analytics']);

// consider file path from the start page AngularMain.html
angularTraveloggia.config(['$routeProvider', function ($routeProvider, $analyticsProvider) {
    $routeProvider
        .when('/', {
          // templateUrl: 'site/Site.html'
         templateUrl: 'map/Map.html'      
      
        })

         .when('/Monitor', {
          templateUrl:'diagnostics/Monitor.html'
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
            controller: 'MapListController'
       
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

angularTraveloggia.run(function ($rootScope) {
    $rootScope.$on('$locationChangeSuccess', function (event, url, oldUrl, state, oldState) {
            $rootScope.selectedState = {
                mapSelected: (url.lastIndexOf("/") == url.length - 1 || url.indexOf("/Map") > 0) ? true : false,
                albumSelected: url.indexOf("/Album") > 0 ? true : false,
                journalSelected: url.indexOf("/Journal") > 0 ? true : false,
                siteSelected: url.indexOf("/Site") > 0 ? true : false,
                mapListSelected: url.indexOf("/MapList") > 0 ? true : false,
                sitelistSelected: url.indexOf("/SiteList") > 0 ? true : false,
                signInSelected: url.indexOf("/SignIn") > 0 ? true : false,
                createSelected: url.indexOf("/CreateAccount") > 0 ? true : false
            };
      
       
    });
});


// used by the photos on load to determine size and orientation
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

