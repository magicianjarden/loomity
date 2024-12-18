import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketplaceSDK } from './marketplace-sdk';
import type { 
  MarketplaceItem, 
  MarketplaceItemType,
  SearchOptions,
  MarketplaceReview,
  PublishItemOptions
} from './types';

// Query keys
const MARKETPLACE_KEYS = {
  all: ['marketplace'] as const,
  items: () => [...MARKETPLACE_KEYS.all, 'items'] as const,
  item: (id: string) => [...MARKETPLACE_KEYS.items(), id] as const,
  search: (options: SearchOptions) => [...MARKETPLACE_KEYS.items(), 'search', options] as const,
  featured: (type?: MarketplaceItemType) => [...MARKETPLACE_KEYS.items(), 'featured', type] as const,
  installed: () => [...MARKETPLACE_KEYS.items(), 'installed'] as const,
  reviews: (itemId: string) => [...MARKETPLACE_KEYS.items(), itemId, 'reviews'] as const,
};

// Hooks for searching and browsing
export function useMarketplaceSearch(options: SearchOptions) {
  return useQuery({
    queryKey: MARKETPLACE_KEYS.search(options),
    queryFn: () => marketplaceSDK.searchItems(options),
  });
}

export function useFeaturedItems(type?: MarketplaceItemType) {
  return useQuery({
    queryKey: MARKETPLACE_KEYS.featured(type),
    queryFn: () => marketplaceSDK.getFeaturedItems(type),
  });
}

export function useMarketplaceItem(id: string) {
  return useQuery({
    queryKey: MARKETPLACE_KEYS.item(id),
    queryFn: () => marketplaceSDK.getItemById(id),
    enabled: !!id,
  });
}

// Hooks for installation management
export function useUserInstallations() {
  return useQuery({
    queryKey: MARKETPLACE_KEYS.installed(),
    queryFn: () => marketplaceSDK.getUserInstalledItems(),
  });
}

export function useInstallItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => marketplaceSDK.installItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.installed() });
    },
  });
}

export function useUninstallItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => marketplaceSDK.uninstallItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.installed() });
    },
  });
}

export function useUpdateItemSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, settings }: { itemId: string; settings: Record<string, any> }) =>
      marketplaceSDK.updateItemSettings(itemId, settings),
    onSuccess: (_, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.item(itemId) });
    },
  });
}

// Hooks for reviews
export function useItemReviews(itemId: string) {
  return useQuery({
    queryKey: MARKETPLACE_KEYS.reviews(itemId),
    queryFn: () => marketplaceSDK.getItemReviews(itemId),
    enabled: !!itemId,
  });
}

export function useAddReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, rating, review }: { itemId: string; rating: number; review?: string }) =>
      marketplaceSDK.addReview(itemId, rating, review),
    onSuccess: (_, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.reviews(itemId) });
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.item(itemId) });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, rating, review }: { itemId: string; rating: number; review?: string }) =>
      marketplaceSDK.updateReview(itemId, rating, review),
    onSuccess: (_, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.reviews(itemId) });
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.item(itemId) });
    },
  });
}

// Hooks for publishing
export function usePublishItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options: PublishItemOptions) => marketplaceSDK.publishItem(options),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.items() });
      queryClient.setQueryData(MARKETPLACE_KEYS.item(item.id), item);
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, updates }: { itemId: string; updates: Partial<MarketplaceItem> }) =>
      marketplaceSDK.updateItem(itemId, updates),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.items() });
      queryClient.setQueryData(MARKETPLACE_KEYS.item(item.id), item);
    },
  });
}

export function useUnpublishItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => marketplaceSDK.unpublishItem(itemId),
    onSuccess: (_, itemId) => {
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.items() });
      queryClient.removeQueries({ queryKey: MARKETPLACE_KEYS.item(itemId) });
    },
  });
}
