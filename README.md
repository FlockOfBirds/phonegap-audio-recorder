# Phonegap audio recorder

Record microphone audio.

- Start recording while the button is pressed down
- Stop recording when the button is released
- Send file to server after the recording is finished
- Call a microflow after the file has been uploaded
- Cancels recording 
    - Shorter than 200ms
    - When touch is released outside the start button
- Styling:
    - Classes for different states: recording, processing, recording-canceled
    - Font icons for state: default, recording, processing, recording-canceled
- File format
    - Android .3gp Adaptive Multi-Rate format
    - iOS .wav Waveform Audio File format

## Demo

https://phonegapaudiorecor.mxapps.io

## Issues

Please report any issues or ideas to improve this widget:

https://github.com/FlockOfBirds/phonegap-audio-recorder/issues
 
## Dependency

- Mendix 6.10
- Cordova plugins
    - media https://github.com/apache/cordova-plugin-media
    - file https://github.com/apache/cordova-plugin-file
    - device https://github.com/apache/cordova-plugin-device

Please note that iOS 10 can crash when `Microphone Usage Description` is not provided.

### config.xml

```xml
<gap:plugin name="cordova-plugin-media" source="npm" version="2.4.1" />
<gap:plugin name="cordova-plugin-file" source="npm" version="4.3.1" />
<gap:plugin name="cordova-plugin-device" source="npm" version="1.1.4" />

<platform name="ios">
    <config-file parent="NSMicrophoneUsageDescription" platform="ios" target="*-Info.plist">
        <string>This application needs access to the microphone</string>
    </config-file>
</platform>
```
