//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";

// Import the OpenZeppeling Contracts
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

import "./MerkleTree.sol";

// Inherit the OpenZeppeling contract imported so we can have access to the inherited contract methods
contract CityNameNFT is ERC721URIStorage {
    // Convert uint256 to string
    using Strings for uint256;
    // Taken from OpenZeppelin to keep track of tokenIds.
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public totalNFTsMinted;

    uint256 public totalNFTs;

    // Part one of the svg concatenation
    string svgPartOne =
        '<svg width="350" height="350" viewBox="0 0 350 350" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="a" x1="0" y1="0" x2="270" y2="270" gradientUnits="userSpaceOnUse"><stop stop-color="#8b5cf6"/><stop offset="1" stop-color="#3b82f6" stop-opacity=".99"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#a)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" style="fill:#fff;font-family:serif;font-size:30px">';

    // Final part of the svg concatenation
    string svgPartTwo = "</text></svg>";

    // Names of some cities that one of them will be randomly chosen to inlcude in the NFT
    string[] cities = [
        "Havana",
        "New York",
        "Tokyo",
        "Delhi",
        "Paris",
        "Madrid"
    ];

    MerkleTree public merkleTreeAddress;

    // Event to emit when an NFT is minted. This is to send information to the frontend application
    event NewCityNameNFTMinted(address sender, uint256 tokenId);

    // Pass the name of the NFT token and its symbol
    constructor(uint256 _totalNFts) ERC721("CityNFT", "CITY") {
        console.log("City NFT contract");
        totalNFTs = _totalNFts;
        merkleTreeAddress = new MerkleTree(_totalNFts);
    }

    // Function that generate a random
    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    // Function to pick a random city from the cities array
    function pickRandomCity(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        // I seed the random generator
        uint256 rand = random(
            string(abi.encodePacked("CITY", Strings.toString(tokenId)))
        );
        // Squash the # between 0 and the length of the array to avoid going out of bounds.
        rand = rand % cities.length;
        return cities[rand];
    }

    // Function to build and mint the NFT
    function makeACityNFT(address personAddress) public {
        require(totalNFTsMinted < totalNFTs, "No more NFTs to mint");
        uint256 newItemId = _tokenIds.current();

        string memory cityName = pickRandomCity(newItemId);

        // The NFT svg
        string memory finalSvg = string(
            abi.encodePacked(svgPartOne, cityName, svgPartTwo)
        );
        console.log("\n--------------------");
        console.log(finalSvg);
        console.log("--------------------\n");

        // Get all the JSON metadata in place and base64 encode it.
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        // Set the title of the NFT as the generated word.
                        cityName,
                        '", "description": "A collection of city names.", "image": "data:image/svg+xml;base64,',
                        // Add data:image/svg+xml;base64 and then append the base64 encode the svg.
                        Base64.encode(bytes(finalSvg)),
                        '"}'
                    )
                )
            )
        );

        // Just like before, prepend data:application/json;base64, to the data.
        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        console.log("\n--------------------");
        console.log(
            string(
                abi.encodePacked(
                    "https://nftpreview.0xdev.codes/?code=",
                    finalTokenUri
                )
            )
        );
        console.log("--------------------\n");

        // _safeMint(msg.sender, newItemId);
        _safeMint(personAddress, newItemId);

        // Update the URI!!!
        _setTokenURI(newItemId, finalTokenUri);

        string memory info = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"sender": "',
                        msg.sender,
                        '", "receiver address": "',
                        personAddress,
                        '", "tokenId": "',
                        newItemId.toString(),
                        '", "tokenURI": "',
                        finalTokenUri,
                        '"}'
                    )
                )
            )
        );

        merkleTreeAddress.addData(info);

        // Increment the counter for when the next NFT is minted.
        _tokenIds.increment();
        totalNFTsMinted++;
        console.log(
            "An NFT w/ ID %s has been minted to %s",
            newItemId,
            personAddress
        );

        emit NewCityNameNFTMinted(msg.sender, newItemId);
    }

    // Get the Merkle Tree leaves
    function getMerkleTreeLeaves() public view returns (bytes32[] memory) {
        return merkleTreeAddress.getLeaves();
    }

    function getTotalNFTsMinted() public view returns (uint256) {
        return totalNFTsMinted;
    }

    function getTotalNFTs() public view returns (uint256) {
        return totalNFTs;
    }
}
