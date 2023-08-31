import * as React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { H1, H6 } from 'tamagui';

export const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <H1> Loading RLY Account </H1>
      <View style={styles.smallMargin}>
        <H6>This may take several seconds</H6>
      </View>
      <ActivityIndicator style={styles.standardMargin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 60,
    paddingHorizontal: 12,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  smallMargin: {
    marginTop: 12,
  },
  standardMargin: {
    marginTop: 24,
  },
});
