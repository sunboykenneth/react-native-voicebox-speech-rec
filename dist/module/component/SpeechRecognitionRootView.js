"use strict";

import React from 'react';
import { SpeechRecProvider } from '../context/SpeechRecProvider';
import { SpeechRecView } from './SpeechRecView';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const SpeechRecognitionRootView = ({
  children
}) => {
  return /*#__PURE__*/_jsxs(SpeechRecProvider, {
    children: [children, /*#__PURE__*/_jsx(SpeechRecView, {})]
  });
};
SpeechRecognitionRootView.displayName = 'SpeechRecognitionRootView';
//# sourceMappingURL=SpeechRecognitionRootView.js.map