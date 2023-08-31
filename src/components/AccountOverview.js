import React, { useEffect, useState, useContext } from 'react';
import { AppContainer } from './AppContainer';
import { H2, H6, Paragraph } from 'tamagui';
import {
  Button,
  Linking,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {
  getAccountPhrase,
  RlyMumbaiNetwork,
  MetaTxMethod,
} from '@rly-network/mobile-sdk';
import { RlyCard } from './RlyCard';
import { LoadingModal, StandardModal } from './LoadingModal';
import { PrivateConfig } from '../private_config';
import { StateContext } from "../StateContext";
import { useRouter } from "expo-router";

const RlyNetwork = RlyMumbaiNetwork;
RlyNetwork.setApiKey(PrivateConfig.RALLY_API_KEY);

const customTokenAddress = undefined;

const AccountOverviewScreen = (props) => {
  const router = useRouter();

  const [rlyAccount, setRlyAccount] = useContext(StateContext);
  const [performingAction, setPerformingAction] = useState();

  const [balance, setBalance] = useState();

  const [transferBalance, setTransferBalance] = useState('');
  const [transferAddress, setTranferAddress] = useState('');

  const [mnemonic, setMnemonic] = useState();

  const fetchBalance = async () => {
    const bal = await RlyNetwork.getBalance();

    setBalance(bal);
  };

  useEffect(() => {
    console.log({ rlyAccount })
    if (!rlyAccount)
      router.replace('/account/generate')

    fetchBalance();
  }, []);

  const claimRlyTokens = async () => {
    setPerformingAction('Registering Account');
    await RlyNetwork.claimRly();

    await fetchBalance();
    setPerformingAction(undefined);
  };

  const transferTokens = async () => {
    setPerformingAction('Transfering Tokens');
    await RlyNetwork.transfer(
      transferAddress,
      parseInt(transferBalance, 10),
      customTokenAddress,
      MetaTxMethod.ExecuteMetaTransaction
    );

    await fetchBalance();
    setPerformingAction(undefined);
    setTransferBalance('');
    setTranferAddress('');
  };

  const revealMnemonic = async () => {
    const value = await getAccountPhrase();

    if (!value) {
      throw 'Something went wrong, no Mnemonic when there should be one';
    }

    setMnemonic(value);
  };

  return (
    <>
      <AppContainer>
        <ScrollView>
          <View style={styles.alignMiddle}>
            <H2 style={{ fontFamily: "InterBold" }} color="black">RallyVotes</H2>
            <H6 letterSpacing={2} color="black">GASLESS VOTING SYSTEM</H6>
          </View>
          <View style={styles.addressContainer}>
            <Paragraph color="black">{rlyAccount || 'No Account Exists'}</Paragraph>
          </View>
          <RlyCard style={styles.balanceCard}>
            <View style={styles.balanceContainer}>
              <Paragraph>Your Current Balance Is</Paragraph>
              <H2>{balance}</H2>
            </View>
            <View style={styles.balanceContainer}>
              <Button
                title="View on Polygon"
                onPress={() => {
                  Linking.openURL(
                    `https://mumbai.polygonscan.com/address/${rlyAccount}`
                  );
                }}
              />
            </View>
          </RlyCard>
          {balance === 0 && (
            <RlyCard style={styles.balanceCard}>
              <View style={styles.alignMiddle}>
                <Paragraph>Claim RLY Tokens from Faucet</Paragraph>
              </View>
              <Button onPress={claimRlyTokens} title="Claim RLY" />
            </RlyCard>
          )}

          {/* <RlyCard style={styles.balanceCard}>
            <View style={styles.alignMiddle}>
              <Paragraph>Transfer RLY</Paragraph>
            </View>
            <View>
              <Paragraph>Recipient</Paragraph>
              <TextInput
                style={styles.input}
                value={transferAddress}
                onChangeText={setTranferAddress}
              />
            </View>
            <View>
              <Paragraph>Amount</Paragraph>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={transferBalance}
                onChangeText={setTransferBalance}
              />
            </View>
            <Button onPress={transferTokens} title="Transfer" />
          </RlyCard> */}

          {/* <RlyCard style={styles.balanceCard}>
            <View style={styles.alignMiddle}>
              <Paragraph>Export Your Account</Paragraph>
            </View>
            <Button title="Reveal my Mnemonic" onPress={revealMnemonic} />
          </RlyCard> */}
          <Paragraph color="gray" style={{ marginTop: 20 }}>Please note: You can only claim from the faucet once. It costs 1 RLY token to create a new proposal. It costs 0.1 RLY to vote on a proposal.</Paragraph>
        </ScrollView>
      </AppContainer>

      {/* <StandardModal show={!!mnemonic}>
        <View>
          <View>
            <Paragraph>Copy The Phrase below to export your wallet</Paragraph>
          </View>
          <View style={styles.balanceCard}>
            <H2>{mnemonic}</H2>
          </View>
          <View style={styles.balanceCard}>
            <Button
              title="Close"
              onPress={() => {
                setMnemonic(undefined);
              }}
            />
          </View>
        </View>
      </StandardModal> */}

      <LoadingModal title={performingAction || 'Loading'} show={!!performingAction} />
    </>
  );
};

const styles = StyleSheet.create({
  alignMiddle: {
    alignItems: 'center',
  },
  balanceCard: {
    marginTop: 24,
  },
  balanceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressContainer: {
    marginTop: 16,
  },
  input: {
    height: 40,
    padding: 10,
    marginVertical: 12,
    color: 'white',
    backgroundColor: '#3A3A3A',
    borderRadius: 8,
    borderWidth: 0,
  },
});

export default AccountOverviewScreen;
