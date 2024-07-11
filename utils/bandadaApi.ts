// utils/bandadaApi.ts
import axios from 'axios';

const BANDADA_API_BASE_URL = 'https://api.bandada.com';

export const getTopCommunities = async () => {
  const response = await axios.get(`${BANDADA_API_BASE_URL}/communities/top`);
  return response.data.communities;
};
