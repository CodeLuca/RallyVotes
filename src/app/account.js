import * as React from 'react';
import { useEffect, useState, useContext } from 'react';
import { Button, YStack, ScrollView, H2, H6 } from 'tamagui';
import { useRouter } from 'expo-router';
import { createAccount, getAccount } from '@rly-network/mobile-sdk';
import AccountOverview from '../components/AccountOverview';
import AccountGenerate from '../components/AccountGenerate';
import { LoadingScreen } from '../components/LoadingScreen';
import { StateContext } from '../StateContext';

export default function App() {
  const router = useRouter();
  const [accountLoaded, setAccountLoaded] = useState(false);
  const [rlyAccount, setRlyAccount] = useContext(StateContext);

  useEffect(() => {
    const readAccount = async () => {
      const account = await getAccount();
      console.log('user account', account);

      setAccountLoaded(true);
    };
    readAccount();
  }, [accountLoaded]);

  if (!accountLoaded) {
    return <LoadingScreen />;
  }

  if (!rlyAccount) {
    return <AccountGenerate />;
  }

  return <AccountOverview rlyAccount={rlyAccount} />;
}
