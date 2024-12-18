import { Metadata } from 'next';
import { MarketplaceExplorer } from '@/components/marketplace/marketplace-explorer';

export const metadata: Metadata = {
  title: 'Marketplace - Loomity',
  description: 'Discover and install plugins and themes for your Loomity editor',
};

export default function MarketplacePage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <MarketplaceExplorer />
    </div>
  );
}
