define([ "dojo/_base/declare" ], function(declare) {
    "use strict";

    // Declare widget's prototype.
    return declare("AudioRecorder.widget.Audio", [], {
        localMedia: null,
        audioSrc: "myRecording.amr",
        textFile: "textFile.txt",
        fileCallback: null,
        // The function to record audio file
        startRecording: function() {
            if (this.localMedia) {
                this.localMedia.release();
            }
            this.localMedia = new Media(this.audioSrc, this.onSuccessRecord.bind(this), this.onErrorRecord.bind(this), this.logStatus);
            this.localMedia.startRecord();
        },

        logStatus: function(status) {
            logger.debug("mediaStatus :" + status);
        },

        stopRecording: function() {
            this.localMedia.stopRecord();
        },

        playRecording: function() {
            // this.localMedia.play();
            var url = cordova.file.externalRootDirectory + this.audioSrc;
            var myMedia = new Media(url, 
                function () { console.log("playAudio():Audio Success"); },
                function (err) { console.log("playAudio():Audio Error: " + err); }
            );
            myMedia.play();
        },

        cancelRecording: function() {
            this.localMedia.stopRecord();
            this.localMedia.release();
        },

        onSuccessRecord: function() {
            logger.debug("recordAudio():Audio Success");
        },

        onErrorRecord: function(error) {
            logger.error("onErrorRecord", error);
        },

        createFile: function(fileName) { 
            this.textFile = fileName;
            var that = this, data = "date today is ["+ (new Date())+"]";
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
                dir.getFile(that.textFile, {create:true}, function(file) {
                    file.createWriter(function(fileWriter) {
                        var blob = new Blob([data], { type: 'text/plain' });
                        fileWriter.write(blob);
                    });
                });
            });
        },

        readFile: function(fileName){
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory+fileName, function(fileEntry) {
                console.log("got main dir",fileEntry);
                fileEntry.file(function(file) {
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        console.log("end of file reading");
                        console.log("this.result is", reader.result);
                    };
                    reader.readAsText(file);
                });
            });
        }

    });
});
