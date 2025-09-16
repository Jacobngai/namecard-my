import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface TopLoaderProps {
  isLoading: boolean;
  progress?: number; // 0 to 1
  color?: string;
}

export function TopLoader({ isLoading, progress, color = '#2563EB' }: TopLoaderProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const indeterminateAnimation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isLoading) {
      if (progress !== undefined) {
        // Determinate progress
        if (indeterminateAnimation.current) {
          indeterminateAnimation.current.stop();
          indeterminateAnimation.current = null;
        }
        Animated.timing(animatedWidth, {
          toValue: progress * width,
          duration: 300,
          useNativeDriver: false,
        }).start();
      } else {
        // Indeterminate progress
        indeterminateAnimation.current = Animated.loop(
          Animated.sequence([
            Animated.timing(animatedWidth, {
              toValue: width * 0.3,
              duration: 800,
              useNativeDriver: false,
            }),
            Animated.timing(animatedWidth, {
              toValue: width * 0.8,
              duration: 600,
              useNativeDriver: false,
            }),
            Animated.timing(animatedWidth, {
              toValue: width,
              duration: 400,
              useNativeDriver: false,
            }),
            Animated.timing(animatedWidth, {
              toValue: 0,
              duration: 0,
              useNativeDriver: false,
            }),
          ])
        );
        indeterminateAnimation.current.start();
      }
    } else {
      // Complete and fade out
      if (indeterminateAnimation.current) {
        indeterminateAnimation.current.stop();
        indeterminateAnimation.current = null;
      }
      Animated.sequence([
        Animated.timing(animatedWidth, {
          toValue: width,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(animatedWidth, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isLoading, progress, animatedWidth]);

  if (!isLoading && animatedWidth._value === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.progressBar,
          {
            width: animatedWidth,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'transparent',
    zIndex: 9999,
  },
  progressBar: {
    height: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
});