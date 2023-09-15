# react-native-voicebox-speech-rec <img src="https://github.com/sunboykenneth/react-native-voicebox-speech-rec/blob/main/img/library_logo.png?raw=true"  alt="SpeechRec"  width="64"  height="64">

**React Native Voicebox Speech Recognition**: A powerful speech recognition library for React Native applications, enabling real-time speech-to-text transcription.

- 📱 Cross-platform: Consistent and reliable performance on both iOS and Android.
- 🌐 Driven by the [SpeechRecognition interface](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) from the Web Speech API.
<br/>
<p  align="center">
<img  src="https://github.com/sunboykenneth/react-native-voicebox-speech-rec/blob/main/img/example_app_demo.gif?raw=true"  alt="SpeechRec"  width="300">
</p>
<br/>

## Versions

| 1.0.0           |
| --------------- |
| iOS support     |
| Android support |
| Sample App      |

<br/>

## Features

- **Real-time Transcription**: Convert speech to text in real-time as the user speaks.
- **Custom Handlers**: Easily setup callback handlers for start, end, and error events during speech recognition.
- **Language Flexibility**: Set a specific language for recognition or default to the user's device system language.
- **No Cloud Dependency**: Leverage the native speech recognition engines on iOS and Android without relying on external cloud services.
- **Universal Language Support**: Compatible with most languages.
  <br/>

## Installation

    npm install react-native-voicebox-speech-rec --save

or

    yarn add react-native-voicebox-speech-rec

<br/>

Then link the iOS package by running:

    cd ios && pod install && cd ..

or

    npx pod-install

<br  />

Please make sure AndroidX is enabled in your React Native project by editing `android/gradle.properties` and adding the following 2 lines if they are not there yet:

    android.useAndroidX=true
    android.enableJetifier=true

<br/>

## Linking

Please use React Native version >=0.60 . React native will automatically link the library to your project.

## Development Notes

📱 **iOS Simulator Limitation**: The simulator simulates voice input with repeated "Test" phrases and does not utilize the actual microphone input. For genuine speech recognition testing, use a **physical iPhone**.

🤖 **Android Emulator**: No specific issues noted. Just remember to enable to use the host audio input for emulator everytime (shown below).

<p  align="center">
<img  src="https://github.com/sunboykenneth/react-native-voicebox-speech-rec/blob/main/img/android_emulator_setup.gif?raw=true"  alt="SpeechRec"  width="500">
</p>
<br/>

## Usage

Just two steps:

- In App.jsx or App.tsx in your React Native project, wrap your components with `SpeechRecognitionRootView` from react-native-voicebox-speech-rec

```js
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { ConversationPage } from './conversation/ConversationPage';
import { SpeechRecognitionRootView } from 'react-native-voicebox-speech-rec';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App(): JSX.Element {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <SpeechRecognitionRootView>
          <ConversationPage />
        </SpeechRecognitionRootView>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
export default App;
```

<br />

- In the file where you want to use speech recognition (e.g. ConversationPage in code example above), use the `useSpeechRecognition` hook to get the APIs and use them.

```js
import React, { useCallback, useEffect, useMemo } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MicrophoneButton } from './MicrophoneButton';
import { useSpeechRecognition } from 'react-native-voicebox-speech-rec';

export const ConversationPage = React.memo(() => {
  /** ***************************************************************
   * Speech Recognition APIs from useSpeechRecognition hook
   *************************************************************** */
  const {
    startSpeechRecognition,
    stopSpeechRecognition,
    speechContentRealTime,
    setSpeechRecErrorHandler,
    setSpeechRecStartedHandler,
    setSpeechRecCompletedHandler,
  } = useSpeechRecognition();

  // Event handler when speech recognition starts
  useEffect(() => {
    setSpeechRecStartedHandler(() => {
      console.log('👆 Speech Recgnition Started!');
    });
  }, [setSpeechRecStartedHandler]);

  // Event handler when speech recognition has errors
  useEffect(() => {
    setSpeechRecErrorHandler((errorMessage: any) => {
      Alert.alert(
        'Error in speech recognition',
        String(errorMessage),
        [
          {
            text: 'OK',
            style: 'cancel',
          },
        ],
        { cancelable: false }
      );
    });
  }, [setSpeechRecErrorHandler]);

  // Event handler when speech recognition ends
  useEffect(() => {
    setSpeechRecCompletedHandler(async (userChatMessage: string) => {
      if (userChatMessage.length > 0) {
        console.log('🎉 Speech Recognition Completed. Recognized Content: ', userChatMessage);
      } else {
        console.log('🎉 Speech Recognition Completed. User spoke nothing. ');
      }
    });
  }, [setSpeechRecCompletedHandler]);

  /** **********************************************************************
   * Start speech recognition when user presses the microphone button
   ********************************************************************** */
  const handleConversationButtonPressed = useCallback(async () => {
    startSpeechRecognition();
  }, [startSpeechRecognition]);

  /** **********************************************************************
   * End speech recognition when user releases the microphone button
   ********************************************************************** */
  const handleConversationButtonReleased = useCallback(() => {
    stopSpeechRecognition();
  }, [stopSpeechRecognition]);

  const speechRecContentArea = useMemo(() => {
    return <Text variant="titleLarge">{speechContentRealTime}</Text>;
  }, [speechContentRealTime]);

  return (
    <SafeAreaView>
      {/* Show realtime speech recognition content in this area */}
      <ScrollView>{speechRecContentArea}</ScrollView>

      <MicrophoneButton
        disabled={false}
        handleButtonPressed={handleConversationButtonPressed}
        handleButtonReleased={handleConversationButtonReleased}
      />
    </SafeAreaView>
  );
});
```

<br/>

## Example App

For full and advanced usage please take a look into the example React Native app in the example folder.
<br/>

## API

**Here are all the APIs provided by the useSpeechRecognition hook**.

| API                               | Description                                                                                                                                                                                                                                               | Platform     |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| startSpeechRecognition(localeTag) | Starts listening for speech for a specific locale in IETF BCP 47 standard (e.g., en-US, en-GB, zh-CN, etc). If no localeTag is given, then it uses the system locale of the user's device.                                                                | iOS, Android |
| stopSpeechRecognition             | Stops listening for speech.                                                                                                                                                                                                                               | iOS, Android |
| cancelSpeechRecognition           | Cancels listening for speech.                                                                                                                                                                                                                             | iOS, Android |
| speechContentRealTime             | A string representing the recognized texts while the user is speaking. You can use this string to show the real time speech recognition text.                                                                                                             | iOS, Android |
| setSpeechRecStartedHandler        | Set a callback handler which is called when speech recognition starts without error. The signature of the handler is `async () => void`                                                                                                                   | iOS, Android |
| setSpeechRecCompletedHandler      | Set a callback handler which is called when speech recognition completes without error. The signature of the handler is `async (speechRecResult: string) =>  void`, where speechRecResult is a string representing the text recognized from user's speech | iOS, Android |
| setSpeechRecErrorHandler          | Set a callback handler which is called when speech recognition has error. The signature of the handler is `async (errorMessage: string) =>  void`, where errorMessage explains why the error happens                                                      | iOS, Android |

## License

MIT
