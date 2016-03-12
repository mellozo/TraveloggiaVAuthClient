//angularTraveloggia.directive('confirmCancel', function ($compile) {
    angularTraveloggia.directive('confirmCancel', function () {
    return {
        restrict: 'E',
        templateUrl: "common/confirm-cancel.html",
        scope: {
            question: '=',
            'confirm':'&onConfirm' , // we love how camel caseing changes to lower case dash separated
            'cancel':'&onCancel'
            }

     
       // ,
        //link: function (scope, element, attrs) 
        //{   
      //  per angular docs:
      //       Best Practice: use &attr in the scope option when you want your directive to expose an API for binding to behaviors.
      //       dont do whats below:
      //      element.find('#btnConfirm').bind('click',function(event){
      //          attrs.confirm();
      //      })

      //      element.find('#btnCancel').bind('click', function (event) {
      //          scope.$eval(attrs.cancel)
      //      })

      //      var placeholder =   angular.element(document.getElementById('confirm-cancel-placeholder'));
      //      var dhtml = '<div class="container" style="width:200px"><div class="panel panel-default"><div class="panel-body">'+
      //'<p><span style="font:Centaur;color:brown">{{question}}</span></p><button type="button" class="btn btn-primary" id="btnConfirm">Yes</button>'+
      //'<button type="button" class="btn btn-danger" id="btnCancel"  >No</button></div></div>'
      //           element.append( $compile(dhtml) (scope));
        
     // }//end link
    }// end return directive

})