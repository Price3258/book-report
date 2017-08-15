$(document).ready(function() {
    var book = new Book();
    book.init();
    book.initEvent();
});


function Book() {
    this.$header = null;
    this.$write = null;
    this.$content = null;
    this.$search = null;
    this.$book = null;
    this.$reportList = null;
}

Book.prototype.init = function() {
    this.$header = $('#header');
    this.$write = $('#write');
    this.$content = $('#content');
    this.$search = $('#search');
    this.$book = $('#book');
    this.$reportList = $('#reportList > tbody > tr');
};

Book.prototype.initEvent = function() {
    var objThis = this;
    var items = '';
    this.$write.on('click', function(event) {
        event.preventDefault();
        objThis.$header.text('Search page');
        objThis.$content.load('/search', function() {
            $('#search').on('submit', function(event) {
                event.preventDefault();
                var url = "/search/book";
                //var data=$('#book').val();
                var data = { book: $('#book').val() };
                //console.log(data);
                var method = "POST";
                objThis.sendAjax(url, method, data, objThis.searchBook);

            });
        });
    });
    //List click event
    this.$reportList.on('click', function(event) {
        event.preventDefault();
        //get report's id
        var id = $(this).find(':first-child').html();
        id = id.trim();
        //alert("test" + id);
        $('#header').text('View page');
        objThis.$content.load('/view/' + id, function() {

        });
    })

};

Book.prototype.getBookList = function() {

}

Book.prototype.sendAjax = function(url, method, data, callback) {
    var objThis = this;
    $.ajax({
        method: method,
        url: url,
        data: data,
        async: false,
        dataType: 'json',
        success: function(result) {
            callback(result);


        }
    });
};
Book.prototype.searchBook = function(result) {
    //var table=$('#bookList').DataTable();

    $('#bookList').empty();
    var items = result.items;
    console.log(result);

    $('#bookList').append('<thead><tr><th>#</th><th>이미지</th><th>제목</th><th>저자</th><th>가격</th></tr></thead><tbody>');
    for (var i = 0; i < items.length; i++) {
        var output = '';
        output += '<tr value="' + i + '">';
        output += '<th scope="row">' + (i + 1) + '</th>';
        output += '<td>' + '<img src=\'' + items[i].image + '\'>' + '</td>';
        output += '<td>' + items[i].title + '</td>';
        output += '<td>' + items[i].author + '</td>';
        output += '<td>' + items[i].price + '</td>';
        output += '</tr>';

        $('#bookList').append(output);
    }
    $('#bookList').append('</tbody>');


    $('#bookList tbody').on('click', 'tr', function() {

        if ($(this).hasClass('success')) {
            var con = confirm("확인을 누르시면 평가 페이지로 이동합니다.");
            if (con === true) {
                console.log("con is true");
                var trValue = $(this).attr('value');

                loadWritePage(items[trValue]);
            } else {
                console.log("con is false");
            }
            $(this).removeClass('success');
        } else {
            $('tr.success').removeClass('success');
            $(this).addClass('success');

        }
    });
};

function loadWritePage(item) {
    $('#header').text('Write page');
    $('#content').load('/write', function() {
        $('#bookImg').attr('src', item.image);
        $('#bookTitle').text(removeBtag(item.title));
    });

}

function removeBtag(title) {
    var newTitle = title.replace("<b>", "");
    newTitle = newTitle.replace("</b>", "");

    return newTitle;
}