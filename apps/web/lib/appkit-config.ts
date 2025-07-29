import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  AppKitNetwork,
  arbitrum,
  mainnet,
  optimism,
  polygon,
} from "@reown/appkit/networks";
import {
  createAppKit,
  useAppKit,
  useAppKitAccount,
  useAppKitEvents,
  useAppKitNetwork,
  useAppKitState,
  useAppKitTheme,
  useDisconnect,
  useWalletInfo,
} from "@reown/appkit/react";

export const projectId =
  process.env.NEXT_PUBLIC_APPKIT_PRODUCT_ID ||
  "b56e18d47c72ab683b10814fe9495694"; // this is a public projectId only to use on localhost

export const networks = [mainnet, polygon, arbitrum, optimism] as [
  AppKitNetwork,
  ...AppKitNetwork[],
];

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
});

const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  metadata: {
    name: "DeWrap",
    description: "DeWrap",
    url: "https://dewrap.io",
    icons: ["https://avatars.githubusercontent.com/u/179229932?s=200&v=4"],
  },
  projectId,
  themeMode: "light",
});

export {
  modal,
  useAppKit,
  useAppKitState,
  useAppKitTheme,
  useAppKitEvents,
  useAppKitAccount,
  useWalletInfo,
  useAppKitNetwork,
  useDisconnect,
};
