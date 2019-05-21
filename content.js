
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

chrome.runtime.sendMessage({todo: "showPageAction"});
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.todo == "downloadAllImages"){

        const film_number_div = $('.film-number').text();
        const film_number = getFilmNumber (film_number_div);
        console.log(film_number);
        sendResponse( film_number);






    }
});