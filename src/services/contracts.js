import { ethers } from 'ethers';
import { walletState } from './wallet';
import { APP_ENV } from './environment'; // Import from the new centralized file
import { toRaw } from 'vue';
import { showToast } from '../services/notification';
import { t } from '../i18n';

// --- Helper to get USDT decimals based on environment ---
export const getUsdtDecimals = () => {
  // Both Production and Development environments use 18 decimals for USDT
  return 18;
};

// --- Import ABIs ---
import referralAbi from '../abis/referral.json';
// Import different staking ABIs based on environment
import stakingAbiTest from '../abis/staking_test.json';
import stakingAbiMain from '../abis/staking_main.json';
import athAbi from '../abis/ath.json';
import s5poolAbi from '../abis/s5pool.json';
import s6poolAbi from '../abis/s6pool.json';
import s7poolAbi from '../abis/s7pool.json';
import nodeDividendPoolAbi from '../abis/node_dividend_pool.json';
import crashAbi from '../abis/crash.json';
import bankerPoolAbi from '../abis/bankerpool.json';
import gameLevelAbi from '../abis/game_level.json';
import athpAbi from '../abis/athp.json';
import stakingWelfareAbi from '../abis/stakingWelfare.json';
// No need for a separate USDT ABI if it follows ERC20 standard like `ath.json`
// import usdtAbi from '../abis/usdt.json';

// Select staking ABI based on environment
const stakingAbi = APP_ENV === 'PROD' ? stakingAbiMain : stakingAbiTest;

const uniswapV2RouterAbi = [
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
];

// --- Contract Addresses ---
export const contractAddresses = {
  referral: {
    production: '0x3E6F4149Ca9217642F8848c5a2BD79BB97B30A4E',
    development: '0x1Ad59D67a7D413b0F053d33cf4Ec1FC92190C83A',
  },
  staking: {
    production: '0x56214003629E7162eC8Eda8C5aC5c5a693929b3A',
    development: '0xDc582d3439a17115Ddf8288ED9BD86f37846394B',
  },
  ath: {
    production: '0x0A8cdD89e99E6921595beB032b8Cb8e8314bf310',
    development: '0x28C465A59EE6470f76581186a1E9E8205Ed11276',
  },
  usdt: {
    production: '0x55d398326f99059fF775485246999027B3197955', // BNB Mainnet USDT
    development: '0xaE36d423c5B05f80926AaEAE0Fca978A74C0aA01', // BNB Testnet USDT
  },
  router: {
    production: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap Router V2 on BNB Mainnet
    development: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1', // PancakeSwap Router V2 on BNB Testnet
  },
  s5pool: {
    production: '0x01EAb616Fbd39404CE8C3944928CecE8ab8887c1',
    development: '0xb65b398eB4d9FcAeaC8046A3c9Eb84d4eA60ed2d',
  },
  s6pool: {
    production: '0xd90cB1D8DC0981655FEB8c129dD72aF11a15993C',
    development: '0xa28CC3Ea8E349c41bfDd4eE84d99C224e31620c9',
  },
  s7pool: {
    production: '0xCbE399196541D600dE6eB23A6A8365F697E4e3fb',
    development: '0x1041DDd9585387BC4Aad8bc914db26d1FBbf2D00',
  },
  lp: {
    production: '0x9D673fDCD92fF174B669A23403bd86f59d6ac459',
    development: '0xcC24F978082277ABc2c5c5C4e5FB38a412e7F55A', // USDT-ATH LP
  },
  nodeDividendPool: {
    production: '0x2547A4b83BEFFC6d73656C918aA6d4f6dE00b034',
    development: '0x3F4E253D329C767293F0B50670882Eb3761a6989',
  },
  crash: {
    production: '0x15bD75bCb8f23a310230817A54c0Cc24DE782c2D',
    development: '0x756cb7FdC2Df93b78E012E4229F3a8c9c6432c07',
  },
  bankerPool: {
    production: '0x39616E1B408cd882C51BE664Ea751FFE57198f64',
    development: '0x4a8b912526724da4eC1974720e70196C7d6823eb',
  },
  gameLevel: {
    production: '0x16Cbc3A7b858d3C5715C45Ab15D20cb71A598FbA',
    development: '0xE46055144B3E2EabC06935b0Bf245AA846c9061f',
  },
  ATHP: {
    production: '0xE1940F9641Bd549d5DFF9305Bf87a22239640Bbe',
    development: '0x21C95Ca4e64aA0B49242cc6E7c96BDf8B3a2d41F',
  },
  StakingWelfare: {
    production: '0xecC2403A9e1c52A5C5880054a971e6f584e6Cc23',
    development: '0x38cC750ecd51fcF8a48760c8d5512F88936f5CC4',
  }
};

// --- Contract Instances ---
let referralContract;
let stakingContract;
let athContract;
let usdtContract;
let routerContract;
let s5poolContract;
let s6poolContract;
let s7poolContract;
let nodeDividendPoolContract;
let crashContract;
let bankerPoolContract;
let gameLevelContract;
let athpContract;
let stakingWelfareContract;

// We need to export these for other modules to use them.
export { referralContract, stakingContract, athContract, usdtContract, s5poolContract, s6poolContract, s7poolContract, nodeDividendPoolContract, crashContract, bankerPoolContract, gameLevelContract, athpContract, stakingWelfareContract };

