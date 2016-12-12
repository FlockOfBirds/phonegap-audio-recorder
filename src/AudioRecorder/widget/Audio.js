define([ "dojo/_base/declare" ], function(declare) {
    "use strict";

    // Declare widget's prototype.
    return declare("AudioRecorder.widget.Audio", [], {
        localMedia: null,
        fileName: "Recording_{date}",
        fileExtension: "wav",
        audioSrc: "",
        fileCallback: null,

        startRecording: function() {
            // if (this.localMedia) {
            //     this.localMedia.release();
            // }
            this.audioSrc = this.fileName.replace("{date}", Date.now()) + "." + this.getExtension();
            this.localMedia = new Media(this.audioSrc,
                this.onSuccessRecord.bind(this),
                this.onErrorRecord.bind(this),
                this.logStatus
            );
            this.localMedia.startRecord();
        },

        getExtension: function() {
            // TODO OS Depended return.
            return this.fileExtension;
        },

        logStatus: function(status) {
            logger.debug("mediaStatus :" + status);
        },

        stopRecording: function() {
            if (this.localMedia) {
                this.localMedia.stopRecord();
                this.localMedia.release();
            }
        },

        getUrl: function() {
            if (device.platform === "iOS") {
                return cordova.file.tempDirectory + this.audioSrc;
            }
            if (device.platform === "Android") {
                return cordova.file.externalRootDirectory + this.audioSrc;
            }
            return this.audioSrc;
        },

        playRecording: function() {
            this.localMedia.play();
        },

        cancelRecording: function() {
            this.stopRecording();
        },

        onSuccessRecord: function() {
            logger.debug("recordAudio():Audio Success");
        },

        onErrorRecord: function(error) {
            logger.error("onErrorRecord", error);
            // TODO UI output
        }
    });
});
