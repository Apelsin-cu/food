import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Linking, Platform, Pressable, Text, TextStyle } from 'react-native';

export function ExternalLink(
  props: React.PropsWithChildren<{
    href: string;
    style?: TextStyle;
  }>
) {
  const { href, style, children } = props;

  const handlePress = async () => {
    if (Platform.OS === 'web') {
      await Linking.openURL(href);
      return;
    }

    await WebBrowser.openBrowserAsync(href);
  };

  return (
    <Pressable onPress={handlePress}>
      <Text style={style}>{children}</Text>
    </Pressable>
  );
}
