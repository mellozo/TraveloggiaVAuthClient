


var angularTraveloggia = angular.module("AngularTraveloggia", ["ngRoute"])



// consider file path from the start page AngularMain.html

angularTraveloggia.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'signin/SignIn.html'
          
        })

        .when('/SignIn', {
          templateUrl: 'signin/SignIn.html'
          
        })

        .when('/CreateAccount', {
            templateUrl: 'signin/SignIn.html',
            isCreate:true
        })

        .when('/Map', {
            templateUrl: 'map/Map.html'
           
        })

    .when('/MapList', {
        templateUrl: 'map/MapList.html',
        controller: 'MapController'
       
    });
  }
]);

