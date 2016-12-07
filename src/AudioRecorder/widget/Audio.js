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

        getUrl: function() {
            return cordova.file.externalRootDirectory + this.audioSrc;
        },

        playRecording: function() {
            this.localMedia.play();
        },

        cancelRecording: function() {
            if (this._mediaRecorder) {
                this._mediaRecorder.stopRecord();
                this._mediaRecorder.release();
            }
        },

        onSuccessRecord: function() {
            logger.debug("recordAudio():Audio Success");
        },

        onErrorRecord: function(error) {
            logger.error("onErrorRecord", error);
        }
    });
});
