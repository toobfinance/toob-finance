"use client";

import React, { useState } from "react";

import { Amount, TOOB, Type, USDC } from "@/packages/currency";
import SwapSide from "../Swap/SwapSide";
import CCFiatSide from "./CCFiatSide";
import { ChainId } from "@/packages/chain";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { isAddress, parseUnits } from "viem";
import toast from "react-hot-toast";
import CustomToast from "../CustomToast";
import WertWidget from "@wert-io/widget-initializer";
import Spinner from "../Spinner";
import { useDebounce } from "@/hooks/useDebounce";
import MasterCard from "@/assets/master_card.svg";
import Visa from "@/assets/visa.svg";
import AmEx from "@/assets/amex.png";
import JCB from "@/assets/jcb.svg";
import Discover from "@/assets/Discover.png";
import Link from "next/link";
import Image from "next/image";

const CCPanel = () => {
  const [fiatAmount, setFiatAmount] = useState("");
  const [tokenOut, setTokenOut] = useState<Type>(TOOB[ChainId.ARBITRUM_ONE]);
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);

  const debouncedAmount = useDebounce(fiatAmount, 200);

  const { data: convertedAmount, refetch } = useQuery({
    queryKey: ["buy-converter", debouncedAmount],
    queryFn: async () => {
      try {
        if (
          !debouncedAmount ||
          Number(debouncedAmount) < 10 ||
          Number(debouncedAmount) > 1000
        )
          return 0;

        const { data } = await axios.post(
          "https://widget.wert.io/api/v3/partners/convert",
          {
            from: "USD",
            network: "arbitrum",
            to: "USDC",
            amount: Number(debouncedAmount),
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-Partner-ID": "01HYJMVRGMMH6C99JJK70K0VMS",
            },
          }
        );
        return data?.body?.commodity_amount
          ? data?.body?.commodity_amount - 0.1
          : 0;
      } catch (err) {
        console.log(err);
      }
    },
    refetchInterval: 20000,
  });

  console.log(convertedAmount);

  const { data: amountOut } = useQuery({
    queryKey: ["buy-estimation", convertedAmount, tokenOut.wrapped.address],
    queryFn: async () => {
      if (!convertedAmount) return "0";
      if (tokenOut.equals(USDC[ChainId.ARBITRUM_ONE])) {
        return convertedAmount.toString();
      }
      const { data } = await axios.get(
        `https://aggregator-api.kyberswap.com/arbitrum/api/v1/routes?tokenIn=0xaf88d065e77c8cc2239327c5edb3a432268e5831&tokenOut=${
          tokenOut.isNative
            ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
            : tokenOut.address
        }&amountIn=${(
          (parseUnits(convertedAmount.toString(), 6) * 9600n) /
          10000n
        ).toString()}&gasInclude=true`
      );
      console.log(data);
      return Amount.fromRawAmount(
        tokenOut,
        data?.data?.routeSummary?.amountOut ?? 0
      ).toExact();
    },
    refetchInterval: 20000,
  });

  const onBuy = async () => {
    try {
      setLoading(true);
      await refetch();
      const { data } = await axios.post("api/purchase", {
        recipient,
        amount: convertedAmount,
        token: tokenOut.isNative
          ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
          : tokenOut.address,
      });
      if (!data) {
        return;
      }
      const wertWidget = new WertWidget({
        partner_id: "01HYJMVRGMMH6C99JJK70K0VMS",
        origin: "https://widget.wert.io",
        // color_secondary_text: "#fff",
        ...data,
        extra: {
          item_info: {
            image_url:
              "https://raw.githubusercontent.com/Toobdog/media/main/logo-network.svg",
            name: "Toob Finance",
          },
        },
      });
      wertWidget.open();
    } catch (err) {
      console.log(err);
      toast.custom((t) => (
        <CustomToast t={t} type="error" text={`Failed to buy the assets`} />
      ));
    } finally {
      setLoading(false);
    }
  };

  const invalidAddress = !isAddress(recipient);
  const invalidAmount =
    !fiatAmount || Number(fiatAmount) < 10 || Number(fiatAmount) > 1000;

  return (
    <>
      <div className="bg-[#e4e4e4] relative p-4 md:p-8 mt-4 border border-[#e2cdae] rounded-lg md:rounded-[32px]">
        <CCFiatSide amount={fiatAmount} setAmount={setFiatAmount} />
        <div className="border border-[#e2cdae] w-full my-5"></div>
        <SwapSide
          side="To"
          token={tokenOut}
          amount={amountOut ?? ""}
          setToken={setTokenOut}
          hideSide
          hideBalance
          primaryTokens
          disabled
        />
        <div className="border border-[#e2cdae] w-full my-5"></div>
        <div>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full h-12 max-sm:data-[fast=true]:h-[72px] outline-none text-[30px] bg-transparent text-[#31291e] font-semibold placeholder:text-[#afa392]"
            placeholder="Recipient Address"
          />
        </div>
        <button
          className="flex items-center justify-center h-12 w-full bg-[#d8c7ad] text-[#1F1D1A] border-b-2 border-[#d1bc9c] enabled:hover:bg-[#d1bc9c] enabled:hover:border-[#c0ac8e] transition-all rounded-full font-semibold disabled:opacity-70 disabled:cursor-not-allowed mt-8"
          disabled={invalidAddress || invalidAmount || loading}
          onClick={onBuy}
        >
          {loading ? (
            <Spinner className="w-5 h-5 mr-2" />
          ) : invalidAmount ? (
            !fiatAmount.length ? (
              "Input Amount to Buy"
            ) : Number(fiatAmount) < 10 ? (
              "Should be Greater Than 10"
            ) : (
              "Should be Less Than 1000"
            )
          ) : invalidAddress ? (
            "Invalid Address"
          ) : (
            "Buy"
          )}
        </button>
      </div>
      <div className="flex items-center space-x-3 justify-center mt-6">
        <Link
          href={"https://www.mastercard.us/en-us.html"}
          target="_blank"
          rel="noreferrer"
        >
          <Image
            src={MasterCard.src}
            width={MasterCard.width}
            height={MasterCard.height}
            alt="MasterCard"
            className="w-10"
          />
        </Link>
        <Link href={"https://usa.visa.com/"} target="_blank" rel="noreferrer">
          <Image
            src={Visa.src}
            width={Visa.width}
            height={Visa.height}
            alt="Visa"
            className="w-10"
          />
        </Link>
        <Link
          href={"https://www.americanexpress.com/"}
          target="_blank"
          rel="noreferrer"
        >
          <Image
            src={AmEx.src}
            width={AmEx.width}
            height={AmEx.height}
            alt="AmEx"
            className="w-8"
          />
        </Link>
        <Link
          href={"https://www.global.jcb/en/products/cards/index.html"}
          target="_blank"
          rel="noreferrer"
        >
          <Image
            src={JCB.src}
            width={JCB.width}
            height={JCB.height}
            alt="JCB"
            className="w-10"
          />
        </Link>
        <Link
          href={"https://www.discover.com"}
          target="_blank"
          rel="noreferrer"
        >
          <Image
            src={Discover.src}
            width={Discover.width}
            height={Discover.height}
            alt="Discover"
            className="w-10"
          />
        </Link>
      </div>
    </>
  );
};

export default CCPanel;