// --- KPI Thresholds (as per Staking.sol) ---
const THRESHOLDS = {
  production: {
    S1: 3000n * (10n ** 18n),      // 3,000 USDT value
    S2: 30000n * (10n ** 18n),     // 30,000 USDT value
    S3: 100000n * (10n ** 18n),    // 100,000 USDT value
    S4: 500000n * (10n ** 18n),    // 500,000 USDT value
    S5: 1000000n * (10n ** 18n),   // 1 Million USDT value
    S6: 3000000n * (10n ** 18n),   // 3 Million USDT value
    S7: 5000000n * (10n ** 18n),   // 5 Million USDT value
  },
  development: {
    S1: 3000n * (10n ** 18n),      // Test: 3,000 USDT value
    S2: 6000n * (10n ** 18n),      // Test: 6,000 USDT value
    S3: 9000n * (10n ** 18n),      // Test: 9,000 USDT value
    S4: 12000n * (10n ** 18n),     // Test: 12,000 USDT value
    S5: 15000n * (10n ** 18n),     // Test: 15,000 USDT value
    S6: 18000n * (10n ** 18n),     // Test: 18,000 USDT value
    S7: 21000n * (10n ** 18n),     // Test: 21,000 USDT value
  }
};

const env = APP_ENV === 'PROD' ? 'production' : 'development';

export const S1_THRESHOLD = THRESHOLDS[env].S1;
export const S2_THRESHOLD = THRESHOLDS[env].S2;
export const S3_THRESHOLD = THRESHOLDS[env].S3;
export const S4_THRESHOLD = THRESHOLDS[env].S4;
export const S5_THRESHOLD = THRESHOLDS[env].S5;
export const S6_THRESHOLD = THRESHOLDS[env].S6;
export const S7_THRESHOLD = THRESHOLDS[env].S7;


/**
 * Initializes all contract instances with the current signer from walletState.
 * This should be called after a successful wallet connection.
 */
export const initializeContracts = async () => {
  const rawSigner = toRaw(walletState.signer);
  if (!rawSigner) {
    console.warn("Cannot initialize contracts without a signer.");
    return;
  }

  const env = APP_ENV === 'PROD' ? 'production' : 'development';

  console.log(`Initializing contracts for ${env} environment.`);

  // Get addresses for the current environment
  const referralAddress = contractAddresses.referral[env];
  const stakingAddress = contractAddresses.staking[env];
  const athAddress = contractAddresses.ath[env];
  const usdtAddress = contractAddresses.usdt[env];
  const routerAddress = contractAddresses.router[env];
  const s5poolAddress = contractAddresses.s5pool[env];
  const s6poolAddress = contractAddresses.s6pool[env];
  const s7poolAddress = contractAddresses.s7pool[env];
  const nodeDividendPoolAddress = contractAddresses.nodeDividendPool[env];
  const crashAddress = contractAddresses.crash[env];
  const bankerPoolAddress = contractAddresses.bankerPool[env];
  const gameLevelAddress = contractAddresses.gameLevel[env];
  const athpAddress = contractAddresses.ATHP[env];
  const stakingWelfareAddress = contractAddresses.StakingWelfare[env];

  // Helper to safely create contract
  const createContract = (address, abi, signer) => {
      if (!address) return null;
      try {
          return new ethers.Contract(address, abi, signer);
      } catch (e) {
          console.error(`Failed to create contract instance for ${address}`, e);
          return null;
      }
  };

  // Create new contract instances using the raw, unwrapped signer
  referralContract = createContract(referralAddress, referralAbi, rawSigner);
  stakingContract = createContract(stakingAddress, stakingAbi, rawSigner);
  athContract = createContract(athAddress, athAbi, rawSigner);
  usdtContract = createContract(usdtAddress, athAbi, rawSigner);
  routerContract = createContract(routerAddress, uniswapV2RouterAbi, rawSigner);
  s5poolContract = createContract(s5poolAddress, s5poolAbi, rawSigner);
  s6poolContract = createContract(s6poolAddress, s6poolAbi, rawSigner);
  s7poolContract = createContract(s7poolAddress, s7poolAbi, rawSigner);
  nodeDividendPoolContract = createContract(nodeDividendPoolAddress, nodeDividendPoolAbi, rawSigner);
  crashContract = createContract(crashAddress, crashAbi, rawSigner);
  bankerPoolContract = createContract(bankerPoolAddress, bankerPoolAbi, rawSigner);
  gameLevelContract = createContract(gameLevelAddress, gameLevelAbi, rawSigner);
  athpContract = createContract(athpAddress, athpAbi, rawSigner);
  stakingWelfareContract = createContract(stakingWelfareAddress, stakingWelfareAbi, rawSigner);

  console.log("Contracts initialized:", {
    referral: referralContract ? await referralContract.getAddress() : 'Not Initialized',
    staking: stakingContract ? await stakingContract.getAddress() : 'Not Initialized',
    ath: athContract ? await athContract.getAddress() : 'Not Initialized',
    usdt: usdtContract ? await usdtContract.getAddress() : 'Not Initialized',
    router: routerContract ? await routerContract.getAddress() : 'Not Initialized',
    s5pool: s5poolContract ? await s5poolContract.getAddress() : 'Not Initialized',
    s6pool: s6poolContract ? await s6poolContract.getAddress() : 'Not Initialized',
    s7pool: s7poolContract ? await s7poolContract.getAddress() : 'Not Initialized',
    nodeDividendPool: nodeDividendPoolContract ? await nodeDividendPoolContract.getAddress() : 'Not Initialized',
    crash: crashContract ? await crashContract.getAddress() : 'Not Initialized',
    bankerPool: bankerPoolContract ? await bankerPoolContract.getAddress() : 'Not Initialized',
    gameLevel: gameLevelContract ? await gameLevelContract.getAddress() : 'Not Initialized',
    athp: athpContract ? await athpContract.getAddress() : 'Not Initialized',
    stakingWelfare: stakingWelfareContract ? await stakingWelfareContract.getAddress() : 'Not Initialized',
  });

  walletState.contractsInitialized = true;
  console.log("[合约] 初始化成功, contractsInitialized 状态已更新为 true");
};

