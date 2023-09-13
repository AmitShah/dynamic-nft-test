// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/base/ERC721Drop.sol";
import "@thirdweb-dev/contracts/lib/TWStrings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract MyContract is ERC721Drop {
    using TWStrings for uint256;
    constructor(
        address _defaultAdmin,
        string memory _name,
        string memory _symbol,
        address _royaltyRecipient,
        uint128 _royaltyBps,
        address _primarySaleRecipient
    )
        ERC721Drop(
            _defaultAdmin,
            _name,
            _symbol,
            _royaltyRecipient,
            _royaltyBps,
            _primarySaleRecipient
        )
    {}

    //https://ethereum.stackexchange.com/questions/124874/nft-metatdata-not-showing-on-opensea
    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        (uint256 batchId, ) = _getBatchId(_tokenId);
        string memory batchUri = _getBaseURI(_tokenId);

        // if (isEncryptedBatch(batchId)) {
        //     return string(abi.encodePacked(batchUri, "0"));
        // } else {
        //     return string(abi.encodePacked(batchUri, _tokenId.toString()));
        // }
         uint b = block.number;        
        bytes memory dataURI = abi.encodePacked(
            '{',
                '"name": "Chain Battles #', _tokenId.toString(), '",',
                '"description": "Battles on chain",',
                '"animation_url": "https://ipfs.io/ipfs/QmQfEe8BK3fY8XySU9QFG1vmZW3c4oWZ1r6K8iL6Fs6LMc/?id=',_tokenId.toString(),'&block=',b.toString(),'"',
            '}'
        );
        
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }
    

}