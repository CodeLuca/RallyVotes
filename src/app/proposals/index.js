import { useEffect, useState, useContext } from 'react';
import { Button, YStack, XStack, ScrollView, H2, H6, Card, Spinner, Image, Paragraph, H4 } from 'tamagui';
import { AppContainer } from '../../components/AppContainer';
import { StateContext } from '../../StateContext';
import { ethers, JsonRpcProvider } from 'ethers';
import contractAbi from "../../../assets/voting_contract_abi.json";
import { Link } from 'expo-router';
import { getAccountPhrase, RlyMumbaiNetwork } from "@rly-network/mobile-sdk";
import { useFocusEffect } from '@react-navigation/native';


export default function Proposals() {
  const [rlyAccount, setRlyAccount] = useContext(StateContext);
  const [proposals, setProposalData] = useState(null);
  const [loading, setIsLoading] = useState(null);

  const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/-dYNjZXvre3GC9kYtwDzzX4N8tcgomU4");
  const tokenAddress = "0x1C7312Cb60b40cF586e796FEdD60Cf243286c9E9";
  const contractAddress = "0xb605F160EC4f5F94e1A81268e5FdDbD704262bc6";

  const refresh = async () => {
    setIsLoading(true);
    const mnemonic = await getAccountPhrase()
    const mnemonicWallet = await ethers.Wallet.fromMnemonic(mnemonic);
    const wallet = new ethers.Wallet(mnemonicWallet.privateKey, provider)
    const myContract = new ethers.Contract(contractAddress, contractAbi, wallet);

    const proposalsResponse = await myContract.getAllProposalTitlesAndIds();

    const pD = proposalsResponse[0].map((p, i) => {
      return {
        title: p,
        id: proposalsResponse[1][i].toString()
      }
    });

    setProposalData(pD);
    setIsLoading(false);
  }
  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [])
  );

  useEffect(() => {
    refresh();
  }, [])

  return (
    <AppContainer>
      <ScrollView style={{ width: "100%" }}>
        <YStack style={{ width: "100%" }} space>
          <YStack alignItems="center" style={{ marginTop: 5, marginBottom: 5 }}>
            <H2 style={{ fontFamily: "InterBold" }} color="black">RallyVotes</H2>
            <H6 letterSpacing={2} color="black">GASLESS VOTING SYSTEM</H6>
          </YStack>
          <YStack style={{ width: "100%" }} space alignItems='center' justifyContent='center'>
            {
              !loading && proposals ?
                proposals.map((p) => (
                  <Link href={`/proposals/${p.id}`} asChild key={p.id}>
                    <Card elevate bordered style={{ width: "100%" }}>
                      <Card.Header padded>
                        <H2>{p.title}</H2>
                        <Paragraph color="white">Proposal ID: {p.id}</Paragraph>
                      </Card.Header>
                      <Card.Footer padded>
                        <XStack flex={1} />
                        <Link href={`/proposals/${p.id}`} asChild>
                          <Button themeInverse borderRadius="$10">View Proposal</Button>
                        </Link>
                      </Card.Footer>
                      <Card.Background>
                      </Card.Background>
                    </Card>
                  </Link>
                )) : (
                  <YStack style={{ marginTop: 50 }} alignItems="center" justifyContent='center'>
                    <Spinner size="large" color="black" />
                    <H4 color="black" style={{ width: "100%", textAlign: "center" }}>Loading...</H4>
                  </YStack>
                )
            }
          </YStack>
        </YStack>
      </ScrollView>
    </AppContainer >
  )
}