import { api } from './api';

export interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  price: number;
  type: 'product' | 'service';
  category: string;
  authorName?: string | null;
}

export interface SearchCommunityItem {
  id: string;
  name: string;
  description: string;
  imageUrl?: string | null;
  membersCount: number;
}

export interface UnifiedSearchResult {
  products: SearchResultItem[];
  services: SearchResultItem[];
  communities: SearchCommunityItem[];
}

export const searchService = {
  async searchAll(q: string, limit = 5): Promise<UnifiedSearchResult> {
    const params = new URLSearchParams({ q, limit: String(limit) });
    return api.get<UnifiedSearchResult>(`/search/all?${params}`);
  },

  async getProductFacets(): Promise<FacetResult> {
    return api.get<FacetResult>('/search/product-facets');
  },

  async getServiceFacets(): Promise<FacetResult> {
    return api.get<FacetResult>('/search/service-facets');
  },
};

export interface FacetResult {
  categories: Record<string, number>;
  tags: Record<string, number>;
}
