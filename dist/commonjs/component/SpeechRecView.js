"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SpeechRecView = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _reactNativeWebview = require("react-native-webview");
var _SpeechRecProvider = require("../context/SpeechRecProvider");
var _speechRecScript = require("../static/speechRecScript");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const SpeechRecView = exports.SpeechRecView = /*#__PURE__*/_react.default.memo(() => {
  const {
    webViewRef,
    notifyListeners
  } = (0, _react.useContext)(_SpeechRecProvider.SpeechRecContext);
  const onMessageReceived = (0, _react.useCallback)(event => {
    const message = JSON.parse(event.nativeEvent.data);
    notifyListeners({
      type: message.type,
      data: message.data
    });
  }, [notifyListeners]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
    style: {
      width: 0,
      height: 0,
      overflow: 'hidden'
    },
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeWebview.WebView, {
      ref: webViewRef,
      originWhitelist: ['*'],
      source: {
        html: _speechRecScript.speechRecScript
      },
      onMessage: onMessageReceived,
      onLoad: () => {
        console.log('🫵 🫵  Speech Rec Script View Loaded 🫵 🫵 ');
      }
    })
  });
});
//# sourceMappingURL=SpeechRecView.js.map