/**
 * Resets all contract instances.
 * This should be called on wallet disconnection or account change.
 */
export const resetContracts = () => {
  referralContract = null;
  stakingContract = null;
  athContract = null;
  usdtContract = null;
  routerContract = null;
  s5poolContract = null;
  s6poolContract = null;
  s7poolContract = null;
  nodeDividendPoolContract = null;
  crashContract = null;
  bankerPoolContract = null;
  gameLevelContract = null;
  athpContract = null;
  stakingWelfareContract = null;
  console.log("Contract instances have been reset.");
};

/**
 * Fetches the user's raw team KPI as a BigInt for comparisons.
 * @returns {Promise<bigint>} The user's team KPI as a BigInt.
 */
export const getTeamKpiBigNumber = async () => {
    if (!stakingContract || !walletState.address) {
        console.warn("Staking contract not initialized or user not connected.");
        return 0n;
    }
    try {
        return await stakingContract.getTeamKpi(walletState.address);
    } catch (error) {
        console.error("Error fetching team KPI BigNumber:", error);
        return 0n;
    }
};


/**
 * Fetches the total real-time value (principal + interest) of the current user's stakes.
 * @returns {Promise<string>} The user's total staked value, formatted as a string.
 */
export const getUserStakedBalance = async () => {
  if (!stakingContract || !walletState.address) {
    console.warn("Staking contract not initialized or user not connected.");
    return "0";
  }
  try {
    // Call the balanceOf method to get the user's total staked value (principal + interest).
    const totalValue = await stakingContract.balanceOf(walletState.address);
    // Format from Wei to standard unit
    const formattedValue = ethers.formatUnits(totalValue, 18); // Assuming 18 decimals
    // console.log(`获取到用户质押总价值: ${formattedValue}`);
    return formattedValue;
  } catch (error) {
    console.error("Error fetching staked balance:", error);
    return "0";
  }
};

/**
 * Fetches the total real-time value (principal + interest) of a specific user's stakes.
 * @param {string} address The user address to query.
 * @returns {Promise<string>} The user's total staked value, formatted as a string.
 */
export const getUserStakedBalanceByAddress = async (address) => {
  if (!stakingContract) {
    console.warn("Staking contract not initialized.");
    return "0";
  }
  if (!address) {
    console.warn("Address not provided for getUserStakedBalanceByAddress.");
    return "0";
  }
  try {
    const totalValue = await stakingContract.balanceOf(address);
    const formattedValue = ethers.formatUnits(totalValue, 18); // Assuming 18 decimals
    return formattedValue;
  } catch (error) {
    console.error(`Error fetching staked balance for address ${address}:`, error);
    return "0";
  }
};

/**
 * Fetches the team KPI (friends boost) for the current user.
 * @returns {Promise<string>} The user's team KPI, formatted as a string.
 */
export const getFriendsBoost = async () => {
  if (!stakingContract || !walletState.address) {
    console.warn("Staking contract not initialized or user not connected.");
    return "0";
  }
  try {
    // Call the getTeamKpi method to get the user's total team performance.
    const kpi = await stakingContract.getTeamKpi(walletState.address);
    // Format from Wei to standard unit
    const formattedKpi = ethers.formatUnits(kpi, 18); // Assuming 18 decimals
    // console.log(`获取到好友助力值 (团队KPI): ${formattedKpi}`);
    return formattedKpi;
  } catch (error) {
    console.error("Error fetching friends boost (team KPI):", error);
    return "0";
  }
};

/**
 * Fetches the team KPI for a specific address.
 * @param {string} address The user address to query.
 * @returns {Promise<string>} The user's team KPI, formatted as a string.
 */
export const getTeamKpiByAddress = async (address) => {
  if (!stakingContract) {
    console.warn("Staking contract not initialized.");
    return "0";
  }
  if (!address) {
    console.warn("Address not provided for getTeamKpiByAddress.");
    return "0";
  }
  try {
    const kpi = await stakingContract.getTeamKpi(address);
    // Format from Wei to standard unit
    const formattedKpi = ethers.formatUnits(kpi, 18); // Assuming 18 decimals
    return formattedKpi;
  } catch (error) {
    console.error(`Error fetching team KPI for address ${address}:`, error);
    return "0";
  }
};

/**
 * Generic function to fetch pending rewards from a pool contract.
 * @param {ethers.Contract} poolContract The contract instance (e.g., s5poolContract).
 * @returns {Promise<string>} Formatted pending rewards.
 */
const getPendingRewards = async (poolContract) => {
    if (!poolContract || !walletState.address) {
        // This is a normal state if contracts are not yet initialized, so using console.log
        // console.log("Pool contract not initialized or user not connected for rewards check.");
        return "0";
    }
    try {
        const env = APP_ENV === 'PROD' ? 'production' : 'development';
        const athAddress = contractAddresses.ath[env];

        // The correct function name from the ABI is getTokenRewards
        const rewards = await poolContract.getTokenRewards(walletState.address, athAddress);
        return ethers.formatUnits(rewards, 18);
    } catch (error) {
        console.error(`Error fetching pending rewards from ${await poolContract.getAddress()}:`, error);
        return "0";
    }
};

