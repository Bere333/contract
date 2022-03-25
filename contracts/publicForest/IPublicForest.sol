// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;

/** @title PublicForest interface */
interface IPublicForest {
    /**
     * @dev set ipfsHash and factory address of a forest
     * @param _ipfsHash ipfs hash
     * @param _factory address of factory
     */
    function initialize(string memory _ipfsHash, address _factory) external;

    /**
     * @dev set new factory address
     * @param _factory new factory address
     */
    function updateFactoryAddress(address _factory) external;

    /**
     * @dev set new ipfsHash
     * @param _ipfsHash new ipfsHash
     */
    function updateIpfsHash(string memory _ipfsHash) external;

    /**
     * @dev swap given token to base token
     * @param _path path to swap token
     * @param _dexRouter address of dexRouter
     * @param _minBaseTokenOut minimum expected base token
     */
    function swapTokenToBaseToken(
        address[] calldata _path,
        address _dexRouter,
        uint256 _minBaseTokenOut
    ) external;

    /**
     * @dev swap wmatic to base token
     * @param _path path to swap token
     * @param _dexRouter address of dexRouter
     * @param _minBaseTokenOut minimum expected base token
     */
    function swapMainCoinToBaseToken(
        address[] calldata _path,
        address _dexRouter,
        uint256 _minBaseTokenOut
    ) external;

    /**
     * @dev calculate tree amount to fund and fund tree
     * @param _baseTokenAddress address of base token
     * @param _treejerContract address of RegularSale contract to fund tree
     */
    function fundTrees(address _baseTokenAddress, address _treejerContract)
        external;

    /**
     * @dev give approve to given address {_to} for an erc721 token {_token} with id
     * of {_tokenId}
     * @param _token address of token
     * @param _to address to give approve for
     * @param _tokenId id of token
     */
    function externalTokenERC721Approve(
        address _token,
        address _to,
        uint256 _tokenId
    ) external;

    /**
     * @dev give approve for or revoke approve from given address {_to} for an erc1155
     * token {_token}
     * @param _token address of token
     * @param _to address to give approve for or revoke approve from
     * @param _approved true in case of giving approve and false in revoking approve
     */
    function externalTokenERC1155Approve(
        address _token,
        address _to,
        bool _approved
    ) external;

    /** @return ipfsHash of a forest */
    function ipfsHash() external view returns (string memory);

    /** @return true factory address of a forest */
    function factory() external view returns (address);
}
