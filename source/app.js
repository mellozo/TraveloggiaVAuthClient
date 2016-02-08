


var angularTraveloggia = angular.module("AngularTraveloggia", ["ngRoute"])



// consider file path from the start page AngularMain.html

angularTraveloggia.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'signin/SignIn.html'
        //controller: 'SignInController'
    })

        .when('/SignIn', {
          templateUrl: 'signin/SignIn.html'
          //controller: 'SignInController'
      })
    .when('/Map', {
        templateUrl: 'map/Map.html'
        //controller: 'SignInController'
    });
  }
]);