/**
 * Fetches pending rewards from the S5 pool for the current user.
 * @returns {Promise<string>} Formatted S5 pending rewards.
 */
export const getS5PendingRewards = async () => getPendingRewards(s5poolContract);

/**
 * Fetches pending rewards from the S6 pool for the current user.
 * @returns {Promise<string>} Formatted S6 pending rewards.
 */
export const getS6PendingRewards = async () => getPendingRewards(s6poolContract);

/**
 * Fetches pending rewards from the S7 pool for the current user.
 * @returns {Promise<string>} Formatted S7 pending rewards.
 */
export const getS7PendingRewards = async () => getPendingRewards(s7poolContract);


/**
 * Generic function to claim rewards from a pool contract.
 * @param {ethers.Contract} poolContract The contract instance (e.g., s5poolContract).
 * @returns {Promise<boolean>} True if the claim was successful.
 */
const claimRewards = async (poolContract) => {
    if (!poolContract || !walletState.address) {
        showToast(t('toast.poolNotInitialized'));
        return false;
    }
    try {
        const env = APP_ENV === 'PROD' ? 'production' : 'development';
        const athAddress = contractAddresses.ath[env];

        // The claim function from the ABI is harvest(tokenAddress)
        const tx = await poolContract.harvest(athAddress);
        showToast(t('toast.txSent'));
        await tx.wait();
        showToast(t('toast.claimSuccess'));
        return true;
    } catch (error) {
        if (error.code === 'ACTION_REJECTED') {
            console.log("User rejected the transaction.");
            // No toast for user rejection
        } else {
            console.error(`Error claiming rewards from ${await poolContract.getAddress()}:`, error);
            showToast(t('toast.claimFailed', { reason: error.reason || error.message || 'Unknown error' }));
        }
        return false;
    }
};

/**
 * Claims rewards from the S5 pool.
 * @returns {Promise<boolean>} True if successful.
 */
export const claimS5Rewards = async () => claimRewards(s5poolContract);

/**
 * Claims rewards from the S6 pool.
 * @returns {Promise<boolean>} True if successful.
 */
export const claimS6Rewards = async () => claimRewards(s6poolContract);

/**
 * Claims rewards from the S7 pool.
 * @returns {Promise<boolean>} True if successful.
 */
export const claimS7Rewards = async () => claimRewards(s7poolContract);

/**
 * Fetches pending rewards from the Node Dividend Pool for the current user (USDT).
 * @returns {Promise<string>} Formatted Dividend Point pending rewards (USDT).
 */
export const getDividendPointRewards = async () => {
    if (!nodeDividendPoolContract || !walletState.address) {
        return "0";
    }
    try {
        const env = APP_ENV === 'PROD' ? 'production' : 'development';
        const usdtAddress = contractAddresses.usdt[env];
        const rewards = await nodeDividendPoolContract.getTokenRewards(walletState.address, usdtAddress);
        return ethers.formatUnits(rewards, 18); // USDT has 18 decimals in this project
    } catch (error) {
        console.error(`Error fetching pending dividend point rewards from ${await nodeDividendPoolContract.getAddress()}:`, error);
        return "0";
    }
};

/**
 * Claims rewards from the Node Dividend Pool (USDT).
 * @returns {Promise<boolean>} True if successful.
 */
export const claimDividendPointRewards = async () => {
    if (!nodeDividendPoolContract || !walletState.address) {
        showToast(t('toast.poolNotInitialized'));
        return false;
    }
    try {
        const env = APP_ENV === 'PROD' ? 'production' : 'development';
        const usdtAddress = contractAddresses.usdt[env];
        
        // Pre-check: user must be a preacher
        const isPreacher = await checkIsPreacher();
        if (!isPreacher) {
             showToast(t('toast.stake200Tokens'));
             return false;
        }

        const tx = await nodeDividendPoolContract.harvest(usdtAddress);
        showToast(t('toast.txSent'));
        await tx.wait();
        showToast(t('toast.claimSuccess'));
        return true;
    } catch (error) {
        if (error.code === 'ACTION_REJECTED') {
            console.log("User rejected the dividend point claim transaction.");
        } else {
            console.error(`Error claiming dividend point rewards from ${await nodeDividendPoolContract.getAddress()}:`, error);
            showToast(t('toast.claimFailed', { reason: error.reason || error.message || 'Unknown error' }));
        }
        return false;
    }
};

/**
 * Checks if the current user is a "Preacher" based on the staking contract.
 * @returns {Promise<boolean>} True if the user is a preacher, false otherwise.
 */
export const checkIsPreacher = async () => {
    if (!stakingContract || !walletState.address) {
        console.warn("Staking contract not initialized or user not connected for isPreacher check.");
        return false;
    }
    try {
        return await stakingContract.isPreacher(walletState.address);
    } catch (error) {
        console.error("Error checking isPreacher status:", error);
        return false;
    }
};

/**
 * Fetches the user's total principal staked balance (excluding interest).
 * @returns {Promise<string>} The user's total principal, formatted as a string.
 */
export const getUserPrincipalBalance = async () => {
  if (!stakingContract || !walletState.address) {
    console.warn("Staking contract not initialized or user not connected.");
    return "0";
  }
  try {
    const principal = await stakingContract.balances(walletState.address);
    // Assuming 18 decimals for the principal amount, similar to other values.
    const formattedPrincipal = ethers.formatUnits(principal, 18);
    return formattedPrincipal;
  } catch (error) {
    console.error("Error fetching user principal balance:", error);
    return "0";
  }
};

