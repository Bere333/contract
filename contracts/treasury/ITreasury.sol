// SPDX-License-Identifier: MIT

pragma solidity >=0.7.6;

/** @title Treasury interfce */
interface ITreasury {
    /**
     * @dev return if Treasury contract initialize
     * @return true in case of Treasury contract have been initialized
     */
    function isTreasury() external view returns (bool);

    function maxAssignedIndex() external view returns (bool);

    /**
     * @dev return totalFunds struct data containing {plnaterFund} {referralFund}
     * {treeResearch} {localDevelop} {rescueFund} {treejerDevelop} {reserveFund1}
     * {reserveFund2}
     */
    function totalFunds()
        external
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256
        );

    function treeResearchAddress() external view returns (address);

    function localDevelopAddress() external view returns (address);

    function rescueFundAddress() external view returns (address);

    function treejerDevelopAddress() external view returns (address);

    function reserveFundAddress1() external view returns (address);

    function reserveFundAddress2() external view returns (address);

    /**
     * @dev returns assignModels data containing {stratingTreeId} and {distributionModelId}
     * in index {_index}
     */
    function assignModels(uint256 _index)
        external
        view
        returns (uint256, uint256);

    function fundDistributions(uint256 _index)
        external
        view
        returns (
            uint16,
            uint16,
            uint16,
            uint16,
            uint16,
            uint16,
            uint16,
            uint16,
            uint16
        );

    function planterFunds(uint256 _treeId) external view returns (uint256);

    function referralFunds(uint256 _treeId) external view returns (uint256);

    function plantersPaid(uint256 _treeId) external view returns (uint256);

    function balances(address planterAddress) external view returns (uint256);

    function setPlanterContractAddress(address _address) external;

    /**
     * @dev set {_address} to treeResearchAddress
     */
    function setTreeResearchAddress(address payable _address) external;

    /**
     * @dev set {_address} to localDevelopAddress
     */
    function setLocalDevelopAddress(address payable _address) external;

    /**
     * @dev set {_address} to rescueFundAddress
     */
    function setRescueFundAddress(address payable _address) external;

    /**
     * @dev set {_address} to treejerDevelopAddress
     */
    function setTreejerDevelopAddress(address payable _address) external;

    /**
     * @dev set {_address} to reserveFundAddress1
     */
    function setReserveFund1Address(address payable _address) external;

    /**
     * @dev set {_address} to reserveFundAddress2
     */
    function setReserveFund2Address(address payable _address) external;

    /**
     * @dev add a distributionModel based on input arguments that sum of them are 10000
     */
    function addFundDistributionModel(
        uint16 _planter,
        uint16 _referral,
        uint16 _treeResearch,
        uint16 _localDevelop,
        uint16 _rescueFund,
        uint16 _treejerDevelop,
        uint16 _reserveFund1,
        uint16 _reserveFund2
    ) external;

    /**
     * @dev assing {_distributionModelId} fundDistributionModel to trees strating from
     * {_startTreeId} and ending at {_endTreeId} and emit a
     * {FundDistributionModelAssigned} event
     */
    function assignTreeFundDistributionModel(
        uint256 _startTreeId,
        uint256 _endTreeId,
        uint256 _distributionModelId
    ) external;

    /**
     * @dev calculate shares based on fundDistributionModel of tree and add to related totalFunds
     * NOTE must call by Auctiion or RegularSell
     */
    function fundTree(uint256 _treeId) external payable;

    /**
     * @dev  based on the treeStatus planter charged in every tree update verifying
     * NOTE must call by TreeFactory
     */
    function fundPlanter(
        uint256 _treeId,
        address _planterId,
        uint64 _treeStatus
    ) external;

    /**
     * @dev check if there is a distribution model for a tree or not
     * @return true in case of distribution model existance for a tree
     */
    function distributionModelExistance(uint256 _treeId)
        external
        view
        returns (bool);

    /**
     * @dev trnasfer {_amount} from treeResearch in {totalFunds} to treeResearchAddress
     */
    function withdrawTreeResearch(uint256 _amount, string calldata _reason)
        external;

    /**
     * @dev trnasfer {_amount} from localDevelop in {totalFunds} to localDevelopAddress
     */
    function withdrawLocalDevelop(uint256 _amount, string calldata _reason)
        external;

    /**
     * @dev trnasfer {_amount} from rescueFund in {totalFunds} to rescueFundAddress
     */
    function withdrawRescueFund(uint256 _amount, string calldata _reason)
        external;

    /**
     * @dev trnasfer {_amount} from treejerDevelop in {totalFunds} to treejerDevelopAddress
     */
    function withdrawTreejerDevelop(uint256 _amount, string calldata _reason)
        external;

    /**
     * @dev trnasfer {_amount} from reserveFund1 in {totalFunds} to reserveFundAddress1
     */
    function withdrawReserveFund1(uint256 _amount, string calldata _reason)
        external;

    /**
     * @dev trnasfer {_amount} from reserveFund2 in {totalFunds} to reserveFundAddress2
     */
    function withdrawReserveFund2(uint256 _amount, string calldata _reason)
        external;

    /**
     * @dev trnasfer {_amount} from  planters balances to caller's address
     */
    function withdrawPlanterBalance(uint256 _amount) external;

    event DistributionModelAdded(uint256 modelId);
    event TreeFunded(uint256 treeId, uint256 amount, uint256 modelId);
    event DistributionModelOfTreeNotExist(string description);

    event FundDistributionModelAssigned(
        uint256 startingTreeId,
        uint256 endingTreeId,
        uint256 distributionModelId
    );

    event PlanterFunded(uint256 treeId, address planterId, uint256 amount);

    event PlanterBalanceWithdrawn(uint256 amount, address account);

    event TreeResearchBalanceWithdrawn(
        uint256 amount,
        address account,
        string reason
    );

    event LocalDevelopBalanceWithdrawn(
        uint256 amount,
        address account,
        string reason
    );

    event RescueBalanceWithdrawn(
        uint256 amount,
        address account,
        string reason
    );

    event TreejerDevelopBalanceWithdrawn(
        uint256 amount,
        address account,
        string reason
    );

    event OtherBalanceWithdrawn1(
        uint256 amount,
        address account,
        string reason
    );

    event OtherBalanceWithdrawn2(
        uint256 amount,
        address account,
        string reason
    );
}
