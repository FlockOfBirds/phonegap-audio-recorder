define([ "dojo/_base/declare" ], function(declare) {
    "use strict";

    var Upload = declare("AudioRecorder.widget.Upload", [], {
        sendFile: function(guid, fileUrl, callback) {
            logger.debug(this.id + "._sendFile");
            var self = this,
                filename = (/[^\/]*$/).exec(fileUrl)[0];
            if (window.mx.data.saveDocument && window.mx.data.saveDocument.length === 6) {
                window.resolveLocalFileSystemURL(fileUrl, function(fileEntry) {
                    self.resolveFileSuccess(fileEntry, guid, filename, callback);
                }, self.error);
            } else {
                logger.error("Upload file not supported.");
            }
        },

        resolveFileSuccess: function(fileEntry, guid, filename, callback) {
            var self = this;
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
        },
        error: function(uploadError) {
            logger.debug("Upload error", uploadError);
            window.mx.ui.error("Uploading audio failed with error code " + uploadError.code);
        }
    });

    Upload.testSupport = function() {
        return window.mx.data.saveDocument && window.mx.data.saveDocument.length === 6;
    };

    return Upload;
});
