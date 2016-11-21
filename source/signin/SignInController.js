angularTraveloggia.controller('SignInController', function ($route, SharedStateService,DataTransportService,canEdit,readOnly,isEditing,$location,$scope,$route,$window) {
    var VM = this;
    VM.Member = new Member();

    VM.authenticationStatus = {
        firstAttempt:($route.current.isCreate != null)?false:true,
        failedSignin: false,
        createAccount: ($route.current.isCreate != null) ? true : false,
        signedIn: (SharedStateService.getAuthorizationState() =="CAN_EDIT") ? true:false
    };
   
    VM.authenticate = function () {
        DataTransportService.getMember(VM.Member.Email, VM.Member.Password).then(
          function (result, x, y, z, h) {
              // clear default map loaded with default display user's data
              SharedStateService.Repository.put("Map", null);
              SharedStateService.setSelected("Map", null);
              SharedStateService.setAuthenticatedMember(result.data);
              SharedStateService.setAuthorizationState(canEdit);
              // we will depricate this
              // SharedStateService.readOnlyUser = false;
              if ($window.location.search.indexOf("MapID") == -1)
                  $location.path("/Map")
              else {

                  var plainold = $window.location.href.split("?")[0]
                  plainold = plainold + "#/Map";
                  $window.location.replace(plainold);
              }

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


    $scope.$watch(
        function (scope) {
            if (SharedStateService.getAuthorizationState() != null)
                return SharedStateService.getAuthorizationState();
        },
        function (newValue, oldValue) {
            if (newValue != null && newValue != oldValue) {

                var boolAuth =  (newValue==canEdit) ? true:false;
                VM.authenticationStatus.signedIn = boolAuth;
               
            }
        });



    VM.signOut = function(){
        SharedStateService.setAuthenticatedMember({ MemberID: 1 });
        SharedStateService.setAuthorizationState(readOnly);
        // clear 
        SharedStateService.setSelected("Map", null);
        SharedStateService.setSelected("Site", null);
        SharedStateService.setSelected("Journal", null);

        SharedStateService.Repository.put("Map", null);
        SharedStateService.Repository.put("Sites", []);
        SharedStateService.Repository.put("Journals", []);
        SharedStateService.Repository.put("Photos", [])
        VM.authenticationStatus.signedIn = false;
        $route.reload();

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
                SharedStateService.setSelected("Site", null);
                SharedStateService.setSelected("Journal", null);
                SharedStateService.setSelected("Map", null);
                SharedStateService.Repository.put("Sites", []);
                SharedStateService.Repository.put("Map", null);
                SharedStateService.Repository.put("Journals", []);
                SharedStateService.Repository.put("Photos", [])

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