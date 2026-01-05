/**
 * SharePoint Service - Microsoft Graph API Integration
 * Handles all SharePoint list operations using Microsoft Graph API
 */

require('dotenv').config();
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class SharePointService {
  constructor() {
    // Hardcoded credentials for Right Arc Consulting
    this.tenantId = process.env.AZURE_TENANT_ID || 'da28b76b-d863-4415-a190-cec116ad367e';
    this.clientId = process.env.AZURE_CLIENT_ID || '1443c462-d929-4195-9282-64df97cf4e3a';
    this.clientSecret = process.env.AZURE_CLIENT_SECRET || 'iIe8Q~kZ~zNMCtOw7T7ifxC0li_fJ.pIrcRB.c4-';
    this.siteUrl = process.env.SHAREPOINT_SITE_URL || 'https://rightarcconsulting.sharepoint.com';
    this.siteName = process.env.SHAREPOINT_SITE_NAME || 'rightarcconsulting.sharepoint.com';
    this.accessToken = null;
    this.tokenExpiry = null;
    
    console.log('🔧 SharePoint service created (PowerShell mode)');
  }

  /**
   * Execute PowerShell command and parse JSON result
   */
  async executePowerShell(command) {
    try {
      const { stdout, stderr } = await execAsync(`powershell.exe -NoProfile -Command "${command}"`, {
        timeout: 60000,
        maxBuffer: 10 * 1024 * 1024
      });
      
      if (stderr && stderr.trim()) {
        console.warn('PowerShell stderr:', stderr);
      }
      
      return stdout.trim();
    } catch (error) {
      console.error('PowerShell execution error:', error.message);
      throw error;
    }
  }

  /**
   * Get access token using PowerShell (bypasses Node.js HTTP issues)
   */
  async getAccessToken() {
    try {
      // Check if we have a valid cached token
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        console.log('✅ Using cached access token');
        return this.accessToken;
      }

      console.log('🔑 Requesting new access token via PowerShell...');
      
      // Escape single quotes in secret for PowerShell
      const escapedSecret = this.clientSecret.replace(/'/g, "''");
      
      const psScript = `
        $tokenBody = @{
          grant_type = 'client_credentials'
          client_id = '${this.clientId}'
          client_secret = '${escapedSecret}'
          scope = 'https://graph.microsoft.com/.default'
        }
        $response = Invoke-RestMethod -Uri 'https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token' -Method POST -Body $tokenBody -ContentType 'application/x-www-form-urlencoded' -TimeoutSec 30
        $response | ConvertTo-Json -Compress
      `.replace(/\n/g, ' ').replace(/\s+/g, ' ');

      const result = await this.executePowerShell(psScript);
      const data = JSON.parse(result);
      
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min before expiry
      
      console.log('✅ Access token obtained successfully via PowerShell');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Failed to get access token:', error.message);
      throw error;
    }
  }

  /**
   * Make Graph API request using PowerShell
   */
  async makeGraphRequest(endpoint, method = 'GET', body = null) {
    try {
      const token = await this.getAccessToken();
      
      let psScript = `
        $headers = @{
          'Authorization' = 'Bearer ${token}'
          'Content-Type' = 'application/json'
        }
        $uri = 'https://graph.microsoft.com/v1.0${endpoint}'
      `;

      if (method === 'GET') {
        psScript += `
          $response = Invoke-RestMethod -Uri $uri -Headers $headers -Method GET -TimeoutSec 30
          $response | ConvertTo-Json -Depth 10 -Compress
        `;
      } else {
        const bodyJson = JSON.stringify(body).replace(/'/g, "''");
        psScript += `
          $body = '${bodyJson}'
          $response = Invoke-RestMethod -Uri $uri -Headers $headers -Method ${method} -Body $body -TimeoutSec 30
          $response | ConvertTo-Json -Depth 10 -Compress
        `;
      }

      psScript = psScript.replace(/\n/g, ' ').replace(/\s+/g, ' ');
      const result = await this.executePowerShell(psScript);
      return JSON.parse(result);
    } catch (error) {
      console.error(`❌ Graph API request failed (${method} ${endpoint}):`, error.message);
      throw error;
    }
  }

  /**
   * Get SharePoint site ID
   */
  async getSiteId() {
    try {
      console.log('📡 Getting SharePoint site ID via PowerShell...');
      console.log('Site name:', this.siteName);
      
      const site = await this.makeGraphRequest(`/sites/${this.siteName}`);
      
      console.log('✅ Site found:', site.displayName);
      return site.id;
    } catch (error) {
      console.error('❌ Error getting site ID:', error.message);
      throw error;
    }
  }

  /**
   * Get list by name
   */
  async getList(listName) {
    try {
      const siteId = await this.getSiteId();
      const lists = await this.makeGraphRequest(`/sites/${siteId}/lists?$filter=displayName eq '${listName}'`);
      
      return lists.value[0] || null;
    } catch (error) {
      console.error(`Error getting list ${listName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new list
   */
  async createList(listName, columns) {
    try {
      const siteId = await this.getSiteId();
      
      const list = await this.client
        .api(`/sites/${siteId}/lists`)
        .post({
          displayName: listName,
          list: {
            template: 'genericList',
          },
        });

      console.log(`✅ Created list: ${listName}`);

      // Add custom columns
      for (const column of columns) {
        await this.createColumn(listName, column);
      }

      return list;
    } catch (error) {
      console.error(`Error creating list ${listName}:`, error);
      throw error;
    }
  }

  /**
   * Create a column in a list
   */
  async createColumn(listName, columnDefinition) {
    try {
      const siteId = await this.getSiteId();
      const list = await this.getList(listName);

      if (!list) {
        throw new Error(`List ${listName} not found`);
      }

      await this.client
        .api(`/sites/${siteId}/lists/${list.id}/columns`)
        .post(columnDefinition);

      console.log(`✅ Created column: ${columnDefinition.name} in ${listName}`);
    } catch (error) {
      console.error(`Error creating column:`, error);
      throw error;
    }
  }

  /**
   * Get all items from a list
   */
  async getListItems(listName, filter = null, expand = null, select = null) {
    try {
      const siteId = await this.getSiteId();
      const list = await this.getList(listName);

      if (!list) {
        throw new Error(`List ${listName} not found`);
      }

      let query = this.client.api(`/sites/${siteId}/lists/${list.id}/items`).expand('fields');

      if (filter) query = query.filter(filter);
      if (expand) query = query.expand(expand);
      if (select) query = query.select(select);

      const items = await query.get();
      return items.value.map(item => ({
        id: item.id,
        ...item.fields,
      }));
    } catch (error) {
      console.error(`Error getting items from ${listName}:`, error);
      throw error;
    }
  }

  /**
   * Get a single item from a list
   */
  async getListItem(listName, itemId) {
    try {
      const siteId = await this.getSiteId();
      const list = await this.getList(listName);

      if (!list) {
        throw new Error(`List ${listName} not found`);
      }

      const item = await this.client
        .api(`/sites/${siteId}/lists/${list.id}/items/${itemId}`)
        .expand('fields')
        .get();

      return {
        id: item.id,
        ...item.fields,
      };
    } catch (error) {
      console.error(`Error getting item ${itemId} from ${listName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new item in a list
   */
  async createListItem(listName, data) {
    try {
      const siteId = await this.getSiteId();
      const list = await this.getList(listName);

      if (!list) {
        throw new Error(`List ${listName} not found`);
      }

      const item = await this.client
        .api(`/sites/${siteId}/lists/${list.id}/items`)
        .post({
          fields: data,
        });

      console.log(`✅ Created item in ${listName}: ID ${item.id}`);
      
      return {
        id: item.id,
        ...item.fields,
      };
    } catch (error) {
      console.error(`Error creating item in ${listName}:`, error);
      throw error;
    }
  }

  /**
   * Update an item in a list
   */
  async updateListItem(listName, itemId, data) {
    try {
      const siteId = await this.getSiteId();
      const list = await this.getList(listName);

      if (!list) {
        throw new Error(`List ${listName} not found`);
      }

      const item = await this.client
        .api(`/sites/${siteId}/lists/${list.id}/items/${itemId}`)
        .patch({
          fields: data,
        });

      console.log(`✅ Updated item in ${listName}: ID ${itemId}`);
      
      return {
        id: item.id,
        ...item.fields,
      };
    } catch (error) {
      console.error(`Error updating item ${itemId} in ${listName}:`, error);
      throw error;
    }
  }

  /**
   * Delete an item from a list
   */
  async deleteListItem(listName, itemId) {
    try {
      const siteId = await this.getSiteId();
      const list = await this.getList(listName);

      if (!list) {
        throw new Error(`List ${listName} not found`);
      }

      await this.client
        .api(`/sites/${siteId}/lists/${list.id}/items/${itemId}`)
        .delete();

      console.log(`✅ Deleted item from ${listName}: ID ${itemId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting item ${itemId} from ${listName}:`, error);
      throw error;
    }
  }

  /**
   * Upload attachment to list item
   */
  async uploadAttachment(listName, itemId, fileName, fileBuffer) {
    try {
      const siteId = await this.getSiteId();
      const list = await this.getList(listName);

      if (!list) {
        throw new Error(`List ${listName} not found`);
      }

      const attachment = await this.client
        .api(`/sites/${siteId}/lists/${list.id}/items/${itemId}/driveItem:/${fileName}:/content`)
        .put(fileBuffer);

      console.log(`✅ Uploaded attachment: ${fileName}`);
      return attachment;
    } catch (error) {
      console.error(`Error uploading attachment:`, error);
      throw error;
    }
  }

  /**
   * Get attachments for a list item
   */
  async getAttachments(listName, itemId) {
    try {
      const siteId = await this.getSiteId();
      const list = await this.getList(listName);

      if (!list) {
        throw new Error(`List ${listName} not found`);
      }

      const attachments = await this.client
        .api(`/sites/${siteId}/lists/${list.id}/items/${itemId}/driveItem/children`)
        .get();

      return attachments.value || [];
    } catch (error) {
      console.error(`Error getting attachments:`, error);
      return [];
    }
  }

  /**
   * Batch create multiple items (for performance)
   */
  async batchCreateItems(listName, items) {
    try {
      const siteId = await this.getSiteId();
      const list = await this.getList(listName);

      if (!list) {
        throw new Error(`List ${listName} not found`);
      }

      const batchRequestContent = {
        requests: items.map((item, index) => ({
          id: `${index + 1}`,
          method: 'POST',
          url: `/sites/${siteId}/lists/${list.id}/items`,
          body: {
            fields: item,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        })),
      };

      const response = await this.client
        .api('/$batch')
        .post(batchRequestContent);

      console.log(`✅ Batch created ${items.length} items in ${listName}`);
      return response.responses;
    } catch (error) {
      console.error(`Error batch creating items:`, error);
      throw error;
    }
  }

  /**
   * Search across all lists
   */
  async search(query) {
    try {
      const siteId = await this.getSiteId();
      
      const results = await this.client
        .api('/search/query')
        .post({
          requests: [
            {
              entityTypes: ['listItem'],
              query: {
                queryString: query,
              },
              from: 0,
              size: 25,
              fields: ['title', 'path'],
              sharePointQueryableFields: ['Title'],
            },
          ],
        });

      return results.value[0].hitsContainers[0].hits;
    } catch (error) {
      console.error('Error searching:', error);
      throw error;
    }
  }
}

// Export the class itself, not an instance
module.exports = SharePointService;
