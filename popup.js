
/**
 * Strip url to get the cat and imageOrFilmUrl params
 * i is not necessary
 * example urls :
 *  https://www.familysearch.org/ark:/61903/3:1:3Q9M-C3MX-4TKW?cat=101779
 * and
 *  https://www.familysearch.org/ark:/61903/3:1:3Q9M-C3MX-4TN9?i=1&cat=101779
 */

function parseUrlParams(request_url){

    //let url_pattern = new RegExp("https://www.familysearch.org/(ark:/[0-9]*/.*)\?.*&cat=(\d*)");
    //const url_pattern = new RegExp("https://www.familysearch.org/(ark:/[0-9]*/.*)\\?+(?:.=.&)*cat=(\\d*)");
    //const url_pattern = new RegExp("https://www.familysearch.org/(ark:/[0-9]*/.*)\\?+(?:.=.&)*cat=([0-9]*)");
    const url_pattern = new RegExp("https://www.familysearch.org/(.*/.*/.*)\\?+(?:.=.&)*cat=([0-9]*)");
    const url_pattern_results = url_pattern.exec(request_url);

    const cat = url_pattern_results[2];
    const imageOrFilmUrl = url_pattern_results[1];
    return { 'cat' : cat, 'imageOrFilmUrl' : imageOrFilmUrl}
}



/**
 * Assemble necessary parameters to mount request for filmdatainfo.json
 * example:
 * params= '{"type":"film-data","args":{"dgsNum":"008448065","state":{"i":"344","cat":"101779","imageOrFilmUrl":"/ark:/61903/3:1:3Q9M-C3MX-4T6S","catalogContext":"101779","viewMode":"i","selectedImageIndex":344},"locale":"pt","sessionId":"28ac18aa-04e1-47c7-b69a-d94c53c7e9d5-prod","loggedIn":true}}'
 */
function assembleParams (url_params, film_number) {
    film_number = $('span#film_number').text();
    cat = $('input#cat').val();
    imageOrFilmUrl = $('input#imageOrFilmUrl').val();
     return '{"type":"film-data","args":{"dgsNum":"'+film_number+'","state":{"cat":"'+cat+'","imageOrFilmUrl":"'+imageOrFilmUrl+'","catalogContext":"'+cat+'","viewMode":"i","selectedImageIndex":-1}}}' ;
}


$(function(){
    $('.translate').each(function( index ) {
        if (typeof (this.getAttribute('value'))==="string") { //text is set by attribute value and not inner text
            $( this ).val( chrome.i18n.getMessage(this.id)) ;
        }else{
            $( this ).text( chrome.i18n.getMessage(this.id)) ;
        }

      });

    $('#allImgs').click(function(){
        const film_number = $('span#film_number').text();
        const params= assembleParams ();
        const url = "https://www.familysearch.org/search/filmdatainfo";
        //download images on the background script

        chrome.runtime.sendMessage({todo: "downloadAllImages", url: url, params : params, film_number : film_number  } , function (dataReturned) {
            // console.log(dataReturned);
        });
    });

    $('#someImgs').click(function(){

        const film_number = $('span#film_number').text();
        const params= assembleParams ();
        const url = "https://www.familysearch.org/search/filmdatainfo";
        const image_min = $('#fromImage').val();
        const image_max  =$('#toImage').val();
        chrome.runtime.sendMessage({todo: "downloadImageRange", url: url, params : params, film_number : film_number, min : image_min , max: image_max  } , function (dataReturned) {
            // console.log(dataReturned);
        });

    });

    //load film_number and image_count
    chrome.tabs.query({active:true,currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {todo: "getFilmData", url: tabs[0].url  } , function (film_data) {

            $('span#film_number').text(film_data.film_number);
            $('span#image_count').text(film_data.image_count);
            $('#fromImage').val('1');
            $("#fromImage").attr("max",film_data.image_count);
            $('#toImage').val(film_data.image_count);
            $('#toImage').attr("max",film_data.image_count);

            request_url = tabs[0].url;
            const url_params = parseUrlParams(request_url);
            $('input#cat').val(url_params.cat);
            $('input#imageOrFilmUrl').val(url_params.imageOrFilmUrl);

        });
    });






});

