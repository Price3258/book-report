$(document).ready(function(){
    getArticle();
});

function getArticle(){
    $.ajax({
        url:'/board/getArticle',
        type:'get',
        dataType:'json',
        success:function(data){
            for(var i=0;i<data.length;i++){
                $('#board').append(
                    '<tr>'+
                    '<th>'+data[i].id+'</th>'+
                    '<th>'+'<a href=/board/content/'+data[i].id+'>'+data[i].title+'</a></th>'+
                    '<th>'+data[i].displayName+'</th>'+
                    '<th>'+data[i].since+'</th>'+
                    '</tr>'
                );
            }
        }
    });
    
}
