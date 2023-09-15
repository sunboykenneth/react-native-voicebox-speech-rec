import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Platform} from 'react-native';
import {AndroidVolumeTypes, VolumeManager} from 'react-native-volume-manager';
import {SpeechRecContext} from '../context/SpeechRecProvider';
import {SpeechRecReqType} from '../context/SpeechRecTypes';
import * as RNLocalize from 'react-native-localize';

export interface SpeechRecognitionHookType {
  // Actions
  startSpeechRecognition: (languageCode?: string) => void;
  stopSpeechRecognition: () => void;
  cancelSpeechRecognition: () => void;

  // State
  speechContentRealTime: string;

  // Handlers
  setSpeechRecErrorHandler: (handler: (errorMessage: string) => void) => void;
  setSpeechRecStartedHandler: (handler: () => void) => void;
  setSpeechRecCompletedHandler: (
    handler: (speechRecResult: string) => void,
  ) => void;
}

export const useSpeechRecognition = (): SpeechRecognitionHookType => {
  const {sendMessage, registerListener, unregisterListener} =
    useContext(SpeechRecContext);

  // Whether the voice recognition is working at the moment
  const voiceRecognitionActiviatedRef = useRef<boolean>(false);

  const needToStartSpeechRecWhenCancelled = useRef<boolean>(false);

  // What language to use for speech recognition
  // Default to the current system language on user's device
  const languageCodeForSpeechRec = useRef<string>('en-US');
  useEffect(() => {
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
  const volumeChangedForSpeechRecRef = useRef<boolean>(false);
  const currentSystemVolumeRef = useRef<number>(0);

  const volumesToChangeForSpeechRec = useMemo(
    () => ['system' as AndroidVolumeTypes],
    [],
  );

  const muteSystemVolume = useCallback(() => {
    if (Platform.OS === 'android') {
      volumesToChangeForSpeechRec.forEach((type?: AndroidVolumeTypes) => {
        VolumeManager.setVolume(0, {showUI: false, type});
      });
    }
  }, [volumesToChangeForSpeechRec]);

  const resumeSystemVolume = useCallback(() => {
    if (Platform.OS === 'android') {
      volumesToChangeForSpeechRec.forEach(type => {
        VolumeManager.setVolume(currentSystemVolumeRef.current, {
          showUI: false,
          type,
        });
      });
    }
  }, [volumesToChangeForSpeechRec]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      VolumeManager.getVolume().then((result: any) => {
        currentSystemVolumeRef.current = result.system || result.volume;
      });
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const volumeListener = VolumeManager.addVolumeListener(result => {
        if (volumeChangedForSpeechRecRef.current) {
          return;
        }

        currentSystemVolumeRef.current = result.system || result.volume;
      });

      return () => {
        volumeListener.remove();
      };
    }

    return () => {};
  }, []);
  // =============================== SECTION END ==============================

  // The spoken words from the user in the current round of speech recognition
  const [spokenContentInCurrentRound, setSpokenContentInCurrentRound] =
    useState('');
  const spokenContentInCurrentRoundRef = useRef(spokenContentInCurrentRound);
  useEffect(() => {
    spokenContentInCurrentRoundRef.current = spokenContentInCurrentRound;
  }, [spokenContentInCurrentRound]);

  const processCurrentChatRef = useRef((_speechRecResult: string) => {});
  const setSpeechRecCompletedHandler = useCallback(
    (speechRecCompletedHandler: (speechRecResult: string) => void) => {
      processCurrentChatRef.current = speechRecCompletedHandler;
    },
    [],
  );

  const startSpeechRecognitionImpl = useCallback(async () => {
    volumeChangedForSpeechRecRef.current = true;

    muteSystemVolume();

    setSpokenContentInCurrentRound('');

    sendMessage({
      type: SpeechRecReqType.StartSpeechRecognition,
      data: {
        language: languageCodeForSpeechRec.current,
      },
    });

    voiceRecognitionActiviatedRef.current = true;
    needToStartSpeechRecWhenCancelled.current = false;
  }, [muteSystemVolume, sendMessage]);

  const handleSpeechRecStartRef = useRef(() => {});
  const setSpeechRecStartedHandler = useCallback(
    (speechRecStartedHandler: () => void) => {
      handleSpeechRecStartRef.current = speechRecStartedHandler;
    },
    [],
  );

  const handleSpeechRecErrorRef = useRef((_errorMessage: string) => {});
  const setSpeechRecErrorHandler = useCallback(
    (speechRecErrorHandler: (errorMessage: string) => void) => {
      handleSpeechRecErrorRef.current = speechRecErrorHandler;
    },
    [],
  );

  const onSpeechStartRef = useRef(() => {
    voiceRecognitionActiviatedRef.current = true;
    setSpokenContentInCurrentRound('');

    if (handleSpeechRecStartRef.current) {
      handleSpeechRecStartRef.current();
    }
  });

  const onSpeechEndRef = useRef((transcriptFinalResult: any) => {
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

  const stopSpeechRecognition = useCallback(async () => {
    if (voiceRecognitionActiviatedRef.current) {
      voiceRecognitionActiviatedRef.current = false;

      sendMessage({type: SpeechRecReqType.StopSpeechRecognition, data: {}});
    }
  }, [sendMessage]);

  const onSpeechResultsRef = useRef((result: any) => {
    if (!voiceRecognitionActiviatedRef.current) {
      return;
    }

    if (result.trim().length === 0) {
      return;
    }

    setSpokenContentInCurrentRound(result);
  });

  const onSpeechErrorRef = useRef(
    ({code, errorMessage}: {code: string; errorMessage: any}) => {
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
    },
  );

  useEffect(() => {
    const speechRecStartedListener = onSpeechStartRef.current;
    const speechRecEndListener = onSpeechEndRef.current;
    const speechRecErrorListener = onSpeechErrorRef.current;
    const speechRecRealTimeResultListener = onSpeechResultsRef.current;

    registerListener({
      type: SpeechRecReqType.SpeechRecognitionStarted,
      listener: speechRecStartedListener,
    });
    registerListener({
      type: SpeechRecReqType.SpeechRecognitionEnd,
      listener: speechRecEndListener,
    });
    registerListener({
      type: SpeechRecReqType.SpeechRecognitionError,
      listener: speechRecErrorListener,
    });
    registerListener({
      type: SpeechRecReqType.SpeechRecognitionRealTimeResult,
      listener: speechRecRealTimeResultListener,
    });

    return () => {
      unregisterListener({
        type: SpeechRecReqType.SpeechRecognitionStarted,
        listener: speechRecStartedListener,
      });
      unregisterListener({
        type: SpeechRecReqType.SpeechRecognitionEnd,
        listener: speechRecEndListener,
      });
      unregisterListener({
        type: SpeechRecReqType.SpeechRecognitionError,
        listener: speechRecErrorListener,
      });
      unregisterListener({
        type: SpeechRecReqType.SpeechRecognitionRealTimeResult,
        listener: speechRecRealTimeResultListener,
      });
    };
  }, [registerListener, unregisterListener]);

  const cancelSpeechRecognition = useCallback(async () => {
    if (voiceRecognitionActiviatedRef.current) {
      voiceRecognitionActiviatedRef.current = false;

      sendMessage({type: SpeechRecReqType.CancelSpeechRecognition, data: {}});
    }
  }, [sendMessage]);

  const startSpeechRecognition = useCallback(
    async (languageCode?: string) => {
      if (voiceRecognitionActiviatedRef.current) {
        // If we are still in speech recognition mode, stop it and restart
        needToStartSpeechRecWhenCancelled.current = true;
        sendMessage({type: SpeechRecReqType.CancelSpeechRecognition, data: {}});
        return;
      }

      if (languageCode) {
        languageCodeForSpeechRec.current = languageCode;
      }

      startSpeechRecognitionImpl();
    },
    [sendMessage, startSpeechRecognitionImpl],
  );

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
    setSpeechRecCompletedHandler,
  };
};
