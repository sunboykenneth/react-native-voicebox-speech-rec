export interface SpeechRecognitionHookType {
    startSpeechRecognition: (languageCode?: string) => void;
    stopSpeechRecognition: () => void;
    cancelSpeechRecognition: () => void;
    speechContentRealTime: string;
    setSpeechRecErrorHandler: (handler: (errorMessage: string) => void) => void;
    setSpeechRecStartedHandler: (handler: () => void) => void;
    setSpeechRecCompletedHandler: (handler: (speechRecResult: string) => void) => void;
}
export declare const useSpeechRecognition: () => SpeechRecognitionHookType;
//# sourceMappingURL=useSpeechRecognition.d.ts.map