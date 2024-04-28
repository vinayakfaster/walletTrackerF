import { useState, useEffect } from "react";
import axios from "axios";
import { useAccount } from "wagmi";
import styles from "../styles/Multiwallet.module.css";

const MultiplesWallet = ({ onClose }) => {
    const { address, isConnected } = useAccount();
    const [walletAddresses, setWalletAddresses] = useState([]);
    const [eth, setEth] = useState([]);
    const [bsc, setBsc] = useState([]);
    const [ethPool, setEthPool] = useState([]);
    const [activeTab, setActiveTab] = useState('eth');
    const [showSlider, setShowSlider] = useState(false);
    const [showWalletAddress, setShowWalletAddress] = useState(true);
    const [loading, setLoading] = useState(false);
    const [tokendetial, setTokendetial] = useState([]);
    const [bsctokendetial, setBscTokendetial] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');



    useEffect(() => {
        const fetchWalletAddresses = async () => {
            if (!address) return;
            try {
                const response = await axios.get('https://wallettrackerb.onrender.com/getWalletAddresses', { params: { address } });
                setWalletAddresses(response.data.walletAddresses || []);
            } catch (error) {
                console.error('Error fetching wallet addresses:', error.toString());
            }
        };
        fetchWalletAddresses();
    }, [address]);

    useEffect(() => {
        const sendAddressChunks = async (addressChunks, network) => {
            try {
                let allPools = [];

                for (const chunk of addressChunks) {
                    const chunkedAddresses = chunk.join(",");
                    const response = await axios.get(`https://api.geckoterminal.com/api/v2/networks/${network}/tokens/multi/${chunkedAddresses}`);
                    const tokens = response.data.data;
                    tokens.forEach(token => {
                        if (token.relationships && token.relationships.top_pools && token.relationships.top_pools.data) {
                            token.relationships.top_pools.data.forEach(pool => {
                                const idWithoutPrefix = pool.id.replace(`${network}_`, ''); // Remove prefix
                                allPools.push(idWithoutPrefix);
                            });
                        }
                    });
                }

                setEthPool(allPools);

                const add = allPools.join(',');

                if (allPools.length > 0) {
                    const poolResponse = await axios.get(`https://api.geckoterminal.com/api/v2/networks/${network}/pools/multi/${add}`);
                    const pools = poolResponse.data.data;


                    const tokenDetails = pools.map(pool => {
                        const {
                            id,
                            attributes: {
                                name,
                                base_token_price_usd,
                                quote_token_price_usd,
                                pool_created_at,
                                fdv_usd,
                                market_cap_usd,
                                price_change_percentage,
                                transactions,
                                volume_usd,
                                reserve_in_usd
                            },
                            relationships: {
                                base_token: { data: { id: baseTokenId } },
                                quote_token: { data: { id: quoteTokenId } },
                                dex: { data: { id: dexId } }
                            }
                        } = pool;

                        const idWithoutPrefix = id.replace(`${network}_`, '');
                        const baseTokenIdWithoutPrefix = baseTokenId.replace(`${network}_`, '');
                        const quoteTokenIdWithoutPrefix = quoteTokenId.replace(`${network}_`, '');
                        const dexIdWithoutPrefix = dexId.replace(`${network}_`, '');

                        return {
                            id: idWithoutPrefix,
                            name,
                            baseTokenId: baseTokenIdWithoutPrefix,
                            quoteTokenId: quoteTokenIdWithoutPrefix,
                            dexId: dexIdWithoutPrefix,
                            base_token_price_usd,
                            quote_token_price_usd,
                            pool_created_at,
                            fdv_usd,
                            market_cap_usd,
                            price_change_percentage,
                            transactions,
                            volume_usd,
                            reserve_in_usd
                        };
                    });

                    if (network === 'eth') {
                        const ethTokenDetails = tokenDetails.map(token => ({
                            ...token,
                            balance: eth.find(wallet => wallet.address === token.baseTokenId)?.balance || 0,
                            decimals: eth.find(wallet => wallet.address === token.baseTokenId)?.decimals || 0,
                            holdingValue: formatTokenBalance(token.balance, token.decimals) * (Number(token.priceUsd) || 0)
                        }));
                        setTokendetial(ethTokenDetails);
                    } else {
                        const bscTokenDetails = tokenDetails.map(token => ({
                            ...token,
                            balance: bsc.find(wallet => wallet.address === token.baseTokenId)?.balance || 0,
                            decimals: bsc.find(wallet => wallet.address === token.baseTokenId)?.decimals || 0
                        }));
                        setBscTokendetial(bscTokenDetails);
                    }
                }


            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === 'eth' && eth.length > 0) {
            setLoading(true);
            const ethAddresses = eth.map(item => item.address);
            const addressChunks = chunkArray(ethAddresses, 10);
            sendAddressChunks(addressChunks, 'eth');
        }

        if (activeTab === 'bsc' && bsc.length > 0) {
            setLoading(true);
            const bscAddresses = bsc.map(item => item.address);
            const addressChunks = chunkArray(bscAddresses, 10);
            sendAddressChunks(addressChunks, 'bsc');
        }
    }, [eth, bsc, activeTab]);

    const handleWalletClick = async (addresses) => {
        setShowSlider(true);
        setLoading(true);
        try {
            const ethResponse = await axios.get("https://wallettrackerb.onrender.com/getwalletbalance", { params: { address: addresses } });
            const bscResponse = await axios.get("https://wallettrackerb.onrender.com/getBscWalletBalance", { params: { address: addresses } });
            setEth(Object.values(ethResponse.data));
            setBsc(Object.values(bscResponse.data));
        } catch (error) {
            console.error("Error fetching data for clicked wallet:", error);
        }
    };

    function chunkArray(array, size) {
        const chunked = [];
        for (let i = 0; i < array.length; i += size) {
            chunked.push(array.slice(i, i + size));
        }
        return chunked;
    }
    // console.log(tokendetial)

    const getFilteredTokens = () => {
    const currentData = activeTab === 'eth' ? tokendetial : bsctokendetial;
    if (!searchQuery) return currentData; 
    return currentData.filter(token => 
        token.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

};


const close = () => {
   
}

console.log(tokendetial , bsctokendetial)
    return (
        <>
        {showWalletAddress && (
            <div className={styles.walletAddressesContainer}>
                {walletAddresses.map((addresses, index) => (
                    <button key={index} className={styles.walletAddress} onClick={() => handleWalletClick(addresses)}>
                        {addresses}
                    </button>  
                ))}

            </div>
        )}
        
  
            {showSlider && (
                <div className={styles.popupContainer}>
                    <div className={styles.popup}>
                        <div className={styles.popupTabs}>
                            <button
                                className={`${styles.tab} ${activeTab === 'eth' ? styles.active : ''}`}
                                onClick={() => setActiveTab('eth')}
                            >
                                Ethereum
                            </button>
                            <button
                                className={`${styles.tab} ${activeTab === 'bsc' ? styles.active : ''}`}
                                onClick={() => setActiveTab('bsc')}
                            >
                                BSC
                            </button>
                        </div>
                        <button className={styles.closeButton} onClick={() => {
                            setShowSlider(false);
                            setTokendetial([]);
                            setBscTokendetial([]);
                        }}>Close</button>

                        { }
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <Table data={activeTab === 'eth' ? tokendetial : bsctokendetial} />
                    )}
                </div>
                </div >
            )}
        </>
    );
}



