import React, { useEffect, useState } from "react";
import "./App.css";
import twitterLogo from "./assets/twitter-logo.svg";

// library used to communiate with the smart contract
import { ethers } from "ethers";

// The abi file which is one of the things needed to communicate with the smart contract
import cityNameNFT from "./utils/CityNameNFT.json";

// Constants
const TWITTER_HANDLE = "ViviPlasenciaC";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK =
  "https://testnets.opensea.io/collection/citynft-nxmx0jgjmj";

const CONTRACT_ADDRESS = "0x0cd7A00087253211dED313A8bE52e6911a5918da";

function App() {
  // A state variable to store the user's public wallet
  const [currentAccount, setCurrentAccount] = useState("");

  // A state variable to store the loader status when an NFT is minted
  const [loaderState, setLoaderState] = useState(false);

  // A state vatiable to store the address that will receive the NFT
  let [userAddressTo, setUserAddressTo] = useState("");

  let [totalNFTs, setTotalNFTs] = useState(0);
  let [totalNFTsMinted, setTotalNFTsMinted] = useState(0);

  let [merkleTreeLeaves, setMerkleTreeLeaves] = useState([]);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    // Check if we're authorized to access the user's wallet
    const accounts = await ethereum.request({ method: "eth_accounts" });

    // User can have multiple authorized accounts, we grab the first one if its there!
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      // Setup listener! This is for the case where a user comes to the site
      // and already had their wallet connected + authorized.
      setupEventListener();
      getTotalAndMintedNFTs();
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      }

      // Method to request access to account
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      // This should print out public address once we authorize Metamask
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      // Setup listener! This is for the case where a user comes to the site
      // and have not had the wallet connected.
      setupEventListener();
      getTotalAndMintedNFTs();
    } catch (error) {
      console.log(error);
    }
  };

  // Setup the listener.
  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          cityNameNFT.abi,
          signer
        );

        // This will "capture" the event when the contract throws it.
        connectedContract.on("NewCityNameNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          setTotalNFTsMinted(tokenId.toNumber() + 1);
          alert(
            `Hey there! Your NFT was minted and sent to the provided wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTotalAndMintedNFTs = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        console.log("Getting Total and Minted NFTs!");

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          cityNameNFT.abi,
          signer
        );

        let _totalNFTs = await connectedContract.getTotalNFTs();
        setTotalNFTs(_totalNFTs.toNumber());
        let _totalNFtsMinted = await connectedContract.getTotalNFTsMinted();
        setTotalNFTsMinted(_totalNFtsMinted.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputAddressChange = (e) => {
    setUserAddressTo(e.target.value);
  };

  // Method to mint the NFT
  const askContractToMintNft = async () => {
    try {
      // Check user address to send the NFT is not empty
      if (userAddressTo === "") {
        alert("The user address to cannot be empty");
        return;
      }

      // Check the user address to send the NFT is a correct address
      if (!ethers.utils.isAddress(userAddressTo)) {
        alert("The user address to is not correct");
        return;
      }

      const { ethereum } = window;

      if (ethereum) {
        setLoaderState(true);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          cityNameNFT.abi,
          signer
        );

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeACityNFT(userAddressTo);

        console.log("Mining...please wait.");
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
        setLoaderState(false);
        setUserAddressTo("");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
      alert(error.error.message);
      setUserAddressTo("");
      setLoaderState(false);
    }
  };

  const getMerkleTreeLeaves = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        console.log("Getting Merkle Tree Leaves!");

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          cityNameNFT.abi,
          signer
        );

        const _merkleTreeLeaves = await connectedContract.getMerkleTreeLeaves();
        setMerkleTreeLeaves(_merkleTreeLeaves);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="text-white font-semibold px-5 py-3 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 rounded-md"
    >
      Connect Wallet
    </button>
  );

  // This runs the checkIfWalletIsConnected function when the page loads
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="flex flex-col min-h-screen px-2 bg-gray-900">
      <header className="flex place-content-center mt-10">
        <h1 className="text-5xl text-center text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-blue-500 font-extrabold">
          My City Names NFT Collection
        </h1>
      </header>
      <div className="mb-auto">
        <div className="flex place-content-center mt-5">
          <p className="text-2xl text-white text-center">
            Mint random City Names!
          </p>
        </div>
        <div className="flex  items-center justify-center">
          <div className="grid grid-cols-1 place-items-center gap-10 my-10">
            <a
              href={OPENSEA_LINK}
              target="_blank"
              rel="noreferrer noopener nofollow"
              className="text-gray-100 underline hover:no-underline"
            >
              🌊 View Collection on OpenSea
            </a>
            {currentAccount !== "" && (
              <div className="text-slate-100">
                {totalNFTsMinted} / {totalNFTs} NFTs minted so far
              </div>
            )}
            {currentAccount === "" ? (
              renderNotConnectedContainer()
            ) : (
              <div className="grid place-items-center gap-5">
                <div className="grid grid-cols-1 gap-2">
                  <label htmlFor="address" className="text-gray-100">
                    User Address to:
                  </label>
                  <input
                    autoComplete="off"
                    value={userAddressTo}
                    placeholder="0x..."
                    onChange={handleInputAddressChange}
                    type="text"
                    id="address"
                    className="rounded-md p-3 bg-transparent border-2 border-violet-500 focus:outline-none focus:border-blue-500 text-gray-100"
                  />
                </div>
                <button
                  onClick={askContractToMintNft}
                  className="text-white font-semibold px-5 py-3 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 rounded-md"
                  disabled={loaderState}
                  style={loaderState ? { cursor: "not-allowed" } : {}}
                >
                  <div className="flex place-content-center space-x-2">
                    {loaderState && <div id="loader"></div>}
                    <span>Mint NFT</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
        {currentAccount !== "" && (
          <div className="grid grid-cols-1 place-items-center gap-5">
            <button
              onClick={getMerkleTreeLeaves}
              className="text-white font-semibold px-5 py-3 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 rounded-md"
            >
              Get Merkle Tree Leaves
            </button>
            <div className="grid grid-cols-1 place-items-center text-slate-100 gap-2">
              {merkleTreeLeaves.map((leaf, index) => {
                return (
                  <div key={index}>
                    <span>{leaf}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <footer className="my-10">
        <a
          className="flex items-center justify-center text-white underline hover:no-underline"
          href={TWITTER_LINK}
          target="_blank"
          rel="noreferrer noopener nofollow"
        >
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <span>{`built by @${TWITTER_HANDLE}`}</span>
        </a>
      </footer>
    </div>
  );
}

export default App;