/**
 * Checks all reward pools to see if the user has any pending rewards.
 * Updates the global walletState.hasClaimableRewards.
 * @returns {Promise<boolean>} True if there are any claimable rewards.
 */
export const checkAllClaimableRewards = async () => {
    if (!walletState.isAuthenticated || !walletState.contractsInitialized) {
        walletState.hasClaimableRewards = false;
        return false;
    }
    try {
        // We can run these checks in parallel for performance
        const [s5, s6, s7] = await Promise.all([
            getS5PendingRewards(),
            getS6PendingRewards(),
            getS7PendingRewards(),
        ]);

        const hasRewards = parseFloat(s5) > 0 || parseFloat(s6) > 0 || parseFloat(s7) > 0;
        walletState.hasClaimableRewards = hasRewards;
        console.log(`[小红点检查] 检查完成. 是否有奖励可领: ${hasRewards}`);
        return hasRewards;
    } catch (error) {
        console.error("[小红点检查] 检查可领奖励时出错:", error);
        walletState.hasClaimableRewards = false;
        return false;
    }
};


export const getUserStakingData = async () => {
  if (!stakingContract || !walletState.address) {
    console.warn("Staking contract not initialized or user not connected.");
    return [];
  }
  // console.log(`[质押列表] 开始获取数据, 用户地址: ${walletState.address}`);

  try {
    const count = await stakingContract.stakeCount(walletState.address);
    const stakeCount = Number(count);
    // console.log(`[质押列表] 获取到总质押笔数: ${stakeCount}`);


    if (stakeCount === 0) {
      // console.log("[质押列表] 用户无质押记录, 停止获取.");
      return [];
    }

    const recordPromises = [];
    const rewardPromises = [];
    const indices = [];

    // Loop from newest to oldest
    for (let i = stakeCount - 1; i >= 0; i--) {
      indices.push(i);
      recordPromises.push(stakingContract.userStakeRecord(walletState.address, i));
      rewardPromises.push(stakingContract.rewardOfSlot(walletState.address, i));
    }

    const records = await Promise.all(recordPromises);
    const rewards = await Promise.all(rewardPromises);

    // console.log("[质押列表] 批量获取到原始Reward数据:", rewards);

    // Staking durations: 1, 15, 30 days for PROD; 1, 15, 30 minutes for others
    const isProd = APP_ENV === 'PROD';
    const stakeDurations = isProd 
      ? [86400, 1296000, 2592000] // 1 day, 15 days, 30 days
      : [60, 900, 1800];          // 1 min, 15 min, 30 min

    const formattedData = records.map((record, index) => {
      const originalIndex = indices[index];
      const totalValue = rewards[index];

      let interest;
      if (record.status === true) { // Redeemed
        interest = record.finalReward > 0 ? record.finalReward - record.amount : 0n;
      } else { // In-progress
        const totalValue = totalValue ? BigInt(totalValue.toString()) : 0n;
        interest = totalValue > record.amount ? totalValue - record.amount : 0n;
      }

      const stakeTimeInSeconds = Number(record.stakeTime);
      const stakeDurationInSeconds = stakeDurations[Number(record.stakeIndex)];
      const expiryTimestamp = (stakeTimeInSeconds + stakeDurationInSeconds) * 1000;

      let displayStatus = 'waiting';
      if (record.status === true) {
        displayStatus = 'redeemed';
      } else if (expiryTimestamp <= Date.now()) {
        displayStatus = 'redeemable';
      }

      const decimals = getUsdtDecimals();

      return {
        principal: ethers.formatUnits(record.amount, decimals),
        interest: ethers.formatUnits(interest, decimals),
        stakeDate: new Date(stakeTimeInSeconds * 1000).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).replace(/\//g, '-'),
        expiryTimestamp: expiryTimestamp,
        displayStatus: displayStatus,
        originalIndex: originalIndex, // Add the original index here
      };
    });

    // console.log("[质押列表] 数据处理完成, 最终格式化后数据:", formattedData);
    return formattedData;

  } catch (error) {
    console.error("[质押列表] 获取数据时发生严重错误:", error);
    showToast(t('toast.fetchDataFailed'));
    return [];
  }
};

export const unstake = async (id, exitType) => {
  if (!stakingContract) {
    showToast(t('toast.stakingNotInitialized'));
    return false;
  }
  if (typeof id !== 'number' || id < 0) {
    showToast(t('toast.invalidOrderId'));
    return false;
  }
  if (![1, 2].includes(exitType)) {
      console.error("Invalid exitType:", exitType);
      return false;
  }

  console.log(`[赎回操作] 准备为 ID 为 ${id} 的订单发起交易, 类型: ${exitType}...`);

  try {
    // Dry-run the transaction first to catch potential reverts without sending a transaction.
    await stakingContract.unstake.staticCall(id, exitType);
    console.log("[赎回操作] 静态调用检查通过，交易很可能会成功。");

    const tx = await stakingContract.unstake(id, exitType);
    console.log(`[赎回操作] 交易已发送, Hash: ${tx.hash}. 等待链上确认...`);
    // showToast("交易已发送，等待确认...");

    const receipt = await tx.wait();
    console.log("[赎回操作] 交易成功!", receipt);
    showToast(t('toast.unstakeSuccess'));

    return true;
  } catch (error) {
    // Check if the error is due to user rejecting the transaction in their wallet.
    if (error.code === 'ACTION_REJECTED') {
      console.log("[赎回操作] 用户拒绝了交易。");
      // No toast notification needed for user-initiated cancellation.
    } else {
      console.error("[赎回操作] 交易失败 (可能是静态调用检查时发现问题):", error);
      const reason = error.reason || error.message || 'Unknown error';
      if (reason.includes("Daily limit")) {
          showToast(t('toast.dailyLimitExceeded'));
      } else if (reason.includes("Invalid Type")) {
          showToast(t('toast.invalidType'));
      } else {
          showToast(t('toast.unstakeFailed', { reason: reason }));
      }
    }
    return false;
  }
};


