/*global logger*/
/*
    PAR
    ========================

    @file      : PAR.js
    @version   : 1.0.0
    @author    : Acellam Guy
    @date      : Fri, 02 Dec 2016 11:37:15 GMT
    @copyright : Flock Of Birds
    @license   : MIT

    Documentation
    ========================
    Describe your widget here.
*/
/*global mxui, mx, dojo, cordova */
define([
    "mxui/widget/_WidgetBase", "mxui/dom", "dojo/dom-class", "dojo/_base/declare"
], function (_WidgetBase, mxuiDom, dojoClass, declare) {
    "use strict";

    // Declare widget's prototype.
    return declare("PAR.widget.PAR", [_WidgetBase], {

        buttonLabel: "",
        buttonClass: "",
        onchangemf: "",

        _hasStarted: false,
        _obj: null,
        _button: null,

        startup: function () {
            if (this._hasStarted) return;

            this._hasStarted = true;

            dojoClass.add(this.domNode, "widget-audiorecorder-container");

            this._createChildNodes();
            this._setupEvents();
        },

        update: function (obj, callback) {
            this._obj = obj;
            if (callback) callback();
        },

        _setupEvents: function () {
            var audioRecorderAvailable = (
                typeof (cordova) !== "undefined" &&
                typeof (Media) !== "undefined"
            );

            if (audioRecorderAvailable) {
                this.connect(this._button, "click", function () {
                    console.log('starting recording');
                    var src = "cdvfile://localhost/persistent/par.mp3";
                    var mediaRec = new Media(src,

                        function () {
                            console.log('mediaSuccess');
                            this._audioRecordSuccess.bind(this)
                        },
                        function (err) {
                            console.log('mediaError: ' + err.code + '   ' + err.message);
                            this._audioRecordFailure.bind(this)
                        },
                        function (status) {
                            console.log('mediaStatus :' + status);
                        });
                    console.log(mediaRec);

                    mediaRec.startRecord();

                    setTimeout(function () {
                        mediaRec.stopRecord();
                        mediaRec.release();

                    }, 10000);
                });
            } else {
                this.connect(this._button, "click", function () {
                    mx.ui.error("Unable to detect microphone.");
                });
            }
        },

        _audioRecordSuccess: function (output) {
            if (!output.cancelled && output.text && output.text.length > 0) {
                //TODO save audio
                //this._obj.set(this.attributeName, output.text);
                this._executeMicroflow();
            }
        },

        _audioRecordFailure: function (error) {
            mx.ui.error("Recording failed: " + error.message);
        },

        _executeMicroflow: function () {
            if (this.onchangemf && this._obj) {
                mx.data.action({
                    params: {
                        actionname: this.onchangemf,
                        applyto: "selection",
                        guids: [this._obj.getGuid()]
                    }
                });
            }
        },

        _createChildNodes: function () {
            this._button = mxuiDom.create("div", {
                "class": "widget-recorder-button btn btn-primary"
            });
            if (this.buttonClass) dojoClass.add(this._button, this.buttonClass);

            this._button.textContent = this.buttonLabel || "Record Audio";

            this.domNode.appendChild(this._button);
        }
    });
});

require(["PAR/widget/PAR"]);
