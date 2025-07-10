import { authAPI } from "./api/auth.js";
import { webAPI } from "./api/web.js";

import { api } from "../lib/api.js";

class WebService {
  /**
   * Get all webs with optional filtering and pagination
   * @param {Object} options - Query parameters
   * @param {number} options.limit - Max number of webs to fetch (default: 20)
   * @param {string} options.cursor - ISO timestamp for pagination
   * @param {string} options.visibility - Filter by visibility ("Public", "Private", etc.)
   * @param {string} options.userId - Target user ID to fetch owned/contributed webs
   * @returns {Promise} Response with webs array, nextCursor, and total count
   */
  async getAllWebs(options = {}) {
    try {
      const response = await api.get('/web/all', { params: options });
      return response.data;
    } catch (error) {
      console.error('Error getting webs:', error);
      throw error;
    }
  }

  /**
   * Get public webs only
   * @param {number} limit - Max number of webs to fetch
   * @param {string} cursor - Pagination cursor
   * @returns {Promise} Public webs response
   */
  async getPublicWebs(limit = 20, cursor = null) {
    return this.getAllWebs({ 
      limit, 
      cursor, 
      visibility: 'Public' 
    });
  }

  /**
   * Get webs for a specific user
   * @param {string} userId - User ID
   * @param {number} limit - Max number of webs to fetch
   * @param {string} cursor - Pagination cursor
   * @returns {Promise} User webs response
   */
  async getUserWebs(userId, limit = 20, cursor = null) {
    return this.getAllWebs({ 
      userId, 
      limit, 
      cursor 
    });
  }

  /**
   * Get webs with pagination helper
   * @param {Object} lastResponse - Previous response to get next cursor
   * @param {Object} options - Additional options
   * @returns {Promise} Next page of webs
   */
  async getNextPage(lastResponse, options = {}) {
    if (!lastResponse?.nextCursor) {
      return { result: [], nextCursor: null, total: 0 };
    }

    return this.getAllWebs({
      ...options,
      cursor: lastResponse.nextCursor
    });
  }
}

export const webService = new WebService();