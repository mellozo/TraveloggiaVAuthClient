angularTraveloggia.controller('SignInController', function ($route, SharedStateService,DataTransportService,canEdit,readOnly,isEditing,$location,$scope,$route) {
    var VM = this;
    VM.Member = new Member();

    VM.authenticationStatus = {
        firstAttempt:($route.current.isCreate != null)?false:true,
        failedSignin: false,
        createAccount: ($route.current.isCreate != null) ? true : false,
        signedIn: (SharedStateService.getAuthorizationState() ==canEdit) ? true:false
    };
   
    VM.authenticate = function () {
        DataTransportService.getMember(VM.Member.Email, VM.Member.Password).then(
          function (result, x, y, z, h) {
              SharedStateService.setAuthenticatedMember(result.data);
              SharedStateService.setAuthorizationState(canEdit);
              // we will depricate this
              SharedStateService.readOnlyUser = false;
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



    //var alreadyLoggedIn = window.sessionStorage.getItem("memberID")
    //if (alreadyLoggedIn != null) {
    //    VM.Member.MemberID = alreadyLoggedIn;
    //    VM.authenticate();
    //}


    VM.signOut = function(){
        //  window.location.href = "http://html5.traveloggia.net/Default.html";
        SharedStateService.setAuthenticatedMember({ MemberID: 1 });
        SharedStateService.setAuthorizationState(readOnly);
        // this will be deprecated
    //    SharedStateService.readOnlyUser = true;
        VM.authenticationStatus.signedIn = false;
        $route.reload();
       // and all the other stuff we will fool around with later like JWT
    }


    VM.goSignInPage=function(){
        $location.path("/SignIn");
    }

    VM.goCreateAccount = function () {
        $location.path("/CreateAccount");
    }

    VM.signIn = function (){
        if (VM.Member.Email == null && VM.Member.Password == null) {
            SharedStateService.readOnlyUser = true;
            VM.member.MemberID = 1;
            $scope.systemMessage.text = "As you have not provided email or password you can navigate the site with read only privledges. Please create an account, to develop your own content.";
            $scope.systemMessage.activate();
            // to do add db logging date time referrer for attempted illegal access
            VM.authenticate();
        }
        else
            VM.authenticate();
          
    }


    VM.createAccount = function () {
        DataTransportService.addMember(VM.Member).then(
            function (result, x, y, z, h) {
                SharedStateService.setAuthenticatedMember(result.data);
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