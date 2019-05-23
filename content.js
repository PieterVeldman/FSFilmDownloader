
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

chrome.runtime.sendMessage({todo: "showPageAction"});
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.todo == "downloadAllImages"){

        const film_number_div = $('.film-number').text();
        const film_number = getFilmNumber (film_number_div);
        sendResponse( film_number);
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.todo == "getFilmData"){
        console.log ('getFilmData');

        const film_number_div = $('.film-number').text();
        const film_number = getFilmNumber (film_number_div);
        const image_count_label = $('label.afterInput').text();
        const image_count = getImageCount (image_count_label);
        const film_data = { film_number: film_number, image_count : image_count};
        sendResponse(film_data);
    }
});