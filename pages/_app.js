import "../styles/globals.css";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet, polygon, goerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
// import { WatchlistProvider } from "../components/WatchlistContext";
// import { ManageAddressProvider  } from "../components/ManageAddressContext";

const { chains, provider } = configureChains(
  [mainnet, polygon],
  [publicProvider()]
);
const { connectors } = getDefaultWallets({
  appName: "Firebase Web3 Wallet Tracker",
  chains,
});
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const App = ({ Component, pageProps }) => {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
      {/* <WatchlistProvider> */}
        {/* <ManageAddressProvider > */}
          {/* <Header></Header> */}
        <Component {...pageProps} />
        {/* <ShowFav> */}
        {/* <ShowPrice> */}
          {/* <TokenDetail > */}
            {/* <TokenPools> */}
              {/* <TokenValueCalculator> */}
                {/* <PieChart> */}
      {/* <MutualToken> */}
        
      {/* </MutualToken> */}

                  {/* <ohlcv> */}
                  {/* <TradingChart></TradingChart> */}
                  {/* </ohlcv> */}
                {/* </PieChart> */}
              {/* </TokenValueCalculator> */}
            {/* </TokenPools> */}
          {/* </TokenDetail>           */}
        {/* </ShowPrice> */}
        {/* </ShowFav> */}
        {/* </ManageAddressProvider>
        </WatchlistProvider> */}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default App;
