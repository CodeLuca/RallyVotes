import * as React from 'react';
import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'expo-router';
import { createAccount, getAccount } from '@rly-network/mobile-sdk';
// import AccountOverview from './AccountOverview';
// import GenerateAccountScreen from './GenerateAccount';
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

      if (account) {
        setRlyAccount(account);
        router.replace('/account')
      } else {
        router.replace('/account')
      }
    };
    readAccount();
  }, [accountLoaded]);

  const createRlyAccount = async () => {
    const rlyAct = await createAccount();
    setRlyAccount(rlyAct);
  };

  // if (!accountLoaded) {
  return <LoadingScreen />;
  // }

  // if (!rlyAccount) {
  //   return <GenerateAccountScreen generateAccount={createRlyAccount} />;
  // }

  // return <AccountOverviewScreen rlyAccount={rlyAccount} />;
}
