let ajaxComm = (goUrl, uData, uDataType, uType) => {

    if(uDataType == "") uDataType='json';
    if(uType == "") uType = 'post';

    return $.ajax({
        url:goUrl,
        data:uData,
        dataType:uDataType,
        type:uType
    })
}

// https://zetawiki.com/wiki/JQuery_%ED%94%8C%EB%9F%AC%EA%B7%B8%EC%9D%B8_%EB%A7%8C%EB%93%A4%EA%B8%B0_3_-_%EC%98%B5%EC%85%98_%EB%B0%9B%EA%B8%B0
$(function($){
    $.fn.myPlugin = function( options ) {
        var opts = $.extend( {}, $.fn.myPlugin.defaults, options );
        return this.css({
            color: opts.color,
            backgroundColor: opts.backgroundColor
        });
    };
    $.fn.myPlugin.defaults = {
        color: "red",
        backgroundColor: "yellow"
    };
}(jQuery));

