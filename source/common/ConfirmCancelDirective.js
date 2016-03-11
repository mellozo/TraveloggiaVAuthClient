angularTraveloggia.directive('confirmCancel', function ($compile) {
    return {
        restrict: 'E',

     //   templateUrl: "common/confirm-cancel.html",
        link: function (scope, element, attrs) 
        {

            scope.question = attrs.question;

            element.find('#btnConfirm').bind('click',function(event){
                scope.$eval(attrs.confirm)
            })

            element.find('#btnCancel').bind('click', function (event) {
                scope.$eval(attrs.cancel)
            })

          //  var placeholder =   angular.element(document.getElementById('confirm-cancel-placeholder'));
            var dhtml = '<div class="container" style="width:200px"><div class="panel panel-default"><div class="panel-body">'+
      '<p><span style="font:Centaur;color:brown">{{question}}</span></p><button type="button" class="btn btn-primary" id="btnConfirm">Yes</button>'+
      '<button type="button" class="btn btn-danger" id="btnCancel"  >No</button></div></div>'
                 element.append( $compile(dhtml) (scope));
        
        }//end link
    }// end return directive

})