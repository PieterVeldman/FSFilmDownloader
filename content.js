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
    const url_pattern = new RegExp("https://www.familysearch.org/(ark:/[0-9]*/.*)\\?+(?:.=.&)*cat=(\\d*)");
    const url_pattern_results = url_pattern.exec(request_url);

    const cat = url_pattern_results[2];
    const imageOrFilmUrl = url_pattern_results[1];
    return { 'cat' : cat, 'imageOrFilmUrl' : imageOrFilmUrl}
}

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

/**
 * Assemble necessary parameters to mount request for filmdatainfo.json
 * example:
 * params= '{"type":"film-data","args":{"dgsNum":"008448065","state":{"i":"344","cat":"101779","imageOrFilmUrl":"/ark:/61903/3:1:3Q9M-C3MX-4T6S","catalogContext":"101779","viewMode":"i","selectedImageIndex":344},"locale":"pt","sessionId":"28ac18aa-04e1-47c7-b69a-d94c53c7e9d5-prod","loggedIn":true}}'
 */
function assembleParams (url_params, film_number) {
     return '{"type":"film-data","args":{"dgsNum":"'+film_number+'","state":{"cat":"'+url_params.cat+'","imageOrFilmUrl":"'+url_params.imageOrFilmUrl+'","catalogContext":"'+url_params.cat+'","viewMode":"i","selectedImageIndex":-1}}}' ;
}

function getImageUrls(JSONfile){
    let i = 0;
    const images_data = [];
    JSONfile.images.forEach(element => {
        i++;
        let patt = new RegExp("/familysearch.org/ark:/[0-9]*/(.*)/image.xml");
        let res = patt.exec(element);
        let img_id = res[1];
        //console.log(img_id);
        images_data.push({  'img_id' : img_id, 'img_sequence': i} );
    });
    return images_data;

}


function requestJSON(url, params){
    var xhr = new XMLHttpRequest();

    xhr.open("POST", url, false);
    xhr.setRequestHeader("accept", "application/json, application/json")
    xhr.setRequestHeader("content-type", "application/json")

    //xhr.open("GET", "https://www.familysearch.org/", true);
    const images_data =  xhr.onreadystatechange = function() {
       // console.log(xhr.readyState)
      if (xhr.readyState == 4) {
        JSONfile = JSON.parse(xhr.responseText);
        const images_data = getImageUrls (JSONfile);
        return images_data;
        console.log('inside requestJSON');

      }
    }

    xhr.send(params);
    return images_data;
}

chrome.runtime.sendMessage({todo: "showPageAction"});
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.todo == "changeColor"){

        const film_number_div = $('.film-number').text();
        const film_number = getFilmNumber (film_number_div);
        const url_params = parseUrlParams(request.url);
        const params= assembleParams (url_params, film_number);
        const url = "https://www.familysearch.org/search/filmdatainfo";

        console.log('before requestJSON');
        images_data = requestJSON(url, params);
        console.log('after requestJSON');
        console.log (images_data)

        sendResponse(images_data, film_number);






    }
});