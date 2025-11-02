import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface TopLoaderProps {
  isLoading: boolean;
  progress?: number; // 0 to 1
  color?: string;
}

export function TopLoader({ isLoading, progress, color = '#2563EB' }: TopLoaderProps) {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;
  const indeterminateAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      if (progress !== undefined) {
        // Determinate progress
        if (indeterminateAnimation.current) {
          indeterminateAnimation.current.stop();
          indeterminateAnimation.current = null;
        }
        Animated.timing(animatedProgress, {
          toValue: progress,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        // Indeterminate progress
        indeterminateAnimation.current = Animated.loop(
          Animated.sequence([
            Animated.timing(animatedProgress, {
              toValue: 0.3,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(animatedProgress, {
              toValue: 0.8,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(animatedProgress, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(animatedProgress, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
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
        Animated.timing(animatedProgress, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
        animatedProgress.setValue(0);
      });
    }
  }, [isLoading, progress, animatedProgress, animatedOpacity]);

  if (!isVisible) {
    return null;
  }

  const translateX = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, 0],
  });

  return (
    <Animated.View style={[styles.container, { opacity: animatedOpacity }]}>
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: color,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    </Animated.View>
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
  progressBarContainer: {
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '100%',
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