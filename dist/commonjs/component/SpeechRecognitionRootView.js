"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SpeechRecognitionRootView = void 0;
var _react = _interopRequireDefault(require("react"));
var _SpeechRecProvider = require("../context/SpeechRecProvider");
var _SpeechRecView = require("./SpeechRecView");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const SpeechRecognitionRootView = ({
  children
}) => {
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_SpeechRecProvider.SpeechRecProvider, {
    children: [children, /*#__PURE__*/(0, _jsxRuntime.jsx)(_SpeechRecView.SpeechRecView, {})]
  });
};
exports.SpeechRecognitionRootView = SpeechRecognitionRootView;
SpeechRecognitionRootView.displayName = 'SpeechRecognitionRootView';
//# sourceMappingURL=SpeechRecognitionRootView.js.map