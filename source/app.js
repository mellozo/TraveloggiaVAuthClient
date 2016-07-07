


var angularTraveloggia = angular.module("AngularTraveloggia", ["ngRoute", 'textAngular',  'angulartics', 'angulartics.google.analytics'])

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
    if (cachedPhotos.length >0 && cachedPhotos[0].SiteID == SharedStateService.Selected.Site.SiteID) {
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


