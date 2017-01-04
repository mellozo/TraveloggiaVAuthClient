/// <reference path="C:\Traveloggia Experimental\TraveloggiaVAuthClient\source\common/SharedStateService.js" />


angularTraveloggia.controller('AlbumController', function ($scope, $location, $route, DataTransportService, SharedStateService, $window,debounce,$timeout) {
   
    $scope.stateMachine = {
        state: SharedStateService.getAuthorizationState()
    }

    $scope.previewImage = {
        Url: "../image/sail.jpeg",
        useCanvas:false
    }
  
    var toolbarHeight = 66;
    $scope.viewFrameWidth = $window.document.getElementById("viewFrame").clientWidth;
    $scope.viewFrameHeight = ($window.document.getElementById("viewFrame").clientHeight) - toolbarHeight;
    var widthMinusPad = $scope.viewFrameWidth - 36;
    var heightMinusPad = $scope.viewFrameHeight - 32;
    var scrollContainer = $window.document.getElementById("albumScrollContainer")
    var scrollWidth = 24;//scrollContainer.offsetWidth -scrollContainer.clientWidth;
    var widthMinusPadScroll = widthMinusPad - scrollWidth ;
    var widthMinusPadScrollBorder = widthMinusPadScroll - 14;
    var previewWidth = $window.document.getElementById("previewFrame").offsetWidth;
    var previewHeight = ( ($scope.reliableHeight -12  )* .33) -28

    $scope.previewImageStyle = {
        "height": previewHeight,
        "width": previewWidth - 32
    }


    $scope.imageServer = "https://s3-us-west-2.amazonaws.com/traveloggia-guests/";
 

    $scope.selectPhoto = function (photo) {
        $scope.selectedPhoto = photo;
        SharedStateService.setSelectedAsync("Photo", photo);
        $location.path("/Photo");
    }


    var onPageLoad = function () {
        $scope.photoReady = false;
       if($scope.PhotoList ==null ||$scope.PhotoList.length == null)
           loadPhotos()
    }


    var loadPhotos = function () {
        var cachedPhotos = SharedStateService.getItemFromCache('Photos');
        var selectedSite = SharedStateService.getItemFromCache("Site");
      
        if (cachedPhotos != null && cachedPhotos.length > 0 && cachedPhotos[0].SiteID == selectedSite.SiteID) {
            $scope.PhotoList = cachedPhotos;
            preloadImagesSequentially(0);
            preparePreviewImage($scope.PhotoList[0]);
            $scope.selectedPhoto = SharedStateService.getItemFromCache("Photo");
            if ($scope.selectedPhoto == null) {
                SharedStateService.setSelectedAsync("Photo", $scope.PhotoList[0]);
                $scope.selectedPhoto = $scope.PhotoList[0];
            }
         
        }
        else if (SharedStateService.getItemFromCache("Site") != null) {
            var siteID = SharedStateService.getItemFromCache("Site").SiteID
            DataTransportService.getPhotos(siteID).then(
                function (result) {
                    $scope.PhotoList = result.data;
                    SharedStateService.setSelectedAsync('Photos', result.data);
                    if (result.data.length > 0) {
                        preloadImagesSequentially(0);
                        preparePreviewImage($scope.PhotoList[0]);
                        $scope.selectedPhoto = $scope.PhotoList[0];
                        SharedStateService.setSelectedAsync("Photo", $scope.PhotoList[0]);
                      
                    }

                },
                function (error) {
                    $scope.systemMessage.text = "Error loading photos";
                    $scope.systemMessage.activate();

                })
        }

    }


    var updateImagePath = function () {
        if (SharedStateService.getItemFromCache("Map") == null)
            return;
        var mapName = SharedStateService.getItemFromCache("Map").MapName;
        var mapID = SharedStateService.getItemFromCache("Map").MapID
        $scope.oldImagePath = "http://www.traveloggia.net/upload/" + SharedStateService.getAuthenticatedMemberID() + "/" + mapName + "/";
        $scope.imagePath = SharedStateService.getAuthenticatedMemberID() + "/" + mapID + "/";
    }


    var getImageURL = function (pic) {
        if (pic == null)
            return;
        updateImagePath();
        var theImageURL = (pic.StorageURL != null) ? $scope.imageServer + $scope.imagePath + pic.FileName : $scope.oldImagePath + pic.FileName;
        return theImageURL;
    }


    var preparePreviewImage = function (Photo) {

        var rotate = needsRotation(Photo);
      
        if (rotate == true) {
            var canvas = $window.document.getElementById("previewCanvas")
            var offlineImg = new Image();
            var earl = $scope.getImageSource(Photo);
            offlineImg.onload = function () {
                $scope.$apply(function () {
                    doRotation(Photo, canvas);
                    $scope.previewImage.useCanvas = true;
                });
            }
            offlineImg.src = earl;
       
        }
        else {
            $scope.previewImage.useCanvas = false;
            var offlineImg = new Image();
            var earl = $scope.getImageSource(Photo);
            offlineImg.onload = function () {
                $scope.$apply(function () {
                    $scope.previewImage.Url = earl;
                  
                });
            }
            offlineImg.src = earl;
             

        }
     
    }


    // called by injectCanvas
    var doRotation = function ( Photo,canvas) {
        var orientationID = Photo.orientationID;
        var loadedImage = new Image();
        loadedImage.src = getImageURL(Photo);
        loadedImage.height = Photo.Height;
        loadedImage.width = Photo.Width;

        var degrees = 0;
        var maxHeight = 0
        var maxWidth = 0
        if ($location.path() == "/Album") {
            var scrollContainer = $window.document.getElementById("albumScrollContainer")
            var widthMinusPadScroll = widthMinusPad - scrollWidth;
            var widthMinusBorderBackground = widthMinusPadScroll - 14;
            maxHeight = heightMinusPad;
            maxWidth = widthMinusBorderBackground;
        }
        else if ($location.path() == "/Photo") {
            maxHeight = heightMinusPad;
            maxWidth = widthMinusPad - scrollWidth;
        }
        else//preview frame rotation?
        {
                maxHeight = $scope.previewPaneStyle.height;
                maxWidth = $scope.previewMapWidth;
        }

        var scaledWidth = maxHeight;
        var height = Photo.Height;
        var width = Photo.Width;
        var x;
        x = (height * scaledWidth) / width;
        if (x > maxWidth) {
            var y = 0;
            y = (width * maxWidth) / height;
            scaledWidth = y;
            x = maxWidth;
        }

        //var canvasElement = false;
        //var canvas = null;
        //canvas = $window.document.getElementById("previewCanvas");
        //if (canvas == null)
        //    canvas = $window.document.getElementById("photoCanvas")
        //if (canvas == null) {
        //    canvasElement = true;
        //    canvas = $window.document.createElement("canvas")
        //}
        var ctx = canvas.getContext("2d");
        ctx.save();
        canvas.width = x;
        canvas.height = scaledWidth;// adding 10 for border... which was previously padding
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
                var w = maxWidth;
                var h = (maxWidth * loadedImage.height) / loadedImage.width;
                canvas.width = w
                canvas.height = h
                ctx.translate(w / 2, h / 2)// move the origin to the center of the canvas so rotate will rotate around the center
                ctx.rotate(degrees * Math.PI / 180);
                ctx.drawImage(loadedImage, -w / 2, -h / 2, w, h);//specify starting coords ( back out from the center to get upper left corner )
                break;
            case 4:
                degrees = 0;
                break;
            case 5:
                degrees = 90;
                ctx.translate(width / 2, height / 2);
                ctx.rotate(degrees * Math.PI / 180);
                var moveLeft = ((width / 2) - (height / 2)) * 2
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

        }


        //if (canvasElement == true)
        //    return canvas;

    }


    // called by  calculateImageWidth
    var calculateAspectRatio = function (origH, origW, maxH, maxW) {
        var orientation = (origH >= origW) ? "portrait" : "landscape";
        switch (orientation) {
            case "landscape":
                var landscapeWidth = maxW;
                var lStyle = { "width": landscapeWidth }
                var calculatedHeight = (origH * maxW) / origW;
                if (calculatedHeight > maxH) {
                    var calculatedWidth = (maxH * origW) / origH;
                    landscapeWidth = Math.round(calculatedWidth);
                }
                return { "width": landscapeWidth, "height": "" }
                break;

            case "portrait":
                var portraitHeight = maxH;
                var portraitWidth = null;
                var pStyle = {
                    "height": portraitHeight,
                    "width": portraitWidth
                }
                var calculatedWidth = (maxH * origW) / origH;

                if (calculatedWidth > maxW) {
                    var calculatedHeight = (origH * maxW) / origW;
                    portraitHeight = Math.round(calculatedHeight);
                    portraitWidth = maxW;
                }
                else
                    portraitWidth = calculatedWidth;
                return { "width": portraitWidth, "height": portraitHeight }
                break;
        }
    }


// called by get Image style
    var calculateImageWidth = function (Photo) {
        if (Photo == null)
            return;
        if (Photo.Height == null || Photo.Width == null)
            return;
        var origH = Photo.Height;
        var origW = Photo.Width;
        var maxH = heightMinusPad;
        // add preview image width
        var maxW = ($location.path() == "/Album") ? widthMinusPadScrollBorder : widthMinusPadScroll;
        var dimensions = calculateAspectRatio(origH, origW, maxH, maxW)
        if (dimensions.width == null)
            dimensions={"width":maxW}
        return dimensions;
    }




    $scope.getImageSource = function (Photo) {
        return getImageURL(Photo)
    }


    // called by getImageStyle
    var needsRotation = function (pic) {
        if (pic == null)
            return;
        var doRotation = false;
        if (pic.orientationID == null)
            pic.orientationID = 0;
        switch (pic.orientationID) {
            case 3:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
                if ($scope.Capabilities.alreadyKnowsHow == false) {
                    doRotation = true;
                }
                break;
            default:
                ;
        }
        return doRotation;
    }



    // called by album.html
    $scope.getImageStyle = function (Photo, index) {
        var rotate = needsRotation(Photo);
        if (rotate != true) {
            style = calculateImageWidth(Photo);
        }
            return style;
        }

    var rotatedImages = [];
    var preloadImagesSequentially = function (start) {
        rotatedImages = new Array($scope.PhotoList.length)
        if ($location.path() == "/Album") 
        {
            for (var i = 0; i <= $scope.PhotoList.length; i++) {
                var pic = $scope.PhotoList[i];
                var theImageURL = getImageURL(pic)
                var img = new Image();
                img.src = theImageURL;
              
            }

        }
      
    }


    $scope.processImage = function (event, Photo) {
        var imageEl = event.target;
        var waitingImg = imageEl.parentNode.getElementsByTagName("img")[0];
        var canvas = imageEl.parentNode.getElementsByTagName("canvas")[0];
        var mustRotate = needsRotation(Photo);
     
            waitingImg.style.display = "none"
            if (mustRotate) {
                doRotation(Photo, canvas)
                canvas.style.display="inline-block"
            }
            else
            imageEl.style.display="inline-block"

    }



  
///***WATCH SITE ID*****/
    $scope.$watch(
        function (scope) {
            var value=SharedStateService.getItemFromCache("Site")
            if (value == "null")
                value = null;
            return (value==null)?null:value.SiteID;
        },
        function (newValue, oldValue) {
            if (newValue != oldValue)
            {
                $scope.previewImage.Url="../image/sail.jpeg"
                $scope.previewImage.notReady = true;
                // its worth it to clear the scope because images take so long to load, looks better empty than with the wrong one
                // to do... there should be a splash image to go in fast and fix page load woes
                $scope.PhotoList = [];
                SharedStateService.setSelectedAsync("Photos", null);
                $scope.selectedPhoto = null;
                if (newValue != null) {
                  updateImagePath();// only nescessary if map has been switched but simultaneous watchers causing error ( now )
                    loadPhotos();

                }
            
             }
        });

   
  

    //var injectCanvas = function (canvasEl, index) {
    //    var frames = $window.document.getElementsByClassName("monkey")
    //    var parent = frames[index];
    //    if (parent != null) {
    //        // parent.style.height = canvasEl.height + "px";
    //        parent.innerHTML = "";
    //        parent.appendChild(canvasEl);
    //        //if (SharedStateService.getAuthorizationState() == "CAN_EDIT" && $location.path() == "/Album")
    //        //    $window.document.getElementById("albumScroller").scrollTop = 62;
    //    }
    //    //else 
    //    //{
    //    //    $timeout( function () 
    //    //                    {
    //    //                        console.log("frame for canvas " + index + " was null  try again")
    //    //                        injectCanvas(canvasEl, index)
    //    //                    },3000)
    //    //}
    //}










    //******************single photo edit page 


    //ConfirmCancel Handlers
    var dismiss = function () {
        $scope.ConfirmCancel.isShowing = false;
    }

    $scope.confirmDeletePhoto = function () {
        $scope.ConfirmCancel.isShowing = true;
    }

    var deletePhoto = function () {
        $scope.ConfirmCancel.isShowing = false;
        DataTransportService.deletePhoto($scope.selectedPhoto.PhotoID).then(
            function (result) {
                SharedStateService.deleteFromCacheAsync("Photos", "PhotoID", $scope.selectedPhoto.PhotoID);
                $scope.PhotoList=SharedStateService.getItemFromCache("Photos")
               SharedStateService.setSelectedAsync("Photo", null)
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


    if ($location.path() == "/Photo") {
        $scope.ConfirmCancel.question = "Delete Selected Image ?";
        $scope.ConfirmCancel.ccCancel = dismiss;
        $scope.ConfirmCancel.ccConfirm = deletePhoto;
    }
 


    $scope.updatePhoto = function () {
        DataTransportService.updatePhoto($scope.selectedPhoto).then(
             function (result) {
                 SharedStateService.updateCacheAsync("Photos","PhotoID",$scope.selectedPhoto.PhotoID,$scope.selectedPhoto)
                 $scope.PhotoList=SharedStateService.getItemFromCache("Photos")
                 $scope.systemMessage.text = " photo updated successfully";
                 $scope.systemMessage.activate();
             },
              function (error) {
                  $scope.systemMessage.text = "error updating photo record";
                  $scope.systemMessage.activate();
              }
             );

    }


    //**************************upload functionality todo:move to its own page
    var filesToUpload = null;

    $scope.photoRecords = [];

    // upon selecting file to upload
    $scope.fileNameChanged = function (mel) {
        var files = mel.files;
        if (files && files.length > 0) 
        {
            // store file objects to be passed to http => aws
            filesToUpload = files;
          
                    for (var i = 0; i < files.length; i++) 
                    {
                        var file = files[i];
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
            if (dbRecord != null) {
                // store in associative array so that at the right time ( after sucessful upload) we can post the record to db 
                $scope.photoRecords.push(dbRecord);
                displayImage(file, options)
            }
            else {
                $scope.$apply(function () {
                    $scope.systemMessage.text = "unable to determine image size for file " + file.name + "please try again omitting this file" ;
                    $scope.systemMessage.activate();
                    $route.reload();
                })

            }
           

        })

    }

    $scope.filesUploadedCount = 0;

    var createPhotoRecord = function (fileName, exif, orientationID) {
        var photoRecord = new Photo();
        photoRecord.SiteID = SharedStateService.getItemFromCache("Site").SiteID;
        photoRecord.StorageURL = $scope.imageServer;
     
        photoRecord.FileName = fileName;
        if (exif != null) {
            photoRecord.orientation = exif.orientation;
            photoRecord.orientationID = orientationID;
            photoRecord.Width = exif.PixelXDimension;
            photoRecord.Height = exif.PixelYDimension
            // "YYYY:MM:DD HH:MM:SS" with time shown in 24-hour format, 
            // and the date and time separated by one blank character (hex 20).
            // will somebody just shoot me?
            if (exif.DateTimeOriginal != null) {
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
        }

        if (photoRecord.Height == null && photoRecord.Width == null) {
            photoRecord = null;
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

    var uploadFile = function () {
        var memberID = SharedStateService.getAuthenticatedMemberID();
        var mapID = SharedStateService.getItemFromCache("Map").MapID;
        for (var i = 0; i < filesToUpload.length; i++) {
            (function (imageFile, fileName, photoRecord) {
                var fileName = imageFile.name
                var photoRecord = getObjectByProperty($scope.photoRecords, "FileName", fileName);
               
                    DataTransportService.uploadImage(memberID, mapID, imageFile).then(
                        function (result) {
                            $scope.addPhotoRecord(photoRecord);
                        },
                        function (error) {
                            $scope.systemMessage.text = "error uploading photo";
                            $scope.systemMessage.activate();
                        });


            })(filesToUpload[i])

        }

        if (filesToUpload.length == $scope.filesUploadedCount)
        {
            if ($scope.filesUploadedCount == 1)
                $scope.systemMessage.text = "photo was uploaded successfuly"
            else if ($scope.filesUploadedCount > 1)
                $scope.systemMessage.text = $scope.filesUploadedCount + " photos were uploaded successfuly"
            $scope.systemMessage.activate();
        }

    }

    $scope.$watch(
        function (scope) {
            return $scope.filesUploadedCount
        },
        function (newValue, oldValue) {
            if (filesToUpload && newValue == filesToUpload.length) {
                if ($scope.filesUploadedCount > 1)
                    $scope.systemMessage.text = $scope.filesUploadedCount + " photos uploaded successfully";
                else
                    $scope.systemMessage.text = " photo uploaded successfully";

                $scope.systemMessage.activate();
                filesToUpload = null;
                $scope.filesUploadedCount = 0;
                $route.reload();
            }
        }
        );



    // I think this was refactored into the sss
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
                var cachedPhotos = SharedStateService.getItemFromCache('Photos');
                cachedPhotos.push(result.data);
                SharedStateService.setSelectedAsync('Photos', cachedPhotos);
                $scope.filesUploadedCount = $scope.filesUploadedCount + 1;
                // $route.reload();
            },
            function (error) {
                $scope.systemMessage.text = "error adding photo record";
                $scope.systemMessage.activate();
            });
    }

// to do refactor... watch can handle this
    onPageLoad();

})

