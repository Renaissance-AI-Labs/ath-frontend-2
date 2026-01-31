import axios from 'axios';
import { APP_ENV } from './environment';

const SUBGRAPH_URLS = {
  PROD: 'https://gateway.thegraph.com/api/subgraphs/id/6mSFS8SEePNKG3SxyzpyoGNQoaPk18DxeHrNrPc8HeYe',
  DEV: 'https://api.studio.thegraph.com/query/16009/athx-referral-test/version/latest',
};

const SUBGRAPH_API_KEY = '59ea243e4cb1078db41167f3fb142843';

const SUBGRAPH_URL = SUBGRAPH_URLS[APP_ENV] || SUBGRAPH_URLS.DEV;

// Dashboard always uses PROD data as requested
const DASHBOARD_URL = SUBGRAPH_URLS.PROD;

console.log(`[Subgraph] Initialized with endpoint for ${APP_ENV}: ${SUBGRAPH_URL}`);

export async function fetchGlobalDashboardData() {
  const query = `
    query GetGlobalData {
      globalStat(id: "global") {
        totalStaked1Day
        totalStaked15Days
        totalStaked30Days
      }
      maturityBuckets(
        orderBy: date, 
        orderDirection: asc, 
        first: 100
      ) {
        date
        totalAmount
      }
    }
  `;

  const requestConfig = {
    method: 'post',
    url: DASHBOARD_URL,
    headers: {
      Authorization: `Bearer ${SUBGRAPH_API_KEY}`
    },
    data: { query }
  };

  try {
    const response = await axios(requestConfig);
    if (response.data.errors) {
      console.error('Subgraph dashboard global query error:', response.data.errors);
      return null;
    }
    return response.data.data;
  } catch (error) {
    console.error('Error fetching global dashboard data:', error);
    return null;
  }
}

export async function fetchTeamDashboardData(teamId) {
  const query = `
    query GetTeamData($teamId: ID!) {
      teamStat(id: $teamId) {
        id
        totalStaked1Day
        totalStaked15Days
        totalStaked30Days
      }
      teamMaturityBuckets(
        where: { team: $teamId },
        orderBy: date,
        orderDirection: asc,
        first: 100
      ) {
        date
        totalAmount
      }
    }
  `;

  const requestConfig = {
    method: 'post',
    url: DASHBOARD_URL,
    headers: {
      Authorization: `Bearer ${SUBGRAPH_API_KEY}`
    },
    data: { 
      query,
      variables: { teamId: teamId.toLowerCase() }
    }
  };

  try {
    const response = await axios(requestConfig);
    if (response.data.errors) {
      console.error('Subgraph dashboard team query error:', response.data.errors);
      return null;
    }
    return response.data.data;
  } catch (error) {
    console.error('Error fetching team dashboard data:', error);
    return null;
  }
}

export async function fetchAllTeams() {
  const query = `
    query GetAllTeams {
      teamStats(first: 100, orderBy: totalStaked30Days, orderDirection: desc) {
        id
        totalStaked1Day
        totalStaked15Days
        totalStaked30Days
      }
    }
  `;

  const requestConfig = {
    method: 'post',
    url: DASHBOARD_URL,
    headers: {
      Authorization: `Bearer ${SUBGRAPH_API_KEY}`
    },
    data: { query }
  };

  try {
    const response = await axios(requestConfig);
    if (response.data.errors) {
      console.error('Subgraph all teams query error:', response.data.errors);
      return [];
    }
    return response.data.data.teamStats || [];
  } catch (error) {
    console.error('Error fetching all teams:', error);
    return [];
  }
}

export async function getReferralsFromSubgraph(address) {
  const query = `
    query GetUserReferrals($address: Bytes!) {
      user(id: $address) {
        referralCount
        estimatedDynamicRewards
        referrals {
          id
        }
      }
    }
  `;

  const requestConfig = {
    method: 'post',
    url: SUBGRAPH_URL,
    data: {
      query,
      variables: {
        address: address.toLowerCase(),
      },
    }
  };

  // Only add the Authorization header for the production URL
  if (SUBGRAPH_URL === SUBGRAPH_URLS.PROD) {
    requestConfig.headers = {
      Authorization: `Bearer ${SUBGRAPH_API_KEY}`
    };
  }

  try {
    const response = await axios(requestConfig);

    if (response.data.errors) {
      console.error('Subgraph query error:', response.data.errors);
      return { referralCount: 0, referrals: [], estimatedDynamicRewards: '0' };
    }

    const user = response.data.data.user;
    if (!user) {
      return { referralCount: 0, referrals: [], estimatedDynamicRewards: '0' };
    }

    return {
      referralCount: parseInt(user.referralCount, 10),
      referrals: user.referrals.map(r => r.id),
      estimatedDynamicRewards: user.estimatedDynamicRewards || '0',
    };
  } catch (error) {
    console.error('Error fetching referrals from subgraph:', error);
    return { referralCount: 0, referrals: [], estimatedDynamicRewards: '0' };
  }
}
