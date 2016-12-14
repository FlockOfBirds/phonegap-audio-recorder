define([ "dojo/_base/declare" ], function(declare) {
    "use strict";

    var Audio = declare("AudioRecorder.widget.Audio", [], {
        localMedia: null,
        fileName: "Recording_{date}",
        fileExtension: "wav",
        audioSrc: "",
        fileCallback: null,
        _duration: 0,
        _startTime: 0,

        startRecording: function() {
            this.audioSrc = this.fileName.replace("{date}", Date.now()) + "." + this.getExtension();
            this.localMedia = new Media(this.audioSrc,
                this.onSuccessRecord.bind(this),
                this.onErrorRecord.bind(this),
                this.setMediaStatus.bind(this)
            );
            this._startTime = Date.now();
            this.localMedia.startRecord();
        },

        getExtension: function() {
            return this.fileExtension;
        },

        setMediaStatus: function(status) {
            logger.debug("mediaStatus :" + status);
        },

        stopRecording: function() {
            logger.debug("stopRecording");
            if (this._startTime) {
                this._duration = Date.now() - this._startTime;
            }
            if (this.localMedia) {
                this.localMedia.stopRecord();
                this.localMedia.release();
                return true;
            }
            return false;
        },

        getDuration: function() {
            return this._duration;
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
            window.mx.ui.error("Audio: error on audio recording, code " + error.code, true);
        }
    });

    Audio.testSupport = function() {
        return typeof (cordova) !== "undefined" && typeof (Media) !== "undefined";
    };

    return Audio;
});
