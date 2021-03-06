// Helper function that formats the file sizes
function formatFileSize(bytes) {
    if (typeof bytes !== 'number') {
        return '';
    }

    if (bytes >= 1000000000) {
        return (bytes / 1000000000).toFixed(2) + ' GB';
    }

    if (bytes >= 1000000) {
        return (bytes / 1000000).toFixed(2) + ' MB';
    }

    return (bytes / 1000).toFixed(2) + ' KB';
}


$(function(){
    var tpl = '<li class="working"><input type="text" value="0" data-width="48" data-height="48"' +
        ' data-fgColor="#0788a5" data-readOnly="1" data-bgColor="#3e4043" /><p></p><span></span>'+
        '<a target="_blank" class="btn btn-warning" id="download-btn"> <i class="icon icon-download"></i> Download</a>'+
      '</li>';

    var ul = $('#upload ul');

    $('#drop a').click(function(){
        // Simulate a click on the file input button
        // to show the file browser dialog
        $(this).parent().find('input').click();
    });

    // Initialize the jQuery File Upload plugin
    $('#upload').fileupload({

        // This element will accept file drag/drop uploading
        dropZone: $('#drop'),

        // This function is called when a file is added to the queue;
        // either via the browse button, or via drag/drop:
        add: function (e, data) {
            var row = $(tpl); // Instantiate the template

            // Append the file name and file size
            row.find('p').text(data.files[0].name)
                         .append('<i>' + formatFileSize(data.files[0].size) + '</i>');

            // Add the HTML to the UL element
            row.appendTo(ul);

            data.context = {
              element: row
            }


            // Initialize the knob plugin
            row.find('input').knob();

            // Listen for clicks on the cancel icon
            row.find('span').click(function(){
                if(row.hasClass('working')){
                    jqXHR.abort();
                }

                row.fadeOut(function(){ row.remove(); });
            });

            // Automatically upload the file once it is added to the queue
            var jqXHR = data.submit();

            //Cancel all Running Uploads
            $('#cancel-upload').click(function(){ jqXHR.abort(); });

            //Deleted all Running Uploads
            $('#delete-upload').click(function(){ row.remove(); });
        },

        progress: function(e, data) {
            // Calculate the completion percentage of the upload
            var progress = parseInt(data.loaded / data.total * 100, 10);

            // Update the hidden input field and trigger a change
            // so that the jQuery knob plugin knows to update the dial
            data.context.element.find('input').val(progress).change();
        },

        fail:function(e, data) {
            data.context.element.addClass('error');
        },

        done:function(e, data) {
            var key = data.result.filehash;

            data.context.element.removeClass('working');
            data.context.element.removeClass('processing');
            data.context.element.find('input').trigger('configure', { 'fgColor': '#0788a5' });
            data.context.element.find('a').attr("href", "/api/download/" + key);
        }
    });

    // Prevent the default action when a file is dropped on the window
    $(document).on('drop dragover', function (e) {
        e.preventDefault();
    });
});
