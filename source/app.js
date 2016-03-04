


var angularTraveloggia = angular.module("AngularTraveloggia", ["ngRoute", 'textAngular'])



// consider file path from the start page AngularMain.html

angularTraveloggia.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'signin/SignIn.html'
           
        })

          .when('/Journal', {
              templateUrl: 'journal/Journal.html'

          })
           .when('/JournalEdit', {
               templateUrl: 'journal/JournalEditCreate.html'

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

// just to demonstrate use of resolve in routing
// you must specify controller here - not optional as in html binding
// note resolve = {} and the object has string property and promise value 
         .when('/Album', {
             templateUrl: 'album/Album.html',
             controller:'AlbumController',
             resolve:{photos: globalBullshit}
         })

        .when('/MapList', {
            templateUrl: 'map/MapList.html',
            controller: 'MapController'
       
        });
  }
]);


function globalBullshit(SharedStateService,DataTransportService) {
    return DataTransportService.getPhotos(SharedStateService.Selected.SiteID)
}

