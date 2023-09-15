import React, {ReactNode, useCallback, useMemo, useRef, useState} from 'react';
import {
  SpeechRecContextType,
  SpeechRecListener,
  SpeechRecReqType,
  SpeechRecRequest,
  SpeechRecResponse,
} from './SpeechRecTypes';

export const SpeechRecContext = React.createContext<SpeechRecContextType>({
  webViewRef: {current: null},
  sendMessage: (_req: SpeechRecRequest) => {},
  registerListener: (_listener: SpeechRecListener) => {},
  unregisterListener: _SpeechRecListener => {},
  notifyListeners: (_data: SpeechRecResponse) => {},
});

interface SpeechRecWebViewProviderProps {
  children?: ReactNode;
}

/**
 * A SpeechRecProvider component.
 *
 * @param {SpeechRecWebViewProviderProps} children - The children components to be rendered inside the SpeechRecProvider.
 * @return {JSX.Element} The SpeechRecProvider component.
 */
export const SpeechRecProvider = ({
  children,
}: SpeechRecWebViewProviderProps): JSX.Element => {
  const webViewRef = useRef<any>(null);
  const [listeners, setListeners] = useState<
    Record<SpeechRecReqType, Array<(data: any) => void>>
  >({} as Record<SpeechRecReqType, Array<(data: any) => void>>);

  const sendMessage = useCallback(({type, data}: SpeechRecRequest) => {
    const jsCode = `if(window && window.handleNativeEvent) {
      window.handleNativeEvent(${JSON.stringify({type, data})});
    }`;
    webViewRef.current?.injectJavaScript(jsCode);
  }, []);

  const registerListener = useCallback(
    ({type, listener}: SpeechRecListener) => {
      setListeners(currentListeners => ({
        ...currentListeners,
        [type]: [...(currentListeners[type] || []), listener],
      }));
    },
    [],
  );

  const unregisterListener = useCallback(
    ({type, listener}: SpeechRecListener) => {
      setListeners(currentListeners => ({
        ...currentListeners,
        [type]: (currentListeners[type] || []).filter(l => l !== listener),
      }));
    },
    [],
  );

  const notifyListeners = useCallback(
    ({type, data}: SpeechRecResponse) => {
      (listeners[type] || []).forEach(listener => listener(data));
    },
    [listeners],
  );

  const contextValue = useMemo(
    () => ({
      webViewRef,
      sendMessage,
      registerListener,
      unregisterListener,
      notifyListeners,
    }),
    [sendMessage, registerListener, unregisterListener, notifyListeners],
  );

  return (
    <SpeechRecContext.Provider value={contextValue}>
      {children}
    </SpeechRecContext.Provider>
  );
};
