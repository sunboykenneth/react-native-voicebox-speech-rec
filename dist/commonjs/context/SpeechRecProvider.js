"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SpeechRecProvider = exports.SpeechRecContext = void 0;
var _react = _interopRequireWildcard(require("react"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const SpeechRecContext = exports.SpeechRecContext = /*#__PURE__*/_react.default.createContext({
  webViewRef: {
    current: null
  },
  sendMessage: _req => {},
  registerListener: _listener => {},
  unregisterListener: _SpeechRecListener => {},
  notifyListeners: _data => {}
});
/**
 * A SpeechRecProvider component.
 *
 * @param {SpeechRecWebViewProviderProps} children - The children components to be rendered inside the SpeechRecProvider.
 * @return {JSX.Element} The SpeechRecProvider component.
 */
const SpeechRecProvider = ({
  children
}) => {
  const webViewRef = (0, _react.useRef)(null);
  const [listeners, setListeners] = (0, _react.useState)({});
  const sendMessage = (0, _react.useCallback)(({
    type,
    data
  }) => {
    const jsCode = `if(window && window.handleNativeEvent) {
      window.handleNativeEvent(${JSON.stringify({
      type,
      data
    })});
    }`;
    webViewRef.current?.injectJavaScript(jsCode);
  }, []);
  const registerListener = (0, _react.useCallback)(({
    type,
    listener
  }) => {
    setListeners(currentListeners => ({
      ...currentListeners,
      [type]: [...(currentListeners[type] || []), listener]
    }));
  }, []);
  const unregisterListener = (0, _react.useCallback)(({
    type,
    listener
  }) => {
    setListeners(currentListeners => ({
      ...currentListeners,
      [type]: (currentListeners[type] || []).filter(l => l !== listener)
    }));
  }, []);
  const notifyListeners = (0, _react.useCallback)(({
    type,
    data
  }) => {
    (listeners[type] || []).forEach(listener => listener(data));
  }, [listeners]);
  const contextValue = (0, _react.useMemo)(() => ({
    webViewRef,
    sendMessage,
    registerListener,
    unregisterListener,
    notifyListeners
  }), [sendMessage, registerListener, unregisterListener, notifyListeners]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(SpeechRecContext.Provider, {
    value: contextValue,
    children: children
  });
};
exports.SpeechRecProvider = SpeechRecProvider;
//# sourceMappingURL=SpeechRecProvider.js.map