export const checkIfUserHasReferrer = async () => {
  if (!referralContract || !walletState.address) {
    console.log("Referral contract not initialized or user not connected.");
    // Default to false to prevent sharing if state is unclear
    return false;
  }
  try {
    const hasReferrer = await referralContract.isBindReferral(walletState.address);
    console.log(`用户是否已绑定推荐人: ${hasReferrer}`);
    return hasReferrer;
  } catch (error) {
    console.error("Error checking user's referrer status:", error);
    return false; // Default to false on error
  }
};

/**
 * Fetches the USDT balance for the current user.
 * @returns {Promise<string>} The user's USDT balance, formatted as a string.
 */
export const getUsdtBalance = async () => {
  if (!usdtContract || !walletState.address) {
    console.warn("USDT contract not initialized or user not connected.");
    return "0";
  }
  try {
    const balance = await usdtContract.balanceOf(walletState.address);
    return ethers.formatUnits(balance, getUsdtDecimals());
  } catch (error) {
    console.error("Error fetching USDT balance:", error);
    return "0";
  }
};

/**
 * Fetches the current USDT reserves from the ATH contract's associated pool.
 * @returns {Promise<string>} The total USDT reserves, formatted as a string.
 */
export const getPoolUsdtReserves = async () => {
  if (!usdtContract) {
    console.warn("USDT contract not initialized.");
    return "0";
  }
  try {
    const env = APP_ENV === 'PROD' ? 'production' : 'development';
    const lpAddress = contractAddresses.lp[env];
    const reserves = await usdtContract.balanceOf(lpAddress);
    return ethers.formatUnits(reserves, getUsdtDecimals());
  } catch (error) {
    console.error("Error fetching pool USDT reserves:", error);
    return "0";
  }
};

/**
 * Fetches the maximum amount that can be unstaked today.
 * @returns {Promise<string>} The max unstake amount in ethers (formatted string).
 */
export const getMaxUnstakeAmount = async () => {
  if (!stakingContract) {
    console.warn("Staking contract not initialized.");
    return "0";
  }
  try {
    // maxUnstakeAmount() returns the amount in wei (based on USDT decimals usually, check contract logic)
    // The previous logic implies amounts are handled in USDT decimals (6) or 18.
    // Let's assume it matches the principal amount's decimals (likely 18 or 6).
    // Based on 'getUsdtDecimals()' usage elsewhere, let's use that if it returns USDT value.
    // However, in 'unstake', amount is principal. 'stake' takes 18 decimals usually if it's main token, 
    // but here stake is USDT. Wait, staking contract usually takes USDT.
    // stakeWithInviter takes amountInWei which is parsed with getUsdtDecimals().
    // So maxUnstakeAmount likely returns USDT wei.
    
    const amount = await stakingContract.maxUnstakeAmount();
    return ethers.formatUnits(amount, getUsdtDecimals());
  } catch (error) {
    console.error("Error fetching max unstake amount:", error);
    return "0";
  }
};

// --- Staking and Referral Flow Functions ---

/**
 * Uses the Uniswap Router to get the expected amount of ATH for a given USDT amount.
 * @param {bigint} usdtAmountIn The amount of USDT in, as a BigInt (6 decimals).
 * @returns {Promise<bigint>} The expected amount of ATH out, as a BigInt (18 decimals).
 */
const getExpectedAthAmount = async (usdtAmountIn) => {
  if (!routerContract) {
    console.error("Router contract not initialized.");
    return 0n;
  }
  const env = APP_ENV === 'PROD' ? 'production' : 'development';
  const usdtAddress = contractAddresses.usdt[env];
  const athAddress = contractAddresses.ath[env];

  console.log(`[滑点计算] 预查询参数:`, {
    '输入USDT (wei)': usdtAmountIn.toString(),
    'USDT地址': usdtAddress,
    'ATH地址': athAddress
  });

  try {
    const amountsOut = await routerContract.getAmountsOut(usdtAmountIn, [usdtAddress, athAddress]);
    console.log(`[滑点计算] 预查询结果:`, {
      '输出ATH (wei)': amountsOut[1].toString(),
      'ATH地址': athAddress
    });
    return amountsOut[1]; // The second element is the output amount
  } catch (error) {
    console.error("Error fetching expected ATH amount from router:", error);
    return 0n;
  }
};

/**
 * Gets the current USDT allowance for the staking contract.
 * @returns {Promise<string>} The allowance amount in ethers (string).
 */
export const getUsdtAllowance = async () => {
  const stakingAddress = contractAddresses.staking[APP_ENV === 'PROD' ? 'production' : 'development'];
  if (!usdtContract || !walletState.address || !stakingAddress) {
    console.warn("USDT contract not initialized, wallet not connected, or staking address missing.");
    return "0";
  }
  try {
    const allowance = await usdtContract.allowance(walletState.address, stakingAddress);
    return ethers.formatUnits(allowance, getUsdtDecimals());
  } catch (error) {
    console.error("Error fetching USDT allowance:", error);
    return "0";
  }
};

