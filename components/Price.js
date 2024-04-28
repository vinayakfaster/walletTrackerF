import React, { useState, useEffect } from "react";
import axios from 'axios';
import ShowPrice from "./showprice";

const Price = ({ balances, bscData }) => {
  const [apiResponse, setApiResponse] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [tokenPriceChange, setTokenPricesChange] = useState([]);

  const [bscapiResponse, setbscApiResponse] = useState(null);
  const [bscshowResult, setbscShowResult] = useState(false);
  const [bsctokenPriceChange, setbscTokenPricesChange] = useState([]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // GeckoTerminal 
        const geckoTerminalUrlEth = `https://api.geckoterminal.com/api/v2/simple/networks/eth/token_price`;
        const ethChunks = chunkArray(balances.map((token) => token.address), 29);
        const ethRequests = ethChunks.map(async (chunk) => {
          const response = await axios.get(`${geckoTerminalUrlEth}/${chunk.join(',')}`);
          return response.data?.data?.attributes?.token_prices || {};
        });
        const geckoTerminalDataEthArray = await Promise.all(ethRequests);
        const geckoTerminalDataEth = Object.assign({}, ...geckoTerminalDataEthArray);

       
        const tokensWithBalanceEth = balances.map((balance) => ({
          ...balance,
          priceUsd: geckoTerminalDataEth[balance.address] || null,
        }));
        setApiResponse(tokensWithBalanceEth);

        const ethKeys = Object.keys(geckoTerminalDataEth);
        const ethPriceChangeResponse = await axios.get("http://localhost:5003/gettokenPriceChange", {
          params: { keys: ethKeys },
        });
        // console.log(ethPriceChangeResponse.data);
        const ethPriceChangeData = ethPriceChangeResponse.data;
        const ethAllPriceChanges = extractPriceChanges(ethPriceChangeData.responseData, ethPriceChangeData.response_data);
        setTokenPricesChange(ethAllPriceChanges);
      } catch (error) {
        console.error("Error fetching token prices for Ethereum network:", error);
      }
    };

    fetchPrices();




    const bscfetchPrices = async () => {
      try {
        // GeckoTerminal for Binance 
        const geckoTerminalUrlBsc = `https://api.geckoterminal.com/api/v2/simple/networks/bsc/token_price`;
        const bscChunks = chunkArray(bscData.map((token) => token.address), 30);
        const bscRequests = bscChunks.map(async (chunk) => {
          const response = await axios.get(`${geckoTerminalUrlBsc}/${chunk.join(',')}`);
          return response.data?.data?.attributes?.token_prices || {};
        });
        const geckoTerminalDataBscArray = await Promise.all(bscRequests);
        const geckoTerminalDataBsc = Object.assign({}, ...geckoTerminalDataBscArray);

   
        const tokensWithBalanceBsc = bscData.map((balance) => ({
          ...balance,
          priceUsd: geckoTerminalDataBsc[balance.address] || null,
        }));
        setbscApiResponse(tokensWithBalanceBsc);


        const bscKeys = Object.keys(geckoTerminalDataBsc);
        const bscPriceChangeResponse = await axios.get("http://localhost:5003/getBscTokenPriceChange", {
          params: { keys: bscKeys },
        });
        // console.log(bscPriceChangeResponse.data);
        const bscPriceChangeData = bscPriceChangeResponse.data;
        const bscAllPriceChanges = extractPriceChanges(bscPriceChangeData.responseData, bscPriceChangeData.response_data);
        setbscTokenPricesChange(bscAllPriceChanges);
      } catch (error) {
        console.error("Error fetching token prices for Binance Smart Chain network:", error);
      }
    };

    bscfetchPrices();

  }, [balances, bscData]);

  useEffect(() => {
    console.log("Token Price Change (Ethereum):", tokenPriceChange);
  }, [tokenPriceChange]);

  useEffect(() => {
    console.log("Token Price Change (Binance Smart Chain):", bsctokenPriceChange);
  }, [bsctokenPriceChange]);

  const chunkArray = (arr, size) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));
  };

  const extractPriceChanges = (responseData, response_data) => {
    const allPriceChanges = [];
  
    if (responseData) {
      responseData.forEach((obj) => {
        const { address,  pairAddress, data } = obj;
        if (data && data.pair) {
          const { priceChange } = data.pair;
          allPriceChanges.push({ address: address, pairAddress: data.pair.baseToken.address, priceChange, pairAddress });
        }
      });
    }
  
    if (response_data) {
      response_data.forEach((obj) => {
        const { pairAddress, address, base_token_price_usd, price_change_percentage } = obj;
        const priceChange = {
          h1: price_change_percentage.h1,
          h6: price_change_percentage.h6,
          h24: price_change_percentage.h24,
          m5: price_change_percentage.m5
        };
        allPriceChanges.push({ address: address, priceChange, pairAddress });
      });
    }
  
    return allPriceChanges;
  };

  useEffect(() => {
  if (apiResponse && tokenPriceChange && bscapiResponse && bsctokenPriceChange) {
    setShowResult(true);
  }
}, [apiResponse, tokenPriceChange, bscapiResponse, bsctokenPriceChange]);

  

  return (
    <>
      <section>
        {showResult && apiResponse && tokenPriceChange && bscapiResponse && bsctokenPriceChange && (
          <ShowPrice
            data={apiResponse}
            tokenPriceChange={tokenPriceChange}
            bscdata={bscapiResponse}
            bsctokenPriceChange={bsctokenPriceChange}
          />
        )}
      </section>
    </>
  );
};

export default Price;


