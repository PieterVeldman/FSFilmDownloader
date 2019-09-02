/**
 * Add and entry to image downloads log
 * returns true if current_n_records plus the records already downloaded do not
 * exceed maximum download quota
 */
function addLineToChromeStorage(current_n_records, callback ) {
    const MAXIMUM_PERMITTED_DOWNLOADS_PER_DAY = 5000;
    return chrome.storage.local.get({FSFilmLog : []}, function (result) {
        FSFilmLog = result.FSFilmLog;
        FSFilmLog = deleteOldRecords(FSFilmLog);
        let sum_of_records = countDownloadedRecords(FSFilmLog);
        //     is the current sum_of_records +  current_n_records more than the
        // allowed quota?
        if (sum_of_records + current_n_records <= MAXIMUM_PERMITTED_DOWNLOADS_PER_DAY) {
            FSFilmLog.push({datetime: Date.now() ,n_records: current_n_records  });
            return chrome.storage.local.set({FSFilmLog: FSFilmLog}, function () {
               callback(true);
            });
        }else{
            callback(false);
        }
    });
}

/**
 * Function designed to reduce array of log entries to number of downloaded records
 *
 * @param {*} accumulator
 * @param {*} entry
 */
function records_counter(accumulator, entry) {
    return accumulator + entry.n_records;
}

/**
 * Counts how many records were downloaded
 */
function countDownloadedRecords(FSFilmLog) {
    return FSFilmLog.reduce(records_counter,0)
}

/**
 * returns true if the entry is recent enough
 * @param {*} entry Log entry
 */
function isRecentEnough(entry) {
    const day_period = 86400000; // miliseconds in a day = 24*60*60*1000
    const lower_miliseconds_limit = Date.now() - day_period;
    return entry.datetime > lower_miliseconds_limit
}
/**
 * Sweep through log rows and delete those which are older than 24 hours
 *
 * @param {*} FSFilmLog  Log Rows
 */
function deleteOldRecords(FSFilmLog) {
    FSFilmLog  = FSFilmLog.filter(isRecentEnough);
    return FSFilmLog;

}
/**
 * For debugging only. Prints download log
 */
function printChromeStorage() {
    chrome.storage.local.get({FSFilmLog : []}, function (result) {
        console.log(result.FSFilmLog);
    });

}

/**
 * toggle showHide status
 */
function toggleShowHide(callback ) {
    return chrome.storage.local.get(['showHide'], function (result) {
        showHide = !result.showHide;
        return chrome.storage.local.set({showHide: showHide}, function () {
            callback(showHide);
        });
    });
}
/**
 * get showHide status
 */
function getShowHideStatus(callback ) {
    return chrome.storage.local.get(['showHide'], function (result) {
        showHide = result.showHide;
        return callback(showHide);
    });
}