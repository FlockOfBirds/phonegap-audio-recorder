define([
    "mxui/widget/_WidgetBase", "mxui/dom", "dojo/dom-class", "dojo/_base/declare", "dojo/_base/lang", "dojo/touch"
], function(_WidgetBase, mxuiDom, dojoClass, declare, dojoLang, touch) {
    "use strict";

    // Declare widget"s prototype.
    return declare("AudioRecorder.widget.AudioRecorder", [ _WidgetBase ], {
        // Modeler properties
        buttonLabel: "",
        buttonClass: "",
        onChangeMicroflow: "",
        // Internal properties
        _hasStarted: false,
        _contextObject: null,
        _button: null,
        _recordingStarted: false,
        _leaveHandler: null,
        _mediaRecorder: null,
        _audioRecord: null,
        _audioUrl: "",
        _audioFile: null,

        startup: function() {
            logger.debug(this.id + ".startup");
            if (this._hasStarted) {
                return;
            }
            this._audioFile = null;
            this._audioRecord = null;
            this._hasStarted = true;
            this._mediaRecorder = null;
            this._createChildNodes();
            this._setupEvents();
            this._createAudioRecord();
        },

        update: function(object, callback) {
            logger.debug(this.id + ".update");
            this._contextObject = object;
            // TODO disable when not context is available.
            if (callback) {
                callback();
            }
        },

        _setupEvents: function() {
            logger.debug(this.id + "._setupEvents");
            this.connect(this._button, touch.press, dojoLang.hitch(this, function() { // "mousedown"
                this._startRecording();
                this._leaveHandler = this.connect(this._button, touch.leave, dojoLang.hitch(this, function() { // "mouseleave"
                    if (this._leaveHandler) {
                        this._leaveHandler.remove();
                        this._leaveHandler = null;
                    }
                    this._cancelRecording();
                }));
            }));
            this.connect(this._button, touch.release, dojoLang.hitch(this, function() { // "mouseup"
                if (this._leaveHandler) {
                    this._leaveHandler.remove();
                    this._leaveHandler = null;
                }
                this._stopRecording();
            }));
        },

        _startRecording: function() {
            logger.debug(this.id + "._startRecording");
            this._recordingStarted = true;
            dojoClass.add(this._button, "recording");
            this._startAudioRecording();
        },

        _startAudioRecording: function() {
            var self = this;
            logger.debug(this.id + "._startAudioRecording");
            var audioRecorderAvailable = (
                typeof (cordova) !== "undefined" &&
                typeof (Media) !== "undefined"
            );

            if (audioRecorderAvailable) {
                this._mediaRecorder = new Media(this._audioUrl,
                    function() {
                        logger.debug("mediaSuccess");
                        self._autoSave();
                    },
                    function(error) {
                        logger.debug("mediaError: " + error.code + "   " + error.message);
                    },
                    function(status) {
                        logger.debug("mediaStatus :" + status);
                    }
                );
                this._mediaRecorder.startRecord();
            } else {
                mx.ui.error("Unable to detect microphone.");
            }
        },

        _createAudioRecord: function() {
            // Prepares File System for Audio Recording
            this._audioRecord = "AudioRecorder.mp3"; // TODO make time unique
            var self = this;

            window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, gotFS, fail);

            function gotFS(fileSystem) {
                fileSystem.root.getFile(self._audioRecord, {
                    create: true,
                    exclusive: false
                }, gotFileEntry, fail);
            }

            function gotFileEntry(fileEntry) {
                self._audioFile = fileEntry;
                self._audioUrl = fileEntry.toURL();
            }

            function fail(error) {
                console.log("requestFileSystem.error", error);
            }
        },

        _stopRecording: function() {
            if (this._recordingStarted) {
                logger.debug(this.id + "._endRecording");
                this._recordingStarted = false;
                dojoClass.remove(this._button, "recording");
                dojoClass.add(this._button, "processing");
                this._stopAudioRecording();
                // this._sendFile(dojoLang.hitch(this, function() {
                //     dojoClass.remove(this._button, "processing");
                //     this._executeMicroflow();
                // }));
            }
        },

        _stopAudioRecording: function() {
            logger.debug(this.id + "._stopAudioRecording");
            this._mediaRecorder.stopRecord();
            this._mediaRecorder.release();
            this._mediaRecorder.play();
        },

        _cancelRecording: function() {
            logger.debug(this.id + "._cancelRecording");
            this._recordingStarted = false;
            dojoClass.remove(this._button, "recording");
        },

        _autoSave: function(url) {
            // this._audioUrl = url;
            if (this._contextObject) {
                window.mx.data.save({
                    mxobj: this._contextObject,
                    callback: function() {
                        this._sendFile();
                    }
                }, this);
            }
        },

        _sendFile: function(callback) {
            logger.debug(this.id + "._sendFile");
            var self = this;
            if (!this._audioUrl) {
                if (callback) {
                    callback();
                }
                return;
            }

            var filename = (/[^\/]*$/).exec(this._audioUrl)[0],
                guid = this._contextObject.getGuid();
            if (window.mx.data.saveDocument && window.mx.data.saveDocument.length === 6) {
                // window.resolveLocalFileSystemURL(this._audioUrl, function(fileEntry) {
                self._audioFile.file(function(blob) {
                    var fileReader = new FileReader();
                    fileReader.onload = function(event) {
                        window.mx.data.saveDocument(guid, filename, {}, new Blob([ event.target.result ]), success, error);
                    };

                    fileReader.onerror = function(event) {
                        error(event.target.error);
                    };

                    fileReader.readAsArrayBuffer(blob);
                }, error);
                // }, error);
            } else {
                // For Mendix versions < 6.4
                var options = new FileUploadOptions();
                options.fileKey = "mxdocument";
                options.fileName = filename;
                options.mimeType = "image/jpeg";
                options.useBrowserHttp = true;

                var url = mx.appUrl +
                    "file?guid=" + this._contextObject.getGuid() +
                    "&csrfToken=" + mx.session.getCSRFToken();

                var ft = new FileTransfer();
                ft.upload(this._audioUrl, url, refreshObject, error, options);
            }

            function refreshObject() {
                logger.debug(self.id + "._sendFile.refreshObject");
                window.mx.data.get({
                    guid: guid,
                    noCache: true,
                    callback: success,
                    error: error
                });
            }

            function success(callback) {
                logger.debug(self.id + "._sendFile.success");
                // TODO remove calss and call MF should be done in call back in the top of the chain.
                dojoClass.remove(self._button, "processing");
                self._executeMicroflow();
                // if (callback) {
                //     callback();
                // }
            }

            function error(uploadError) {
                logger.debug(self.id + "._sendFile.error", uploadError);
                window.mx.ui.error("Uploading audio failed with error code " + uploadError.code);
            }
        },

        // _audioRecordSuccess: function(output) {
        //     logger.debug(this.id + "._audioRecordSuccess");
        //     if (!output.cancelled && output.text && output.text.length > 0) {
        //         // TODO save audio
        //         // this._obj.set(this.attributeName, output.text);
        //     }
        // },

        // _audioRecordFailure: function(error) {
        //     logger.debug(this.id + "._audioRecordFailure");
        //     mx.ui.error("Recording failed: " + error.message);
        // },

        _executeMicroflow: function() {
            logger.debug(this.id + "._executeMicroflow", this.onChangeMicroflow);
            if (this.onChangeMicroflow && this._contextObject) {
                mx.ui.action(this.onChangeMicroflow, {
                    params: {
                        applyto: "selection",
                        guids: [ this._contextObject.getGuid() ]
                    }
                });
            }
        },

        _createChildNodes: function() {
            logger.debug(this.id + "._createChildNodes");
            dojoClass.add(this.domNode, "widget-audio-recorder");
            this._button = mxuiDom.create("div", {
                class: "widget-recorder-button btn"
            });
            if (this.buttonClass) {
                dojoClass.add(this._button, this.buttonClass);
            }
            this._button.textContent = this.buttonLabel || "Record Audio";

            this.domNode.appendChild(this._button);
        }
    });
});

require([ "AudioRecorder/widget/AudioRecorder" ]);
