import { ethers } from 'ethers';
import contractAbi from "../assets/token_abi.json";
// This gets the nonce for the caller address on the contract being called, attempted two different ways because the interface is not standard


export const getTypedMetatransaction = ({
  name,
  version,
  salt,
  verifyingContract,
  nonce,
  from,
  functionSignature,
}) => {
  return {
    types: {
      MetaTransaction: [
        {
          name: 'nonce',
          type: 'uint256',
        },
        {
          name: 'from',
          type: 'address',
        },
        {
          name: 'functionSignature',
          type: 'bytes',
        },
      ],
    },
    domain: {
      name,
      version,
      verifyingContract,
      salt,
    },
    primaryType: 'MetaTransaction',
    message: {
      nonce,
      from,
      functionSignature,
    },
  };
};


const getSenderContractNonce = async (
  token,
  address
) => {
  try {
    return await token.nonces(address);
  } catch {
    return await token.getNonce(address);
  }
};

const getMetaTxEIP712Signature = async (
  account,
  contractName,
  contractAddress,
  functionSignature,
  config,
  nonce,
  wallet
) => {
  const chainId = config?.gsn?.chainId || '80001';

  const eip712Data = getTypedMetatransaction({
    name: contractName,
    version: '1',
    salt: ethers.utils.hexZeroPad(ethers.utils.hexlify(Number(chainId)), 32),
    verifyingContract: contractAddress,
    nonce,
    from: account,
    functionSignature,
  });

  const signature = await wallet._signTypedData(
    eip712Data.domain,
    eip712Data.types,
    eip712Data.message
  );

  return ethers.utils.splitSignature(signature);
};

export const getExecuteMetaTx = async (
  account,
  config,
  contractAddress,
  provider,
  wallet
) => {
  const token = new ethers.Contract("0x1C7312Cb60b40cF586e796FEdD60Cf243286c9E9", contractAbi, provider);

  const [name, nonce] = await Promise.all([
    token.name(),
    getSenderContractNonce(token, account),
    token.decimals(),
  ]);

  console.log({ name, nonce })

  const approveTx = await token.populateTransaction.approve?.(
    contractAddress,
    ethers.constants.MaxUint256
  );

  const { r, s, v } = await getMetaTxEIP712Signature(
    account,
    name,
    token.address,
    approveTx.data,
    config,
    nonce.toNumber(),
    wallet
  );

  const tx = await token.populateTransaction.executeMetaTransaction?.(
    account,
    approveTx.data,
    r,
    s,
    v,
    { from: account }
  );

  const gas = await token.estimateGas.executeMetaTransaction?.(
    account,
    approveTx.data,
    r,
    s,
    v,
    {
      from: account,
    }
  );

  const { maxFeePerGas, maxPriorityFeePerGas } = await provider.getFeeData();

  if (!tx) {
    throw 'tx not populated';
  }

  const gsnTx = {
    from: account,
    data: tx.data,
    value: '0',
    to: tx.to,
    gas: gas?._hex,
    maxFeePerGas: maxFeePerGas?._hex,
    maxPriorityFeePerGas: maxPriorityFeePerGas?._hex,
  };

  return gsnTx;
};