/**
 * Approves the staking contract to spend a certain amount of USDT.
 * Instead of a specific amount, this will now approve the maximum possible amount.
 * @returns {Promise<boolean>} True if the approval transaction was successful, false otherwise.
 */
export const approveUsdt = async () => {
  const stakingAddress = contractAddresses.staking[APP_ENV === 'PROD' ? 'production' : 'development'];
  if (!usdtContract || !stakingAddress) {
    console.error("USDT contract not initialized or staking address missing.");
    return false;
  }
  try {
    const tx = await usdtContract.approve(stakingAddress, ethers.MaxUint256);
    await tx.wait(); // Wait for the transaction to be mined
    console.log("USDT max approval successful, transaction hash:", tx.hash);
    return true;
  } catch (error) {
    console.error("Error approving USDT:", error);
    return false;
  }
};

/**
 * Gets the referrer for an existing user.
 * @returns {Promise<string|null>} The referrer's address or null if not found/error.
 */
export const getReferrer = async () => {
  if (!referralContract || !walletState.address) {
    console.warn("Referral contract not initialized or user not connected.");
    return null;
  }
  try {
    return await referralContract.getReferral(walletState.address);
  } catch (error) {
    console.error("Error fetching referrer:", error);
    return null;
  }
};

/**
 * Gets the root address from the referral contract.
 * @returns {Promise<string|null>} The root referrer's address or null if error.
 */
export const getRootReferrer = async () => {
  if (!referralContract) {
    console.warn("Referral contract not initialized.");
    return null;
  }
  try {
    return await referralContract.getRootAddress();
  } catch (error) {
    console.error("Error fetching root referrer:", error);
    return null;
  }
};

/**
 * Checks if a given address is a valid referrer (i.e., has already staked).
 * @param {string} referrerAddress The address to check.
 * @returns {Promise<boolean>} True if the referrer is valid.
 */
export const isReferrerValid = async (referrerAddress) => {
  if (!referralContract) {
    console.warn("Referral contract not initialized.");
    return false;
  }
  try {
    return await referralContract.isBindReferral(referrerAddress);
  } catch (error) {
    console.error("Error validating referrer:", error);
    return false;
  }
};

/**
 * Executes the final staking transaction.
 * @param {string} amount The amount of USDT to stake, in ethers.
 * @param {number} stakeIndex The index for the staking duration (e.g., 1, 15, 30).
 * @param {string} parentAddress The address of the referrer.
 * @returns {Promise<boolean>} True if the transaction was successful.
 */
export const stakeWithInviter = async (amount, stakeIndex, parentAddress) => {
  if (!stakingContract) {
    showToast(t('toast.stakingNotInitialized'));
    return false;
  }
  try {
    const decimals = getUsdtDecimals();
    const amountInWei = ethers.parseUnits(amount, decimals);

    // --- Calculate amountOutMin with 5% slippage ---
    const expectedAth = await getExpectedAthAmount(amountInWei / 2n); // Only half is swapped
    if (expectedAth === 0n) {
      console.error("Could not calculate expected ATH amount, aborting stake.");
      showToast(t('toast.calculateFailed'));
      return false;
    }
    const slippageTolerance = 10n; // 10%
    const amountOutMin = (expectedAth * (100n - slippageTolerance)) / 100n;

    console.log(`[滑点计算] 结果:`, {
      '预期获得ATH (wei)': expectedAth.toString(),
      '最小接受ATH (wei)': amountOutMin.toString()
    });
    // -------------------------------------------------

    console.log("[contracts.js] stakeWithInviter Parameters:", {
      _amount: amountInWei.toString(),
      amountOutMin: amountOutMin.toString(),
      _stakeIndex: stakeIndex,
      parent: parentAddress
    });

    const tx = await stakingContract.stakeWithInviter(
      amountInWei,
      amountOutMin,
      stakeIndex,
      parentAddress
    );
    await tx.wait();
    console.log("Staking successful, transaction hash:", tx.hash);
    return true;
  } catch (error) {
    if (error.code === 'ACTION_REJECTED') {
      console.log('[质押操作] 用户在钱包中拒绝了交易。');
      // No toast notification for user rejection
    } else {
      console.error("Error during stakeWithInviter call:", error);
      showToast(t('toast.stakeFailed', { reason: error.reason || error.message || 'Unknown error' }));
    }
    return false;
  }
};

/**
 * Reads the current maximum stake amount from the contract.
 * @returns {Promise<string>} The max stake amount, formatted as a string.
 */
export const getMaxStakeAmount = async () => {
  if (!stakingContract) {
    console.warn("Staking contract not initialized.");
    return "0";
  }
  try {
    const maxStake = await stakingContract.maxStakeAmount();
    return ethers.formatUnits(maxStake, getUsdtDecimals());
  } catch (error) {
    console.error("Error fetching max stake amount:", error);
    return "0";
  }
};

/**
 * Fetches the reward for a single stake record by its index.
 * Note: This is now a standalone function as it's called from HowToUseSection.vue
 * @param {number} id The permanent ID of the stake record.
 * @returns {Promise<BigInt>} The total reward value as a BigInt.
 */
