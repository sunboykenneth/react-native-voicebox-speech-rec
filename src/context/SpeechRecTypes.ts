export enum SpeechRecReqType {
  StartSpeechRecognition = 'StartSpeechRecognition',
  StopSpeechRecognition = 'StopSpeechRecognition',
  CancelSpeechRecognition = 'CancelSpeechRecognition',

  SpeechRecognitionStarted = 'SpeechRecognitionStarted',
  SpeechRecognitionRealTimeResult = 'SpeechRecognitionRealTimeResult',
  SpeechRecognitionEnd = 'SpeechRecognitionEnd',
  SpeechRecognitionError = 'SpeechRecognitionError',
}

export interface SpeechRecRequest {
  type: SpeechRecReqType;
  data: any;
}

export interface SpeechRecResponse {
  type: SpeechRecReqType;
  data: any;
}

export type SpeechRecListener = {
  type: SpeechRecReqType;
  listener: (data: any) => void;
};

export interface SpeechRecContextType {
  webViewRef: React.RefObject<any>;
  sendMessage: (req: SpeechRecRequest) => void;
  registerListener: (listener: SpeechRecListener) => void;
  unregisterListener: (listener: SpeechRecListener) => void;
  notifyListeners: (data: SpeechRecResponse) => void;
}
