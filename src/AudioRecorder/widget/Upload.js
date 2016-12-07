define([ "dojo/_base/declare" ], function(declare) {
    "use strict";

    return declare("AudioRecorder.widget.Upload", [], {
        // Should split in multiple functions, not nested 10 deep.
        sendFile: function(guid, fileUrl, callback) {
            logger.debug(this.id + "._sendFile");
            var self = this,
                filename = (/[^\/]*$/).exec(fileUrl)[0];
            if (window.mx.data.saveDocument && window.mx.data.saveDocument.length === 6) {
                window.resolveLocalFileSystemURL(fileUrl, function(fileEntry) {
                    fileEntry.file(function(blob) {
                        var fileReader = new FileReader();
                        fileReader.onload = function(event) {
                            window.mx.data.saveDocument(guid, filename, {}, new Blob([ event.target.result ]),
                                function() {
                                    logger.debug(self.id + "._sendFile.success");
                                    if (callback) {
                                        callback();
                                    }
                                },
                                self.error
                            );
                        };

                        fileReader.onerror = function(event) {
                            self.error(event.target.error);
                        };

                        fileReader.readAsArrayBuffer(blob);
                    }, self.error);
                }, self.error);
            } else {
                logger.error("Upload file not supported ");
            }
        },

        error: function(uploadError) {
            logger.debug("Upload error", uploadError);
            window.mx.ui.error("Uploading audio failed with error code " + uploadError.code);
        }
    });
});
