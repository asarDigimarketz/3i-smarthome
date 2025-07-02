import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '../../utils/cn';

interface ScreenProps {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  safeArea?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  className,
  scrollable = false,
  keyboardAvoiding = false,
  safeArea = true,
}) => {
  const insets = useSafeAreaInsets();

  const Container = scrollable ? ScrollView : View;
  const containerProps = scrollable ? { contentContainerStyle: styles.content } : {};

  const content = (
    <Container
      className={cn('flex-1 bg-white', className)}
      {...containerProps}
    >
      {children}
    </Container>
  );

  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  if (safeArea) {
    return (
      <View
        style={[
          styles.safeArea,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        {content}
      </View>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
}); 