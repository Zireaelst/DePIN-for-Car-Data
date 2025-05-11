import React, { ReactNode } from 'react';
import { StyleSheet, View, Platform, useWindowDimensions } from 'react-native';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

interface WebLayoutWrapperProps {
  children: ReactNode;
  fullWidth?: boolean;
}

/**
 * A component that wraps content in a responsive container for web
 * On mobile platforms, it renders children without modification
 * On web, it centers content with a max width for better readability
 */
export const WebLayoutWrapper = ({ children, fullWidth = false }: WebLayoutWrapperProps) => {
  const backgroundColor = useThemeColor({}, 'background');
  const { width } = useWindowDimensions();
  
  // Only apply web-specific layout on web platform
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  // On web, provide a responsive container
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ThemedView style={[
        styles.content,
        fullWidth ? styles.fullWidth : { maxWidth: Math.min(1200, width * 0.9) }
      ]}>
        {children}
      </ThemedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  content: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
    // Add subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  fullWidth: {
    maxWidth: '100%',
  }
});