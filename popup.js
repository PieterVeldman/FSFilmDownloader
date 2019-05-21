
function downloadImages(images_data, film_number) {

    images_data.forEach(image_data => {
        const img_sequence = image_data.img_sequence;
        const img_id = image_data.img_id;
        const image_url ='https://familysearch.org/das/v2/'+img_id+'/dist.jpg'
        const filename = 'FS_films/'+film_number+'/'+img_sequence+'.jpg';
        chrome.downloads.download({url: image_url,
            //filename: 'image.png', saveAs: true},
            filename: filename},
            function(img_sequence,id) {
                console.log("downloading "+img_sequence)
        });

    });
    alert('Download Completo');
}
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
    const url_pattern = new RegExp("https://www.familysearch.org/(ark:/[0-9]*/.*)\\?+(?:.=.&)*cat=([0-9]*)");
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
     return '{"type":"film-data","args":{"dgsNum":"'+film_number+'","state":{"cat":"'+url_params.cat+'","imageOrFilmUrl":"'+url_params.imageOrFilmUrl+'","catalogContext":"'+url_params.cat+'","viewMode":"i","selectedImageIndex":-1}}}' ;
}

function getImagesUrl(JSONfile){
    let i = 0;
    const images_data = [];
    JSONfile.images.forEach(element => {
        i++;
        let patt = new RegExp("/familysearch.org/ark:/[0-9]*/(.*)/image.xml");
        let res = patt.exec(element);
        let img_id = res[1];
        images_data.push({  'img_id' : img_id, 'img_sequence': i} );
    });
    return images_data;

}


function requestJSON(url, params, film_number){
    var xhr = new XMLHttpRequest();

    xhr.open("POST", url, true);
    xhr.setRequestHeader("accept", "application/json, application/json")
    xhr.setRequestHeader("content-type", "application/json")

    //xhr.open("GET", "https://www.familysearch.org/", true);
    const images_data =  xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        JSONfile = JSON.parse(xhr.responseText);
        const images_data = getImagesUrl (JSONfile);
        downloadImages(images_data, film_number);
      }
    }

    xhr.send(params);
    return images_data;
}
$(function(){


   $('#btnChange').click(function(){
         chrome.tabs.query({active:true,currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {todo: "downloadAllImages", url: tabs[0].url  } , function (film_number) {
                request_url = tabs[0].url;
                const url_params = parseUrlParams(request_url);
                const params= assembleParams (url_params, film_number);
                const url = "https://www.familysearch.org/search/filmdatainfo";

                //console.log('before requestJSON');
                images_data = requestJSON(url, params, film_number);
                //console.log('after requestJSON');
                //console.log (images_data)




            });
        });




        // chrome.downloads.download({url: 'https://edge.fscdn.org/assets/docs/fs_logo_favicon_sq.png',
        // //filename: 'image.png', saveAs: true},
        // filename: 'teste/image.png'},
        // function(id) {
        // // alert('Baixando imagem');
        // });




   });
});

