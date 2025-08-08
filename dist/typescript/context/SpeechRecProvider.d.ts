import React, { ReactNode } from 'react';
import { SpeechRecContextType } from './SpeechRecTypes';
export declare const SpeechRecContext: React.Context<SpeechRecContextType>;
interface SpeechRecWebViewProviderProps {
    children?: ReactNode;
}
/**
 * A SpeechRecProvider component.
 *
 * @param {SpeechRecWebViewProviderProps} children - The children components to be rendered inside the SpeechRecProvider.
 * @return {JSX.Element} The SpeechRecProvider component.
 */
export declare const SpeechRecProvider: ({ children, }: SpeechRecWebViewProviderProps) => React.ReactNode;
export {};
//# sourceMappingURL=SpeechRecProvider.d.ts.map