export const rewardOfSlot = async (id) => {
    if (!stakingContract) {
        console.warn("Staking contract not initialized for rewardOfSlot call.");
        return 0n;
    }
    try {
        // The contract function signature has changed from index to id.
        return await stakingContract.rewardOfSlot(walletState.address, id);
    } catch (error) {
        console.error(`Error fetching reward for slot with ID ${id}:`, error);
        return 0n;
    }
};

// --- Exported Functions to get contract instances (optional, but good practice) ---
// This allows other parts of the app to get a read-only instance if needed,
// but for now, we will keep them internal and expose specific function calls later.

/**
 * Fetches the welfare claim records for the user.
 * @param {number} offset Pagination offset.
 * @param {number} limit Pagination limit.
 * @param {number} status Filter status: 0=All, 1=Unclaimed, 2=Claimed.
 * @returns {Promise<{records: Array, total: number}>} Records and total count.
 */
export const getWelfareRecords = async (offset = 0, limit = 10, status = 1) => {
    if (!stakingWelfareContract || !walletState.address) {
        if (walletState.isAuthenticated && walletState.contractsInitialized) {
            console.warn("StakingWelfare contract not initialized or user not connected.");
        }
        return { records: [], total: 0 };
    }
    try {
        console.log(`[Welfare] Fetching records: user=${walletState.address}, offset=${offset}, limit=${limit}, status=${status}`);
        const result = await stakingWelfareContract.getUserClaimRecords(
            walletState.address,
            offset,
            limit,
            status
        );
        console.log("[Welfare] Raw contract result:", result);
        
        // result is likely [records, total] (tuple)
        // Check if result is array-like or object-like
        let recordsRaw, totalRaw;
        
        if (Array.isArray(result)) {
            recordsRaw = result[0];
            totalRaw = result[1];
        } else {
             // Try accessing by name if available, or assume structure
             recordsRaw = result.records || result[0];
             totalRaw = result.total || result[1];
        }

        if (!recordsRaw) {
            console.warn("[Welfare] Records not found in result");
            return { records: [], total: 0 };
        }

        // Map contract struct to frontend friendly format
        const formattedRecords = recordsRaw.map(record => ({
            orderId: record.orderId.toString(),
            isClaimed: record.isClaimed,
            claimableAmount: ethers.formatUnits(record.claimableAmount, 18), // Assuming ATHP is 18 decimals
            stakingStatus: record.stakingStatus // false: Active, true: Ended
        }));

        console.log("[Welfare] Formatted records:", formattedRecords);

        return {
            records: formattedRecords,
            total: Number(totalRaw)
        };
    } catch (error) {
        console.error("Error fetching welfare records:", error);
        return { records: [], total: 0 };
    }
};

/**
 * Claims ATHP reward for a single order.
 * @param {string} orderId The order ID to claim.
 * @returns {Promise<boolean>} Success status.
 */
export const claimWelfareReward = async (orderId) => {
    if (!stakingWelfareContract) {
        showToast(t('toast.poolNotInitialized'));
        return false;
    }
    try {
        const tx = await stakingWelfareContract.claim(orderId);
        showToast(t('toast.txSent'));
        await tx.wait();
        showToast(t('toast.claimSuccess'));
        return true;
    } catch (error) {
        if (error.code === 'ACTION_REJECTED') {
            console.log("User rejected claim transaction.");
        } else {
            console.error("Error claiming welfare reward:", error);
            const reason = error.reason || error.message || 'Unknown error';
            if (reason.includes("Already claimed")) {
                showToast("该订单已领取过积分");
            } else if (reason.includes("Invalid stake amount")) {
                showToast("无效的质押数据");
            } else if (reason.includes("Weight not set")) {
                showToast("该周期暂未开放兑换");
            } else if (reason.includes("ATHP not set")) {
                showToast("合约暂停服务");
            } else {
                showToast(t('toast.claimFailed', { reason: reason }));
            }
        }
        return false;
    }
};

/**
 * Batch claims ATHP rewards for multiple orders.
 * @param {string[]} orderIds Array of order IDs to claim.
 * @returns {Promise<boolean>} Success status.
 */
export const batchClaimWelfareRewards = async (orderIds) => {
    if (!stakingWelfareContract) {
        showToast(t('toast.poolNotInitialized'));
        return false;
    }
    if (!orderIds || orderIds.length === 0) {
        return false;
    }
    try {
        const tx = await stakingWelfareContract.batchClaim(orderIds);
        showToast(t('toast.txSent'));
        await tx.wait();
        showToast(t('toast.claimSuccess'));
        return true;
    } catch (error) {
        if (error.code === 'ACTION_REJECTED') {
            console.log("User rejected batch claim transaction.");
        } else {
            console.error("Error batch claiming welfare rewards:", error);
            const reason = error.reason || error.message || 'Unknown error';
            showToast(t('toast.claimFailed', { reason: reason }));
        }
        return false;
    }
};

/**
 * Adds the ATHP token to the user's wallet (MetaMask).
 */
export const addAthpToWallet = async () => {
    const env = APP_ENV === 'PROD' ? 'production' : 'development';
    const athpAddress = contractAddresses.ATHP[env];
    
    if (!athpAddress || !window.ethereum) return;

    try {
        await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: athpAddress,
                    symbol: 'ATHP',
                    decimals: 18,
                },
            },
        });
    } catch (error) {
        console.error("Error adding ATHP to wallet:", error);
    }
};

// Example of how we will export specific functions later:
/*
export const getUserBalance = async () => {
  if (!athContract) throw new Error("ATH contract not initialized.");
  return await athContract.balanceOf(walletState.address);
};
*/
