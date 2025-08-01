export type Token = {
  chainId: number;
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI: string;
  rating: number;
  eip2612: boolean;
  isFoT: boolean;
  tags:
    | {
        name: string;
        provider: string;
      }[]
    | string[];
  providers: string[];
};
