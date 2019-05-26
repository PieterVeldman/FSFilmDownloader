
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.todo == "showPageAction") {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.pageAction.show(tabs[0].id);
        });
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.todo == "downloadAllImages") {
        images_data = requestJSON(request.url, request.params, request.film_number);
        sendResponse("OK");
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.todo == "downloadImageRange") {
        images_data = requestJSON(request.url, request.params, request.film_number, request.min,request.max );
        sendResponse("OK");

    }
});

function getImagesUrl(JSONfile, min = null, max = null) {
    let i = 0;
    const images_data = [];
    JSONfile.images.forEach(element => {
        i++;
        let patt = new RegExp("/familysearch.org/ark:/[0-9]*/(.*)/image.xml");
        let res = patt.exec(element);
        let img_id = res[1];
        if(min !==null  && max !== null ) {
            if (i >= min && i <= max) {
                images_data.push({ 'img_id': img_id, 'img_sequence': i });
            }
        }else {
            images_data.push({ 'img_id': img_id, 'img_sequence': i });
        }
    });
    return images_data;

}

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
              //  console.log(downloadId);
            });

    });
}

function requestJSON(url, params, film_number, min = null, max = null) {
    var xhr = new XMLHttpRequest();

    xhr.open("POST", url, true);
    xhr.setRequestHeader("accept", "application/json, application/json")
    xhr.setRequestHeader("content-type", "application/json")

    //xhr.open("GET", "https://www.familysearch.org/", true);
    const images_data = xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            JSONfile = JSON.parse(xhr.responseText);
            const images_data = getImagesUrl(JSONfile, min, max);
            downloadImages(images_data, film_number);
        }
    }

    xhr.send(params);
    return images_data;
}





