
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.todo == "showPageAction") {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.pageAction.show(tabs[0].id);
        });
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.todo == "downloadImages") {
        images_data = requestJSON(request.params);
        sendResponse("OK");
    }
});


/**
 * Assemble necessary parameters to mount request for filmdatainfo.json
 * example:
 * params= '{"type":"film-data","args":{"dgsNum":"008448065","state":{"i":"344","cat":"101779","imageOrFilmUrl":"/ark:/61903/3:1:3Q9M-C3MX-4T6S","catalogContext":"101779","viewMode":"i","selectedImageIndex":344},"locale":"pt","sessionId":"28ac18aa-04e1-47c7-b69a-d94c53c7e9d5-prod","loggedIn":true}}'
 */
function assembleParams(film_number, catalog_context, image_or_film_url) {
    return '{"type":"film-data","args":{"dgsNum":"' + film_number + '","state":{"cat":"' + catalog_context + '","imageOrFilmUrl":"' + image_or_film_url + '","catalogContext":"' + catalog_context + '","viewMode":"i","selectedImageIndex":-1}}}';
}

/**
 * Provided the filmdatainfo.json file contents and image boundaries, this
 * function returns an array of image data to be consumed by the downloadImages
 * function
 */
function getImagesUrl(JSONfile, min = null, max = null) {
    console.log(min);
    console.log(max);
    console.log(JSONfile)
    let i = 0;
    const images_data = [];
    JSONfile.images.forEach(element => {
        i++;
        let patt = new RegExp("/familysearch.org/ark:/[0-9]*/(.*)/image.xml");
        let res = patt.exec(element);
        let img_id = res[1];
        if (min !== null && max !== null) {
            if (i >= min && i <= max) {
                images_data.push({ 'img_id': img_id, 'img_sequence': i });
            }
        } else {
            images_data.push({ 'img_id': img_id, 'img_sequence': i });
        }
    });
    console.log(images_data);
    return images_data;

}

/**
 * This function will download all images listed in images_data and
 * save it to FS_films/film_number folder
 *
 * @param {*} images_data //array of images id and images sequence
 * @param {*} film_number //DSG number or film number as string
 */
function downloadImages(images_data, film_number) {
    images_data.forEach(image_data => {
        const img_sequence = image_data.img_sequence;
        const img_id = image_data.img_id;
        const image_url = 'https://familysearch.org/das/v2/' + img_id + '/dist.jpg'
        const filename = 'FS_films/' + film_number + '/' + img_sequence + '.jpg';
        chrome.downloads.download({
            url: image_url,
            //filename: 'image.png', saveAs: true},
            filename: filename
        },
            function (downloadId) {
                if (downloadId === undefined) { //there was an error downloading the file
                    console.log(chrome.runtime.lastError);
                    chrome.storage.local.set({ 'FSFilmCanDownload': false }, function () { });
                }
            });


    });
}

/**
 *  Fetches filmdatainfo.json data
 *
 * @param {*} params parameters relative to the Microfilm to be downloaded
 *    params.film_number = the Microfilm Film Number or DSG Number
 *    params.catalog_context = the "cat" parameter provided in the microfilm url
 *    params.image_or_film_url = the part of the Microfilm url between
 *  "familysearch.org" and "?"
 *    params.image_min = the sequence number of the first image to be downloaded
 *    params.image_max = the sequence number of the last image to be downloaded
 */

function requestJSON(params) {
    console.log(params)
    const filmdatainfo_url = "https://www.familysearch.org/search/filmdatainfo";

    let xhr = new XMLHttpRequest();
    xhr.open("POST", filmdatainfo_url, true);
    xhr.setRequestHeader("accept", "application/json, application/json")
    xhr.setRequestHeader("content-type", "application/json")

    //xhr.open("GET", "https://www.familysearch.org/", true);
    const images_data = xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            JSONfile = JSON.parse(xhr.responseText);
            const images_data = getImagesUrl(JSONfile, params.image_min, params.image_max);
            /**
             * test wether the requested number of images will exceed the quota
             */
            const current_n_records = images_data.length;
            addLineToChromeStorage(current_n_records, function (download) {
                if (download){
                    downloadImages(images_data, params.film_number);
                }else{
                    alert('Maximum download quota per day reached. Wait a little longer to download again!');
                }
            } );



        }
    }

    xhr.send(assembleParams(params.film_number, params.catalog_context, params.image_or_film_url));
    return images_data;
}






