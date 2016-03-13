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

    VM.signIn = function (){
        if (VM.Member.Email == null && VM.Member.Password == null)
        {
            SharedStateService.readOnlyUser = true;
            $scope.systemMessage.text = "As you have not provided email or password you can navigate the site with read only privledges. Please create an account, to develop your own content.";
            $scope.systemMessage.activate();
            // to do add db logging date time referrer for attempted illegal access
        }
      
            DataTransportService.getMember(VM.Member.Email, VM.Member.Password).then(
            function (result, x, y, z, h) {
                SharedStateService.authenticatedMember = result.data;
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
                $scope.systemMessage.text = "Account created successfully. You have full access to develop content.";
                $scope.systemMessage.activate();
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