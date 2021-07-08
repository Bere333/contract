// SPDX-License-Identifier: MIT
pragma solidity ^0.6.9;

interface ITreeAuction {
    function isTreeAuction() external view returns (bool);

    function setGenesisTreeAddress(address _address) external;

    function setTreasuryAddress(address _address) external;

    function createAuction(
        uint256 _treeId,
        uint64 _startDate,
        uint64 _endDate,
        uint256 _intialPrice,
        uint256 _bidInterval
    ) external;

    function bid(uint256 _auctionId) external payable;

    function manualWithdraw() external returns (bool);

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
