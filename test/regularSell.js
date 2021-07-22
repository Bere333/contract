const AccessRestriction = artifacts.require("AccessRestriction");
const RegularSell = artifacts.require("RegularSell.sol");
const GenesisTree = artifacts.require("GenesisTree.sol");
const Dai = artifacts.require("Dai.sol");
const Tree = artifacts.require("Tree.sol");
const Planter = artifacts.require("Planter.sol");
const Treasury = artifacts.require("Treasury.sol");
const assert = require("chai").assert;
require("chai").use(require("chai-as-promised")).should();
const { deployProxy } = require("@openzeppelin/truffle-upgrades");
const truffleAssert = require("truffle-assertions");
const Common = require("./common");
const Units = require("ethereumjs-units");
const Math = require("./math");

const {
  TimeEnumes,
  CommonErrorMsg,
  GenesisTreeErrorMsg,
  RegularSellErrors,
  TreesuryManagerErrorMsg,
} = require("./enumes");

//gsn
const WhitelistPaymaster = artifacts.require("WhitelistPaymaster");
const Gsn = require("@opengsn/gsn");
const { GsnTestEnvironment } = require("@opengsn/gsn/dist/GsnTestEnvironment");
const ethers = require("ethers");

contract("GenesisTree", (accounts) => {
  let regularSellInstance;
  let treeFactoryInstance;
  let arInstance;
  let daiInstance;
  let treeTokenInstance;
  let treasuryInstance;

  const ownerAccount = accounts[0];
  const deployerAccount = accounts[1];
  const userAccount1 = accounts[2];
  const userAccount2 = accounts[3];
  const userAccount3 = accounts[4];
  const userAccount4 = accounts[5];
  const userAccount5 = accounts[6];
  const userAccount6 = accounts[7];
  const userAccount7 = accounts[8];
  const userAccount8 = accounts[9];

  const zeroAddress = "0x0000000000000000000000000000000000000000";

  beforeEach(async () => {
    arInstance = await deployProxy(AccessRestriction, [deployerAccount], {
      initializer: "initialize",
      unsafeAllowCustomTypes: true,
      from: deployerAccount,
    });

    regularSellInstance = await deployProxy(RegularSell, [arInstance.address], {
      initializer: "initialize",
      from: deployerAccount,
      unsafeAllowCustomTypes: true,
    });

    treeFactoryInstance = await deployProxy(GenesisTree, [arInstance.address], {
      initializer: "initialize",
      from: deployerAccount,
      unsafeAllowCustomTypes: true,
    });

    treeTokenInstance = await deployProxy(Tree, [arInstance.address, ""], {
      initializer: "initialize",
      from: deployerAccount,
      unsafeAllowCustomTypes: true,
    });

    treasuryInstance = await deployProxy(Treasury, [arInstance.address], {
      initializer: "initialize",
      from: deployerAccount,
      unsafeAllowCustomTypes: true,
    });

    daiInstance = await Dai.new(Units.convert("1000000", "eth", "wei"), {
      from: deployerAccount,
    });
  });

  afterEach(async () => {});
  //////////////////************************************ deploy successfully ****************************************//
  it("deploys successfully", async () => {
    const address = regularSellInstance.address;
    assert.notEqual(address, 0x0);
    assert.notEqual(address, "");
    assert.notEqual(address, null);
    assert.notEqual(address, undefined);
  });

  /////////////////---------------------------------set tree factory address--------------------------------------------------------
  it("set tree factory address", async () => {
    await regularSellInstance
      .setTreeFactoryAddress(treeFactoryInstance.address, {
        from: userAccount1,
      })
      .should.be.rejectedWith(CommonErrorMsg.CHECK_ADMIN);

    await regularSellInstance.setTreeFactoryAddress(
      treeFactoryInstance.address,
      {
        from: deployerAccount,
      }
    );

    assert.equal(
      treeFactoryInstance.address,
      await regularSellInstance.treeFactory.call(),
      "address set incorect"
    );
  });

  /////////////////---------------------------------set  tresury address--------------------------------------------------------
  it("set treasury address", async () => {
    await regularSellInstance
      .setTreasuryAddress(treasuryInstance.address, {
        from: userAccount1,
      })
      .should.be.rejectedWith(CommonErrorMsg.CHECK_ADMIN);

    await regularSellInstance.setTreasuryAddress(treasuryInstance.address, {
      from: deployerAccount,
    });

    assert.equal(
      treasuryInstance.address,
      await regularSellInstance.treasury.call(),
      "address set incorect"
    );
  });

  /////////////////------------------------------------- set price ------------------------------------------
  it("set price and check data", async () => {
    let treePrice1 = await regularSellInstance.treePrice.call();

    assert.equal(Number(treePrice1), 0, "treePriceInvalid");

    await regularSellInstance.setPrice(10, { from: deployerAccount });

    const treePrice2 = await regularSellInstance.treePrice.call();

    assert.equal(Number(treePrice2), 10, "tree price is incorrect");
  });

  it("should fail set price", async () => {
    await regularSellInstance
      .setPrice(10, { from: userAccount1 })
      .should.be.rejectedWith(CommonErrorMsg.CHECK_ADMIN);
  });

  //////////TODO: must be complete below tests

  /////////////////////// -------------------------------------- request trees ----------------------------------------------------
  // it("should request trees successfully", async () => {});

  it("should fail request trees", async () => {
    let price = Units.convert("1", "eth", "wei");
    await regularSellInstance.setPrice(price, { from: deployerAccount });

    await regularSellInstance
      .requestTrees(0)
      .should.be.rejectedWith(RegularSellErrors.INVALID_COUNT);

    await Common.approveAndTransfer(
      daiInstance,
      userAccount1,
      regularSellInstance.address,
      deployerAccount,
      "3"
    );

    await regularSellInstance.requestTrees(1, { from: userAccount1 }).should.be
      .rejected;

    await regularSellInstance.setDaiTokenAddress(daiInstance.address, {
      from: deployerAccount,
    });

    await regularSellInstance
      .requestTrees(4, { from: userAccount1 })
      .should.be.rejectedWith(RegularSellErrors.INVALID_AMOUNT);

    await regularSellInstance.requestTrees(2).should.be.rejected;

    await Common.addRegularSellRole(
      arInstance,
      regularSellInstance.address,
      deployerAccount
    );

    await regularSellInstance.setTreeFactoryAddress(
      treeFactoryInstance.address,
      { from: deployerAccount }
    );

    await regularSellInstance.requestTrees(2, { from: userAccount1 }).should.be
      .rejected;

    await Common.addGenesisTreeRole(
      arInstance,
      treeFactoryInstance.address,
      deployerAccount
    );

    await regularSellInstance.requestTrees(2, { from: userAccount1 }).should.be
      .rejected;

    await treeFactoryInstance.setTreeTokenAddress(treeTokenInstance.address, {
      from: deployerAccount,
    });

    await regularSellInstance.requestTrees(2, { from: userAccount1 });
  });
  ////////////////////////////////------------------------- aliad ----------------------------------------------------------------------
  //////////////////////// ------------------------------------------- request tree by id ---------------------------------------------------
  it("should request tree by id successfully", async () => {
    const treePrice = Units.convert("1", "eth", "wei");
    const birthDate = parseInt(new Date().getTime() / 1000);
    const countryCode = 2;
    const planter = userAccount2;
    const ipfsHash = "some ipfs hash here";

    ////////////// ------------------- handle fund distribution model ----------------------

    await treasuryInstance.addFundDistributionModel(
      4000,
      1200,
      1200,
      1200,
      1200,
      1200,
      0,
      0,
      {
        from: deployerAccount,
      }
    );

    await treasuryInstance.assignTreeFundDistributionModel(1, 100000, 0, {
      from: deployerAccount,
    });

    ///////////////////// ------------------------- handle tree price ------------------------

    await regularSellInstance.setPrice(treePrice, { from: deployerAccount });

    /////////////////////////-------------------- deploy contracts --------------------------

    const planterInstance = await deployProxy(Planter, [arInstance.address], {
      initializer: "initialize",
      from: deployerAccount,
      unsafeAllowCustomTypes: true,
    });

    ///////////////////// ------------------- handle addresses here --------------------------

    await regularSellInstance.setTreeFactoryAddress(
      treeFactoryInstance.address,
      { from: deployerAccount }
    );

    await regularSellInstance.setTreasuryAddress(treasuryInstance.address, {
      from: deployerAccount,
    });

    await treeFactoryInstance.setTreeTokenAddress(treeTokenInstance.address, {
      from: deployerAccount,
    });

    await treeFactoryInstance.setPlanterAddress(planterInstance.address, {
      from: deployerAccount,
    });

    ///////////////////////// -------------------- handle roles here ----------------

    await Common.addRegularSellRole(
      arInstance,
      regularSellInstance.address,
      deployerAccount
    );

    await Common.addGenesisTreeRole(
      arInstance,
      treeFactoryInstance.address,
      deployerAccount
    );

    //////////////////-------------------------- plant regualar -----------------

    await Common.regularPlantTreeSuccess(
      arInstance,
      treeFactoryInstance,
      planterInstance,
      ipfsHash,
      birthDate,
      countryCode,
      planter,
      deployerAccount
    );

    await treeFactoryInstance.verifyRegularPlant(0, true, {
      from: deployerAccount,
    });

    ///////////////////////////////////////////

    await regularSellInstance.requestByTreeId(10001, {
      from: userAccount1,
      value: web3.utils.toWei("1"),
    });
  });

  it("should check data to be ok after request tree", async () => {
    const treePrice = Units.convert("1", "eth", "wei");
    const birthDate = parseInt(new Date().getTime() / 1000);
    const countryCode = 2;
    const planter = userAccount2;
    const ipfsHash = "some ipfs hash here";
    const treeId = 10001;

    ////////////// ------------------- handle fund distribution model ----------------------

    await treasuryInstance.addFundDistributionModel(
      3000,
      1200,
      1200,
      1200,
      1200,
      1200,
      500,
      500,
      {
        from: deployerAccount,
      }
    );

    let expected = {
      planterFund: Math.divide(Math.mul(30, treePrice), 100),
      referralFund: Math.divide(Math.mul(12, treePrice), 100),
      treeResearch: Math.divide(Math.mul(12, treePrice), 100),
      localDevelop: Math.divide(Math.mul(12, treePrice), 100),
      rescueFund: Math.divide(Math.mul(12, treePrice), 100),
      treejerDevelop: Math.divide(Math.mul(12, treePrice), 100),
      otherFund1: Math.divide(Math.mul(5, treePrice), 100),
      otherFund2: Math.divide(Math.mul(5, treePrice), 100),
    };

    await treasuryInstance.assignTreeFundDistributionModel(1, 100000, 0, {
      from: deployerAccount,
    });

    ///////////////////// ------------------------- handle tree price ------------------------

    await regularSellInstance.setPrice(treePrice, {
      from: deployerAccount,
    });

    ////////////// ---------------- handle deploy --------------------------

    const planterInstance = await deployProxy(Planter, [arInstance.address], {
      initializer: "initialize",
      from: deployerAccount,
      unsafeAllowCustomTypes: true,
    });

    ///////////////////// ------------------- handle addresses here --------------------------

    await regularSellInstance.setTreeFactoryAddress(
      treeFactoryInstance.address,
      { from: deployerAccount }
    );

    await regularSellInstance.setTreasuryAddress(treasuryInstance.address, {
      from: deployerAccount,
    });

    await treeFactoryInstance.setTreeTokenAddress(treeTokenInstance.address, {
      from: deployerAccount,
    });

    await treeFactoryInstance.setPlanterAddress(planterInstance.address, {
      from: deployerAccount,
    });

    ///////////////////////// -------------------- handle roles here ----------------

    await Common.addRegularSellRole(
      arInstance,
      regularSellInstance.address,
      deployerAccount
    );

    await Common.addGenesisTreeRole(
      arInstance,
      treeFactoryInstance.address,
      deployerAccount
    );

    //////////////////-------------------------- plant regualar -----------------

    await Common.regularPlantTreeSuccess(
      arInstance,
      treeFactoryInstance,
      planterInstance,
      ipfsHash,
      birthDate,
      countryCode,
      planter,
      deployerAccount
    );

    await treeFactoryInstance.verifyRegularPlant(0, true, {
      from: deployerAccount,
    });

    ///////////////////////////////////////////

    /////////////--------------------- check total fund before request

    const totalFundsBefore = await treasuryInstance.totalFunds.call();

    assert.equal(
      Number(totalFundsBefore.planterFund),
      0,
      "invalid planter fund"
    );

    assert.equal(
      Number(totalFundsBefore.referralFund),
      0,
      "invalid refferal fund"
    );

    assert.equal(
      Number(totalFundsBefore.treeResearch),
      0,
      "invalid tree research fund"
    );

    assert.equal(
      Number(totalFundsBefore.localDevelop),
      0,
      "invalid local develop fund"
    );
    assert.equal(Number(totalFundsBefore.rescueFund), 0, "invalid rescue fund");

    assert.equal(
      Number(totalFundsBefore.treejerDevelop),
      0,
      "invalid treejer develop fund"
    );

    assert.equal(Number(totalFundsBefore.otherFund1), 0, "invalid other fund1");

    assert.equal(Number(totalFundsBefore.otherFund2), 0, "invalid other fund2");

    ////////////////// ---------------- check tree before -----------------------

    const treeBefore = await treeFactoryInstance.genTrees.call(treeId);

    assert.equal(Number(treeBefore.treeStatus), 4, "invalid tree status");

    assert.equal(
      Number(treeBefore.provideStatus),
      4,
      "invalid tree provide status"
    );

    /////// --------- get user balacne before request

    const userBalanceBefore = await web3.eth.getBalance(userAccount1);

    ///////////////////////////---------------------- check treasury and regular sell balance after request

    const treasuryBalanceBefore = await web3.eth.getBalance(
      treasuryInstance.address
    );

    const regularSellBalanceBefore = await web3.eth.getBalance(
      regularSellInstance.address
    );

    assert.equal(
      Number(treasuryBalanceBefore),
      0,
      "invalid treasury balance before"
    );

    assert.equal(
      Number(regularSellBalanceBefore),
      0,
      "invalid regular sell balance before"
    );

    ///////////////// ----------------- request tree -------------------------------------------

    const requestTx = await regularSellInstance.requestByTreeId(treeId, {
      from: userAccount1,
      value: web3.utils.toWei("1"),
    });

    ///////////////------------------ check user balace to be correct ---------------------

    const userBalanceAfter = await web3.eth.getBalance(userAccount1);

    const txFee = await Common.getTransactionFee(requestTx);

    assert.equal(
      Number(userBalanceAfter),
      Math.subtract(
        Math.subtract(Number(userBalanceBefore), Number(web3.utils.toWei("1"))),
        txFee
      ),
      "invalid user balance update"
    );

    ///////////////////////////---------------------- check treasury and regular sell balance after request

    const treasuryBalanceAfter = await web3.eth.getBalance(
      treasuryInstance.address
    );

    const regularSellBalanceAfter = await web3.eth.getBalance(
      regularSellInstance.address
    );

    assert.equal(
      Number(treasuryBalanceAfter),
      treePrice,
      "invalid treasury balance after"
    );

    assert.equal(
      Number(regularSellBalanceAfter),
      0,
      "invalid regular sell balance after"
    );

    ////////////////////// ----------------------- check token owner before

    const tokentOwnerAfter = await treeTokenInstance.ownerOf(treeId);

    assert.equal(tokentOwnerAfter, userAccount1, "invalid token owner");

    ////////////////// ---------------- check tree after request-----------------------

    const treeAfter = await treeFactoryInstance.genTrees.call(treeId);

    assert.equal(Number(treeAfter.treeStatus), 4, "invalid tree status");

    assert.equal(
      Number(treeAfter.provideStatus),
      0,
      "invalid tree provide status"
    );

    ////////////////// ---------------------- check total fund after request

    const totalFundsAfter = await treasuryInstance.totalFunds.call();

    assert.equal(
      Number(totalFundsAfter.planterFund),
      expected.planterFund,
      "invalid planter fund"
    );

    assert.equal(
      Number(totalFundsAfter.referralFund),
      expected.referralFund,
      "invalid refferal fund"
    );

    assert.equal(
      Number(totalFundsAfter.treeResearch),
      expected.treeResearch,
      "invalid tree research fund"
    );

    assert.equal(
      Number(totalFundsAfter.localDevelop),
      expected.localDevelop,
      "invalid local develop fund"
    );

    assert.equal(
      Number(totalFundsAfter.rescueFund),
      expected.rescueFund,
      "invalid rescue fund"
    );

    assert.equal(
      Number(totalFundsAfter.treejerDevelop),
      expected.treejerDevelop,
      "invalid treejer develop fund"
    );

    assert.equal(
      Number(totalFundsAfter.otherFund1),
      expected.otherFund1,
      "invalid other fund1"
    );

    assert.equal(
      Number(totalFundsAfter.otherFund2),
      expected.otherFund2,
      "invalid other fund2"
    );
  });

  it("should be reject request by tree id", async () => {
    const price = Units.convert("1", "eth", "wei");
    const birthDate = parseInt(new Date().getTime() / 1000);
    const countryCode = 2;
    const planter = userAccount2;
    const ipfsHash = "some ipfs hash here";
    const treeId = 10001;

    await regularSellInstance.setPrice(price, { from: deployerAccount });

    /////////////// ---------------- fail beacuuse of invalid tree id

    await regularSellInstance
      .requestByTreeId(2, { from: userAccount1 })
      .should.be.rejectedWith(RegularSellErrors.INVALID_TREE);

    /////////////////// ------------------ fail because of invalid amount -----------------

    await regularSellInstance
      .requestByTreeId(treeId, {
        from: userAccount1,
        value: web3.utils.toWei("0.5"),
      })
      .should.be.rejectedWith(RegularSellErrors.INVALID_AMOUNT);

    ////////////////////////// ----------------- fail because treeFactory address not set

    await regularSellInstance.requestByTreeId(treeId, {
      from: userAccount1,
      value: web3.utils.toWei("1"),
    }).should.be.rejected;

    //////////////////------------- set tree factory address

    await regularSellInstance.setTreeFactoryAddress(
      treeFactoryInstance.address,
      { from: deployerAccount }
    );

    ///////////////////////// ------------------ fail because caller is not Regular sell in TreeFactory

    await regularSellInstance
      .requestByTreeId(treeId, {
        from: userAccount1,
        value: web3.utils.toWei("1"),
      })
      .should.be.rejectedWith(CommonErrorMsg.CHECK_REGULAR_SELL);

    ///////////////------------------ add regular sell Role

    await Common.addRegularSellRole(
      arInstance,
      regularSellInstance.address,
      deployerAccount
    );

    ////////////////// ----------------- fail because tree is not planted -------------------

    await regularSellInstance
      .requestByTreeId(treeId, {
        from: userAccount1,
        value: web3.utils.toWei("1"),
      })
      .should.be.rejectedWith(GenesisTreeErrorMsg.TREE_MUST_BE_PLANTED);

    // ///////////////// -----------------------  plant regualar tree

    await treeFactoryInstance.setTreeTokenAddress(treeTokenInstance.address, {
      from: deployerAccount,
    });

    await Common.addGenesisTreeRole(
      arInstance,
      treeFactoryInstance.address,
      deployerAccount
    );

    const planterInstance = await deployProxy(Planter, [arInstance.address], {
      initializer: "initialize",
      from: deployerAccount,
      unsafeAllowCustomTypes: true,
    });

    await treeFactoryInstance.setPlanterAddress(planterInstance.address, {
      from: deployerAccount,
    });

    await Common.regularPlantTreeSuccess(
      arInstance,
      treeFactoryInstance,
      planterInstance,
      ipfsHash,
      birthDate,
      countryCode,
      planter,
      deployerAccount
    );

    await treeFactoryInstance.verifyRegularPlant(0, true, {
      from: deployerAccount,
    });

    ///////////////////////// ---------------- end plant regular tree-------------------------

    //////////--------------------------- fail because treasury address not set

    await regularSellInstance.requestByTreeId(treeId, {
      from: userAccount1,
      value: web3.utils.toWei("1"),
    }).should.be.rejected;

    await regularSellInstance.setTreasuryAddress(treasuryInstance.address, {
      from: deployerAccount,
    });

    await regularSellInstance
      .requestByTreeId(treeId, {
        from: userAccount1,
        value: web3.utils.toWei("1"),
      })
      .should.be.rejectedWith(TreesuryManagerErrorMsg.INVALID_FUND_MODEL);

    ////////////// ------------------- handle fund distribution model ----------------------

    await treasuryInstance.addFundDistributionModel(
      4000,
      1200,
      1200,
      1200,
      1200,
      1200,
      0,
      0,
      {
        from: deployerAccount,
      }
    );

    await treasuryInstance.assignTreeFundDistributionModel(1, 100000, 0, {
      from: deployerAccount,
    });

    await regularSellInstance.requestByTreeId(treeId, {
      from: userAccount1,
      value: web3.utils.toWei("1"),
    });
  });
});
