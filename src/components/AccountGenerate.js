import React, { useContext, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, YStack, H2, H6, Paragraph } from 'tamagui';
import { AppContainer } from './AppContainer';
import { RlyCard } from './RlyCard';
import { createAccount, getAccount } from '@rly-network/mobile-sdk';
import { StateContext } from "../StateContext";
import { useRouter } from "expo-router";

export default GenerateAccountScreen = (props) => {
  const [loading, setLoading] = useState(null);
  const [rlyAccount, setRlyAccount] = useContext(StateContext);

  const createRlyAccount = async () => {
    setLoading(true)
    const rlyAct = await createAccount();
    setRlyAccount(rlyAct);
    setLoading(false)
  };

  return (
    <AppContainer>
      <View>
        <YStack alignItems="center" style={{ marginTop: 5, marginBottom: 5 }}>
          <H2 style={{ fontFamily: "InterBold" }} color="black">RallyVotes</H2>
          <H6 letterSpacing={2} color="black">GASLESS VOTING SYSTEM</H6>
        </YStack>
      </View>
      <RlyCard style={styles.cardMargin}>
        <View style={{ alignItems: "center" }}>
          <H2 style={{ marginBottom: 10 }}>Setup Account</H2>
          <Paragraph textAlign="center">Looks like you don't yet have an account, let's get you setup with one.</Paragraph>
          <Button themeInverse onPress={createRlyAccount} style={{ marginTop: 20 }}>{loading ? "Creating..." : "Create Account"}</Button>
        </View>
      </RlyCard>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  marginBetween: {
    marginTop: 12,
  },
  cardMargin: {
    marginTop: 24,
  },
});
