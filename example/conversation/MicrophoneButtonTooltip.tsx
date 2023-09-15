/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Linking} from 'react-native';
import {Text} from 'react-native-paper';

interface MicrophoneButtonTooltipProps {
  userIsSpeaking: boolean;
  userMicPermissionBlocked: boolean;
}

export const MicrophoneButtonTooltip = React.memo(
  ({
    userIsSpeaking,
    userMicPermissionBlocked,
  }: MicrophoneButtonTooltipProps) => {
    if (userIsSpeaking) {
      return (
        <Text variant="bodyLarge" style={{color: '#333333'}}>
          Swipe up to cancel the conversation
        </Text>
      );
    }

    if (userMicPermissionBlocked) {
      return (
        <Text
          variant="bodyLarge"
          onPress={() => {
            Linking.openSettings();
          }}
          style={{color: '#333333'}}>
          To talk to the app, please click to enable the Speech Recognition
          permission in your system settings.
        </Text>
      );
    }

    return (
      <Text variant="bodyLarge" style={{color: '#333333'}}>
        Hold to speak, release to stop.
      </Text>
    );
  },
);
