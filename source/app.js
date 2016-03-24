


var angularTraveloggia = angular.module("AngularTraveloggia", ["ngRoute", 'textAngular', 'ui.bootstrap'])



// consider file path from the start page AngularMain.html

angularTraveloggia.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/', {
          // templateUrl: 'site/Site.html'
         templateUrl: 'signin/SignIn.html'      
      
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
             controller: 'AlbumController',
             resolve: { photos: globalBullshit }
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



function globalBullshit(SharedStateService, DataTransportService,$q) {
    var photosDeferred = $q.defer();
    var cachedPhotos = SharedStateService.Repository.get('Photos');
    if (cachedPhotos.length >0) {
        photosDeferred.resolve(cachedPhotos);
    }
    else {
        DataTransportService.getPhotos(SharedStateService.Selected.Site.SiteID).then(
            function (result) {
                photosDeferred.resolve(result.data);
                SharedStateService.Repository.put('Photos', result.data);
            },
            function (error) { })


    }
       
 
    return photosDeferred.promise;
}