const formatTokenBalance = (balance, decimal) => {
 
    balance = Number(balance);
    const adjustedBalance = balance / Math.pow(10, decimal);
    return adjustedBalance.toFixed(2);
};

const Table = ({ data }) => {
    let totalPortfolioValue = 0;

    const rows = data.map((token, index) => {
        const tokenValue = token.base_token_price_usd * formatTokenBalance(token.balance, token.decimals);
        totalPortfolioValue += tokenValue;

        return (
            
            <tr key={index} className={styles.tableRow}>
                <td>{token.name} <span> {formatTokenBalance(token.balance, token.decimals)}</span></td>
                <td className={styles.amount}>${Number(token.base_token_price_usd || 'N/A').toFixed(18)}</td>
                <td>{Number(token.base_token_price_usd * formatTokenBalance(token.balance, token.decimals)).toFixed(2)}</td>
                <td>{token.price_change_percentage.m5}</td>
                <td>{token.price_change_percentage.h1}</td>
                <td>{token.price_change_percentage.h6}</td>
                <td>{token.price_change_percentage.h24}</td>
                <td>{token.market_cap_usd}</td>
                <td>{Number(token.reserve_in_usd || "N/A").toFixed(4)}</td>
                <td>{token.dexId}</td>
            </tr>
        );
    });

    return (
        <div className={styles.tableContainer}>
                        <div className={styles.totalPortfolioValue}>
                Total Portfolio Value: ${totalPortfolioValue.toFixed(2)}
            </div>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Base Token Price (USD)</th>
                        <th>Value (USD)</th>
                        <th>Price Change (5m)</th>
                        <th>Price Change (1h)</th>
                        <th>Price Change (6h)</th>
                        <th>Price Change (24h)</th>
                        <th>Market Cap (USD)</th>
                        <th>Reserve (USD)</th>
                        <th>DEX ID</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>

        </div>
    );
};


export default MultiplesWallet;
