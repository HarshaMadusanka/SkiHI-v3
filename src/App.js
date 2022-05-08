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

import whiteList from "./utils/Whitelist";

import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
// const merkleRoot =  (address) => {

// };

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

function App() {
  // const [error, setError]= useState("You are not in whiteList")
  const [pending, setPending] = useState(false);
  const [url, setUrl] = useState(false);
  const [isError, setIsError] = useState(false);
  const [merkleProof, setMerkleProof] = useState([]);
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
    setPending(true);
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
        toast.error("Sorry, something went wrong please try again later.", {
          position: "top-right",
          autoClose: 6000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        setUrl(false);
        setPending(false);
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        toast.success(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it`,
          {
            position: "top-right",
            autoClose: 6000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          }
        );
        setUrl(true);
        setPending(false);
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

  const whiteListMint = async () => {
    setPending(true);
    const whiteListCost = data.whiteListCost;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(whiteListCost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    toast.success(`Minting your ${CONFIG.NFT_NAME}...`, {
      position: "top-right",
      autoClose: 6000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
    setClaimingNft(true);
    blockchain.smartContract.methods
      .whitelistMint(
        // [
        //   "0x15ae9b8298ce04c043cbb1125cd0fb0988dce521beb591020e3f998145959d08",
        //   "0xb8f699d69df2e33083829d668c2b6786e8ace1933039a31f88223f40f7b16724",
        //   "0xe6d6df4e284e15001e268f1af32139d46bc2691ef6af17dcf09acc7f47048cfa",
        // ],
        merkleProof,
        mintAmount
      )
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        toast.error("Sorry, something went wrong please try again later.", {
          position: "top-right",
          autoClose: 6000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        setUrl(false);
        setFeedback("Sorry, something went wrong please try again later.");
        setPending(false);
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        toast.success(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it`,
          {
            position: "top-right",
            autoClose: 6000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          }
        );
        setUrl(true);
        setPending(false);
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

  useEffect(() => {
    console.log(blockchain.account);
    //  const mp=  await merkleRoot(blockchain.account)
    const error = "You are not in whiteList";
    // console.log(address);
    const addresses = [
      "0xd95aa96c0e04f1a37f41f3f9ce7c00038dce7fef",
      // "0xD95aa96C0e04F1a37F41F3f9CE7C00038Dce7fef"
      "0xeD2C856c41899E89fa9Cdefc8c4Ce3dF85671D23",
      "0xBaeAe29E7457F1E69698449a3ff983cAd28A3a75",
      "0x47ee7910969B31BF02d8217b042233B8F1b5423D",
      "0x2D3b5984c56f2dd328f9e4d467289000a4d163DE",
    ];
    const leaves = addresses.map((x) => keccak256(x));
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const buf2hex = (x) => "0x" + x.toString("hex");
    console.log("Root===>", buf2hex(tree.getRoot()));
    const account = addresses.includes(blockchain.account);
    console.log(account);
    if (data.whiteListSale == true) {
      if (account) {
        const leaf = keccak256(blockchain.account); // address from wallet using walletconnect/metamask
        const proof = tree.getProof(leaf).map((x) => buf2hex(x.data));
        const proofArray = proof.map((el) => el);
        setMerkleProof(proofArray);
        console.log(typeof proofArray, proofArray);
        setIsError(false);
        return console.log("proof===>", proof);
      } else {
        setMerkleProof([]);
        return setIsError(true);
      }
    }
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
                  pending={pending}
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
                  whitelistMint={whiteListMint}
                  error={isError}
                  url={url}
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
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
}

export default App;
