import React, {useState, useCallback, useRef, useEffect, useMemo} from 'react';
import {StyleSheet, ScrollView, Alert} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import {Text} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {MicrophoneButton} from './MicrophoneButton';
import {MicrophoneButtonTooltip} from './MicrophoneButtonTooltip';
import {
  useCheckSpeechRecPermissions,
  useRequestSpeechRecPermissions,
} from '../hooks/speechRecPermissions';
import {useSpeechRecognition} from 'react-native-voicebox-speech-rec';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    height: '100%',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  disabledMicContainer: {
    opacity: 0.5,
  },
  micContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 128,
  },
  micImage: {
    height: 140,
    resizeMode: 'contain',
  },
  recognizedTextArea: {
    maxHeight: '50%',
    paddingTop: 30,
  },
});

// TODO: Change the design pattern to Material UI with react-native-paper

export const ConversationPage = React.memo(() => {
  // Is in conversation mode (i.e., whether we are listening to the
  // user's speech and doing speech recognition)
  const [isInConversationMode, setIsInConversationMode] = useState(false);
  const [userMicPermissionGranted, setUserMicPermissionGranted] =
    useState(false);

  /** ***************************************************************
   * Setup speech recognition
   *************************************************************** */
  const {
    startSpeechRecognition,
    stopSpeechRecognition,
    cancelSpeechRecognition,

    speechContentRealTime,

    setSpeechRecErrorHandler,
    setSpeechRecStartedHandler,
    setSpeechRecCompletedHandler,
  } = useSpeechRecognition();

  const conversationCancelledByUser = useRef(false);

  useEffect(() => {
    setSpeechRecStartedHandler(() => {
      console.log('👆 Speech Recgnition Started!');
    });
  }, [setSpeechRecStartedHandler]);

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
        {cancelable: false},
      );
    });
  }, [setSpeechRecErrorHandler]);

  useEffect(() => {
    setSpeechRecCompletedHandler(async (userChatMessage: string) => {
      if (conversationCancelledByUser.current) {
        return;
      }

      const trimmedMessage = userChatMessage.trim();

      if (trimmedMessage.length > 0) {
        console.log(
          '🎉 Speech Recognition Completed. Recognized Content: ',
          trimmedMessage,
        );
      } else {
        console.log('🎉 Speech Recognition Completed. User spoke nothing. ');
      }
    });
  }, [setSpeechRecCompletedHandler]);

  /** ********************************************************
   * Handle asking for speech recognition permission
   ******************************************************** */
  const askForPermission = useRequestSpeechRecPermissions();
  const checkForPermission = useCheckSpeechRecPermissions();

  useEffect(() => {
    checkForPermission().then(permissionCheckResult => {
      setUserMicPermissionGranted(permissionCheckResult === RESULTS.GRANTED);
    });
  }, [checkForPermission]);

  const checkAndAskForPermission = useCallback(async () => {
    const permissionCheckResult = await checkForPermission();
    if (permissionCheckResult === RESULTS.GRANTED) {
      return true;
    }

    const requestResult = await askForPermission();
    if (requestResult === RESULTS.GRANTED) {
      setUserMicPermissionGranted(true);
      return true;
    } else {
      return false;
    }
  }, [askForPermission, checkForPermission]);

  /** ********************************************************
   * Handle start / stop user speak mode (i.e., start voice rec)
   ******************************************************** */
  const handleConversationButtonPressed = useCallback(async () => {
    const permissionGranted = await checkAndAskForPermission();
    if (!permissionGranted) {
      return;
    }

    conversationCancelledByUser.current = false;

    setIsInConversationMode(true);

    startSpeechRecognition();
  }, [checkAndAskForPermission, startSpeechRecognition]);

  const handleConversationButtonReleased = useCallback(() => {
    if (!isInConversationMode) {
      return;
    }

    setIsInConversationMode(false);

    stopSpeechRecognition();
  }, [isInConversationMode, stopSpeechRecognition]);

  const handleConversationButtonSwipedUp = useCallback(async () => {
    if (isInConversationMode) {
      conversationCancelledByUser.current = true;

      setIsInConversationMode(false);
      cancelSpeechRecognition();

      Toast.show({
        type: 'success',
        text1: 'Speech Recognition Cancelled',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 95,
      });
    }
  }, [cancelSpeechRecognition, isInConversationMode]);

  const scrollRef = React.useRef<ScrollView>(null);
  const handleTextAreaSizeChange = useCallback(() => {
    scrollRef.current?.scrollToEnd({animated: true});
  }, []);

  const speechRecContentArea = useMemo(() => {
    return <Text variant="titleLarge">{speechContentRealTime}</Text>;
  }, [speechContentRealTime]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollRef}
        onContentSizeChange={handleTextAreaSizeChange}
        style={styles.recognizedTextArea}>
        {speechRecContentArea}
      </ScrollView>

      <MicrophoneButton
        containerStyle={styles.micContainer}
        disabled={false}
        handleButtonPressed={handleConversationButtonPressed}
        handleButtonReleased={handleConversationButtonReleased}
        handleButtonSwipeUp={handleConversationButtonSwipedUp}
        isInListeningMode={isInConversationMode}
        tooltipText={
          <MicrophoneButtonTooltip
            userIsSpeaking={isInConversationMode}
            userMicPermissionBlocked={userMicPermissionGranted === false}
          />
        }
      />

      <Toast />
    </SafeAreaView>
  );
});

ConversationPage.displayName = 'ConversationPage';
