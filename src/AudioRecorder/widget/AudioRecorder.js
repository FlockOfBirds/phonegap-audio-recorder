define([
    "mxui/widget/_WidgetBase", "mxui/dom", "dojo/dom-class",
    "dojo/_base/declare", "dojo/_base/lang", "dojo/touch",
    "AudioRecorder/widget/Audio", "AudioRecorder/widget/Upload"
], function(_WidgetBase, mxuiDom, dojoClass, declare, dojoLang, touch, Audio, Upload) {
    "use strict";

    // Declare widget"s prototype.
    return declare("AudioRecorder.widget.AudioRecorder", [ _WidgetBase ], {
        // Modeler properties
        buttonLabel: "",
        buttonClass: "",
        onChangeMicroflow: "", // TODO Rename
        // Internal properties
        _hasStarted: false,
        _contextObject: null,
        _button: null,
        _recordingStarted: false,
        _leaveHandler: null,
        _audio: null,
        _cancelAnimationTime: 1000,

        startup: function() {
            logger.debug(this.id + ".startup");
            if (this._hasStarted) {
                return;
            }
            this._audio = new Audio();
            this._createChildNodes();
            this._setupEvents();
        },

        update: function(object, callback) {
            logger.debug(this.id + ".update");
            this._contextObject = object;
            if (callback) {
                callback();
            }
        },

        _setupEvents: function() {
            logger.debug(this.id + "._setupEvents");
            // TODO cordova check, with UI message that audio recording is not available
            this.connect(this._button, touch.press, dojoLang.hitch(this, function() { // "mousedown"
                this._startRecording();
                this._leaveHandler = this.connect(this._button, touch.leave, dojoLang.hitch(this, function() { // "mouseleave"
                    this._leaveHandler.remove();
                    this._leaveHandler = null;
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
            if (this._testSupport()) {
                this._recordingStarted = true;
                dojoClass.add(this._button, "recording");
                this._audio.startRecording();
            }
        },

        _testSupport: function() {
            if (!Audio.testSupport()) {
                window.mx.ui.warning("AudioRecorder: Audio recording is not supported", true);
                return false;
            }
            if (!Upload.testSupport()) {
                window.mx.ui.warning("AudioRecorder: File upload is not supported", true);
                return false;
            }
            return true;
        },

        _stopRecording: function() {
            if (this._recordingStarted) {
                logger.debug(this.id + "._endRecording");
                this._recordingStarted = false;
                dojoClass.remove(this._button, "recording");
                dojoClass.add(this._button, "processing");
                this._audio.stopRecording();
                this._audio.playRecording(); // For testing only
                var testUrl = this._audio.getUrl(),
                    upload = new Upload();
                upload.sendFile(this._contextObject.getGuid(), testUrl, function() {
                    logger.debug("Upload completed");
                    this._executeMicroflow(function() {
                        // TODO Test callback
                        dojoClass.remove(this._button, "processing");
                    });
                });
            }
        },

        _cancelRecording: function() {
            logger.debug(this.id + "._cancelRecording");
            this._recordingStarted = false;
            this._audio.cancelRecording();
            dojoClass.remove(this._button, "recording");
            // TODO add class "recording-canceled" for 2 seconds
        },

        _executeMicroflow: function(callback) {
            logger.debug(this.id + "._executeMicroflow", this.onChangeMicroflow);
            if (this.onChangeMicroflow && this._contextObject) {
                mx.ui.action(this.onChangeMicroflow, {
                    params: {
                        applyto: "selection",
                        callback: callback,
                        guids: [ this._contextObject.getGuid() ]
                    }
                });
            }
        },

        _createChildNodes: function() {
            // Reuse "mxui.widget._Button", use button.domNode for touch events (not onClick)
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
