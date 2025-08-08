"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useSpeechRecognition = void 0;
var _react = require("react");
var _reactNative = require("react-native");
var _reactNativeVolumeManager = require("react-native-volume-manager");
var _SpeechRecProvider = require("../context/SpeechRecProvider");
var _SpeechRecTypes = require("../context/SpeechRecTypes");
var RNLocalize = _interopRequireWildcard(require("react-native-localize"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const useSpeechRecognition = () => {
  const {
    sendMessage,
    registerListener,
    unregisterListener
  } = (0, _react.useContext)(_SpeechRecProvider.SpeechRecContext);

  // Whether the voice recognition is working at the moment
  const voiceRecognitionActiviatedRef = (0, _react.useRef)(false);
  const needToStartSpeechRecWhenCancelled = (0, _react.useRef)(false);

  // What language to use for speech recognition
  // Default to the current system language on user's device
  const languageCodeForSpeechRec = (0, _react.useRef)('en-US');
  (0, _react.useEffect)(() => {
    const locales = RNLocalize.getLocales();
    if (locales.length > 0 && locales[0].languageTag) {
      languageCodeForSpeechRec.current = locales[0].languageTag;
    }
  }, []);

  /**
   * =============================== SECTION START ==============================
   *
   * The following code block are for muting and resuming system volume when doing
   * speech recognition on Android so that users won't be bothered by the repeated
   * mic start beep sounds.
   * ============================================================================
   * */
  const volumeChangedForSpeechRecRef = (0, _react.useRef)(false);
  const currentSystemVolumeRef = (0, _react.useRef)(0);
  const volumesToChangeForSpeechRec = (0, _react.useMemo)(() => ['system'], []);
  const muteSystemVolume = (0, _react.useCallback)(() => {
    if (_reactNative.Platform.OS === 'android') {
      volumesToChangeForSpeechRec.forEach(type => {
        _reactNativeVolumeManager.VolumeManager.setVolume(0, {
          showUI: false,
          type
        });
      });
    }
  }, [volumesToChangeForSpeechRec]);
  const resumeSystemVolume = (0, _react.useCallback)(() => {
    if (_reactNative.Platform.OS === 'android') {
      volumesToChangeForSpeechRec.forEach(type => {
        _reactNativeVolumeManager.VolumeManager.setVolume(currentSystemVolumeRef.current, {
          showUI: false,
          type
        });
      });
    }
  }, [volumesToChangeForSpeechRec]);
  (0, _react.useEffect)(() => {
    if (_reactNative.Platform.OS === 'android') {
      _reactNativeVolumeManager.VolumeManager.getVolume().then(result => {
        currentSystemVolumeRef.current = result.volume;
      });
    }
  }, []);
  (0, _react.useEffect)(() => {
    if (_reactNative.Platform.OS === 'android') {
      const volumeListener = _reactNativeVolumeManager.VolumeManager.addVolumeListener(result => {
        if (volumeChangedForSpeechRecRef.current) {
          return;
        }
        currentSystemVolumeRef.current = result.volume;
      });
      return () => {
        volumeListener.remove();
      };
    }
    return () => {};
  }, []);
  // =============================== SECTION END ==============================

  // The spoken words from the user in the current round of speech recognition
  const [spokenContentInCurrentRound, setSpokenContentInCurrentRound] = (0, _react.useState)('');
  const spokenContentInCurrentRoundRef = (0, _react.useRef)(spokenContentInCurrentRound);
  (0, _react.useEffect)(() => {
    spokenContentInCurrentRoundRef.current = spokenContentInCurrentRound;
  }, [spokenContentInCurrentRound]);
  const processCurrentChatRef = (0, _react.useRef)(_speechRecResult => {});
  const setSpeechRecCompletedHandler = (0, _react.useCallback)(speechRecCompletedHandler => {
    processCurrentChatRef.current = speechRecCompletedHandler;
  }, []);
  const startSpeechRecognitionImpl = (0, _react.useCallback)(async () => {
    volumeChangedForSpeechRecRef.current = true;
    muteSystemVolume();
    setSpokenContentInCurrentRound('');
    sendMessage({
      type: _SpeechRecTypes.SpeechRecReqType.StartSpeechRecognition,
      data: {
        language: languageCodeForSpeechRec.current
      }
    });
    voiceRecognitionActiviatedRef.current = true;
    needToStartSpeechRecWhenCancelled.current = false;
  }, [muteSystemVolume, sendMessage]);
  const handleSpeechRecStartRef = (0, _react.useRef)(() => {});
  const setSpeechRecStartedHandler = (0, _react.useCallback)(speechRecStartedHandler => {
    handleSpeechRecStartRef.current = speechRecStartedHandler;
  }, []);
  const handleSpeechRecErrorRef = (0, _react.useRef)(_errorMessage => {});
  const setSpeechRecErrorHandler = (0, _react.useCallback)(speechRecErrorHandler => {
    handleSpeechRecErrorRef.current = speechRecErrorHandler;
  }, []);
  const onSpeechStartRef = (0, _react.useRef)(() => {
    voiceRecognitionActiviatedRef.current = true;
    setSpokenContentInCurrentRound('');
    if (handleSpeechRecStartRef.current) {
      handleSpeechRecStartRef.current();
    }
  });
  const onSpeechEndRef = (0, _react.useRef)(transcriptFinalResult => {
    volumeChangedForSpeechRecRef.current = false;
    resumeSystemVolume();
    voiceRecognitionActiviatedRef.current = false;

    // Here, trigger the processing of the user's spoken content
    if (processCurrentChatRef.current) {
      processCurrentChatRef.current(transcriptFinalResult);
    }
    setSpokenContentInCurrentRound('');
    if (needToStartSpeechRecWhenCancelled.current) {
      startSpeechRecognitionImpl();
    }
  });
  const stopSpeechRecognition = (0, _react.useCallback)(async () => {
    if (voiceRecognitionActiviatedRef.current) {
      voiceRecognitionActiviatedRef.current = false;
      sendMessage({
        type: _SpeechRecTypes.SpeechRecReqType.StopSpeechRecognition,
        data: {}
      });
    }
  }, [sendMessage]);
  const onSpeechResultsRef = (0, _react.useRef)(result => {
    if (!voiceRecognitionActiviatedRef.current) {
      return;
    }
    if (result.trim().length === 0) {
      return;
    }
    setSpokenContentInCurrentRound(result);
  });
  const onSpeechErrorRef = (0, _react.useRef)(({
    code,
    errorMessage
  }) => {
    let isRealError = true;

    // Handle different types of speech recognition errors
    switch (code) {
      case 'no-speech':
      case 'aborted':
        isRealError = false;
        break;
      case 'audio-capture':
      case 'network':
      case 'not-allowed':
      case 'service-not-allowed':
      case 'bad-grammar':
      case 'language-not-supported':
      default:
        break;
    }
    if (isRealError && handleSpeechRecErrorRef.current) {
      volumeChangedForSpeechRecRef.current = false;
      resumeSystemVolume();
      if (handleSpeechRecErrorRef.current) {
        handleSpeechRecErrorRef.current(errorMessage);
      }
    }
  });
  (0, _react.useEffect)(() => {
    const speechRecStartedListener = onSpeechStartRef.current;
    const speechRecEndListener = onSpeechEndRef.current;
    const speechRecErrorListener = onSpeechErrorRef.current;
    const speechRecRealTimeResultListener = onSpeechResultsRef.current;
    registerListener({
      type: _SpeechRecTypes.SpeechRecReqType.SpeechRecognitionStarted,
      listener: speechRecStartedListener
    });
    registerListener({
      type: _SpeechRecTypes.SpeechRecReqType.SpeechRecognitionEnd,
      listener: speechRecEndListener
    });
    registerListener({
      type: _SpeechRecTypes.SpeechRecReqType.SpeechRecognitionError,
      listener: speechRecErrorListener
    });
    registerListener({
      type: _SpeechRecTypes.SpeechRecReqType.SpeechRecognitionRealTimeResult,
      listener: speechRecRealTimeResultListener
    });
    return () => {
      unregisterListener({
        type: _SpeechRecTypes.SpeechRecReqType.SpeechRecognitionStarted,
        listener: speechRecStartedListener
      });
      unregisterListener({
        type: _SpeechRecTypes.SpeechRecReqType.SpeechRecognitionEnd,
        listener: speechRecEndListener
      });
      unregisterListener({
        type: _SpeechRecTypes.SpeechRecReqType.SpeechRecognitionError,
        listener: speechRecErrorListener
      });
      unregisterListener({
        type: _SpeechRecTypes.SpeechRecReqType.SpeechRecognitionRealTimeResult,
        listener: speechRecRealTimeResultListener
      });
    };
  }, [registerListener, unregisterListener]);
  const cancelSpeechRecognition = (0, _react.useCallback)(async () => {
    if (voiceRecognitionActiviatedRef.current) {
      voiceRecognitionActiviatedRef.current = false;
      sendMessage({
        type: _SpeechRecTypes.SpeechRecReqType.CancelSpeechRecognition,
        data: {}
      });
    }
  }, [sendMessage]);
  const startSpeechRecognition = (0, _react.useCallback)(async languageCode => {
    if (voiceRecognitionActiviatedRef.current) {
      // If we are still in speech recognition mode, stop it and restart
      needToStartSpeechRecWhenCancelled.current = true;
      sendMessage({
        type: _SpeechRecTypes.SpeechRecReqType.CancelSpeechRecognition,
        data: {}
      });
      return;
    }
    if (languageCode) {
      languageCodeForSpeechRec.current = languageCode;
    }
    startSpeechRecognitionImpl();
  }, [sendMessage, startSpeechRecognitionImpl]);
  return {
    // Actions
    startSpeechRecognition,
    stopSpeechRecognition,
    cancelSpeechRecognition,
    // State
    speechContentRealTime: spokenContentInCurrentRound,
    // Handlers
    setSpeechRecErrorHandler,
    setSpeechRecStartedHandler,
    setSpeechRecCompletedHandler
  };
};
exports.useSpeechRecognition = useSpeechRecognition;
//# sourceMappingURL=useSpeechRecognition.js.map