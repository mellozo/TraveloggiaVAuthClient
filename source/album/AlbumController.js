

angularTraveloggia.controller('AlbumController', function ($scope, $location, $route, DataTransportService, SharedStateService, $window,debounce) {

   
    $scope.stateMachine = {
        state: SharedStateService.getAuthorizationState()
    }

    var toolbarHeight = 66;
    $scope.viewFrameWidth = $window.document.getElementById("viewFrame").clientWidth;
    $scope.viewFrameHeight = ($window.document.getElementById("viewFrame").clientHeight) - toolbarHeight;
    var widthMinusPad = $scope.viewFrameWidth - 36;
    var heightMinusPad = $scope.viewFrameHeight - 32;

    if ($location.path() == "/Album") {
        // offset includes the border and scrollbars - not the margin
        // clientWidth is just the inner content - not scroll bars
        var scrollContainer = $window.document.getElementById("albumScrollContainer")
        var scrollWidth = 24;//scrollContainer.offsetWidth -scrollContainer.clientWidth;
        var widthMinusPadScroll = widthMinusPad - scrollWidth ;
        var widthMinusPadScrollBorder = widthMinusPadScroll - 14;

        $scope.landscapeImageStyle = {
            "width": widthMinusPadScrollBorder
        };

        //$scope.portaitImageStyle = {
        //    "height": heightMinusPad,
        //    "width": widthMinusPadScrollBorder
        //}

    }
    else if ($location.path() == "/Photo") {

        $scope.landscapeImageStyle = {
            "width": widthMinusPad
        };

        $scope.portaitImageStyle = {
            "height": heightMinusPad,
            "width": widthMinusPad
        }


    }
    else {// PREVIEW 
       var previewWidth = $window.document.getElementById("previewFrame").offsetWidth;
       var previewHeight = ( ($scope.reliableHeight -12  )* .33) -28


        $scope.previewImageStyle = {
            "height": previewHeight,
            "width": previewWidth - 32
        }
    }
  
 


    $scope.imageServer = "https://s3-us-west-2.amazonaws.com/traveloggia-guests/";

    $scope.imagePath = SharedStateService.getAuthenticatedMemberID() +"/" + SharedStateService.getSelectedMapName() + "/";

    var randomDate = new Date();
    $scope.imageRefresher ={
        queryString:   "?reload=" + Math.random()
        
    }

    var cachedPhotos = SharedStateService.Repository.get('Photos');

    if (cachedPhotos.length > 0 && cachedPhotos[0].SiteID == SharedStateService.getSelectedID("Site"))
    {
        $scope.PhotoList = cachedPhotos;
        $scope.selectedPhoto = SharedStateService.getSelectedPhoto();
        if ($scope.selectedPhoto == null) {
            SharedStateService.setSelected("Photo", $scope.PhotoList[0]);
          

        }
    }
    else if (SharedStateService.getSelectedID("Site") != null ){
        DataTransportService.getPhotos(SharedStateService.getSelectedID("Site")).then(
            function (result) {
                $scope.PhotoList = result.data;
                SharedStateService.Repository.put('Photos', result.data);
                $scope.selectedPhoto = SharedStateService.getSelectedPhoto();
                if ($scope.selectedPhoto == null) {
                    SharedStateService.setSelected("Photo", $scope.PhotoList[0]);
                
                }
            },
            function (error) { })
    }


    $scope.dontAsk = function (event) {
        var loadedImage = event.target;
        var origH = loadedImage.height;
        var origW = loadedImage.width;
        var maxH = heightMinusPad;
        var maxW = ($location.path() == "/Album") ? widthMinusPadScrollBorder : widthMinusPad;
        var w = calculateAspectRatio(origH, origW, maxH, maxW)
        if(w != maxW)
        {
            w= w + "px"
            loadedImage.style.width = w;
        }

    }


    var calculateAspectRatio = function (origH, origW, maxH, maxW) {
        var orientation = (origH >= origW) ? "portrait" : "landscape";
        switch (orientation) {
            case "landscape":
                var landscapeWidth = maxW;
                var lStyle = {"width":landscapeWidth}
                var calculatedHeight = (origH * maxW) / origW;
                if (calculatedHeight > maxH) {
                    var calculatedWidth = (maxH * origW) / origH;
                    landscapeWidth = Math.round(calculatedWidth);
                }
                return landscapeWidth
               $scope.whateverStyle.width = landscapeWidth;
                break;

            case "portrait":
                var portraitHeight = maxH;
                var portraitWidth = null;
        
                var pStyle = {
                    "height": portraitHeight,
                    "width":portraitWidth
                }
                var calculatedWidth = (maxH * origW) / origH;
                
                if (calculatedWidth > maxW) {
                    var calculatedHeight = (origH * maxW) / origW;
                    portraitHeight = Math.round(calculatedHeight);
                    portraitWidth = maxW;
                }
                else
                    portraitWidth = calculatedWidth;

                return portraitWidth;
                $scope.whateverStyle.height = pStyle;
                break;
        }
    }


    // rotates image if nescessary 
    $scope.onImageLoad = function (e, orientationID) {
        var loadedImage = e.target;
        var degrees = 0;
        var maxHeight =0
        var maxWidth = 0
        if ($location.path() == "/Album") {
            var scrollContainer = $window.document.getElementById("albumScrollContainer")
            var scrollWidth = scrollContainer.offsetWidth - scrollContainer.clientWidth;
            var widthMinusPadScroll = widthMinusPad - scrollWidth;
            var widthMinusBorderBackground = widthMinusPadScroll - 14;
            maxHeight = heightMinusPad;
            maxWidth = widthMinusBorderBackground;

            }
        else if ($location.path()=="/Photo"){
            maxHeight = heightMinusPad;
            maxWidth = widthMinusPad;
        }
          
        else
             maxHeight = Math.round($window.document.getElementById("previewFrame").offsetWidth *.20)

        var scaledWidth = maxHeight;
        var height = loadedImage.height;
        var width = loadedImage.width;
        var x;

        //   height/width = x/maxHeight;
      //  height * scaledWidth = x * width;
        x = (height * scaledWidth) / width;
        if (x > maxWidth) {
            var y=0;
            //height/width =  maxWidth/y
         //  height * y = maxWidth * width
            y = (width * maxWidth) / height;
            scaledWidth = y;
            x =maxWidth;

        }
        var canvas = loadedImage.parentNode.getElementsByTagName("canvas")[0];
        var ctx = canvas.getContext("2d");
       ctx.save();
     
       canvas.width = x;
        canvas.height =scaledWidth;
       // ctx.drawImage(loadedImage, 0,0,scaledWidth, x);
        ctx.restore();

        switch (orientationID) {
            case 1:
                degrees = 0;
                break;
            case 2:
                degrees = 0;
                break;
            case 3:
                degrees = 180;
                break;
            case 4:
                degrees = 0;
                break;
            case 5:
                degrees = 90;
                ctx.translate(width / 2, height / 2);
                ctx.rotate(degrees * Math.PI / 180);
                var moveLeft = ((width / 2) -(height / 2)) * 2
                ctx.translate(0, moveLeft)
                ctx.drawImage(loadedImage, -height / 2, -width / 2, width, height);
                break;
            case 6:
                ctx.save();
                degrees = 90;
                ctx.translate(scaledWidth / 2, x / 2);
                ctx.rotate(degrees * Math.PI / 180);
                var moveLeft = ((scaledWidth / 2) - (x / 2)) * 2
                ctx.translate(0, moveLeft)
                ctx.drawImage(loadedImage, -x / 2, -scaledWidth / 2, scaledWidth, x);
                ctx.restore();
                break;
                //degrees = 90;
                //ctx.translate(width / 2, height / 2);
                //ctx.rotate(degrees * Math.PI / 180);
                //var moveLeft = ((width / 2) - (height / 2)) * 2
                //ctx.translate(0, moveLeft)
                //ctx.drawImage(loadedImage, -height / 2, -width / 2, width, height);
                //break;
            case 7:
                ctx.save();
                degrees = -90;
                degrees = -90;
                ctx.translate(scaledWidth / 2, x / 2);
                ctx.rotate(degrees * Math.PI / 180);
                var moveDown = ((scaledWidth / 2) - (x / 2)) * 2
                ctx.translate(-moveDown, 0)
                ctx.drawImage(loadedImage, -x / 2, -scaledWidth / 2, scaledWidth, x);
                ctx.restore();
                break;
                //degrees = -90;
                //degrees = -90;
                //ctx.translate(width / 2, height / 2);
                //ctx.rotate(degrees * Math.PI / 180);
                //var moveDown = ((width / 2) - (height / 2)) * 2
                //ctx.translate(-moveDown, 0)
                //ctx.drawImage(loadedImage, -height / 2, -width / 2, width, height);
                //break;
            case 8:
                ctx.save();
                degrees = -90;
                ctx.translate(scaledWidth / 2, x / 2);
                ctx.rotate(degrees * Math.PI / 180);
                var moveDown = ((scaledWidth / 2) - (x / 2)) * 2
                ctx.translate(-moveDown, 0)
                ctx.drawImage(loadedImage, -x / 2, -scaledWidth / 2, scaledWidth, x);
                ctx.restore();
                break;
                //degrees = -90;
                //ctx.translate(width / 2, height / 2);
                //ctx.rotate(degrees * Math.PI / 180);
                //var moveDown = ((width / 2) - (height / 2)) * 2
                //ctx.translate(-moveDown, 0)
                //ctx.drawImage(loadedImage, -height/2, -width/2, width, height);
                //break;
        }



    }


    $scope.selectPhoto = function (photo) {
        SharedStateService.setSelected("Photo", photo);
        $scope.selectedPhoto = photo;
        $location.path("/Photo");
    }

  
    // loading the data if they change sites but stay on the page
    $scope.$watch(
        function (scope) {
            if(SharedStateService.Selected.Site != null)
            return SharedStateService.Selected.Site.SiteID;
        },
        function (newValue, oldValue) {
            if (newValue != null && newValue != oldValue)
            {
                $scope.PhotoList = [];
                DataTransportService.getPhotos(newValue).then(
                function (result) {
                    $scope.PhotoList = result.data;
                        SharedStateService.setSelected("Photo", $scope.PhotoList[0]);
                     
                },
                function (error) { }
                );
            }
               
        });


    $scope.$watch(
         function (scope) {
             if (SharedStateService.Selected.Map != null)
                 return SharedStateService.Selected.Map.MapName;
         },
         function (newValue, oldValue) {
             if (newValue != null && newValue != oldValue) 
                 $scope.imagePath = SharedStateService.getAuthenticatedMemberID() +"/" + SharedStateService.getSelectedMapName() + "/";
            
         });




    //******************single photo edit page 

    $scope.deletePhoto = function () {
        DataTransportService.deletePhoto($scope.selectedPhoto.PhotoID).then(
            function (result) {
                var cachedPhotos = SharedStateService.Repository.get('Photos');
                for (var i = 0; i < cachedPhotos.length; i++) {
                    if (cachedPhotos[i].PhotoID == $scope.selectedPhoto.PhotoID) {
                        cachedPhotos.splice(i, 1);
                        break;
                    }
                }
                $scope.systemMessage.text = "selected photo has been deleted";
                $scope.systemMessage.activate();
                $location.path("/Album");
            },
            function (error) {
                $scope.systemMessage.text = "error deleting photo record";
                $scope.systemMessage.activate();
            }
            )
    }










    //**************************upload functionality todo:move to its own page
    $scope.filesToUpload = null;

    $scope.photoRecords = [];

    // upon selecting file to upload
    $scope.fileNameChanged = function (mel) {
        var files = mel.files;
        if (files && files.length > 0) {
            // store file objects to be passed to http => aws
            $scope.filesToUpload = files;

            //display selected files in preview pane ( this will change ) 
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                // use the image loader componenet
                onFileSelected(file);
            }
        }
    }

    // used to display in preview pane
    function replaceResults(img) {
        var content
        if (!(img.src || img instanceof HTMLCanvasElement)) {
            content = $('<span>Loading image file failed</span>')
        } else {

            content = $('<a target=_blank>').append(img)
              .attr('download', currentFile.name)
              .attr('href', img.src || img.toDataURL())
        }
        var previewContainer = angular.element("#previewPanel");
        previewContainer.append(content);

    }

    // used to display in preview pane
    function displayImage(file, options) {
        currentFile = file
        if (!loadImage(
            file,
            replaceResults,
            options
          )) {
            result.children().replaceWith(
              $('<span>Your browser does not support the URL or FileReader API.</span>')
            )
        }
    }


    // displays in preview pane and creates record with exif data
    function onFileSelected(file) {
        var options = {
            maxWidth: 80,
            maxHeight: 80,
            canvas: true,
            pixelRatio: window.devicePixelRatio,
            downsamplingRatio: 0.5
        }

        loadImage.parseMetaData(file, function (data) {
            var exifData = null;
            var orientationID = null;
            if (data.exif) {
                options.orientation = data.exif.get('Orientation');
                exifData = data.exif.getAll();
                orientationID = options.orientation
            }
            var dbRecord = createPhotoRecord(file.name, exifData, orientationID);
            // store in associative array so that at the right time ( after sucessful upload) we can post the record to db 
            $scope.photoRecords.push(dbRecord);
            displayImage(file, options)
        })
    }

    $scope.filesUploadedCount = 0;

    var createPhotoRecord = function (fileName, exif, orientationID) {
        var photoRecord = new Photo();
        photoRecord.SiteID = SharedStateService.getSelectedID("Site");
        photoRecord.StorageURL = $scope.imageServer;
        photoRecord.FileName = fileName;
        if (exif != null) {
            photoRecord.orientation = exif.orientation;
            photoRecord.orientationID = orientationID;

            // "YYYY:MM:DD HH:MM:SS" with time shown in 24-hour format, 
            // and the date and time separated by one blank character (hex 20).
            // will somebody just shoot me?
            var stringDateMess = exif.DateTimeOriginal;
            var justDate = stringDateMess.split(" ")[0];
            var ymd = justDate.split(":");
            var justTime = stringDateMess.split(" ")[1];
            var jsMonth = parseInt(ymd[1]) - 1;
            var hms = justTime.split(":");
         //   var hours = hms[0] > 12? parseInt(hms[0])-12:hms[0]
            var jsDate = new Date(ymd[0], jsMonth, ymd[2], hms[0], hms[1], hms[2]);
            var jsDateUTC = jsDate.toUTCString();

            photoRecord.DateTaken = jsDateUTC;
        }
        return photoRecord;
    }

    $scope.handleUploadClick = function () {
        $scope.systemMessage.text = "working...";
        $scope.systemMessage.activate();

        uploadFile();

    }

    $scope.UTCtoLocal = function (utc) {
        var localDate = Date.parse(utc)
        return localDate;

    }

    $scope.updatePhoto = function () {
        DataTransportService.updatePhoto($scope.selectedPhoto).then(
             function (result) {
                 $scope.systemMessage.text = " photo updated successfully";
                 $scope.systemMessage.activate();
             },
              function (error) {
                  $scope.systemMessage.text = "error updating photo record";
                  $scope.systemMessage.activate();
              }
             );

    }

   
    var uploadFile = function () {
        var memberID = SharedStateService.getAuthenticatedMemberID();
        var mapName = SharedStateService.getSelectedMapName();
        for (var i = 0; i < $scope.filesToUpload.length; i++) {
            (function (imageFile, fileName, photoRecord) {
                var fileName = imageFile.name
                var photoRecord = getObjectByProperty($scope.photoRecords, "FileName", fileName);
                DataTransportService.uploadImage(memberID, mapName, imageFile).then(
                                 function (result) {
                                     $scope.addPhotoRecord(photoRecord);
                                 },
                                 function (error) {
                                     $scope.systemMessage.text = "error uploading photo";
                                     $scope.systemMessage.activate();
                                 });
            })($scope.filesToUpload[i])

        }
        if ($scope.filesToUpload.length == $scope.filesUploadedCount) {
            if ($scope.filesUploadedCount == 1)
                $scope.systemMessage.text = "photo was uploaded successfuly"
            else if ($scope.filesUploadedCount > 1)
                $scope.systemMessage.text = $scope.filesUploadedCount + " photos were uploaded successfuly"
            $scope.systemMessage.activate();
        }

    }

    getObjectByProperty = function (list, property, value) {
        var obj = null;
        for (var i = 0; i < list.length; i++) {
            if (list[i][property] == value) {
                obj = list[i];
                break;
            }
        }
        return obj;
    }

    $scope.addPhotoRecord = function (photoRecord) {
        DataTransportService.addPhoto(photoRecord).then(
            function (result) {
                var cachedPhotos = SharedStateService.Repository.get('Photos');
                cachedPhotos.push(result.data);
                SharedStateService.Repository.put('Photos', cachedPhotos);
                $scope.filesUploadedCount = $scope.filesUploadedCount + 1;
                // $route.reload();
            },
            function (error) {
                $scope.systemMessage.text = "error adding photo record";
                $scope.systemMessage.activate();
            });
    }


    $scope.$watch(
       function (scope) {
           return $scope.filesUploadedCount
       },
       function (newValue, oldValue) {
           if ($scope.filesToUpload && newValue == $scope.filesToUpload.length) {
               if ($scope.filesUploadedCount > 1)
                   $scope.systemMessage.text = $scope.filesUploadedCount + " photos uploaded successfully";
               else
                   $scope.systemMessage.text = " photo uploaded successfully";

               $scope.systemMessage.activate();
               $scope.filesToUpload = null;
               $scope.filesUploadedCount = 0;
               $route.reload();
           }
       }
       );



})

