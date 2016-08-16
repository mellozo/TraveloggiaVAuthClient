
$scope.Diagnostics = {
    innerHeight: $window.innerHeight,
    innerWidth: $window.innerWidth,
    buttonWidth: null,
    vpHeight: null,
    toolButtonStyle: {
        'width': '17%',
        'height': 'auto',
        'max-width': '62px'//,
        //'outline':'dotted 2px red'
    }


}


// this is an actual utility function 
$scope.debounce = function (func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};


//  <div style="position:absolute;left:0px;z-index:77;background-color:white;font-size:14px;font-family:Centaur">
//        <div style="display:inline">
//            window.innerHeight :   {{Diagnostics.innerHeight}}
//</div>
//<div style="display:inline">
//    window.innerWidth :   {{Diagnostics.innerWidth}}
//</div>
//<div>
//buttonWidth :   {{Diagnostics.buttonWidth}}
//</div>
