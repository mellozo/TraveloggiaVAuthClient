angularTraveloggia.controller('SignInController', function (SharedStateService,DataTransportService,$location,$scope,$route) {
    var VM = this;

    VM.authenticationStatus = {
        firstAttempt:($route.current.isCreate != null)?false:true,
        failedSignin: false,
        createAccount:($route.current.isCreate != null)?true:false

    };
   

    VM.Member = new Member();


    VM.signOut = function(){

        window.location.href = "http://html5.traveloggia.net/Default.html";

       // and all the other stuff we will fool around with later like JWT
    }


    VM.signIn = function () {
    // DataTransportService.getMember("acap@sd.net", "buster").then(
              DataTransportService.getMember(VM.Member.Email, VM.Member.Password).then(
            function (result, x, y, z, h) {
                SharedStateService.authenticatedMember = result.data;
                SharedStateService.LoadMaps();
                $location.path("/Map")
            },
            function (error) {
                VM.Member = new Member();
                VM.authenticationStatus.failedSignin = true;
                VM.authenticationStatus.firstAttempt = false;
                VM.authenticationStatus.createAccount = true;
            }
        );
    }
   

    VM.createAccount = function () {
        DataTransportService.addMember(VM.Member).then(
            function (result, x, y, z, h) {
                SharedStateService.authenticatedMember = result.data;
                SharedStateService.LoadMaps();
                $location.path("/Map")
            },
            function (error) {

                VM.Member = new Member();
                if ( error.data != null && error.data.Message == "member exists already")
                    $scope.systemMessage.text = "email already in use";
                else
                    $scope.systemMessage.text = "error creating account";

                $scope.systemMessage.activate();
            }
        );

    }

})