// utils/semaphoreAuth.ts
import axios from 'axios';

const SEMAPHORE_API_BASE_URL = 'https://api.semaphore.com';

export const getAuthenticationToken = async () => {
  try {
    const response = await axios.post(`${SEMAPHORE_API_BASE_URL}/authenticate`, {
      // Add necessary auth parameters
    });
    return response.data.token;
  } catch (error) {
    console.error('Semaphore authentication error:', error);
    return null;
  }
};
