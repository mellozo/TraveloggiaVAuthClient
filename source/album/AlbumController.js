angularTraveloggia.controller('AlbumController', function ( photos,$scope,DataTransportService,SharedStateService,$window) {
  
//loading the data with the router/resolve just to demo different was of doing things
    $scope.PhotoList = photos.data;
   
    $scope.fileToUpload = null;

    $scope.fileNameChanged = function (mel) {
            var files = mel.files;
            var file = null;
            if (files && files.length > 0)
            {
                file = files[0];
                $scope.fileToUpload = file;
               try {
                        // Create ObjectURL
                        var imgURL = $window.URL.createObjectURL(file);
                        angular.element("#imagePreview").attr("src",   imgURL);
                        // Revoke ObjectURL
                        URL.revokeObjectURL(imgURL);
                    }
                    catch (e) {
                        //try {
                        //    // Fallback if createObjectURL is not supported
                        //    var fileReader = new FileReader();
                        //    fileReader.onload = function (event) {
                        //        showPicture.src = event.target.result;
                        //    };
                        //    fileReader.readAsDataURL(file);
                        //}
                        //catch (e) {
                        //    $scope.systemMessage.text = "Neither createObjectURL or FileReader are supported";
                        //    $scope.systemMessage.activate();

                        //}
                    }
             }
    }

    $scope.uploadFile = function () {

        //uploadImage:function(memberID, mapName, siteName, imageFile){
        var memberID = SharedStateService.authenticatedMember.MemberID;
        var mapName = SharedStateService.Selected.Map.MapName;
        var siteName = SharedStateService.Selected.Site.Name;// check that we havent allowed nulls already in which case need to use ids or prevent in all future etc.
        DataTransportService.uploadImage(memberID,mapName,siteName,$scope.fileToUpload);

    }


    // loading the data if they change sites but stay on the page
    // may we say, what an inelegant syntax
    $scope.$watch(
        function (scope) {
            return SharedStateService.Selected.SiteID
        },
        function (newValue, oldValue) {
            if(newValue != oldValue)
            DataTransportService.getPhotos(newValue).then(
                function (result) {
                        $scope.PhotoList = result.data;
                },
                function (error) { }
                );
        }
        );

   

})

