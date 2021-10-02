const AccessRestriction = artifacts.require("AccessRestriction");
const CommunityGifts = artifacts.require("CommunityGifts.sol");
const TreeAttribute = artifacts.require("TreeAttribute.sol");
const TreeFactory = artifacts.require("TreeFactory.sol");
const Allocation = artifacts.require("Allocation.sol");
const PlanterFund = artifacts.require("PlanterFund.sol");
const Tree = artifacts.require("Tree.sol");
const Dai = artifacts.require("Dai.sol");
const assert = require("chai").assert;
require("chai").use(require("chai-as-promised")).should();
const Units = require("ethereumjs-units");
const { deployProxy } = require("@openzeppelin/truffle-upgrades");
const truffleAssert = require("truffle-assertions");
const Common = require("./common");
const Math = require("./math");

//gsn
const WhitelistPaymaster = artifacts.require("WhitelistPaymaster");
const Gsn = require("@opengsn/provider");
const { GsnTestEnvironment } = require("@opengsn/cli/dist/GsnTestEnvironment");
const ethers = require("ethers");

const {
  CommonErrorMsg,
  TimeEnumes,
  CommunityGiftErrorMsg,
  TreeAttributeErrorMsg,
  erc20ErrorMsg,
  GsnErrorMsg,
} = require("./enumes");

