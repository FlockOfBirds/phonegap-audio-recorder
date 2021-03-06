define([
    "mxui/widget/_WidgetBase", "mxui/dom", "dojo/dom-class",
    "dojo/_base/declare", "dojo/_base/lang", "dojo/touch",
    "AudioRecorder/widget/Audio", "AudioRecorder/widget/Upload", "mxui/widget/_Button"
], function(_WidgetBase, mxuiDom, dojoClass, declare, dojoLang, touch, Audio, Upload, Button) {
    "use strict";

    return declare("AudioRecorder.widget.AudioRecorder", [ _WidgetBase ], {
        // Modeler properties
        buttonLabel: "",
        buttonClass: "",
        onSaveMicroflow: "",
        iconClassDefault: "",
        iconClassRecording: "",
        iconClassProcessing: "",
        iconClassCanceled: "",
        // Internal settings
        _cancelAnimationTime: 1500,
        _minimalRecordingTime: 200,
        _permissionTestTimeout: 200,
        _vibrationTime: 50,
        // Internal properties
        _hasStarted: false,
        _contextObject: null,
        _buttonNode: null,
        _recordingStarted: false,
        _leaveHandler: null,
        _audio: null,
        _button: null,
        _widgetCssClass: "widget-audio-recorder",

        buildRendering: function() {
            logger.debug(this.id + ".buildRendering");
            // TODO Add other options to Model config.
            this._button = new Button({
                renderType: "button",
                caption: this.buttonLabel,
                iconUrl: "",
                iconClass: this.iconClassDefault,
                cssClasses: this._widgetCssClass + " " + this.buttonClass,
                cssStyle: ""
            });
            this.domNode = this._button.domNode;
        },

        postCreate: function() {
            logger.debug(this.id + ".postCreate");
            this._audio = new Audio();
            this._setupEvents();
        },

        update: function(contextObject, callback) {
            logger.debug(this.id + ".update");
            this._contextObject = contextObject;
            if (contextObject) {
                this._button.enable();
            } else {
                this._button.disable();
            }

            if (callback) {
                callback();
            }
        },

        uninitialize: function() {
            this._audio.cancelRecording();
            if (this._button) {
                this._button.destroy();
            }
        },

        _setupEvents: function() {
            logger.debug(this.id + "._setupEvents");
            this.connect(this.domNode, touch.press, dojoLang.hitch(this, function() { // "mousedown"
                logger.debug(this.id + "._setupEvents: touch.press");
                this._startRecording();
                this._leaveHandler = this.connect(this.domNode, touch.leave, dojoLang.hitch(this, function() { // "mouseleave"
                    logger.debug(this.id + "._setupEvents: touch.leave");
                    if (this._leaveHandler) {
                        this._leaveHandler.remove();
                        this._leaveHandler = null;
                        this._cancelRecording();
                    }
                }));
            }));

            this.connect(this.domNode, touch.release, dojoLang.hitch(this, this._handleStop));
            this.connect(this.domNode, "mouseup", dojoLang.hitch(this, this._handleStop));
        },

        _handleStop: function() {
            logger.debug(this.id + "._handleStop");
            if (this._leaveHandler) {
                this._leaveHandler.remove();
                this._leaveHandler = null;
            }
            this._stopRecording();
        },

        _startRecording: function() {
            logger.debug(this.id + "._startRecording");
            if (this._testSupport()) {
                navigator.vibrate(this._vibrationTime);
                this._recordingStarted = true;
                dojoClass.add(this.domNode, "recording");
                this._button._setIcon(this.iconClassRecording, true);
                this._audio.startRecording();
                setTimeout(dojoLang.hitch(this, function() {
                    if (this._audio.getMediaStatus() === 0) {
                        logger.debug(this.id + "._startRecording: Need confirm state change within " +
                            this._permissionTestTimeout + "ms else the permissions are not set: cancel");
                        this._cancelRecording();
                    }
                }, this._permissionTestTimeout));
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
                dojoClass.remove(this.domNode, "recording");
                this._audio.stopRecording();
                if (this._audio.getDuration() > this._minimalRecordingTime) {
                    dojoClass.add(this.domNode, "processing");
                    this._button._setIcon(this.iconClassProcessing, true);
                    // this._audio.playRecording(); // For testing only
                    var testUrl = this._audio.getUrl(),
                        upload = new Upload();
                    upload.sendFile(this._contextObject.getGuid(), testUrl, dojoLang.hitch(this, function() {
                        logger.debug("Upload completed");
                        this._executeMicroflow(dojoLang.hitch(this, function() {
                            logger.debug("executed Microflow");
                            dojoClass.remove(this.domNode, "processing");
                            this._button._setIcon(this.iconClassDefault, true);
                        }));
                    }));
                } else {
                    this._button._setIcon(this.iconClassDefault, true);
                    logger.debug("Recording to short " + this._audio.getDuration() + "ms " + this._minimalRecordingTime);
                }
            }
        },

        _cancelRecording: function() {
            logger.debug(this.id + "._cancelRecording");
            this._recordingStarted = false;
            this._audio.cancelRecording();
            dojoClass.remove(this.domNode, "recording");

            dojoClass.add(this.domNode, "recording-canceled");
            this._button._setIcon(this.iconClassCanceled, true);
            setTimeout(dojoLang.hitch(this, function() {
                dojoClass.remove(this.domNode, "recording-canceled");
                this._button._setIcon(this.iconClassDefault, true);
            }), this._cancelAnimationTime);
        },

        _executeMicroflow: function(callback) {
            logger.debug(this.id + "._executeMicroflow", this.onSaveMicroflow);
            if (this.onSaveMicroflow && this._contextObject) {
                mx.ui.action(this.onSaveMicroflow, {
                    params: {
                        applyto: "selection",
                        guids: [ this._contextObject.getGuid() ]
                    },
                    callback: callback
                });
            }
        }
    });
});

require([ "AudioRecorder/widget/AudioRecorder" ]);
