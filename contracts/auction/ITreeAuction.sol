// SPDX-License-Identifier: MIT
pragma solidity ^0.6.9;

/** @title TreeAuction interface */
interface ITreeAuction {
    /**
     * @dev return if TreeAuction contract initialize
     * @return true in case of TreeAuction contract have been initialized
     */
    function isTreeAuction() external view returns (bool);

    /** @dev set {_address to GenesisTree contract address} */
    function setGenesisTreeAddress(address _address) external;

    /** @dev set {_address to Treasury contract address} */
    function setTreasuryAddress(address _address) external;

    /** @dev create an auction for {_treeId} with strating date of {_startDate} and ending date of
     * {_endDate} and initialPrice of {_initialPrice} and bidInterval of {_bidInterval}
     * NOTE its necessary that a fundDestributionModel has been assigned to {_treeId}
     * NOTE after create an auction for a tree provideStatus set to 1
     * NOTE for creating an auction for a tree the provideStatus of tree must be 0
     */
    function createAuction(
        uint256 _treeId,
        uint64 _startDate,
        uint64 _endDate,
        uint256 _intialPrice,
        uint256 _bidInterval
    ) external;

    /** @dev bid to auctions {_auctionId}  by user in a time beetwen start time and end time of auction
     * and return the old bidder's amount to account
     * NOTE its require to send at least {higestBid + bidInterval } value.
     * NOTE check if less than 10 minutes left to end of auction add 10 minutes to the end date of auction
     * emit a {HighestBidIncreased} event
     */
    function bid(uint256 _auctionId) external payable;

    /** @dev */
    function manualWithdraw() external returns (bool);

    /** @dev */
    function endAuction(uint256 _auctionId) external;

    event HighestBidIncreased(
        uint256 auctionId,
        uint256 treeId,
        address bidder,
        uint256 amount
    );
    event AuctionEnded(
        uint256 auctionId,
        uint256 treeId,
        address winner,
        uint256 amount
    );
    event AuctionEndTimeIncreased(
        uint256 auctionId,
        uint256 newAuctionEndTime,
        address bidder
    );
}
