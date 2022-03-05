const main = async () => {
  const nftContractFactory = await hre.ethers.getContractFactory("CityNameNFT");
  const nftContract = await nftContractFactory.deploy();
  await nftContract.deployed();
  console.log("Contract deployed to:", nftContract.address);

  // Call the function.
  let txn = await nftContract.makeACityNFT(
    "0x6A6a704f9f9C995105776E00a9DE22fBc4c4c3d3"
  );
  // Wait for it to be mined.
  await txn.wait();
  console.log("Minted NFT #1");
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
