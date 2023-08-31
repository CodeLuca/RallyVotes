import { useEffect, useState, useContext } from 'react';
import { Button, YStack, XStack, ScrollView, H2, H6, H5, Card, Spinner, Separator, Paragraph, H4 } from 'tamagui';
import { AppContainer } from '../../components/AppContainer';
import { StateContext } from '../../StateContext';
import { ethers, JsonRpcProvider } from 'ethers';
import tokenAbi from "../../../assets/token_abi.json";
import contractAbi from "../../../assets/voting_contract_abi.json";
import { Link, useLocalSearchParams } from 'expo-router';
import { getAccountPhrase, RlyMumbaiNetwork } from "@rly-network/mobile-sdk";
import { ThumbsUp, ThumbsDown } from '@tamagui/lucide-icons'
import { Text } from 'react-native';
import { getExecuteMetaTx } from "../../approvalWithExecuteMetaTx";

export default function Proposals() {
  const { id } = useLocalSearchParams();
  const [rlyAccount, setRlyAccount] = useContext(StateContext);
  const [proposal, setProposalData] = useState(null);
  const [refreshing, setRefreshing] = useState(null);
  const [loadingState, setLoadingState] = useState(null);
  const [error, setError] = useState(null);

  const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/-dYNjZXvre3GC9kYtwDzzX4N8tcgomU4");
  const tokenAddress = "0x1C7312Cb60b40cF586e796FEdD60Cf243286c9E9";
  const contractAddress = "0xb605F160EC4f5F94e1A81268e5FdDbD704262bc6";

  const refresh = async () => {
    setRefreshing(true);
    const mnemonic = await getAccountPhrase()
    const mnemonicWallet = await ethers.Wallet.fromMnemonic(mnemonic);
    const wallet = new ethers.Wallet(mnemonicWallet.privateKey, provider)
    const myContract = new ethers.Contract(contractAddress, contractAbi, wallet);

    const proposalsResponse = await myContract.getProposalDetails(id);
    const pD = {
      title: proposalsResponse[0],
      description: proposalsResponse[1],
      upvotes: proposalsResponse[2].toString(),
      downvotes: proposalsResponse[3].toString(),
      isActive: proposalsResponse[4].toString(),
    }

    setProposalData(pD);
    setRefreshing(false);
  }

  const vote = async (isUpvote) => {
    if (loadingState)
      return;

    console.log({ votingIsUpvote: isUpvote })
    try {
      setLoadingState("Loading...")
      const mnemonic = await getAccountPhrase();
      const mnemonicWallet = await ethers.Wallet.fromMnemonic(mnemonic);
      const wallet = new ethers.Wallet(mnemonicWallet.privateKey, provider);

      const { maxFeePerGas, maxPriorityFeePerGas } = await provider.getFeeData();

      const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, wallet);
      const myContract = new ethers.Contract(contractAddress, contractAbi, wallet);

      // Approve

      setLoadingState("Approving...")
      const approveGsnTx = await getExecuteMetaTx(rlyAccount, null, contractAddress, provider, wallet);
      console.log({ approveGsnTx })
      const aX = await RlyMumbaiNetwork.relay(approveGsnTx);

      // Actual Transaction
      setLoadingState("Transacting...")
      const tx = await myContract.populateTransaction.vote(id, isUpvote);
      const gasEstimate = await myContract.estimateGas.vote(id, isUpvote);

      const gsnTx = {
        from: rlyAccount,
        data: tx.data,
        to: tx.to,
        gas: gasEstimate._hex, // Adding some buffer gs
        maxFeePerGas: maxFeePerGas._hex,
        maxPriorityFeePerGas: maxPriorityFeePerGas._hex,
      };

      console.log({ gsnTx })

      const x = await RlyMumbaiNetwork.relay(gsnTx);
      console.log({ x })
      setLoadingState(null)
      refresh();
    } catch (e) {
      console.log(e)
      let msg = e.error.message;
      if (msg.toString().includes("have already voted"))
        msg = "You have already voted on this proposal."
      setError(msg);
      setLoadingState(null)
    }
  }
  useEffect(() => {
    refresh();
  }, [])

  return (
    <AppContainer>
      <ScrollView style={{ width: "100%" }}>
        <YStack style={{ width: "100%" }} space>
          {
            proposal ? (
              <>
                <YStack style={{ margin: 5 }} alignItems="center">
                  <H6 letterSpacing={2} color="black">PROPOSAL ID: {id}</H6>
                  <H2 style={{ fontFamily: "InterBold", marginBottom: 5, textAlign: "center" }} color="black">{proposal.title}</H2>
                  <H5 color="black" textAlign="center">{proposal.description}</H5>
                  <Separator marginVertical={15} style={{ borderColor: 'black' }} />
                </YStack>
                <XStack style={{ textColor: "black" }}>
                  <YStack style={{ width: "50%", paddingRight: 5 }} alignItems="center" space>
                    <XStack alignItems='center'>
                      <ThumbsUp color="green" />
                      <H2 style={{ fontFamily: "InterBold", color: "green" }} color="black">
                        {" "}
                        {
                          refreshing ? <Spinner color="green" style={{ marginBottom: 2 }} /> : proposal.upvotes
                        }
                      </H2>
                    </XStack>
                    <Paragraph color="black" style={{ marginTop: -20 }}>Upvotes</Paragraph>
                    <Button style={{ width: "100%", backgroundColor: "green" }} onPress={() => vote(true)}>
                      <Text style={{ fontFamily: "InterBold", color: "white" }} color="black">
                        {loadingState || "Upvote for 0.1 RLY"}
                      </Text>
                    </Button>
                  </YStack>
                  <YStack style={{ width: "50%" }} alignItems="center" space>
                    <XStack alignItems='center'>
                      <ThumbsDown color="darkred" />
                      <H2 style={{ fontFamily: "InterBold", color: "darkred" }} color="black">
                        {" "}
                        {
                          refreshing ? <Spinner color="darkred" style={{ marginBottom: 2 }} /> : proposal.downvotes
                        }
                      </H2>
                    </XStack>
                    <Paragraph color="black" style={{ marginTop: -20 }}>Downvotes</Paragraph>
                    <Button style={{ width: "100%", backgroundColor: "darkred" }} onPress={() => vote(false)}>
                      <Text style={{ fontFamily: "InterBold", color: "white" }} color="black">
                        {loadingState || "Downvote for 0.1 RLY"}
                      </Text>
                    </Button>
                  </YStack>
                </XStack>
                <Link href="/proposals" asChild>
                  <Button style={{ marginTop: 15 }}>
                    <Text style={{ color: "white" }} color="black">
                      Back to All Proposals
                    </Text>
                  </Button>
                </Link>
              </>
            ) : (
              <YStack style={{ marginTop: 50 }} alignItems="center" justifyContent='center'>
                <Spinner size="large" color="black" />
                <H4 color="black" style={{ width: "100%", textAlign: "center" }}>Loading...</H4>
              </YStack>
            )
          }
          <Paragraph color="red" style={{ marginTop: 20 }}>{error}</Paragraph>
        </YStack>
      </ScrollView>
    </AppContainer>
  )
}