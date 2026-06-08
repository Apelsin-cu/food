import React, { useContext } from 'react';
import { View, Switch, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const ThemeSwitcher = () => {
  const { theme, toggleTheme, colors } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <Ionicons name="sunny-outline" size={18} color={isDark ? colors.tabBarInactive : colors.primary} />
      <Switch
        trackColor={{ false: colors.border, true: colors.accent + '55' }}
        thumbColor={isDark ? colors.primary : '#fff'}
        ios_backgroundColor={colors.border}
        onValueChange={toggleTheme}
        value={isDark}
        style={styles.switch}
      />
      <Ionicons name="moon-outline" size={18} color={isDark ? colors.primary : colors.tabBarInactive} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 4,
  },
  switch: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
  },
});

export default ThemeSwitcher;
