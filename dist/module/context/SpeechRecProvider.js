"use strict";

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { jsx as _jsx } from "react/jsx-runtime";
export const SpeechRecContext = /*#__PURE__*/React.createContext({
  webViewRef: {
    current: null
  },
  sendMessage: _req => {},
  registerListener: _listener => {},
  unregisterListener: _SpeechRecListener => {},
  notifyListeners: _data => {}
});
/**
 * A SpeechRecProvider component.
 *
 * @param {SpeechRecWebViewProviderProps} children - The children components to be rendered inside the SpeechRecProvider.
 * @return {JSX.Element} The SpeechRecProvider component.
 */
export const SpeechRecProvider = ({
  children
}) => {
  const webViewRef = useRef(null);
  const [listeners, setListeners] = useState({});
  const sendMessage = useCallback(({
    type,
    data
  }) => {
    const jsCode = `if(window && window.handleNativeEvent) {
      window.handleNativeEvent(${JSON.stringify({
      type,
      data
    })});
    }`;
    webViewRef.current?.injectJavaScript(jsCode);
  }, []);
  const registerListener = useCallback(({
    type,
    listener
  }) => {
    setListeners(currentListeners => ({
      ...currentListeners,
      [type]: [...(currentListeners[type] || []), listener]
    }));
  }, []);
  const unregisterListener = useCallback(({
    type,
    listener
  }) => {
    setListeners(currentListeners => ({
      ...currentListeners,
      [type]: (currentListeners[type] || []).filter(l => l !== listener)
    }));
  }, []);
  const notifyListeners = useCallback(({
    type,
    data
  }) => {
    (listeners[type] || []).forEach(listener => listener(data));
  }, [listeners]);
  const contextValue = useMemo(() => ({
    webViewRef,
    sendMessage,
    registerListener,
    unregisterListener,
    notifyListeners
  }), [sendMessage, registerListener, unregisterListener, notifyListeners]);
  return /*#__PURE__*/_jsx(SpeechRecContext.Provider, {
    value: contextValue,
    children: children
  });
};
//# sourceMappingURL=SpeechRecProvider.js.map