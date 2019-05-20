
function downloadImages(images_data, film_number) {

    images_data.forEach(image_data => {
        console.log(image_data);
        const image_url ='https://familysearch.org/das/v2/'+image_data.img_id+'/dist.jpg'
        const filename =  film_number+'/image.png';
        const img_sequence = image_data.img_sequence;


    });
}

$(function(){
    color = $('#fontColor').val();
    $("#fontColor").on("change paste keyup", function() {
        color = $(this).val();
    });

   $('#btnChange').click(function(){
         chrome.tabs.query({active:true,currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {todo: "changeColor", clickedColor: color, url: tabs[0].url  } , function (images_data, film_number) {


                alert(response);

                // chrome.downloads.download({url: img_url,
                //     //filename: 'image.png', saveAs: true},
                //     filename: filename},
                //     function(img_sequence,id) {
                //         console.log("downloading "+img_sequence)
                // });

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

