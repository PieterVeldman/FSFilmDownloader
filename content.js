chrome.runtime.sendMessage({todo: "showPageAction"});
const imgURL = chrome.runtime.getURL("filmReelIcon16.png");

/**
     * Parse microfilms as in the format below :
     * https://www.familysearch.org/search/film/005845257?cc=2036997&cat=108418
     * and return parameters necessary to download the microfilm
     *
     */
function parseMicrofilmUrlParams(film_url){

    const url_pattern = new RegExp("https://www.familysearch.org/(search/film/(.*))\\?+[?:=&a-zA-Z0-9]*cat=([0-9]*)");
    const url_pattern_results = url_pattern.exec(film_url);

    const image_or_film_url = url_pattern_results[1];
    const film_number = url_pattern_results[2];
    const catalog_context = url_pattern_results[3];
    return { film_number: film_number, catalog_context : catalog_context, image_or_film_url : image_or_film_url}
}
$(function(){
    const params_array =[];
    self = this;
    /**
     * avoid that index searchs appear as a download option a.film-format-index  (index links )found in: https://www.familysearch.org/search/catalog/2656516?availability=Family%20History%20Library
     */
    $('a.film-format-image').not('a.film-format-index').each(function( index, self ) {
        //get href property and strip Microfilm parameters
        const film_url= $(this).attr("href");
        const film_link_id = 'film_link'+index;
        const params = parseMicrofilmUrlParams(film_url)
        params_array.push(params)
        //append microfilm Reel Image and attach click event to it
        $(this).parent().append('<img id="'+film_link_id+'"src="'+imgURL+'" alt="MicroFilm reel" title="Download all images from this MicroFilm" />');
        $('#'+film_link_id).click( ()=> {
            chrome.runtime.sendMessage({todo: "downloadImages", params : params  } , function (dataReturned) {
                // console.log(dataReturned);
            });
        });
    });
});


/**
 * Strip dsgNum parameter from page content.
 * It's found in the div with .film-number class
 */
function getFilmNumber (film_number_div) {

    const film_number_pattern = new RegExp("([0-9]+)");
    const film_number_pattern_results = film_number_pattern.exec(film_number_div);
    film_number_pattern_results[1]
    return film_number_pattern_results[1];
}
function getImageCount (image_count_label) {
    const image_count_pattern = new RegExp("([0-9]+)");
    const image_count_pattern_results = image_count_pattern.exec(image_count_label);
    image_count_pattern_results[1]
    return image_count_pattern_results[1];

}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.todo == "getFilmData"){
        console.log ('getFilmData');
        if (location.href.indexOf("catalog")=== -1 ){

            const film_number_div = $('.film-number').text();
            const film_number = getFilmNumber (film_number_div);
            const image_count_label = $('label.afterInput').text();
            const image_count = getImageCount (image_count_label);
            const film_data = { film_number: film_number, image_count : image_count};
            sendResponse(film_data);
        }else{
            sendResponse("hi there");
        }
    }
});






