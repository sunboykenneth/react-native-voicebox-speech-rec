import React, {useCallback, useContext} from 'react';
import {Platform, View} from 'react-native';
import {WebView} from 'react-native-webview';
import {SpeechRecContext} from '../context/SpeechRecProvider';
import {speechRecScript} from '../static/speechRecScript';
import {SpeechRecReqType} from '../context/SpeechRecTypes';

interface MessageEvent {
  type: string;
  data: any;
}

export const SpeechRecView = React.memo(() => {
  const {webViewRef, notifyListeners} = useContext(SpeechRecContext);
  const webViewSrc = Platform.select({
    ios: require("../static/speechRecScript.html"),
    android: {html: speechRecScript}
  })

  const onMessageReceived = useCallback(
    (event: any) => {
      const message: MessageEvent = JSON.parse(event.nativeEvent.data);
      notifyListeners({
        type: message.type as SpeechRecReqType,
        data: message.data,
      });
    },
    [notifyListeners],
  );

  return (
    <View style={{width: 0, height: 0, overflow: 'hidden'}}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={webViewSrc}
        onMessage={onMessageReceived}
        onLoad={() => {
          console.log('🫵 🫵  Speech Rec Script View Loaded 🫵 🫵 ');
        }}
      />
    </View>
  );
});
