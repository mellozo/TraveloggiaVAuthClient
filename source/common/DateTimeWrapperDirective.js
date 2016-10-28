angularTraveloggia.directive("wrappedDate", function () {
    return {

        restrict: "E",
        require: 'ngModel',
        scope: {
            mel: '=ngModel'
        },
        replace: true,
        template:
                 "<div class='input-group date'  >" +
                    "<input   id='dateInputField'   type='text' class='form-control'  value={{mel}} />" +
                   //" <label>{{mel}}</label>"+
                    "<span class='input-group-addon'>" +
                        "<span class='glyphicon glyphicon-calendar'></span>" +
                    "</span>" +
                "</div>",
        link: function (scope, elem, attrs, ngModel) {
            try {
      
                $('#' + attrs.id).datetimepicker()
                var picker = $('#' + attrs.id).data('DateTimePicker');
                var ipt = elem.find("#dateInputField");
                if (scope.mel != null && scope.mel != "") {
                    var jdate = new Date(scope.mel);
                    var readableDate = jdate.toLocaleString();
                    ipt[0].value = readableDate;
                    var picker = $('#' + attrs.id).data('DateTimePicker');
                    if(picker == null)
                        alert("picker is dead")
                }
                else {
                    picker.clear();
                }

                ipt.on('blur', function (e) {
                    try {
                 
                        scope.$apply(function () {
                            if (scope.mel != null && scope.mel != "")
                                ngModel.$setViewValue(scope.mel);
                            else if(e.target.value != null)
                                ngModel.$setViewValue(e.target.value);
                        });
                    }
                    catch (error) {
                        alert("error in blur")
                    }

                })

                scope.$watch('mel', function (data, x, y, z) {
                    try {
                        var ipt = elem.find("#dateInputField");
                        if (scope.mel != null && scope.mel != "") {
                            var jdate = new Date(scope.mel);
                            var readableDate = jdate.toLocaleString();
                            ipt[0].value = readableDate;
                        }
                        else {
                            var picker = $('#' + elem[0].id).data('DateTimePicker');
                            if (picker != null)
                                picker.clear();
                            else {
                                ipt[0].value = null;
                                console.log("about to create new picker")
                                $('#' + attrs.id).datetimepicker()
                              
                            }
                        }
                    }
                    catch (error) {
                        alert("error in watch")
                    }

                });
            }
            catch (error) {
                alert("error in link")
            }
        }
    }
});