import React from 'react';
import { Image, useColorScheme, ImageStyle, View } from 'react-native';

interface LogoProps {
  width?: number;
  height?: number;
  style?: ImageStyle;
  forceTheme?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({
  width = 150,
  height = 150,
  style,
  forceTheme
}) => {
  const colorScheme = useColorScheme();
  const isDark = forceTheme ? forceTheme === 'dark' : colorScheme === 'dark';

  // Use white logo on dark backgrounds, black logo on light backgrounds
  const logoSource = isDark
    ? require('../assets/images/logo-white.png')
    : require('../assets/images/logo-black.png');

  return (
    <Image
      source={logoSource}
      style={[
        {
          width,
          height,
          resizeMode: 'contain',
        },
        style,
      ]}
    />
  );
};

// Animated logo variant for splash screens
export const AnimatedLogo: React.FC<LogoProps> = (props) => {
  const [opacity] = React.useState(new (require('react-native').Animated.Value)(0));

  React.useEffect(() => {
    require('react-native').Animated.timing(opacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const AnimatedImage = require('react-native').Animated.createAnimatedComponent(Image);
  const colorScheme = useColorScheme();
  const isDark = props.forceTheme ? props.forceTheme === 'dark' : colorScheme === 'dark';

  const logoSource = isDark
    ? require('../assets/images/logo-white.png')
    : require('../assets/images/logo-black.png');

  return (
    <AnimatedImage
      source={logoSource}
      style={[
        {
          width: props.width || 150,
          height: props.height || 150,
          resizeMode: 'contain',
          opacity,
        },
        props.style,
      ]}
    />
  );
};