angularTraveloggia.controller('SignInController', function ($route, SharedStateService,DataTransportService,canEdit,readOnly,isEditing,$location,$scope,$route,$window,$timeout) {
    var VM = this;
    VM.Member = new Member();


    var getAuthorization = function () {
        var isSignedIn = false;
       var canEdit = (SharedStateService.getAuthorizationState() =="CAN_EDIT") ? true:false
       var selectedMap = SharedStateService.getItemFromCache("Map");
       var member = SharedStateService.getItemFromCache("AuthenticatedMember");

       if (selectedMap != null && selectedMap.CrowdSourced == true)
           isSignedIn = false;
       else if (member.MemberID == 1 && member.Password == null) {
          

               SharedStateService.setAuthorizationState("READ_ONLY");
       
           isSignedIn = false;
       }
       else {
           isSignedIn = canEdit;
       }
        return isSignedIn;
    }

    VM.authenticationStatus = {
        firstAttempt:($route.current.isCreate != null)?false:true,
        failedSignin: false,
        createAccount: ($route.current.isCreate != null) ? true : false,
        signedIn: getAuthorization()
    };

   
   
    VM.authenticate = function () {
        DataTransportService.getMember(VM.Member.Email, VM.Member.Password).then(
          function (result) {
              // clear default map loaded with default display user's data
              SharedStateService.clearAll();
              SharedStateService.setAuthenticatedMember(result.data);
              SharedStateService.setAuthorizationState(canEdit);
              if ($window.location.search.indexOf("MapID") == -1)
                  $timeout(function () {
                      $location.path("/Map")
                  },1500);// wait till clear is set
              else {
                  var plainold = $window.location.href.split("?")[0]
                  plainold = plainold + "#/Map";
                  $timeout($window.location.replace(plainold), 1500);
              }

          },
          function (error) {
              VM.Member = new Member();
              VM.authenticationStatus.failedSignin = true;
              VM.authenticationStatus.firstAttempt = false;
              VM.authenticationStatus.createAccount = true;
          }
      );

    }

//watch auth state
    $scope.$watch(
        function (scope) {
            if (SharedStateService.getAuthorizationState() != null)
                return SharedStateService.getAuthorizationState();
        },
        function (newValue, oldValue) {
            if (newValue != null && newValue != oldValue) {
                getAuthorization();
               
            }
        });

//watch MapID
    $scope.$watch(
        function (scope) {
            if (SharedStateService.getItemFromCache("Map") != null)
                return SharedStateService.getItemFromCache("Map").MapID
        },
        function (newValue, oldValue) {
            if (newValue != null && newValue != oldValue) {
                VM.authenticationStatus.signedIn = getAuthorization();
                $scope.$emit("authStatusChanged");
            }
        });


    VM.signOut = function(){
        SharedStateService.setAuthenticatedMember({ MemberID: 1 });
        SharedStateService.setAuthorizationState(readOnly);
        // clear  
        SharedStateService.clearAll();
        VM.authenticationStatus.signedIn = false;
        $timeout(function () {
            $route.reload()
        }, 1500);

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

        var strMessage = "";
        if (VM.Member.Email == null || VM.Email=="" ) 
            strMessage="Email is required "

        if(VM.Member.Password==null || VM.password=="")
            strMessage = strMessage + "Password is required ";

        if(strMessage != ""){
            $scope.systemMessage.text = strMessage;
            $scope.systemMessage.activate();
            return;
        }

        DataTransportService.addMember(VM.Member).then(
            function (result, x, y, z, h) {
                SharedStateService.setAuthenticatedMember(result.data);
                SharedStateService.setAuthorizationState(canEdit);
// clear 
                SharedStateService.clearMap();
                $scope.systemMessage.text = "Account created successfully.";
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