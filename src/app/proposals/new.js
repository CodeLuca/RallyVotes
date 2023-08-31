import { useEffect, useState, useContext } from 'react';
import { Button, YStack, ScrollView, H3, H6, H2, Input, Paragraph } from 'tamagui';
import { AppContainer } from '../../components/AppContainer';
import { StateContext } from '../../StateContext';
import { ethers, JsonRpcProvider } from 'ethers';
import contractAbi from "../../../assets/voting_contract_abi.json";
import tokenAbi from "../../../assets/token_abi.json";
import { getAccountPhrase, RlyMumbaiNetwork } from "@rly-network/mobile-sdk";
import { getExecuteMetaTx } from "../../approvalWithExecuteMetaTx";

export default function Proposals() {
  const [rlyAccount, setRlyAccount] = useContext(StateContext);
  const [proposals, setProposalData] = useState(null);
  const [title, setTitle] = useState(null);
  const [description, setDescription] = useState(null);
  const [loadingState, setLoadingState] = useState(null);

  const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/-dYNjZXvre3GC9kYtwDzzX4N8tcgomU4");
  const tokenAddress = "0x1C7312Cb60b40cF586e796FEdD60Cf243286c9E9";
  const contractAddress = "0xb605F160EC4f5F94e1A81268e5FdDbD704262bc6";

  const createProposal = async () => {
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
      const tx = await myContract.populateTransaction.createProposal(title, description);
      const gasEstimate = await myContract.estimateGas.createProposal(title, description);

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
    } catch (e) {
      console.error({ e });
      setLoadingState(null)
    }
  }

  useEffect(() => {
  }, [])

  return (
    <AppContainer>
      <ScrollView style={{ width: "100%" }}>
        <YStack style={{ width: "100%" }} space>
          <YStack alignItems="center" style={{ marginTop: 5, marginBottom: 5 }}>
            <H2 style={{ fontFamily: "InterBold" }} color="black">Create a New Proposal</H2>
          </YStack>
          <YStack style={{ width: "100%" }} space>
            <Paragraph color="black" style={{ marginBottom: -10 }}>Proposal Title</Paragraph>
            <Input onChangeText={newText => setTitle(newText)}
              value={title}
              placeholder="Fill our potholes" />
            <Paragraph color="black" style={{ marginBottom: -10 }}>Description (140 characters)</Paragraph>
            <Input onChangeText={newText => setDescription(newText)} value={description}
              placeholder="All the roads in the neighbourhood are awful" />
            <Button onPress={createProposal}>{loadingState || "Create for 1 RLY"}</Button>
          </YStack>
          <Paragraph color="gray" style={{ marginTop: 20 }}>Please note: New proposals can take upto 30 seconds to process. It costs 1 RLY token to create a new proposal. You earn RLY tokens when other users vote on your proposals.</Paragraph>
        </YStack>
      </ScrollView>
    </AppContainer >
  )
}