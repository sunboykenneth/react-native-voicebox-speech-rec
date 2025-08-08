import React, {ReactNode} from 'react';
import {SpeechRecProvider} from '../context/SpeechRecProvider';
import {SpeechRecView} from './SpeechRecView';

interface SpeechRecognitionRootViewProps {
  children?: ReactNode;
}

export const SpeechRecognitionRootView = ({
  children,
}: SpeechRecognitionRootViewProps): React.ReactElement => {
  return (
    <SpeechRecProvider>
      {children}
      <SpeechRecView />
    </SpeechRecProvider>
  );
};
SpeechRecognitionRootView.displayName = 'SpeechRecognitionRootView';
