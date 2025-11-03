/**
 * Type definitions for Conversational Search Refinement
 */

import { BusinessResult, LocationCoordinates } from './business-search.js';

/**
 * Filter state for active filters in a conversation
 */
export interface FilterState {
  rating?: number;
  priceLevel?: number;
  openNow?: boolean;
  distance?: number; // in meters
  attributes?: string[];
}

/**
 * Base search parameters for original search
 */
export interface BaseSearchParams {
  businessType: string[];
  location: string;
  searchCenter: LocationCoordinates;
  baseResults: BusinessResult[];
}

/**
 * Search turn metadata for conversation history
 */
export interface SearchTurn {
  queryText: string;
  appliedFilters: FilterState;
  resultCount: number;
  timestamp: number;
  isRefinement: boolean;
}

/**
 * Conversation session state
 */
export interface ConversationSession {
  sessionId: string;
  userId?: string;
  baseSearch: BaseSearchParams;
  currentFilters: FilterState;
  searchHistory: SearchTurn[];
  lastQueryTimestamp: number;
  stateVersion: number;
}

/**
 * Filter type enum for refinement queries
 */
export enum FilterType {
  RATING = 'rating',
  PRICE = 'price',
  OPEN_NOW = 'openNow',
  DISTANCE = 'distance',
  ATTRIBUTE = 'attribute',
  LIMIT = 'limit',
}

/**
 * Base refinement query interface
 */
export interface RefinementQuery {
  filterType: FilterType;
  confidence: number;
}

/**
 * Rating refinement query
 */
export interface RatingRefinement extends RefinementQuery {
  filterType: FilterType.RATING;
  threshold: number;
}

/**
 * Price refinement query
 */
export interface PriceRefinement extends RefinementQuery {
  filterType: FilterType.PRICE;
  maxLevel?: number;
  minLevel?: number;
}

/**
 * Open now refinement query
 */
export interface OpenNowRefinement extends RefinementQuery {
  filterType: FilterType.OPEN_NOW;
  openNow: boolean;
}

/**
 * Distance refinement query
 */
export interface DistanceRefinement extends RefinementQuery {
  filterType: FilterType.DISTANCE;
  maxDistance: number; // in meters
}

/**
 * Attribute refinement query
 */
export interface AttributeRefinement extends RefinementQuery {
  filterType: FilterType.ATTRIBUTE;
  attributes: string[];
}

/**
 * Limit refinement query
 */
export interface LimitRefinement extends RefinementQuery {
  filterType: FilterType.LIMIT;
  limit: number;
}

/**
 * Union type for all refinement queries
 */
export type RefinementQueryResult =
  | RatingRefinement
  | PriceRefinement
  | OpenNowRefinement
  | DistanceRefinement
  | AttributeRefinement
  | LimitRefinement;

/**
 * Refinement parse result
 */
export interface RefinementParseResult {
  isRefinement: boolean;
  refinements: RefinementQueryResult[];
  confidence: number;
  originalQuery: string;
}

/**
 * Session store entry
 */
export interface SessionStoreEntry {
  session: ConversationSession;
  lastAccessed: number;
}