contract("CommunityGifts", (accounts) => {
  let communityGiftsInstance;
  let arInstance;
  let treeAttributeInstance;
  let treeFactoryInstance;

  let treeTokenInstance;
  let planterFundsInstnce;
  let daiInstance;

  const dataManager = accounts[0];
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
  const initialPlanterFund = web3.utils.toWei("0.5");
  const initialReferralFund = web3.utils.toWei("0.1");

  before(async () => {
    arInstance = await deployProxy(AccessRestriction, [deployerAccount], {
      initializer: "initialize",
      from: deployerAccount,
      unsafeAllowCustomTypes: true,
    });

    await Common.addDataManager(arInstance, dataManager, deployerAccount);
  });

  // beforeEach(async () => {
  //   const expireDate = await Common.timeInitial(TimeEnumes.days, 30); //one month after now

  //   //------------------ deploy contracts

  //   communityGiftsInstance = await deployProxy(
  //     CommunityGifts,
  //     [arInstance.address, expireDate, initialPlanterFund, initialReferralFund],
  //     {
  //       initializer: "initialize",
  //       from: deployerAccount,
  //       unsafeAllowCustomTypes: true,
  //     }
  //   );

  //   treeAttributeInstance = await deployProxy(
  //     TreeAttribute,
  //     [arInstance.address],
  //     {
  //       initializer: "initialize",
  //       from: deployerAccount,
  //       unsafeAllowCustomTypes: true,
  //     }
  //   );

  //   planterFundsInstnce = await deployProxy(PlanterFund, [arInstance.address], {
  //     initializer: "initialize",
  //     from: deployerAccount,
  //     unsafeAllowCustomTypes: true,
  //   });

  //   allocationInstance = await deployProxy(
  //     Allocation,
  //     [arInstance.address],
  //     {
  //       initializer: "initialize",
  //       from: deployerAccount,
  //       unsafeAllowCustomTypes: true,
  //     }
  //   );

  //   treeFactoryInstance = await deployProxy(TreeFactory, [arInstance.address], {
  //     initializer: "initialize",
  //     from: deployerAccount,
  //     unsafeAllowCustomTypes: true,
  //   });

  //   treeTokenInstance = await deployProxy(Tree, [arInstance.address, ""], {
  //     initializer: "initialize",
  //     from: deployerAccount,
  //     unsafeAllowCustomTypes: true,
  //   });

  //   daiInstance = await Dai.new("DAI", "dai", { from: deployerAccount });

  //   //----------------- set cntract addresses

  //   await communityGiftsInstance.setTreeFactoryAddress(
  //     treeFactoryInstance.address,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await communityGiftsInstance.setTreeAttributesAddress(
  //     treeAttributeInstance.address,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await communityGiftsInstance.setPlanterFundAddress(
  //     planterFundsInstnce.address,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await communityGiftsInstance.setDaiTokenAddress(daiInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await treeFactoryInstance.setTreeTokenAddress(treeTokenInstance.address, {
  //     from: deployerAccount,
  //   });

  //   //----------------add role to treejer contract role to treeFactoryInstance address
  //   await Common.addTreejerContractRole(
  //     arInstance,
  //     treeFactoryInstance.address,
  //     deployerAccount
  //   );

  //   //----------------add role to treejer contract role to communityGiftsInstance address
  //   await Common.addTreejerContractRole(
  //     arInstance,
  //     communityGiftsInstance.address,
  //     deployerAccount
  //   );
  // });

  afterEach(async () => {});

  ////////////////--------------------------------------------gsn------------------------------------------------
  // it("test gsn [ @skip-on-coverage ]", async () => {
  //   let env = await GsnTestEnvironment.startGsn("localhost");

  //   const { forwarderAddress, relayHubAddress, paymasterAddress } =
  //     env.contractsDeployment;

  //   await communityGiftsInstance.setTrustedForwarder(forwarderAddress, {
  //     from: deployerAccount,
  //   });

  //   let paymaster = await WhitelistPaymaster.new(arInstance.address);

  //   await paymaster.setRelayHub(relayHubAddress);
  //   await paymaster.setTrustedForwarder(forwarderAddress);

  //   web3.eth.sendTransaction({
  //     from: accounts[0],
  //     to: paymaster.address,
  //     value: web3.utils.toWei("1"),
  //   });

  //   origProvider = web3.currentProvider;

  //   conf = { paymasterAddress: paymaster.address };

  //   gsnProvider = await Gsn.RelayProvider.newProvider({
  //     provider: origProvider,
  //     config: conf,
  //   }).init();

  //   provider = new ethers.providers.Web3Provider(gsnProvider);

  //   let signerGiftee = provider.getSigner(3);

  //   let contractCommunityGift = await new ethers.Contract(
  //     communityGiftsInstance.address,
  //     communityGiftsInstance.abi,
  //     signerGiftee
  //   );

  //   const giftee = userAccount2;
  //   const symbol = 1234554321;

  //   //////////--------------add giftee by admin

  //   const startTree = 11;
  //   const endTree = 13;
  //   const planterShare = web3.utils.toWei("5");
  //   const referralShare = web3.utils.toWei("2");
  //   const transferAmount = web3.utils.toWei("14");
  //   const adminWallet = userAccount8;
  //   const expireDate = await Common.timeInitial(TimeEnumes.days, 30);

  //   ///////---------------- handle admin walllet

  //   await daiInstance.setMint(adminWallet, transferAmount);

  //   await daiInstance.approve(communityGiftsInstance.address, transferAmount, {
  //     from: adminWallet,
  //   });

  //   //////////--------------add giftee by admin

  //   await communityGiftsInstance.setGiftsRange(
  //     startTree,
  //     endTree,
  //     planterShare,
  //     referralShare,
  //     Number(expireDate),
  //     adminWallet,
  //     {
  //       from: dataManager,
  //     }
  //   );

  //   await communityGiftsInstance.updateGiftees(giftee, symbol, {
  //     from: dataManager,
  //   });

  //   await communityGiftsInstance.setPrice(
  //     web3.utils.toWei("4.9"), //planter share
  //     web3.utils.toWei("2.1"), //referral share
  //     { from: dataManager }
  //   );

  //   let balanceAccountBefore = await web3.eth.getBalance(giftee);

  //   await contractCommunityGift
  //     .claimTree({
  //       from: giftee,
  //     })
  //     .should.be.rejectedWith(GsnErrorMsg.ADDRESS_NOT_EXISTS);

  //   await paymaster.addFunderWhitelistTarget(communityGiftsInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await contractCommunityGift.claimTree({
  //     from: giftee,
  //   });

  //   let balanceAccountAfter = await web3.eth.getBalance(giftee);

  //   assert.equal(
  //     balanceAccountAfter,
  //     balanceAccountBefore,
  //     "gsn not true work"
  //   );
  // });
  describe("deployment and set addresses", () => {
    beforeEach(async () => {
      const expireDate = await Common.timeInitial(TimeEnumes.days, 30);
      communityGiftsInstance = await deployProxy(
        CommunityGifts,
        [
          arInstance.address,
          expireDate,
          initialPlanterFund,
          initialReferralFund,
        ],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      treeAttributeInstance = await deployProxy(
        TreeAttribute,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      planterFundsInstnce = await deployProxy(
        PlanterFund,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      treeFactoryInstance = await deployProxy(
        TreeFactory,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      treeTokenInstance = await deployProxy(Tree, [arInstance.address, ""], {
        initializer: "initialize",
        from: deployerAccount,
        unsafeAllowCustomTypes: true,
      });

      daiInstance = await Dai.new("DAI", "dai", { from: deployerAccount });
    });
    it("deploys successfully and set addresses", async () => {
      //////////////////------------------------------------ deploy successfully ----------------------------------------//
      const address = communityGiftsInstance.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);

      ///////////////---------------------------------set trust forwarder address--------------------------------------------------------

      await communityGiftsInstance
        .setTrustedForwarder(userAccount2, {
          from: userAccount1,
        })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_ADMIN);

      await communityGiftsInstance
        .setTrustedForwarder(zeroAddress, {
          from: deployerAccount,
        })
        .should.be.rejectedWith(CommonErrorMsg.INVALID_ADDRESS);

      await communityGiftsInstance.setTrustedForwarder(userAccount2, {
        from: deployerAccount,
      });

      assert.equal(
        userAccount2,
        await communityGiftsInstance.trustedForwarder(),
        "address set incorrect"
      );

      /////////////////---------------------------------set dai token address--------------------------------------------------------

      await communityGiftsInstance
        .setDaiTokenAddress(daiInstance.address, {
          from: userAccount1,
        })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_ADMIN);

      await communityGiftsInstance
        .setDaiTokenAddress(zeroAddress, {
          from: deployerAccount,
        })
        .should.be.rejectedWith(CommonErrorMsg.INVALID_ADDRESS);

      await communityGiftsInstance.setDaiTokenAddress(daiInstance.address, {
        from: deployerAccount,
      });

      assert.equal(
        daiInstance.address,
        await communityGiftsInstance.daiToken.call(),
        "address set incorect"
      );

      /////////////////---------------------------------set tree attribute address--------------------------------------------------------
      await communityGiftsInstance
        .setTreeAttributesAddress(treeAttributeInstance.address, {
          from: userAccount1,
        })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_ADMIN);

      await communityGiftsInstance.setTreeAttributesAddress(
        treeAttributeInstance.address,
        {
          from: deployerAccount,
        }
      );

      assert.equal(
        treeAttributeInstance.address,
        await communityGiftsInstance.treeAttribute.call(),
        "address set incorect"
      );

      /////////////////---------------------------------set tree factory address--------------------------------------------------------

      await communityGiftsInstance
        .setTreeFactoryAddress(treeFactoryInstance.address, {
          from: userAccount1,
        })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_ADMIN);

      await communityGiftsInstance.setTreeFactoryAddress(
        treeFactoryInstance.address,
        {
          from: deployerAccount,
        }
      );

      assert.equal(
        treeFactoryInstance.address,
        await communityGiftsInstance.treeFactory.call(),
        "address set incorect"
      );
      /////////////////---------------------------------set planter fund address--------------------------------------------------------

      await communityGiftsInstance
        .setPlanterFundAddress(planterFundsInstnce.address, {
          from: userAccount1,
        })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_ADMIN);

      await communityGiftsInstance.setPlanterFundAddress(
        planterFundsInstnce.address,
        {
          from: deployerAccount,
        }
      );

      assert.equal(
        planterFundsInstnce.address,
        await communityGiftsInstance.planterFundContract.call(),
        "address set incorect"
      );
    });
  });

  describe("set expire date and price", () => {
    beforeEach(async () => {
      const expireDate = await Common.timeInitial(TimeEnumes.days, 30); //one month after now

      communityGiftsInstance = await deployProxy(
        CommunityGifts,
        [
          arInstance.address,
          expireDate,
          initialPlanterFund,
          initialReferralFund,
        ],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );
    });

    /////////////////---------------------------------set expire date--------------------------------------------------------
    it("should set expire date successfully and check data to be ok and fail in invaid situation", async () => {
      const initialExpireDate = await Common.timeInitial(TimeEnumes.days, 10);

      ////////// --------------- fail because caller is not data manager
      await communityGiftsInstance
        .setExpireDate(100, { from: userAccount1 })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_DATA_MANAGER);

      const eventTx = await communityGiftsInstance.setExpireDate(
        Number(initialExpireDate),
        {
          from: dataManager,
        }
      );

      let settedExpireDate = await communityGiftsInstance.expireDate.call();

      assert.equal(
        Number(settedExpireDate),
        Number(initialExpireDate),
        "expire date is not correct"
      );

      truffleAssert.eventEmitted(eventTx, "CommuintyGiftSet");

      //////////// ------------------ fail becuase of invalid time
      await Common.travelTime(TimeEnumes.days, 20);

      const expireDate2 = await Common.timeInitial(TimeEnumes.days, 15);

      await communityGiftsInstance
        .setExpireDate(Number(expireDate2), {
          from: dataManager,
        })
        .should.be.rejectedWith(CommunityGiftErrorMsg.CANT_UPDATE_EXPIRE_DATE);
    });

    /////////////////-------------------------------------- set price ------------------------------------------------

    it("should set price successfully and check data to be ok and fail in invalid situation", async () => {
      const planterFund = Units.convert("0.5", "eth", "wei");
      const referralFund = Units.convert("0.1", "eth", "wei");

      ////////// --------------- fail because caller is not data manager
      await communityGiftsInstance
        .setPrice(100, 200, { from: userAccount1 })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_DATA_MANAGER);

      const eventTx = await communityGiftsInstance.setPrice(
        planterFund,
        referralFund,
        {
          from: dataManager,
        }
      );

      const settedPlanterFund = await communityGiftsInstance.planterFund.call();
      const settedReferralFund =
        await communityGiftsInstance.referralFund.call();

      assert.equal(
        Number(settedPlanterFund),
        planterFund,
        "planter fund is not correct"
      );

      assert.equal(
        Number(settedReferralFund),
        referralFund,
        "referral fund is not correct"
      );

      truffleAssert.eventEmitted(eventTx, "CommunityGiftPlanterFund", (ev) => {
        return (
          Number(ev.planterFund) == Number(planterFund) &&
          Number(ev.referralFund) == Number(referralFund)
        );
      });
    });
  });

  describe("update giftees", () => {
    beforeEach(async () => {
      const expireDate = await Common.timeInitial(TimeEnumes.days, 30); //one month after now

      //------------------ deploy contracts

      communityGiftsInstance = await deployProxy(
        CommunityGifts,
        [
          arInstance.address,
          expireDate,
          initialPlanterFund,
          initialReferralFund,
        ],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      treeAttributeInstance = await deployProxy(
        TreeAttribute,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      planterFundsInstnce = await deployProxy(
        PlanterFund,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      treeFactoryInstance = await deployProxy(
        TreeFactory,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      treeTokenInstance = await deployProxy(Tree, [arInstance.address, ""], {
        initializer: "initialize",
        from: deployerAccount,
        unsafeAllowCustomTypes: true,
      });

      daiInstance = await Dai.new("DAI", "dai", { from: deployerAccount });

      //----------------- set cntract addresses

      await communityGiftsInstance.setTreeFactoryAddress(
        treeFactoryInstance.address,
        {
          from: deployerAccount,
        }
      );

      await communityGiftsInstance.setTreeAttributesAddress(
        treeAttributeInstance.address,
        {
          from: deployerAccount,
        }
      );

      await communityGiftsInstance.setPlanterFundAddress(
        planterFundsInstnce.address,
        {
          from: deployerAccount,
        }
      );

      await communityGiftsInstance.setDaiTokenAddress(daiInstance.address, {
        from: deployerAccount,
      });

      await treeFactoryInstance.setTreeTokenAddress(treeTokenInstance.address, {
        from: deployerAccount,
      });

      //----------------add role to treejer contract role to treeFactoryInstance address
      await Common.addTreejerContractRole(
        arInstance,
        treeFactoryInstance.address,
        deployerAccount
      );

      //----------------add role to treejer contract role to communityGiftsInstance address
      await Common.addTreejerContractRole(
        arInstance,
        communityGiftsInstance.address,
        deployerAccount
      );
    });

    /////////////////---------------------------------set gift range--------------------------------------------------------

    it("set gift range successfully and check data", async () => {
      //------------------initial data

      const startTree = 11;
      const endTree = 101;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("630");
      const adminWallet = userAccount8;
      let now = await Common.timeInitial(TimeEnumes.seconds, 0);
      const expireDate = await Common.timeInitial(TimeEnumes.minutes, 1440);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      const eventTx = await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      truffleAssert.eventEmitted(eventTx, "CommuintyGiftSet");

      const treeId11 = await treeFactoryInstance.trees.call(11);
      const treeId21 = await treeFactoryInstance.trees.call(21);
      const treeId41 = await treeFactoryInstance.trees.call(41);
      const treeId51 = await treeFactoryInstance.trees.call(51);
      const treeId100 = await treeFactoryInstance.trees.call(100);

      assert.equal(Number(treeId11.saleType), 5, "saleType is not correct");
      assert.equal(Number(treeId21.saleType), 5, "saleType is not correct");
      assert.equal(Number(treeId41.saleType), 5, "saleType is not correct");
      assert.equal(Number(treeId51.saleType), 5, "saleType is not correct");
      assert.equal(Number(treeId100.saleType), 5, "saleType is not correct");

      assert.equal(
        Number(planterShare),
        Number(await communityGiftsInstance.planterFund.call()),
        "planter share is not correct"
      );

      assert.equal(
        Number(referralShare),
        Number(await communityGiftsInstance.referralFund.call()),
        "referral share is not correct"
      );

      assert.equal(
        Number(endTree - startTree),
        Number(await communityGiftsInstance.maxGiftCount.call()),
        "max gift count is not correct"
      );

      assert.equal(
        Number(startTree),
        Number(await communityGiftsInstance.toClaim.call()),
        "toClaim is not correct"
      );

      assert.equal(
        Number(endTree),
        Number(await communityGiftsInstance.upTo.call()),
        "upTo is not correct"
      );
      assert.equal(
        Number(await communityGiftsInstance.expireDate.call()),
        Math.add(Number(now), 86400),
        "expire date is not correct"
      );
    });

    it("fail to set gift range", async () => {
      //------------------initial data

      const startTree = 11;
      const endTree = 101;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("630");
      const insufficientTransferAmount = web3.utils.toWei("629.9");
      const addminWalletWithInsufficientTransferAmount = userAccount6;
      const insufficientApprovalAmount = web3.utils.toWei("629");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.minutes, 1440);
      const treeIdInAuction = 16;
      const startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
      const endTime = await Common.timeInitial(TimeEnumes.hours, 1);

      ///////////////// ---------------------- fail because caller is not data manager
      await communityGiftsInstance
        .setGiftsRange(
          startTree,
          endTree,
          planterShare,
          referralShare,
          Number(expireDate),
          adminWallet,
          {
            from: userAccount1,
          }
        )
        .should.be.rejectedWith(CommonErrorMsg.CHECK_DATA_MANAGER);

      ///////////----------------- fail because of invalid range
      await communityGiftsInstance
        .setGiftsRange(
          endTree,
          startTree,
          planterShare,
          referralShare,
          Number(expireDate),
          adminWallet,
          {
            from: dataManager,
          }
        )
        .should.be.rejectedWith(CommunityGiftErrorMsg.INVALID_RANGE);

      /////////////// fail because of insufficient approval amount

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        insufficientApprovalAmount,
        {
          from: adminWallet,
        }
      );

      await communityGiftsInstance
        .setGiftsRange(
          startTree,
          endTree,
          planterShare,
          referralShare,
          Number(expireDate),
          adminWallet,
          {
            from: dataManager,
          }
        )
        .should.be.rejectedWith(erc20ErrorMsg.APPROVAL_ISSUE);

      //////////// fail because of insufficient admin account balance
      await daiInstance.setMint(
        addminWalletWithInsufficientTransferAmount,
        insufficientTransferAmount
      );

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: addminWalletWithInsufficientTransferAmount,
        }
      );

      await communityGiftsInstance
        .setGiftsRange(
          startTree,
          endTree,
          planterShare,
          referralShare,
          Number(expireDate),
          addminWalletWithInsufficientTransferAmount,
          {
            from: dataManager,
          }
        )
        .should.be.rejectedWith(erc20ErrorMsg.INSUFFICIENT_BALANCE);

      //////////////----------------- fail because of invalid admin account
      await communityGiftsInstance
        .setGiftsRange(
          startTree,
          endTree,
          planterShare,
          referralShare,
          Number(expireDate),
          zeroAddress,
          {
            from: dataManager,
          }
        )
        .should.be.rejectedWith(erc20ErrorMsg.ZERO_ADDRESS);

      //----------------- fail setGiftsRange because a tree is not free

      await treeFactoryInstance.listTree(treeIdInAuction, "some ipfs hash", {
        from: dataManager,
      });

      await Common.addTreejerContractRole(
        arInstance,
        userAccount7,
        deployerAccount
      );

      await treeFactoryInstance.manageSaleTypeBatch(
        treeIdInAuction,
        treeIdInAuction + 1,
        5,
        { from: userAccount7 }
      );

      await communityGiftsInstance
        .setGiftsRange(
          startTree,
          endTree,
          planterShare,
          referralShare,
          Number(expireDate),
          adminWallet,
          {
            from: dataManager,
          }
        )
        .should.be.rejectedWith(CommunityGiftErrorMsg.TREES_ARE_NOT_AVAILABLE);
    });

    ////////////////////// -------------------------------- update giftees ----------------------------------------

    it("should update giftees succesfully and check data to be ok", async () => {
      //////// -------------------- set gifts range

      const startTree = 10;
      const endTree = 20;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("70");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.minutes, 1440);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      /////////////////////////////////////////////////////////////////

      const giftee1 = userAccount1;
      const giftee2 = userAccount2;
      const symbol1 = 1234554321;
      const symbol2 = 1357997531;

      const giftCountBefore = await communityGiftsInstance.giftCount.call();

      //////////---------------------- give symbol1 to giftee1

      const eventTx1 = await communityGiftsInstance.updateGiftees(
        giftee1,
        symbol1,
        {
          from: dataManager,
        }
      );

      //////////-------------- check event emitted

      truffleAssert.eventEmitted(eventTx1, "GifteeUpdated", (ev) => {
        return ev.giftee == giftee1;
      });

      //////////---------------- check communityGift data

      const communityGift1 = await communityGiftsInstance.communityGifts.call(
        giftee1
      );

      assert.equal(
        Number(communityGift1.symbol),
        symbol1,
        "symbol is not correct"
      );

      assert.equal(communityGift1.exist, true, "exist is not correct");

      assert.equal(communityGift1.claimed, false, "claimed is not correct");

      //////////-------------- check gift count

      const giftCountAfter1 = await communityGiftsInstance.giftCount.call();

      assert.equal(
        Number(giftCountBefore),
        0,
        "gift count before update giftee is not correct"
      );

      assert.equal(
        Number(giftCountAfter1),
        1,
        "gift count after update giftee is not correct"
      );

      ///////////---------------- check attribute code

      const generatedAttr1Symbol1 =
        await treeAttributeInstance.generatedAttributes.call(symbol1);

      const reservedAttr1Symbol1 =
        await treeAttributeInstance.reservedAttributes.call(symbol1);

      assert.equal(
        Number(generatedAttr1Symbol1),
        1,
        "generated code is not correct"
      );

      assert.equal(
        Number(reservedAttr1Symbol1),
        1,
        "reserved code is not correct"
      );

      ///////////---------------------- give symbol2 to giftee1

      const eventTx2 = await communityGiftsInstance.updateGiftees(
        giftee1,
        symbol2,
        {
          from: dataManager,
        }
      );

      //-------------- check event emitted

      truffleAssert.eventEmitted(eventTx2, "GifteeUpdated", (ev) => {
        return ev.giftee == giftee1;
      });

      //////////---------------- check communityGift data

      const communityGift2 = await communityGiftsInstance.communityGifts.call(
        giftee1
      );

      assert.equal(
        Number(communityGift2.symbol),
        symbol2,
        "symbol is not correct"
      );

      assert.equal(communityGift2.exist, true, "exist is not correct");

      assert.equal(communityGift2.claimed, false, "claimed is not correct");

      //////////-------------- check gift count

      const giftCountAfter2 = await communityGiftsInstance.giftCount.call();

      assert.equal(
        Number(giftCountAfter2),
        1,
        "gift count after update giftee is not correct"
      );

      ///////////---------------- check attribute code for symbol 1 that must be free

      const generatedAttr2Symbol1 =
        await treeAttributeInstance.generatedAttributes.call(symbol1);

      const reservedAttr2Symbol1 =
        await treeAttributeInstance.reservedAttributes.call(symbol1);

      assert.equal(
        Number(generatedAttr2Symbol1),
        0,
        "generated code is not correct"
      );

      assert.equal(
        Number(reservedAttr2Symbol1),
        0,
        "reserved code is not correct"
      );

      ///////////---------------- check attribute code for symbol 2 that must be reserved

      const generatedAttr1Symbol2 =
        await treeAttributeInstance.generatedAttributes.call(symbol2);

      const reservedAttr1Symbol2 =
        await treeAttributeInstance.reservedAttributes.call(symbol2);

      assert.equal(
        Number(generatedAttr1Symbol2),
        1,
        "generated code is not correct"
      );

      assert.equal(
        Number(reservedAttr1Symbol2),
        1,
        "reserved code is not correct"
      );

      ///////------------------ give symbol1 to giftee2

      const eventTx3 = await communityGiftsInstance.updateGiftees(
        giftee2,
        symbol1,
        {
          from: dataManager,
        }
      );

      //-------------- check event emitted

      truffleAssert.eventEmitted(eventTx3, "GifteeUpdated", (ev) => {
        return ev.giftee == giftee2;
      });

      //////////---------------- check communityGift data

      const communityGift3 = await communityGiftsInstance.communityGifts.call(
        giftee2
      );

      assert.equal(
        Number(communityGift3.symbol),
        symbol1,
        "symbol is not correct"
      );

      assert.equal(communityGift3.exist, true, "exist is not correct");

      assert.equal(communityGift3.claimed, false, "claimed is not correct");

      //////////-------------- check gift count

      const giftCountAfter3 = await communityGiftsInstance.giftCount.call();

      assert.equal(
        Number(giftCountAfter3),
        2,
        "gift count after update giftee is not correct"
      );

      ///////////---------------- check attribute code for symbol 1 that must be reserved

      const generatedAttr3Symbol1 =
        await treeAttributeInstance.generatedAttributes.call(symbol1);

      const reservedAttr3Symbol1 =
        await treeAttributeInstance.reservedAttributes.call(symbol1);

      assert.equal(
        Number(generatedAttr3Symbol1),
        1,
        "generated code is not correct"
      );

      assert.equal(
        Number(reservedAttr3Symbol1),
        1,
        "reserved code is not correct"
      );
    });

    it("should fail to update giftees", async () => {
      //////// -------------------- set gifts range

      const startTree = 10;
      const endTree = 20;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("70");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.days, 10);

      const symbol0 = 123456789;

      //////////----------------- fail because community gift does not set

      await communityGiftsInstance
        .updateGiftees(userAccount1, symbol0, {
          from: dataManager,
        })
        .should.be.rejectedWith(CommunityGiftErrorMsg.MAX_GIFT_AMOUNT_REACHED);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      /////////////////////////////////////////////////////////////////

      const giftee1 = userAccount1;
      const giftee2 = userAccount2;
      const symbol1 = 1234554321;
      const symbol2 = 1357997531;

      /////// ---------------should fail admin access
      await communityGiftsInstance
        .updateGiftees(giftee1, symbol1, { from: userAccount3 })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_DATA_MANAGER);

      ///////////////// ------------ should fail becuse giftee claimed before
      await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
        from: dataManager,
      });

      await communityGiftsInstance.claimTree({
        from: giftee1,
      });

      await communityGiftsInstance
        .updateGiftees(giftee1, symbol2, { from: dataManager })
        .should.be.rejectedWith(CommunityGiftErrorMsg.CLAIMED_BEFORE);

      /////////------------------------- should fail because of duplicate symbol

      await communityGiftsInstance
        .updateGiftees(giftee2, symbol1, { from: dataManager })
        .should.be.rejectedWith(
          TreeAttributeErrorMsg.DUPLICATE_TREE_ATTRIBUTES
        );
      ////////////////// --------------------- should fail because gift count is not less than maxGiftCount

      const startTree2 = 20;
      const endTree2 = 30;

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      await communityGiftsInstance.setGiftsRange(
        startTree2,
        endTree2,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      /////////////////////////////////////////////////////////////////
      //TODO: aliad010 FIX_THIS_BUG
      // const symbol3 = 123456789;

      // for (i = 0; i < 10; i++) {
      //   let address = await Common.getNewAccountPublicKey();
      //   await communityGiftsInstance.updateGiftees(address, i, {
      //     from: dataManager,
      //   });
      // }

      // await communityGiftsInstance
      //   .updateGiftees(userAccount1, symbol3, {
      //     from: dataManager,
      //   })
      //   .should.be.rejectedWith(CommunityGiftErrorMsg.MAX_GIFT_AMOUNT_REACHED);
    });
  });

  describe("claim tree and transfer tree", () => {
    beforeEach(async () => {
      const expireDate = await Common.timeInitial(TimeEnumes.days, 30); //one month after now

      //------------------ deploy contracts

      communityGiftsInstance = await deployProxy(
        CommunityGifts,
        [
          arInstance.address,
          expireDate,
          initialPlanterFund,
          initialReferralFund,
        ],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      treeAttributeInstance = await deployProxy(
        TreeAttribute,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      planterFundsInstnce = await deployProxy(
        PlanterFund,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      allocationInstance = await deployProxy(Allocation, [arInstance.address], {
        initializer: "initialize",
        from: deployerAccount,
        unsafeAllowCustomTypes: true,
      });

      treeFactoryInstance = await deployProxy(
        TreeFactory,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      treeTokenInstance = await deployProxy(Tree, [arInstance.address, ""], {
        initializer: "initialize",
        from: deployerAccount,
        unsafeAllowCustomTypes: true,
      });

      daiInstance = await Dai.new("DAI", "dai", { from: deployerAccount });

      //----------------- set cntract addresses

      await communityGiftsInstance.setTreeFactoryAddress(
        treeFactoryInstance.address,
        {
          from: deployerAccount,
        }
      );

      await communityGiftsInstance.setTreeAttributesAddress(
        treeAttributeInstance.address,
        {
          from: deployerAccount,
        }
      );

      await communityGiftsInstance.setPlanterFundAddress(
        planterFundsInstnce.address,
        {
          from: deployerAccount,
        }
      );

      await communityGiftsInstance.setDaiTokenAddress(daiInstance.address, {
        from: deployerAccount,
      });

      await treeFactoryInstance.setTreeTokenAddress(treeTokenInstance.address, {
        from: deployerAccount,
      });

      //----------------add role to treejer contract role to treeFactoryInstance address
      await Common.addTreejerContractRole(
        arInstance,
        treeFactoryInstance.address,
        deployerAccount
      );

      //----------------add role to treejer contract role to communityGiftsInstance address
      await Common.addTreejerContractRole(
        arInstance,
        communityGiftsInstance.address,
        deployerAccount
      );
    });

    ////////////////////// -------------------------------- claim tree ----------------------------------------

    it("1-should claimTree succesfully and check data to be ok", async () => {
      const giftee1 = userAccount1;
      const symbol1 = 1234554321;

      const startTree = 11;
      const endTree = 13;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("14");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.minutes, 1440);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      //////////--------------add giftee by admin

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
        from: dataManager,
      });

      let toClaimBefore = await communityGiftsInstance.toClaim.call();

      const planterShareOfTree = web3.utils.toWei("4.9");
      const referralShareOfTree = web3.utils.toWei("2.1");

      await communityGiftsInstance.setPrice(
        planterShareOfTree,
        referralShareOfTree,
        { from: dataManager }
      );

      const treeId = startTree; //id of tree to be claimed

      //////// ----------------- check plnter fund before

      const pFundBefore =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId);

      const rFundBefore =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(treeId);

      assert.equal(Number(pFundBefore), 0, "planter fund is not ok");

      assert.equal(Number(rFundBefore), 0, "referral fund is not ok");

      const pfTotalFundBefore = await planterFundsInstnce.totalBalances.call();

      assert.equal(
        Number(pfTotalFundBefore.planter),
        0,
        "planter total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundBefore.ambassador),
        0,
        "ambassador total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundBefore.localDevelopment),
        0,
        "local develop total fund is not ok"
      );

      //////////--------------claim tree by giftee1

      let eventTx1 = await communityGiftsInstance.claimTree({
        from: giftee1,
      });

      let toClaimAfter = await communityGiftsInstance.toClaim.call();

      let giftee = await communityGiftsInstance.communityGifts(giftee1);

      assert.equal(Number(giftee.symbol), symbol1, "1.symbol not true updated");

      assert.equal(giftee.claimed, true, "1.claimed not true updated");

      assert.equal(
        Number(toClaimAfter),
        Number(toClaimBefore) + 1,
        "1.toClaim not true updated"
      );

      assert.equal(
        Number(toClaimAfter),
        treeId + 1,
        "1.toClaim not true updated"
      );

      //////////--------------check tree owner
      let addressGetToken = await treeTokenInstance.ownerOf(treeId);

      assert.equal(addressGetToken, giftee1, "1.mint not true");

      //////////--------------check provide status

      let genTree = await treeFactoryInstance.trees.call(treeId);

      assert.equal(Number(genTree.saleType), 0, "saleType is not correct");

      //////////--------------check treeAttribute
      let treeAttribute = await treeAttributeInstance.treeAttributes(treeId);

      assert.equal(treeAttribute.exists, 1, "treeAttribute is not true update");

      //////////////// ---------------- check planter fund values after claim

      const pFundAfter =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId);

      const rFundAfter =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(treeId);

      assert.equal(
        Number(pFundAfter),
        Number(planterShareOfTree),
        "planter fund is not ok"
      );

      assert.equal(
        Number(rFundAfter),
        Number(referralShareOfTree),
        "referral fund is not ok"
      );

      const pfTotalFundAfter = await planterFundsInstnce.totalBalances.call();

      assert.equal(
        Number(pfTotalFundAfter.planter),
        Number(planterShareOfTree),
        "planter total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundAfter.ambassador),
        Number(referralShareOfTree),
        "ambassador total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundAfter.localDevelopment),
        0,
        "local develop total fund is not ok"
      );

      //////////-------------- check event emitted

      truffleAssert.eventEmitted(eventTx1, "TreeClaimed", (ev) => {
        return Number(ev.treeId) == treeId;
      });
    });

    it("2-should claimTree succesfully and check data to be ok", async () => {
      const giftee1 = userAccount1;
      const symbol1 = 1234554321;

      const giftee2 = userAccount2;
      const symbol2 = 1234554322;

      const startTree = 11;
      const endTree = 13;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("14");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.minutes, 1440);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      //////////--------------add giftee by admin

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
        from: dataManager,
      });

      await communityGiftsInstance.updateGiftees(giftee2, symbol2, {
        from: dataManager,
      });

      let toClaimBefore = await communityGiftsInstance.toClaim.call();

      const treeId1 = startTree; // first tree to be claimed
      const treeId2 = startTree + 1; //2nd tree to be claimed

      const planterShareOfTree = web3.utils.toWei("4.9");
      const referralShareOfTree = web3.utils.toWei("2.1");

      await communityGiftsInstance.setPrice(
        planterShareOfTree,
        referralShareOfTree,
        { from: dataManager }
      );

      //////// ----------------- check plnter fund before

      const pFundBeforeTree1 =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId1);

      const rFundBeforeTree1 =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(
          treeId1
        );

      assert.equal(
        Number(pFundBeforeTree1),
        0,
        "planter fund is not ok for tree1"
      );

      assert.equal(
        Number(rFundBeforeTree1),
        0,
        "referral fund is not ok for tree1"
      );

      const pFundBeforeTree2 =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId2);

      const rFundBeforeTree2 =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(
          treeId2
        );

      assert.equal(
        Number(pFundBeforeTree2),
        0,
        "planter fund is not ok for tree2"
      );

      assert.equal(
        Number(rFundBeforeTree2),
        0,
        "referral fund is not ok for tree 2"
      );

      const pfTotalFundBefore = await planterFundsInstnce.totalBalances.call();

      assert.equal(
        Number(pfTotalFundBefore.planter),
        0,
        "planter total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundBefore.ambassador),
        0,
        "ambassador total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundBefore.localDevelopment),
        0,
        "local develop total fund is not ok"
      );

      //////////--------------claim tree by giftee1

      let eventTx1 = await communityGiftsInstance.claimTree({
        from: giftee1,
      });

      //////// ----------------- check plnter fund after claim

      const pFundAfterTree1 =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId1);

      const rFundAfterTree1 =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(
          treeId1
        );

      assert.equal(
        Number(pFundAfterTree1),
        Number(planterShareOfTree),
        "planter fund is not ok for tree1"
      );

      assert.equal(
        Number(rFundAfterTree1),
        Number(referralShareOfTree),
        "referral fund is not ok for tree1"
      );

      const pfTotalFundAfterTree1 =
        await planterFundsInstnce.totalBalances.call();

      assert.equal(
        Number(pfTotalFundAfterTree1.planter),
        Number(planterShareOfTree),
        "planter total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundAfterTree1.ambassador),
        Number(referralShareOfTree),
        "ambassador total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundAfterTree1.localDevelopment),
        0,
        "local develop total fund is not ok"
      );

      //////////--------------claim tree by giftee2
      let eventTx2 = await communityGiftsInstance.claimTree({
        from: giftee2,
      });

      let toClaimAfter = await communityGiftsInstance.toClaim.call();

      //////////-------------- check claimed tree data
      let giftee1Data = await communityGiftsInstance.communityGifts(giftee1);

      let giftee2Data = await communityGiftsInstance.communityGifts(giftee2);

      assert.equal(
        Number(giftee1Data.symbol),
        symbol1,
        "1.symbol not true updated"
      );

      assert.equal(giftee1Data.claimed, true, "1.claimed not true updated");

      assert.equal(
        Number(giftee2Data.symbol),
        symbol2,
        "2.symbol not true updated"
      );

      assert.equal(giftee2Data.claimed, true, "2.claimed not true updated");

      assert.equal(
        Number(toClaimAfter),
        Number(toClaimBefore) + 2,
        "toClaim not true updated"
      );

      assert.equal(
        Number(toClaimAfter),
        treeId1 + 2,
        "toClaim not true updated"
      );

      //////////--------------check tree owner
      let addressGetToken = await treeTokenInstance.ownerOf(11);

      assert.equal(addressGetToken, giftee1, "1.mint not true");

      let addressGetToken2 = await treeTokenInstance.ownerOf(12);

      assert.equal(addressGetToken2, giftee2, "2.mint not true");

      //////////--------------check provide status

      let genTree = await treeFactoryInstance.trees.call(11);

      assert.equal(Number(genTree.saleType), 0, "saleType is not correct");

      let genTree2 = await treeFactoryInstance.trees.call(12);

      assert.equal(Number(genTree2.saleType), 0, "saleType is not correct");

      //////////--------------check treeAttribute
      let treeAttribute = await treeAttributeInstance.treeAttributes(11);
      assert.equal(treeAttribute.exists, 1, "treeAttribute is not true update");

      let treeAttribute2 = await treeAttributeInstance.treeAttributes(12);
      assert.equal(
        treeAttribute2.exists,
        1,
        "treeAttribute is not true update"
      );

      //////// ----------------- check plnter fund after final claim

      const pFundFinalTree1 =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId1);

      const rFundFinalTree1 =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(
          treeId1
        );

      assert.equal(
        Number(pFundFinalTree1),
        Number(planterShareOfTree),
        "planter fund is not ok for tree1"
      );

      assert.equal(
        Number(rFundFinalTree1),
        Number(referralShareOfTree),
        "referral fund is not ok for tree1"
      );

      const pFundFinalTree2 =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId2);

      const rFundFinalTree2 =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(
          treeId2
        );

      assert.equal(
        Number(pFundFinalTree2),
        Number(planterShareOfTree),
        "planter fund is not ok for tree 2"
      );

      assert.equal(
        Number(rFundFinalTree2),
        Number(referralShareOfTree),
        "referral fund is not ok for tree2"
      );

      const pfTotalFundFinal = await planterFundsInstnce.totalBalances.call();

      assert.equal(
        Number(pfTotalFundFinal.planter),
        Math.mul(Number(planterShareOfTree), 2),
        "planter total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundFinal.ambassador),
        Math.mul(Number(referralShareOfTree), 2),
        "ambassador total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundFinal.localDevelopment),
        0,
        "local develop total fund is not ok"
      );

      //////////-------------- check event emitted

      truffleAssert.eventEmitted(eventTx1, "TreeClaimed", (ev) => {
        return Number(ev.treeId) == treeId1;
      });

      truffleAssert.eventEmitted(eventTx2, "TreeClaimed", (ev) => {
        return Number(ev.treeId) == treeId2;
      });
    });

    it("Should claimTree reject(expireDate reach)", async () => {
      const giftee1 = userAccount1;
      const symbol1 = 1234554321;

      const giftee2 = userAccount2;
      const symbol2 = 1234587543;

      const startTree = 11;
      const endTree = 13;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("14");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.days, 30);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      //////////--------------add giftee by admin

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
        from: dataManager,
      });

      await communityGiftsInstance.updateGiftees(giftee2, symbol2, {
        from: dataManager,
      });

      //////////-------------- fail because user not exist
      await communityGiftsInstance
        .claimTree({
          from: userAccount3,
        })
        .should.be.rejectedWith(CommunityGiftErrorMsg.USER_NOT_EXIST);

      //////////--------------claim tree by giftee1 for first time and it's not problem

      await communityGiftsInstance.claimTree({
        from: giftee1,
      });

      //////////-------------- fail becuase claimed before
      await communityGiftsInstance
        .claimTree({
          from: giftee1,
        })
        .should.be.rejectedWith(CommunityGiftErrorMsg.CLAIMED_BEFORE);

      //////////--------------time travel
      await Common.travelTime(TimeEnumes.days, 31);

      //////////--------------claim with expire date error

      await communityGiftsInstance
        .claimTree({
          from: giftee2,
        })
        .should.be.rejectedWith(CommunityGiftErrorMsg.EXPIREDATE_REACHED);
    });

    ////////////////////// -------------------------------- transfer tree ----------------------------------------

    it("1-should transferTree succesfully and check data to be ok", async () => {
      const giftee1 = userAccount1;
      const symbol1 = 1234554321;

      const startTree = 11;
      const endTree = 13;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("14");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.minutes, 1440);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      //////////--------------add giftee by admin

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
        from: dataManager,
      });

      let toClaimBefore = await communityGiftsInstance.toClaim.call();

      //////////--------------time travel
      await Common.travelTime(TimeEnumes.days, 31);

      ////////////// ----------- prepare for transfer
      const planterShareOfTree = web3.utils.toWei("4.9");
      const referralShareOfTree = web3.utils.toWei("2.1");

      await communityGiftsInstance.setPrice(
        planterShareOfTree,
        referralShareOfTree,
        { from: dataManager }
      );

      const treeId = startTree; //tree to be claimed

      ////////////// check planter fund values before claim
      const pFundBefore =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId);

      const rFundBefore =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(treeId);

      assert.equal(Number(pFundBefore), 0, "planter fund is not ok");

      assert.equal(Number(rFundBefore), 0, "referral fund is not ok");

      const pfTotalFundBefore = await planterFundsInstnce.totalBalances.call();

      assert.equal(
        Number(pfTotalFundBefore.planter),
        0,
        "planter total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundBefore.ambassador),
        0,
        "ambassador total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundBefore.localDevelopment),
        0,
        "local develop total fund is not ok"
      );

      //////////--------------call transferTree by admin(owner=>userAccount3)

      let eventTx1 = await communityGiftsInstance.transferTree(
        userAccount3,
        1234554321,
        {
          from: dataManager,
        }
      );

      let toClaimAfter = await communityGiftsInstance.toClaim.call();

      assert.equal(
        Number(toClaimAfter),
        Number(toClaimBefore) + 1,
        "1.claimedCount not true updated"
      );

      //////////--------------check tree owner
      let addressGetToken = await treeTokenInstance.ownerOf(treeId);

      assert.equal(addressGetToken, userAccount3, "1.mint not true");

      //////////--------------check provide status

      let genTree = await treeFactoryInstance.trees.call(treeId);

      assert.equal(Number(genTree.saleType), 0, "saleType is not correct");

      //////////--------------check treeAttribute
      let treeAttribute = await treeAttributeInstance.treeAttributes(treeId);
      assert.equal(treeAttribute.exists, 1, "treeAttribute is not true update");

      ////////////// check planter fund values after transfer
      const pFundAfter =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId);

      const rFundAfter =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(treeId);

      assert.equal(
        Number(pFundAfter),
        Number(planterShareOfTree),
        "planter fund is not ok"
      );

      assert.equal(
        Number(rFundAfter),
        Number(referralShareOfTree),
        "referral fund is not ok"
      );

      const pfTotalFundAfter = await planterFundsInstnce.totalBalances.call();

      assert.equal(
        Number(pfTotalFundAfter.planter),
        Number(planterShareOfTree),
        "planter total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundAfter.ambassador),
        Number(referralShareOfTree),
        "ambassador total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundAfter.localDevelopment),
        0,
        "local develop total fund is not ok"
      );

      //////////-------------- check event emitted

      truffleAssert.eventEmitted(eventTx1, "TreeTransfered", (ev) => {
        return Number(ev.treeId) == 11;
      });
    });

    it("2-should transferTree succesfully and check data to be ok", async () => {
      const giftee1 = userAccount1;
      const giftee2 = userAccount2;
      const symbol1 = 1234554321;
      const symbol2 = 1234567890;

      const startTree = 11;
      const endTree = 15;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("28");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.minutes, 1440);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      //////////--------------add giftee by admin

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
        from: dataManager,
      });

      await communityGiftsInstance.updateGiftees(giftee2, symbol2, {
        from: dataManager,
      });

      let toClaimBefore = await communityGiftsInstance.toClaim.call();

      //////////--------------time travel
      await Common.travelTime(TimeEnumes.days, 31);

      ////////////// ----------- prepare for transfer
      const planterShareOfTree = web3.utils.toWei("4.9");
      const referralShareOfTree = web3.utils.toWei("2.1");

      await communityGiftsInstance.setPrice(
        planterShareOfTree,
        referralShareOfTree,
        { from: dataManager }
      );

      const treeId1 = startTree;
      const treeId2 = startTree + 1;

      //////// ----------------- check plnter fund before transfer

      const pFundBeforeTree1 =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId1);

      const rFundBeforeTree1 =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(
          treeId1
        );

      assert.equal(
        Number(pFundBeforeTree1),
        0,
        "planter fund is not ok for tree1"
      );

      assert.equal(
        Number(rFundBeforeTree1),
        0,
        "referral fund is not ok for tree1"
      );

      const pFundBeforeTree2 =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId2);

      const rFundBeforeTree2 =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(
          treeId2
        );

      assert.equal(
        Number(pFundBeforeTree2),
        0,
        "planter fund is not ok for tree2"
      );

      assert.equal(
        Number(rFundBeforeTree2),
        0,
        "referral fund is not ok for tree 2"
      );

      const pfTotalFundBefore = await planterFundsInstnce.totalBalances.call();

      assert.equal(
        Number(pfTotalFundBefore.planter),
        0,
        "planter total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundBefore.ambassador),
        0,
        "ambassador total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundBefore.localDevelopment),
        0,
        "local develop total fund is not ok"
      );

      //////////--------------call transferTree by admin(owner=>userAccount3)

      const eventTx1 = await communityGiftsInstance.transferTree(
        userAccount3,
        symbol1,
        {
          from: dataManager,
        }
      );

      const toClaimAfter1 = await communityGiftsInstance.toClaim.call();

      //////// ----------------- check plnter fund after transfer11

      const pFundAfterTree1 =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId1);

      const rFundAfterTree1 =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(
          treeId1
        );

      assert.equal(
        Number(pFundAfterTree1),
        Number(planterShareOfTree),
        "planter fund is not ok for tree1"
      );

      assert.equal(
        Number(rFundAfterTree1),
        Number(referralShareOfTree),
        "referral fund is not ok for tree1"
      );

      const pfTotalFundAfterTree1 =
        await planterFundsInstnce.totalBalances.call();

      assert.equal(
        Number(pfTotalFundAfterTree1.planter),
        Number(planterShareOfTree),
        "planter total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundAfterTree1.ambassador),
        Number(referralShareOfTree),
        "ambassador total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundAfterTree1.localDevelopment),
        0,
        "local develop total fund is not ok"
      );

      //////////--------------call transferTree by admin(owner=>userAccount4)

      const eventTx2 = await communityGiftsInstance.transferTree(
        userAccount4,
        symbol2,
        {
          from: dataManager,
        }
      );
      const toClaimAfter2 = await communityGiftsInstance.toClaim.call();

      assert.equal(
        Number(toClaimAfter1),
        Number(toClaimBefore) + 1,
        "1.claimedCount not true updated"
      );

      assert.equal(
        Number(toClaimAfter2),
        Number(toClaimBefore) + 2,
        "1.claimedCount not true updated"
      );

      //////////--------------check tree owner
      let addressGetToken1 = await treeTokenInstance.ownerOf(treeId1);
      let addressGetToken2 = await treeTokenInstance.ownerOf(treeId2);

      assert.equal(addressGetToken1, userAccount3, "1.mint not true");

      assert.equal(addressGetToken2, userAccount4, "1.mint not true");

      //////////--------------check provide status

      let genTree1 = await treeFactoryInstance.trees.call(treeId1);
      let genTree2 = await treeFactoryInstance.trees.call(treeId2);

      assert.equal(Number(genTree1.saleType), 0, "saleType is not correct");

      assert.equal(Number(genTree2.saleType), 0, "saleType is not correct");

      //////////--------------check treeAttribute
      let treeAttribute1 = await treeAttributeInstance.treeAttributes(treeId1);
      let treeAttribute2 = await treeAttributeInstance.treeAttributes(treeId2);

      assert.equal(
        treeAttribute1.exists,
        1,
        "treeAttribute is not true update"
      );
      assert.equal(
        treeAttribute2.exists,
        1,
        "treeAttribute is not true update"
      );

      //////// ----------------- check plnter fund after both transfer

      const pFundFinalTree1 =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId1);

      const rFundFinalTree1 =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(
          treeId1
        );

      assert.equal(
        Number(pFundFinalTree1),
        Number(planterShareOfTree),
        "planter fund is not ok for tree1"
      );

      assert.equal(
        Number(rFundFinalTree1),
        Number(referralShareOfTree),
        "referral fund is not ok for tree1"
      );

      const pFundFinalTree2 =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId2);

      const rFundFinalTree2 =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(
          treeId2
        );

      assert.equal(
        Number(pFundFinalTree2),
        Number(planterShareOfTree),
        "planter fund is not ok for tree2"
      );

      assert.equal(
        Number(rFundFinalTree2),
        Number(referralShareOfTree),
        "referral fund is not ok for tree 2"
      );

      const pfTotalFundFinal = await planterFundsInstnce.totalBalances.call();

      assert.equal(
        Number(pfTotalFundFinal.planter),
        Math.mul(Number(planterShareOfTree), 2),
        "planter total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundFinal.ambassador),
        Math.mul(Number(referralShareOfTree), 2),
        "ambassador total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundBefore.localDevelopment),
        0,
        "local develop total fund is not ok"
      );

      //////////-------------- check event emitted

      truffleAssert.eventEmitted(eventTx1, "TreeTransfered", (ev) => {
        return Number(ev.treeId) == treeId1;
      });

      truffleAssert.eventEmitted(eventTx2, "TreeTransfered", (ev) => {
        return Number(ev.treeId) == treeId2;
      });
    });

    it("Should transferTree succuss (symbol not assigned to anyone)", async () => {
      //////////--------------add giftee by admin
      const startTree = 11;
      const endTree = 13;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("14");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.days, 30);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      //////////--------------add giftee by admin

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      //////////--------------time travel
      await Common.travelTime(TimeEnumes.days, 31);

      //////////--------------call transferTree by user
      await communityGiftsInstance.transferTree(userAccount3, 1234554321, {
        from: dataManager,
      });
    });

    it("Should transferTree success (symbol assinged but not claimed)", async () => {
      const giftee1 = userAccount1;
      const symbol1 = 1234554321;

      const startTree = 11;
      const endTree = 13;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("14");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.days, 30);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      //////////--------------add giftee by admin

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
        from: dataManager,
      });

      ////////////// ----------- prepare for transfer
      const planterShareOfTree = web3.utils.toWei("4.9");
      const referralShareOfTree = web3.utils.toWei("2.1");

      await communityGiftsInstance.setPrice(
        planterShareOfTree,
        referralShareOfTree,
        { from: dataManager }
      );

      //////////--------------time travel
      await Common.travelTime(TimeEnumes.days, 31);

      //////////--------------call transferTree by admin(owner=>userAccount3)

      await communityGiftsInstance.transferTree(userAccount3, 1234554321, {
        from: dataManager,
      });
    });

    // it("Should transferTree reject (only admin call)", async () => {
    //   const giftee1 = userAccount1;
    //   const symbol1 = 1234554321;
    //   const startTree = 11;
    //   const endTree = 13;
    //   const planterShare = web3.utils.toWei("5");
    //   const referralShare = web3.utils.toWei("2");
    //   const transferAmount = web3.utils.toWei("14");
    //   const adminWallet = userAccount8;
    //   const expireDate = await Common.timeInitial(TimeEnumes.days, 30);

    //   ///////---------------- handle admin walllet

    //   await daiInstance.setMint(adminWallet, transferAmount);

    //   await daiInstance.approve(
    //     communityGiftsInstance.address,
    //     transferAmount,
    //     {
    //       from: adminWallet,
    //     }
    //   );

    //   //////////--------------add giftee by admin

    //   await communityGiftsInstance.setGiftsRange(
    //     startTree,
    //     endTree,
    //     planterShare,
    //     referralShare,
    //     Number(expireDate),
    //     adminWallet,
    //     {
    //       from: dataManager,
    //     }
    //   );

    //   await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
    //     from: dataManager,
    //   });

    //   //////////--------------time travel
    //   await Common.travelTime(TimeEnumes.days, 31);

    //   ////////////// ----------- prepare for transfer
    //   const planterShareOfTree = web3.utils.toWei("4.9");
    //   const referralShareOfTree = web3.utils.toWei("2.1");

    //   await communityGiftsInstance.setPrice(
    //     planterShareOfTree,
    //     referralShareOfTree,
    //     { from: dataManager }
    //   );

    // });

    it("Should transferTree reject (expireDate not reach)", async () => {
      const giftee1 = userAccount1;
      const symbol1 = 1234554321;

      const startTree = 11;
      const endTree = 13;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("14");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.days, 30);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      //////////--------------add giftee by admin

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
        from: dataManager,
      });

      ////////////// ----------- prepare for transfer
      const planterShareOfTree = web3.utils.toWei("4.9");
      const referralShareOfTree = web3.utils.toWei("2.1");

      await communityGiftsInstance.setPrice(
        planterShareOfTree,
        referralShareOfTree,
        { from: dataManager }
      );

      //////////--------------expire time does not reach
      await communityGiftsInstance
        .transferTree(userAccount3, 1234554321, {
          from: dataManager,
        })
        .should.be.rejectedWith(CommunityGiftErrorMsg.EXPIREDATE_NOT_REACHED);
    });

    it("1-Should transferTree reject (maximum reached)", async () => {
      const giftee1 = userAccount1;
      const symbol1 = 1234554321;

      const giftee2 = userAccount2;
      const symbol2 = 1234554322;

      const startTree = 11;
      const endTree = 13;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("14");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.days, 30);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      //////////--------------add giftee by admin

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
        from: dataManager,
      });

      await communityGiftsInstance.updateGiftees(giftee2, symbol2, {
        from: dataManager,
      });

      ////////////// ----------- prepare for transfer
      const planterShareOfTree = web3.utils.toWei("4.9");
      const referralShareOfTree = web3.utils.toWei("2.1");

      await communityGiftsInstance.setPrice(
        planterShareOfTree,
        referralShareOfTree,
        { from: dataManager }
      );

      //////////-------------- transfer tree faild caller is not data manager
      await communityGiftsInstance
        .transferTree(userAccount3, symbol1, {
          from: userAccount3,
        })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_DATA_MANAGER);

      ///////////// ----------------- fail expire time dont reach

      await communityGiftsInstance
        .transferTree(userAccount3, symbol1, {
          from: dataManager,
        })
        .should.be.rejectedWith(CommunityGiftErrorMsg.EXPIREDATE_NOT_REACHED);

      await communityGiftsInstance.claimTree({
        from: giftee1,
      });

      await communityGiftsInstance.claimTree({
        from: giftee2,
      });

      //////////--------------time travel
      await Common.travelTime(TimeEnumes.days, 31);

      let now = new Date().getTime();

      await communityGiftsInstance
        .setExpireDate(now, { from: dataManager })
        .should.be.rejectedWith(CommunityGiftErrorMsg.CANT_UPDATE_EXPIRE_DATE);

      //////////--------------call transferTree by admin(owner=>userAccount3)

      await communityGiftsInstance
        .transferTree(userAccount3, 322, {
          from: dataManager,
        })
        .should.be.rejectedWith(CommunityGiftErrorMsg.TREE_IS_NOT_FOR_GIFT);
    });

    it("2-Should transferTree reject (maximum reached)", async () => {
      const giftee1 = userAccount1;
      const symbol1 = 1234554321;

      const giftee2 = userAccount2;
      const symbol2 = 1234554322;

      const startTree = 11;
      const endTree = 13;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("14");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.days, 30);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      //////////--------------add giftee by admin

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
        from: dataManager,
      });

      await communityGiftsInstance.updateGiftees(giftee2, symbol2, {
        from: dataManager,
      });

      ////////////// ----------- prepare for transfer
      const planterShareOfTree = web3.utils.toWei("4.9");
      const referralShareOfTree = web3.utils.toWei("2.1");

      await communityGiftsInstance.setPrice(
        planterShareOfTree,
        referralShareOfTree,
        { from: dataManager }
      );

      await communityGiftsInstance.claimTree({
        from: giftee1,
      });

      //////////--------------time travel
      await Common.travelTime(TimeEnumes.days, 31);

      //////////// ---------------- fail symbol claimed before
      await communityGiftsInstance
        .transferTree(userAccount3, symbol1, {
          from: dataManager,
        })
        .should.be.rejectedWith(TreeAttributeErrorMsg.ATTRIBUTE_TAKEN);

      await communityGiftsInstance.transferTree(giftee2, symbol2, {
        from: dataManager,
      });

      //////////--------------call transferTree by admin(owner=>userAccount3)

      await communityGiftsInstance
        .transferTree(userAccount3, 322, {
          from: dataManager,
        })
        .should.be.rejectedWith(CommunityGiftErrorMsg.TREE_IS_NOT_FOR_GIFT);
    });
  });
});
