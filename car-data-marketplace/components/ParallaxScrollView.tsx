import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, Platform, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';
// Import ThemedText component for the footer
import { ThemedText } from './ThemedText';

const HEADER_HEIGHT = Platform.OS === 'web' ? 320 : 250;
const MAX_WIDTH = 1200;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
  webFullWidth?: boolean;
  webEnhancedParallax?: boolean;
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
  webFullWidth = false,
  webEnhancedParallax = true,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();
  const isWeb = Platform.OS === 'web';

  const headerAnimatedStyle = useAnimatedStyle(() => {
    // Enhanced parallax effect for web
    if (isWeb && webEnhancedParallax) {
      return {
        transform: [
          {
            translateY: interpolate(
              scrollOffset.value,
              [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
              [-HEADER_HEIGHT / 1.5, 0, HEADER_HEIGHT * 0.5]
            ),
          },
          {
            scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2.2, 1, 1]),
          },
        ],
        opacity: interpolate(
          scrollOffset.value,
          [0, HEADER_HEIGHT * 0.8],
          [1, 0.6]
        ),
      };
    }

    // Default parallax effect for mobile
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  const contentOverlayStyle = useAnimatedStyle(() => {
    if (isWeb && webEnhancedParallax) {
      return {
        opacity: interpolate(
          scrollOffset.value,
          [HEADER_HEIGHT * 0.5, HEADER_HEIGHT * 0.8],
          [0, 0.03]
        ),
      };
    }
    return {
      opacity: 0,
    };
  });

  // For web, add a content wrapper for max-width and centered content
  const ContentWrapper = isWeb ? ({ children }: PropsWithChildren) => (
    <ThemedView style={[
      styles.webContentWrapper as ViewStyle,
      webFullWidth ? styles.webContentWrapperFullWidth as ViewStyle : null
    ]}>
      {children}
    </ThemedView>
  ) : ({ children }: PropsWithChildren) => <>{children}</>;

  return (
    <ThemedView style={styles.container as ViewStyle}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={[
          { paddingBottom: bottom },
          isWeb && (styles.webScrollContainer as ViewStyle)
        ]}>
        <Animated.View
          style={[
            styles.header as ViewStyle,
            { backgroundColor: headerBackgroundColor[colorScheme] },
            isWeb && (styles.webHeader as ViewStyle),
            headerAnimatedStyle,
          ]}>
          {headerImage}
          {isWeb && webEnhancedParallax && (
            <Animated.View style={[StyleSheet.absoluteFill, styles.headerOverlay as ViewStyle, contentOverlayStyle]} />
          )}
        </Animated.View>

        <ContentWrapper>
          <ThemedView style={[
            styles.content as ViewStyle,
            isWeb && (styles.webContent as ViewStyle)
          ]}>
            {children}
          </ThemedView>
        </ContentWrapper>

        {isWeb && (
          <ThemedView style={styles.webFooter as ViewStyle}>
            <ThemedView style={styles.webFooterContent as ViewStyle}>
              <ThemedView style={styles.webFooterColumn as ViewStyle}>
                <ThemedText type="subtitle">DeCharge</ThemedText>
                <ThemedText style={styles.webFooterText as TextStyle}>
                  A decentralized marketplace for vehicle data
                </ThemedText>
                <ThemedText style={styles.webFooterText as TextStyle}>
                  © 2025 DeCharge Protocol
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.webFooterColumn as ViewStyle}>
                <ThemedText type="defaultSemiBold">Resources</ThemedText>
                <ThemedText style={styles.webFooterLink as TextStyle}>Documentation</ThemedText>
                <ThemedText style={styles.webFooterLink as TextStyle}>API</ThemedText>
                <ThemedText style={styles.webFooterLink as TextStyle}>Community</ThemedText>
              </ThemedView>

              <ThemedView style={styles.webFooterColumn as ViewStyle}>
                <ThemedText type="defaultSemiBold">Company</ThemedText>
                <ThemedText style={styles.webFooterLink as TextStyle}>About</ThemedText>
                <ThemedText style={styles.webFooterLink as TextStyle}>Blog</ThemedText>
                <ThemedText style={styles.webFooterLink as TextStyle}>Careers</ThemedText>
              </ThemedView>

              <ThemedView style={styles.webFooterColumn as ViewStyle}>
                <ThemedText type="defaultSemiBold">Legal</ThemedText>
                <ThemedText style={styles.webFooterLink as TextStyle}>Privacy</ThemedText>
                <ThemedText style={styles.webFooterLink as TextStyle}>Terms</ThemedText>
                <ThemedText style={styles.webFooterLink as TextStyle}>Security</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  webHeader: {
    height: HEADER_HEIGHT,
    width: '100%',
  },
  headerOverlay: {
    backgroundColor: '#000',
    opacity: 0,
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
  webContent: {
    padding: 40,
    gap: 24,
    borderRadius: 12,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
    } : {}),
    backgroundColor: 'transparent',
  },
  webScrollContainer: {
    ...(Platform.OS === 'web' ? {
      minHeight: '100vh' as any, // Type assertion to bypass the type check for web-only property
    } : {}),
  },
  webContentWrapper: {
    maxWidth: MAX_WIDTH,
    width: '100%',
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
    marginTop: -80,
    position: 'relative',
    zIndex: 10,
  },
  webContentWrapperFullWidth: {
    maxWidth: '100%',
    marginTop: 0,
  },
  webFooter: {
    width: '100%',
    paddingVertical: 60,
    paddingHorizontal: 24,
    marginTop: 60,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  webFooterContent: {
    maxWidth: MAX_WIDTH,
    marginHorizontal: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  webFooterColumn: {
    minWidth: 200,
    marginBottom: 32,
  },
  webFooterText: {
    marginTop: 12,
    opacity: 0.7,
    fontSize: 14,
  },
  webFooterLink: {
    marginTop: 12,
    color: '#007AFF',
    fontSize: 14,
  },
});
