import React from 'react';

import {PaperProvider} from 'react-native-paper';
import {ConversationPage} from './conversation/ConversationPage';
import {SpeechRecognitionRootView} from 'react-native-voicebox-speech-rec';
import {SafeAreaProvider} from 'react-native-safe-area-context';

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
