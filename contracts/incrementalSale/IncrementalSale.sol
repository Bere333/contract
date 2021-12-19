// // SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.6;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "../access/IAccessRestriction.sol";
import "../tree/ITreeFactory.sol";
import "../treasury/IWethFund.sol";
import "../treasury/IAllocation.sol";
import "../treasury/IPlanterFund.sol";
import "../tree/IAttribute.sol";
import "../regularSale/IRegularSale.sol";
import "./IIncrementalSale.sol";

contract IncrementalSale is Initializable, IIncrementalSale {
    struct IncrementalSaleData {
        uint256 startTreeId;
        uint256 endTreeId;
        uint256 initialPrice;
        uint64 increments;
        uint64 priceJump;
    }

    struct TotalBalances {
        uint256 planter;
        uint256 ambassador;
        uint256 research;
        uint256 localDevelopment;
        uint256 insurance;
        uint256 treasury;
        uint256 reserve1;
        uint256 reserve2;
    }

    /** NOTE {isIncrementalSale} set inside the initialize to {true} */
    bool public override isIncrementalSale;
    /** NOTE last tree id sold in incremetal sale */
    uint256 public override lastSold;

    /** NOTE {incrementalSaleData} store startTreeId, endTreeId, initialPrice,
     *  increments, priceJump values
     */
    IncrementalSaleData public override incrementalSaleData;

    IAccessRestriction public accessRestriction;
    ITreeFactory public treeFactory;
    IWethFund public wethFund;
    IAllocation public allocation;
    IAttribute public attribute;
    IPlanterFund public planterFundContract;
    IRegularSale public regularSale;
    IERC20Upgradeable public wethToken;

    /** NOTE modifier to check msg.sender has admin role */
    modifier onlyAdmin() {
        accessRestriction.ifAdmin(msg.sender);
        _;
    }

    /** NOTE modifier to check msg.sender has data manager role */
    modifier onlyDataManager() {
        accessRestriction.ifDataManager(msg.sender);
        _;
    }

    /** NOTE modifier for check if function is not paused */
    modifier ifNotPaused() {
        accessRestriction.ifNotPaused();
        _;
    }

    /** NOTE modifier for check valid address */
    modifier validAddress(address _address) {
        require(_address != address(0), "invalid address");
        _;
    }

    /**
     * @dev initialize AccessRestriction contract and set true for isIncrementalSale
     * @param _accessRestrictionAddress set to the address of AccessRestriction contract
     */
    function initialize(address _accessRestrictionAddress)
        external
        override
        initializer
    {
        IAccessRestriction candidateContract = IAccessRestriction(
            _accessRestrictionAddress
        );
        require(candidateContract.isAccessRestriction());
        isIncrementalSale = true;
        accessRestriction = candidateContract;
    }

    /**
     * @dev admin set PlanterFund contract address
     * @param _address set to the address of PlanterFund contract
     */

    function setPlanterFundAddress(address _address)
        external
        override
        onlyAdmin
    {
        IPlanterFund candidateContract = IPlanterFund(_address);
        require(candidateContract.isPlanterFund());
        planterFundContract = candidateContract;
    }

    /**
     * @dev admin set RegularSale contract address
     * @param _address set to the address of RegularSale contract
     */
    function setRegularSaleAddress(address _address)
        external
        override
        onlyAdmin
    {
        IRegularSale candidateContract = IRegularSale(_address);
        require(candidateContract.isRegularSale());
        regularSale = candidateContract;
    }

    /** @dev admin set TreeFactory contract address
     * @param _address set to the address of TreeFactory contract
     */
    function setTreeFactoryAddress(address _address)
        external
        override
        onlyAdmin
    {
        ITreeFactory candidateContract = ITreeFactory(_address);
        require(candidateContract.isTreeFactory());
        treeFactory = candidateContract;
    }

    /** @dev admin set WethFund contract address
     * @param _address set to the address of WethFund contract
     */
    function setWethFundAddress(address _address) external override onlyAdmin {
        IWethFund candidateContract = IWethFund(_address);

        require(candidateContract.isWethFund());

        wethFund = candidateContract;
    }

    /** @dev admin set wethToken contract address
     * @param _address set to the address of WethToken contract
     */
    function setWethTokenAddress(address _address)
        external
        override
        onlyAdmin
        validAddress(_address)
    {
        IERC20Upgradeable candidateContract = IERC20Upgradeable(_address);
        wethToken = candidateContract;
    }

    /**
     * @dev admin set Allocation contract address
     * @param _address set to the address of Allocation contract
     */
    function setAllocationAddress(address _address)
        external
        override
        onlyAdmin
    {
        IAllocation candidateContract = IAllocation(_address);
        require(candidateContract.isAllocation());
        allocation = candidateContract;
    }

    /**
     * @dev admin set Attribute contract address
     * @param _address set to the address of Attribute contract
     */

    function setAttributesAddress(address _address)
        external
        override
        onlyAdmin
    {
        IAttribute candidateContract = IAttribute(_address);
        require(candidateContract.isAttribute());
        attribute = candidateContract;
    }

    /**
     * @dev admin set a tree range from {startTreeId} to {startTreeId + treeCount}
     * for incremental sales
     * @param _startTreeId starting treeId
     * @param _initialPrice initialPrice of trees
     * @param _treeCount number of tree in incremental sell
     * @param _increments number of trees after which the price increases
     * @param _priceJump price jump
     */
    function createIncrementalSale(
        uint256 _startTreeId,
        uint256 _initialPrice,
        uint64 _treeCount,
        uint64 _increments,
        uint64 _priceJump
    ) external override ifNotPaused onlyDataManager {
        require(_treeCount > 0 && _treeCount < 501, "invalid treeCount");

        require(_startTreeId > 100, "trees are under Auction");

        require(_increments > 0, "incremental period should be positive");

        IncrementalSaleData storage incSaleData = incrementalSaleData;

        require(
            incSaleData.endTreeId == lastSold + 1 ||
                incSaleData.increments == 0,
            "can't create new IncrementalSale"
        );

        require(
            allocation.allocationExists(_startTreeId),
            "equivalant fund Model not exists"
        );

        require(
            treeFactory.manageSaleTypeBatch(
                _startTreeId,
                _startTreeId + _treeCount,
                2
            ),
            "trees are not available for sell"
        );

        incSaleData.startTreeId = _startTreeId;
        incSaleData.endTreeId = _startTreeId + _treeCount;
        incSaleData.initialPrice = _initialPrice;
        incSaleData.increments = _increments;
        incSaleData.priceJump = _priceJump;

        lastSold = _startTreeId - 1;

        emit IncrementalSaleUpdated();
    }

    /**
     * @dev remove some trees from incremental sale and reset saleType of that trees
     * NOTE {_count} trees removed from first of the incremetalSale tree range
     * @param _count is number of trees to remove
     */
    function removeIncrementalSale(uint256 _count)
        external
        override
        ifNotPaused
        onlyDataManager
    {
        //TODO:add limited count check
        require(_count > 0 && _count < 501, "invalid count");
        IncrementalSaleData storage incSaleData = incrementalSaleData;

        uint256 newStartTreeId = incSaleData.startTreeId + _count;

        require(
            incSaleData.increments > 0 &&
                newStartTreeId <= incSaleData.endTreeId,
            "IncrementalSale not exist or count must be lt endTree"
        );

        treeFactory.resetSaleTypeBatch(
            incSaleData.startTreeId,
            newStartTreeId,
            2
        );

        incSaleData.startTreeId = newStartTreeId;
        lastSold = newStartTreeId - 1;

        emit IncrementalSaleUpdated();
    }

    /**
     * @dev admin update endTreeId of incrementalSale tree range
     * @param _treeCount number of trees added at the end of the incrementalSale
     * tree range
     */
    function updateEndTreeId(uint256 _treeCount)
        external
        override
        ifNotPaused
        onlyDataManager
    {
        //TODO:add treeCount limit
        require(_treeCount > 0 && _treeCount < 501, "invalid count");

        IncrementalSaleData storage incSaleData = incrementalSaleData;
        //TODO: change require error
        require(incSaleData.increments > 0, "incremental sale should be exist");
        require(
            treeFactory.manageSaleTypeBatch(
                incSaleData.endTreeId,
                incSaleData.endTreeId + _treeCount,
                2
            ),
            "trees are not available for sell"
        );
        incSaleData.endTreeId = incSaleData.endTreeId + _treeCount;

        emit IncrementalSaleUpdated();
    }

    /**
     * @dev fund {_count} tree
     * NOTE if {_recipient} address exist tree minted to the {_recipient}
     * and mint to the function caller otherwise
     * NOTE function caller pay for the price of trees
     * NOTE total price calculated based on the incrementalSaleData
     * NOTE based on the allocation data for tree totalBalances and PlanterFund
     * contract balance updated
     * NOTE generate unique symbols for trees
     * @param _count number of trees to fund
     * @param _referrer address of referrer
     * @param _recipient address of recipient
     */
    function fundTree(
        uint256 _count,
        address _referrer,
        address _recipient,
        uint256 _minDaiOut
    ) external override ifNotPaused {
        require(_count < 101 && _count > 0, "Count must be lt 100");

        IncrementalSaleData storage incSaleData = incrementalSaleData;

        require(
            lastSold + _count < incSaleData.endTreeId,
            "Not enough tree in incremental sell"
        );

        uint256 tempLastSold = lastSold + 1;

        //calc total price

        uint256 totalPrice = _calcTotalPrice(tempLastSold, _count);

        //transfer totalPrice to wethFund
        require(
            wethToken.balanceOf(msg.sender) >= totalPrice,
            "low price paid"
        );

        bool success = wethToken.transferFrom(
            msg.sender,
            address(wethFund),
            totalPrice
        );

        require(success, "unsuccessful transfer");

        address recipient = _recipient == address(0) ? msg.sender : _recipient;

        _setAllocation(
            tempLastSold,
            _count,
            msg.sender,
            recipient,
            _referrer,
            totalPrice,
            _minDaiOut
        );

        lastSold = tempLastSold + _count - 1;

        emit TreeFunded(msg.sender, recipient, _referrer, tempLastSold, _count);
    }

    /** @dev admin update incrementalSaleData
     * @param _initialPrice initialPrice of trees
     * @param _increments number of trees after which the price increases
     * @param _priceJump price jump
     */
    function updateIncrementalSaleData(
        uint256 _initialPrice,
        uint64 _increments,
        uint64 _priceJump
    ) external override ifNotPaused onlyDataManager {
        require(_increments > 0, "incremental period should be positive");

        IncrementalSaleData storage incSaleData = incrementalSaleData;
        //TODO:add require
        require(incSaleData.increments > 0, "incremental sale should be exist");

        incSaleData.initialPrice = _initialPrice;
        incSaleData.increments = _increments;
        incSaleData.priceJump = _priceJump;

        emit IncrementalSaleDataUpdated();
    }

    /**
     * @dev calculate amount of each part in totalBalances based on the tree allocation
     * data and total price of trees and update them in totalBlances.
     * NOTE trees minted to the recipient
     * @param _tempLastSold last tree id sold in incremetal sale
     * @param _count number of trees to fund
     * @param _funder address of funder
     * @param _recipient address of recipient
     * @param _referrer address of referrer
     * @param _totalPrice total price of trees
     */
    function _setAllocation(
        uint256 _tempLastSold,
        uint256 _count,
        address _funder,
        address _recipient,
        address _referrer,
        uint256 _totalPrice,
        uint256 _minDaiOut
    ) private {
        TotalBalances memory totalBalances = _mintFundedTree(
            _tempLastSold,
            _count,
            _recipient
        );

        uint256 daiAmount = wethFund.fundTreeBatch(
            totalBalances.planter,
            totalBalances.ambassador,
            totalBalances.research,
            totalBalances.localDevelopment,
            totalBalances.insurance,
            totalBalances.treasury,
            totalBalances.reserve1,
            totalBalances.reserve2,
            _minDaiOut
        );

        _setPlanterAllocation(
            _tempLastSold,
            _count,
            daiAmount,
            (daiAmount * totalBalances.planter) /
                (totalBalances.planter + totalBalances.ambassador), //planterDaiAmount
            (daiAmount * totalBalances.ambassador) /
                (totalBalances.planter + totalBalances.ambassador), //ambassadorDaiAmount
            _totalPrice,
            _funder
        );

        if (_referrer != address(0)) {
            regularSale.updateReferrerClaimableTreesWeth(_referrer, _count);
        }
    }

    /**
     * @dev update projected earning in PlanterFund and create symbol for tree
     * @param _tempLastSold last tree id sold in incremetal sale
     * @param _count number of trees to fund
     * @param _daiAmount total dai amount
     * @param _planterDaiAmount total planter dai share
     * @param _ambassadorDaiAmount total ambassador dai share
     * @param _totalPrice total price
     * @param _funder address of funder
     */
    function _setPlanterAllocation(
        uint256 _tempLastSold,
        uint256 _count,
        uint256 _daiAmount,
        uint256 _planterDaiAmount,
        uint256 _ambassadorDaiAmount,
        uint256 _totalPrice,
        address _funder
    ) private {
        IncrementalSaleData storage incSaleData = incrementalSaleData;

        for (uint256 i = 0; i < _count; i++) {
            uint256 treePrice = incSaleData.initialPrice +
                (((_tempLastSold - incSaleData.startTreeId) /
                    incSaleData.increments) *
                    incSaleData.initialPrice *
                    incSaleData.priceJump) /
                10000;

            uint256 planterDaiAmount = (_planterDaiAmount * treePrice) /
                _totalPrice;

            uint256 ambassadorDaiAmount = (_ambassadorDaiAmount * treePrice) /
                _totalPrice;

            planterFundContract.updateProjectedEarnings(
                _tempLastSold,
                planterDaiAmount,
                ambassadorDaiAmount
            );

            bytes32 randTree = keccak256(
                abi.encodePacked(
                    planterDaiAmount,
                    ambassadorDaiAmount,
                    treePrice,
                    _daiAmount
                )
            );

            _createSymbol(_tempLastSold, randTree, _funder);

            _tempLastSold += 1;
        }
    }

    function _calcTotalPrice(uint256 _tempLastSold, uint256 _count)
        private
        view
        returns (uint256)
    {
        IncrementalSaleData storage incSaleData = incrementalSaleData;

        uint256 y = (_tempLastSold - incSaleData.startTreeId) /
            incSaleData.increments;

        uint256 tempLastSoldPrice = incSaleData.initialPrice +
            (y * incSaleData.initialPrice * incSaleData.priceJump) /
            10000;

        uint256 totalPrice = _count * tempLastSoldPrice;

        int256 extra = int256(_count) -
            int256(
                (y + 1) *
                    incSaleData.increments +
                    incSaleData.startTreeId -
                    _tempLastSold
            );

        while (extra > 0) {
            totalPrice +=
                (uint256(extra) *
                    incSaleData.initialPrice *
                    incSaleData.priceJump) /
                10000;
            extra -= int64(incSaleData.increments);
        }

        return totalPrice;
    }

    function _mintFundedTree(
        uint256 _tempLastSold,
        uint256 _count,
        address _recipient
    ) private returns (TotalBalances memory) {
        IncrementalSaleData storage incSaleData = incrementalSaleData;

        TotalBalances memory totalBalances;

        uint256 tempLastSold = _tempLastSold;
        address recipient = _recipient;

        for (uint256 i = 0; i < _count; i++) {
            uint256 treePrice = incSaleData.initialPrice +
                (((tempLastSold - incSaleData.startTreeId) /
                    incSaleData.increments) *
                    incSaleData.initialPrice *
                    incSaleData.priceJump) /
                10000;

            (
                uint16 planterShare,
                uint16 ambassadorShare,
                uint16 researchShare,
                uint16 localDevelopmentShare,
                uint16 insuranceShare,
                uint16 treasuryShare,
                uint16 reserve1Share,
                uint16 reserve2Share
            ) = allocation.findAllocationData(tempLastSold);

            totalBalances.planter += (treePrice * planterShare) / 10000;
            totalBalances.ambassador += (treePrice * ambassadorShare) / 10000;
            totalBalances.research += (treePrice * researchShare) / 10000;
            totalBalances.localDevelopment +=
                (treePrice * localDevelopmentShare) /
                10000;
            totalBalances.insurance += (treePrice * insuranceShare) / 10000;
            totalBalances.treasury += (treePrice * treasuryShare) / 10000;
            totalBalances.reserve1 += (treePrice * reserve1Share) / 10000;
            totalBalances.reserve2 += (treePrice * reserve2Share) / 10000;

            treeFactory.mintAssignedTree(tempLastSold, recipient);
            tempLastSold += 1;
        }

        return (totalBalances);
    }

    function _createSymbol(
        uint256 _tempLastSold,
        bytes32 _randTree,
        address _funder
    ) private {
        uint8 funderRank = attribute.getFunderRank(_funder);

        bool symbolCreated = attribute.createSymbol(
            _tempLastSold,
            _randTree,
            _funder,
            funderRank,
            16
        );

        require(symbolCreated, "symbol not generated");
    }
}
