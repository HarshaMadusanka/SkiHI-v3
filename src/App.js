import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { Header } from "./components/header/Header";
import { Hero } from "./components/hero/Hero";
import { About } from "./components/about/About";
import { Features } from "./components/features/Features";
import { Roadmap } from "./components/roadmap/Roadmap";
import { Utility } from "./components/utility/Utility";
import { Prizes } from "./components/prizes/Prizes";
import { Team } from "./components/team/Team";
import { Faq } from "./components/faq/Faq";
import { Whitepaper } from "./components/whitepaper/Whitepaper";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import { Page2 } from "./components/page2/Page2";
import { Enter } from "./components/enter/Enter";
import { Disclaimer } from "./components/disclaimer/Disclaimer";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [nftCost, setNftCost] = useState(0.09);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    const publicCost = data.publicCost;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(publicCost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    console.log("blockchain: ", blockchain.smartContract);
    console.log(data.totalSupply ? data.totalSupply : typeof data.totalSupply);
    console.log(data.publicCost ? data.publicCost : typeof data.publicCost);
    console.log(
      data.whiteListCost ? data.whiteListCost : typeof data.whiteListCost
    );
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        console.log(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 50) {
      newMintAmount = 50;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <React.Fragment>
                <Hero
                  mint={claimNFTs}
                  decrementMintAmount={decrementMintAmount}
                  incrementMintAmount={incrementMintAmount}
                  getData={getData}
                  config={CONFIG}
                  mintAmount={mintAmount}
                  dispatch={dispatch}
                  connect={connect}
                  data={data}
                  blockchain={blockchain}
                />
                <About />
                <Features />
                <Utility />
                {/* <Enter/> */}
                <Roadmap />
                {/* <Prizes/> */}
                <Team />
                {/* <Whitepaper/>         */}
                <Faq />
                {/* <Disclaimer/> */}
              </React.Fragment>
            }
          />
          {/* <Route path="/freebies" element={<Page2/>}/> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;