/**
 * Strip url to get the cat and imageOrFilmUrl params
 * i is not necessary
 * example urls :
 *  https://www.familysearch.org/ark:/61903/3:1:3Q9M-C3MX-4TKW?cat=101779
 * and
 *  https://www.familysearch.org/ark:/61903/3:1:3Q9M-C3MX-4TN9?i=1&cat=101779
 */

function parseUrlParams(request_url) {

    //let url_pattern = new RegExp("https://www.familysearch.org/(ark:/[0-9]*/.*)\?.*&cat=(\d*)");
    //const url_pattern = new RegExp("https://www.familysearch.org/(ark:/[0-9]*/.*)\\?+(?:.=.&)*cat=(\\d*)");
    //const url_pattern = new RegExp("https://www.familysearch.org/(ark:/[0-9]*/.*)\\?+(?:.=.&)*cat=([0-9]*)");
    /**
     * Somehow the pattern above failed to match the following url:
     * https://www.familysearch.org/search/film/005845257?cc=2036997&cat=108418
     * because of the "cc=2036997" url parameter.
     * I updated it to solve the bug
     */
    const url_pattern = new RegExp("https://www.familysearch.org/(.*/.*/.*)\\?+[?:=&a-zA-Z0-9]*cat=([0-9]*)");
    const url_pattern_results = url_pattern.exec(request_url);

    const cat = url_pattern_results[2];
    const image_or_film_url = url_pattern_results[1];
    return { 'cat': cat, 'image_or_film_url': image_or_film_url }
}





/**
 * Keep number of records downloaded in the last 24 hours updated
 */
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (!!changes.FSFilmLog){
        FSFilmLog = changes.FSFilmLog.newValue;
        const sum_of_records = countDownloadedRecords(FSFilmLog);
        $('#downloadCountNumber').text(sum_of_records);
    }
});



$(function () {
    function showHide(state) {
        if (!!state){
            $('ul.list-group.below>li:nth-child(1)').hide();
            $('ul.list-group.below>li:nth-child(2)').hide();
            $('ul.list-group.below>li:nth-child(3)').hide();
        }else{
            $('ul.list-group.below>li:nth-child(1)').show();
            $('ul.list-group.below>li:nth-child(2)').show();
            $('ul.list-group.below>li:nth-child(3)').show();

        }
    }
    getShowHideStatus(function (state) {
        showHide(state);
    })


    /**
     * Fetch necessary parameters to download all images
     */
    function getMicrofilmParams() {
        const film_number = $('span#film_number').text();
        const catalog_context = $('input#cat').val();
        const image_or_film_url = $('input#image_or_film_url').val();
        return { film_number: film_number, catalog_context: catalog_context, image_or_film_url: image_or_film_url }
    }

    /**
     * Fetch necessary parameters to download all images
     * plus the desired download range
     */
    function getMicrofilmParamsMinMaxImageNumbers() {
        params = getMicrofilmParams()
        params.image_min = $('#fromImage').val();
        params.image_max = $('#toImage').val();
        return params;
    }
    /**
     * Provides Internalization
     */
    $('.translate').each(function (index) {
        if (typeof (this.getAttribute('value')) === "string") { //text is set by attribute value and not inner text (as in form components)
            $(this).val(chrome.i18n.getMessage(this.id));
        } else {
            $(this).text(chrome.i18n.getMessage(this.id));
        }

    });

    $('#allImgs').click(function () {
        chrome.downloads.onCreated.removeListener(blockDownloadsListener);
            const params = getMicrofilmParams();
            //download images on the background script
            chrome.runtime.sendMessage({ todo: "downloadImages", params: params }, function (dataReturned) {
                // console.log(dataReturned);
            });
    });

    $('#someImgs').click(function () {
        chrome.downloads.onCreated.removeListener(blockDownloadsListener);
        const params = getMicrofilmParamsMinMaxImageNumbers();
        //download images on the background script
        chrome.runtime.sendMessage({ todo: "downloadImages", params: params }, function (dataReturned) {
            // console.log(dataReturned);
        });

    });


    $('#hideInfo').parent().click( async function () {

        toggleShowHide(function (state) {
            showHide(state);
        })
    });

    /**
     * We'll only block downloads from our extension. Since OnCreated event
     * doesn't return byExtensionId, we must retieve it with
     * chrome.downloads.search method.
     * If the download has suceeded, delete the file.
     */
    function blockDownloadsListener(item) {
        chrome.downloads.search({ id: item.id }, function (DownloadItems) {
            DownloadItems.forEach(DownloadItem => {
                if (DownloadItem.byExtensionId === chrome.runtime.id) {
                    chrome.downloads.cancel(item.id);
                    if (item.state == "complete") {
                        chrome.downloads.removeFile(item.id);
                    }
                }
                addLineToChromeStorage(-1, function () { })
            });
        });

    }


    /**
    * If the user wishes to stop all downloads, this option will do it
    */

    $('#stopDownloads').click(function () {
        chrome.downloads.onCreated.addListener(blockDownloadsListener);
    });

    /**
     * Load film_number and image_count to generate download options
     */
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        request_url = tabs[0].url;
        /**
         *      it's necessary to change the popup content according to the
         * page the user is visiting. If he is still the catalog search page,
         * do not load film number data.
         */
        if (request_url.indexOf("catalog") === -1) {

            chrome.tabs.sendMessage(tabs[0].id, { todo: "getFilmData" }, function (film_data) {

                $('span#film_number').text(film_data.film_number);
                $('span#image_count').text(film_data.image_count);
                $('#fromImage').val('1');
                $("#fromImage").attr("max", film_data.image_count);
                $('#toImage').val(film_data.image_count);
                $('#toImage').attr("max", film_data.image_count);

                const url_params = parseUrlParams(request_url);
                $('input#cat').val(url_params.cat);
                $('input#image_or_film_url').val(url_params.image_or_film_url);


            });
        } else {
            // console.log('addDownloadLinkstoContent from popup');
            // chrome.tabs.sendMessage(tabs[0].id, {todo: "addDownloadLinkstoContent"} , function (film_numbers) {



            // });


        }
    });


    /**
     * Keep number of records downloaded in the last 24 hours updated
     */
    return chrome.storage.local.get(  {FSFilmLog : []} , function (result) {
        FSFilmLog = result.FSFilmLog;
        if (!!FSFilmLog){
            FSFilmLog = deleteOldRecords(FSFilmLog);
            const sum_of_records = countDownloadedRecords(FSFilmLog);
            $('#downloadCountNumber').text(sum_of_records);
        }
    });




});

