$(document).ready(function() {
    init();
    initEvent();
});

function init() {
    var starCaptions = {
        0.5: 'Half Star',
        1: 'One Star',
        1.5: 'One & Half Star',
        2: 'Two Stars',
        2.5: 'Two & Half Stars',
        3: 'Three Stars',
        3.5: 'Three & Half Stars',
        4: 'Four Stars',
        4.5: 'Four & Half Stars',
        5: 'Five Stars'
    }
    $("#star").rating({
        'starCaptions': starCaptions,
        showClear: false
    });
}

function initEvent() {
    $("#qwe").on('submit', function(event) {
        event.preventDefault();
        var url = "/write";
        var data = {
            title: $('#reportTitle').val(),
            content: $('#reportContent').val(),
            star: $('#star').val(),
            book: $('#bookTitle').text(),
            img: $('#bookImg').attr('src')
        }
        method = "POST";
        sendAjax(url, method, data);
    });
}

function sendAjax(url, method, data) {
    $.ajax({
        method: method,
        url: url,
        data: data,
        dataType: 'json',
        async: false,
        success: function(result) {
            window.location.reload(true);
        }
    });
}

/*
$("#write").on('click', function(event) {
        event.preventDefault();
        alert("Ewqeqwd");
        var url = "/write";
        var data = {
            title: $('#reportTitle').val(),
            content: $('#reportContent').val(),
            star: $('#star').val(),
            book: $('#bookTitle').text(),
            img: $('#bookImg').attr('src')
        }
        method = "POST";
        sendAjax(url, method, data);
    });
*/