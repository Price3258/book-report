$(document).ready(function() {
    getList();
});

function getUser() {

}

function getList() {
    var nowPage_num = 1;

    $.ajax({
        url: '/board/get/' + nowPage_num,
        type: 'get',
        dataType: 'json',
        data: JSON.stringify({
            id: nowPage_num
        }),
        success: function(article) {
            'use strict';
            var data = article.data;
            var page = article.page;
            var leng = article.leng;
            var page_num = article.page_num;
            var pass = article.pass;


            for (var i = leng - ((page * page_num) - page_num); i > leng - (page * page_num); i--) {
                if (i < 0) {
                    break;
                } else {
                    var since = "";
                    since += new Date().getFullYear() + "/";
                    since += (new Date().getMonth() + 1) + "/";
                    since += new Date().getDate();


                    $('#content').append(
                        '<tr>' +
                        '<th>' + data[i].id + '</th>' +
                        '<th><a href="/board/content/' + data[i].id + '">' + data[i].title + '</th>' +
                        '<th>' + data[i].displayName + '</th>' +
                        '<th>' + since + '</th>' +
                        '</tr>'
                    );
                }
            }
            for (var j = 0; j < data.length / 10; j++) {
                $('#page').append(
                    '<a href="/board/get/' + (j + 1) + '">' + [(j + 1)] + '</a>'
                );
            }
        }
    });
}

function sendAjax(url, method, data, callback) {
    if (data) {
        data = JSON.stringify(data);
    } else {
        data = null;
    }
    $.ajax({
        url: url,
        type: method,
        dataType: 'json',
        data: data,
        success: function(results) {
            callback(results);
        }
    });
}