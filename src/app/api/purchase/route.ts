import { SWAP_FEE } from "@/constants";
import { AGGREGATOR_ADDR, ODOS_EXECUTOR_ADDR } from "@/contracts";
import AggregatorABI from "@/contracts/AggregatorABI";
import toobFinanceRouter from "@/packages/abi/toobFinanceRouter";
import { ChainId } from "@/packages/chain";
import { USDC } from "@/packages/currency";
import { signSmartContractData } from "@wert-io/widget-sc-signer";
import axios from "axios";
import { encodeFunctionData, isAddress, parseEther, parseUnits } from "viem";

export async function POST(request: Request) {
  try {
    const { amount, token, recipient } = await request.json();
    let userAddr = isAddress(recipient)
      ? recipient
      : "0x0bD52D57F18f63bcA6F69a6Dbcddc024B6C0DDCf";

    const amountIn = parseUnits(amount.toString(), 6);
    const feeAmount = (amountIn * SWAP_FEE) / 10000n;
    const exactAmountIn = amountIn - feeAmount;

    if (
      token.toLowerCase() === USDC[ChainId.ARBITRUM_ONE].address.toLowerCase()
    ) {
      return Response.json({
        address: userAddr,
        commodity: "USDC",
        network: "arbitrum",
        commodity_amount: amount,
      });
    }
    const { data: tradeData } = await axios.get(
      `https://aggregator-api.kyberswap.com/arbitrum/api/v1/routes?tokenIn=0xaf88d065e77c8cc2239327c5edb3a432268e5831&tokenOut=${token}&amountIn=${exactAmountIn.toString()}&gasInclude=true`
    );

    const { data: txData } = await axios.post(
      "https://aggregator-api.kyberswap.com/arbitrum/api/v1/route/build",
      {
        routeSummary: tradeData?.data?.routeSummary,
        recipient: userAddr,
        sender: userAddr,
        skipSimulateTx: true,
        slippageTolerance: 100,
      }
    );

    const inputData = encodeFunctionData({
      abi: AggregatorABI,
      functionName: "swap",
      args: [
        {
          targetData: txData?.data?.data,
          target: txData?.data?.routerAddress,
          tokenIn: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
          amountIn: amountIn,
          fee: true,
        },
      ],
    });

    const signedData = signSmartContractData(
      {
        address: userAddr,
        commodity: "USDC",
        network: "arbitrum",
        commodity_amount: amount,
        sc_address: AGGREGATOR_ADDR,
        sc_input_data: inputData,
      },
      process.env.NEXT_PUBLIC_WERT_KEY ?? ""
    );

    return Response.json(signedData);
  } catch (err: any) {
    console.log(err);
    return Response.error();
  }
}
