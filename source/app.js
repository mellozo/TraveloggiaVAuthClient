


var sampleApp = angular.module("AngularTraveloggia", ["ngRoute"])

//.controller('SignInController', function ($scope) {

//    //$scope.callTest = function () {

//    //    return DataFactory.test();

//    //}

//    this.suck = "you suck";

//})

// consider file path from the start page AngularMain.html

sampleApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
      when('/SignIn', {
          templateUrl: 'components/signin/SignIn.html'
          //controller: 'SignInController'
      });
  }
]);

