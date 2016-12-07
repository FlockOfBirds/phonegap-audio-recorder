define([ "dojo/_base/declare" ], function(declare) {
    "use strict";

    // Declare widget's prototype.
    return declare("AudioRecorder.widget.Audio", [], {
        localMedia: null,
        audioSrc: "myRecording.wav",
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
            // The function to read file and get base64
            // this.fileCallback = callback; // This is bad, TODO fix this!
            // this.getAudioBase();
        },

        playRecording: function() {
            this.localMedia.play();
        },

        cancelRecording: function() {
            this._mediaRecorder.stopRecord();
            this._mediaRecorder.release();
        },

        onSuccessRecord: function() {
            logger.debug("recordAudio():Audio Success");
        },

        onErrorRecord: function(error) {
            logger.error("onErrorRecord", error);
        }

        // // File reading
        // getAudioBase: function() {
        //     window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, this.gotFileSystem.bind(this), this.fileFail.bind(this));
        // },

        // gotFileSystem: function(fileSystem) {
        //     fileSystem.root.getFile(this.audioSrc, {
        //         create: false, exclusive: false
        //     }, this.gotFileEntry.bind(this), this.fileFail.bind(this));
        // },

        // gotFileEntry: function(fileEntry) {
        //     fileEntry.file(this.gotFile.bind(this), this.fileFail.bind(this));
        // },

        // gotFile: function(file) {
        //     file.type = "audio/wav";
        //     if (this.fileCallback) {
        //         this.fileCallback(file);
        //     }
        //     // this.readAsDataURL(file);
        // },

        // readAsDataURL: function(file) {
        //     logger.debug("reading as url");
        //     var reader = new FileReader();
        //     reader.onloadend = function(evt) {
        //         logger.debug("Read as data url");
        //         logger.debug("base64 of audio " + evt.target.result);
        //     };
        //     reader.readAsDataURL(file);
        // },

        // fileFail: function(error) {
        //     logger.error(error.code);
        // }
    });
});
