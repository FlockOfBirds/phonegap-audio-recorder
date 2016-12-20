define([ "dojo/_base/declare", "dojo/_base/lang" ], function(declare, dojoLang) {
    "use strict";

    var Audio = declare("AudioRecorder.widget.Audio", [], {
        _localMedia: null,
        _fileName: "Recording_{date}",
        _audioSrc: "",
        _duration: 0,
        _startTime: 0,
        _status: 0, // NONE = 0, STARTING = 1, RUNNING = 2, PAUSED = 3, STOPPED = 4;
        // Audio compress
        _withCompression: false,
        _sampleRate: 16000, // 16 kHz
        _numberOfChannels: 1, // Single channel (mono)

        constructor: function() {
            this._withCompression = this._testCompressionSupport();
        },

        startRecording: function() {
            this._audioSrc = this._fileName.replace("{date}", Date.now()) + "." + this._getExtension();
            this._startTime = Date.now();
            this._status = 0;
            if (device.platform === "Android") {
                // Need to release to fix first time loading after permission is set.
                if (this._localMedia) {
                    this._localMedia.release();
                }
                this._startRecording();
            } else if (device.platform === "iOS") {
                this._getFileIOS(dojoLang.hitch(this, function() {
                    this._startRecording();
                }));
            } else {
                window.mx.ui.error("Device platform: '" + device.platform + "' is not supported");
            }
        },

        getMediaStatus: function() {
            return this._status;
        },

        stopRecording: function() {
            logger.debug("stopRecording");
            if (this._startTime) {
                this._duration = Date.now() - this._startTime;
            }
            if (this._localMedia) {
                this._localMedia.stopRecord();
                this._localMedia.release();
                return true;
            }
            return false;
        },

        getDuration: function() {
            return this._duration;
        },

        getUrl: function() {
            if (device.platform === "iOS") {
                return cordova.file.tempDirectory + this._audioSrc;
            }
            if (device.platform === "Android") {
                return cordova.file.externalRootDirectory + this._audioSrc;
            }
            return this._audioSrc;
        },

        playRecording: function() {
            this._localMedia.play();
        },

        cancelRecording: function() {
            this.stopRecording();
        },

        _startRecording: function() {
            this._localMedia = new Media(this._audioSrc,
                this._onSuccessRecord.bind(this),
                this._onErrorRecord.bind(this),
                this._setMediaStatus.bind(this)
            );
            if (this._withCompression) {
                this._localMedia.startRecordWithCompression({
                    SampleRate: this._sampleRate,
                    NumberOfChannels: this._numberOfChannels
                });
            } else {
                this._localMedia.startRecord();
            }
        },

        _testCompressionSupport: function() {
            if (device.platform === "Android" || device.platform === "iOS") {
                var tmpMedia = new Media("document://tmp" + Date.now());
                // Requires cordova-media-with-compression plugin to be installed
                // instead of cordova-plugin-media
                if (typeof tmpMedia.startRecordWithCompression === "function") {
                    return true;
                }
            }
            return false;
        },

        _getExtension: function() {
            if (this._withCompression) {
                return "m4a";
            }
            if (device.platform === "Android") {
                return "3gp";
            }
            // Else the platform is iOS
            return "wav";
        },

        _getFileIOS: function(callback) {
            window.requestFileSystem(LocalFileSystem.TEMPORARY, 0,
                dojoLang.hitch(this, function(fileSystem) {
                    logger.debug("fileSystem.root.name: " + fileSystem.root.name);
                    fileSystem.root.getFile(this._audioSrc, { create: true, exclusive: false },
                        function() {
                            callback();
                        }, function(error) {
                            logger.error("Failed in getting the created media file", error);
                        }
                    );
                }), function(error) {
                    logger.error("Failed in creating media file in requestFileSystem", error);
                }
            );
        },

        _setMediaStatus: function(status) {
            logger.debug("mediaStatus :" + status);
            this._status = status;
        },

        _onSuccessRecord: function() {
            logger.debug("recordAudio():Audio Success");
        },

        _onErrorRecord: function(error) {
            logger.error("_onErrorRecord", error);
            window.mx.ui.error("Audio: error on audio recording, code " + error.code, true);
        }
    });

    Audio.testSupport = function() {
        return typeof (cordova) !== "undefined" && typeof (Media) !== "undefined";
    };

    return Audio;
});
