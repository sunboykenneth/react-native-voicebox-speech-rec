"use strict";

import React, { useCallback, useContext } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { SpeechRecContext } from '../context/SpeechRecProvider';
import { speechRecScript } from '../static/speechRecScript';
import { jsx as _jsx } from "react/jsx-runtime";
export const SpeechRecView = /*#__PURE__*/React.memo(() => {
  const {
    webViewRef,
    notifyListeners
  } = useContext(SpeechRecContext);
  const onMessageReceived = useCallback(event => {
    const message = JSON.parse(event.nativeEvent.data);
    notifyListeners({
      type: message.type,
      data: message.data
    });
  }, [notifyListeners]);
  return /*#__PURE__*/_jsx(View, {
    style: {
      width: 0,
      height: 0,
      overflow: 'hidden'
    },
    children: /*#__PURE__*/_jsx(WebView, {
      ref: webViewRef,
      originWhitelist: ['*'],
      source: {
        html: speechRecScript
      },
      onMessage: onMessageReceived,
      onLoad: () => {
        console.log('🫵 🫵  Speech Rec Script View Loaded 🫵 🫵 ');
      }
    })
  });
});
//# sourceMappingURL=SpeechRecView.js.map