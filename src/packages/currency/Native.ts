import invariant from "tiny-invariant";
import { ChainId, natives } from "../chain";

import { Currency } from "./Currency";
import { Token } from "./Token";
import { type Type } from "./Type";
import { WNATIVE } from "./constants/tokens";
import { type SerializedNative, nativeSchema } from "./zod";

export class Native extends Currency {
  public readonly id: string;
  public readonly isNative = true as const;
  public readonly isToken = false as const;
  public override readonly symbol: string;
  public override readonly name: string;
  protected constructor(native: {
    chainId: number;
    decimals: number;
    symbol: string;
    name: string;
  }) {
    super({
      ...native,
      icon: native.chainId == 1996 ? "/media/dmt.png" : "/media/eth.webp",
      category: "Native",
    });
    this.id = `${native.chainId}:NATIVE`;
    this.symbol = native.symbol;
    this.name = native.name;
  }
  public get wrapped(): Token {
    let wnative;

    if (this.chainId != 1996 && this.chainId != 42161) {
      wnative = WNATIVE[ChainId.ARBITRUM_ONE];
    } else {
      wnative = WNATIVE[this.chainId];
    }

    invariant(!!wnative, "WRAPPED");

    return wnative;
  }

  // public get tokenURI(): string {
  //   return `native-currency/${this.symbol.toLowerCase()}.svg`
  // }

  private static cache: Record<number, Native> = {};

  public static onChain(chainId: number): Native {
    const cached = this.cache[chainId];

    if (typeof cached !== "undefined") {
      return cached;
    }

    let nativeCurrency;

    if (chainId != 1996 && chainId != 42161) {
      nativeCurrency = { name: "Ether", symbol: "ETH", decimals: 18 };
    } else {
      nativeCurrency = natives?.[chainId];
    }

    invariant(!!nativeCurrency, "NATIVE_CURRENCY");

    const { decimals, name, symbol } = nativeCurrency;

    const native = new Native({
      chainId,
      decimals,
      name,
      symbol,
    });

    this.cache[chainId] = new Native({
      chainId,
      decimals,
      name,
      symbol,
    });

    return native;
  }

  public equals(other: Type): boolean {
    return other.isNative && other.chainId === this.chainId;
  }

  public serialize(): SerializedNative {
    return nativeSchema.parse({
      isNative: this.isNative,
      name: this.name,
      symbol: this.symbol,
      decimals: this.decimals,
      chainId: this.chainId,
    });
  }

  public static deserialize(native: SerializedNative): Native {
    return Native.onChain(native.chainId);
  }
}
