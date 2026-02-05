import React, { useContext } from 'react';
import { View, Switch, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const ThemeSwitcher = () => {
  const { theme, toggleTheme, colors } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <View style={styles.container}>
      <Ionicons name="sunny" size={24} color={isDark ? 'gray' : colors.primary} />
      <Switch
        trackColor={{ false: '#767577', true: '#D0BBEF' }}
        thumbColor={isDark ? colors.primary : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleTheme}
        value={isDark}
      />
      <Ionicons name="moon" size={24} color={isDark ? colors.primary : 'gray'} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
});

export default ThemeSwitcher;
