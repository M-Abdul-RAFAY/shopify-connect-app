// Shopify Pagination Utilities
// This module provides utilities for fetching large datasets from Shopify API
// using proper pagination to overcome the 250 record limit

import { shopifyAPI } from '../services/shopifyAPI';

interface PaginationOptions {
  maxRecords?: number; // Maximum total records to fetch (default: no limit)
  pageSize?: number;   // Records per page (max 250, default 250)
  delay?: number;      // Delay between requests in ms (default: 100ms)
}

export class ShopifyPaginator {
  /**
   * Fetch all products using pagination
   */
  static async getAllProducts(options: PaginationOptions = {}): Promise<any[]> {
    const { maxRecords = Infinity, pageSize = 250, delay = 100 } = options;
    const actualPageSize = Math.min(pageSize, 250);
    
    const allRecords: any[] = [];
    let sinceId = 0;
    let fetched = 0;

    while (fetched < maxRecords) {
      try {
        const remainingRecords = maxRecords - fetched;
        const currentLimit = Math.min(actualPageSize, remainingRecords);
        
        const response = await shopifyAPI.getProducts(currentLimit);
        
        if (!response.products || response.products.length === 0) {
          break; // No more records
        }

        allRecords.push(...response.products);
        fetched += response.products.length;
        
        // Update sinceId for next page
        if (response.products.length > 0) {
          sinceId = response.products[response.products.length - 1].id;
        }
        
        // If we got less than requested, we've reached the end
        if (response.products.length < currentLimit) {
          break;
        }

        // Add delay between requests to be respectful to API
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
      } catch (error) {
        console.error(`Error fetching products page (since_id: ${sinceId}):`, error);
        break;
      }
    }

    return allRecords;
  }

  /**
   * Fetch all orders using pagination
   */
  static async getAllOrders(options: PaginationOptions = {}): Promise<any[]> {
    const { maxRecords = Infinity, pageSize = 250, delay = 100 } = options;
    const actualPageSize = Math.min(pageSize, 250);
    
    const allRecords: any[] = [];
    let sinceId = 0;
    let fetched = 0;

    while (fetched < maxRecords) {
      try {
        const remainingRecords = maxRecords - fetched;
        const currentLimit = Math.min(actualPageSize, remainingRecords);
        
        const response = await shopifyAPI.getOrders(currentLimit);
        
        if (!response.orders || response.orders.length === 0) {
          break; // No more records
        }

        allRecords.push(...response.orders);
        fetched += response.orders.length;
        
        // Update sinceId for next page
        if (response.orders.length > 0) {
          sinceId = response.orders[response.orders.length - 1].id;
        }
        
        // If we got less than requested, we've reached the end
        if (response.orders.length < currentLimit) {
          break;
        }

        // Add delay between requests to be respectful to API
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
      } catch (error) {
        console.error(`Error fetching orders page (since_id: ${sinceId}):`, error);
        break;
      }
    }

    return allRecords;
  }

  /**
   * Fetch all customers using pagination
   */
  static async getAllCustomers(options: PaginationOptions = {}): Promise<any[]> {
    const { maxRecords = Infinity, pageSize = 250, delay = 100 } = options;
    const actualPageSize = Math.min(pageSize, 250);
    
    const allRecords: any[] = [];
    let sinceId = 0;
    let fetched = 0;

    while (fetched < maxRecords) {
      try {
        const remainingRecords = maxRecords - fetched;
        const currentLimit = Math.min(actualPageSize, remainingRecords);
        
        const response = await shopifyAPI.getCustomers(currentLimit);
        
        if (!response.customers || response.customers.length === 0) {
          break; // No more records
        }

        allRecords.push(...response.customers);
        fetched += response.customers.length;
        
        // Update sinceId for next page
        if (response.customers.length > 0) {
          sinceId = response.customers[response.customers.length - 1].id;
        }
        
        // If we got less than requested, we've reached the end
        if (response.customers.length < currentLimit) {
          break;
        }

        // Add delay between requests to be respectful to API
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
      } catch (error) {
        console.error(`Error fetching customers page (since_id: ${sinceId}):`, error);
        break;
      }
    }

    return allRecords;
  }
}

// Example usage:
// 
// // Fetch all products (respects API limits with pagination)
// const allProducts = await ShopifyPaginator.getAllProducts({ 
//   maxRecords: 1000,
//   delay: 200 
// });
//
// // Fetch all orders
// const allOrders = await ShopifyPaginator.getAllOrders({
//   maxRecords: 500
// });
//
// // Fetch all customers with smaller page size
// const allCustomers = await ShopifyPaginator.getAllCustomers({
//   pageSize: 100,
//   delay: 150
// });
