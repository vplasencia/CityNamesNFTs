const main = async () => {
  const nftContractFactory = await hre.ethers.getContractFactory("CityNameNFT");
  const nftContract = await nftContractFactory.deploy(8);
  await nftContract.deployed();
  console.log("Contract deployed to:", nftContract.address);
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
