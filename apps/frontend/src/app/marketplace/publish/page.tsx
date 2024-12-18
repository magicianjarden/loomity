import { Metadata } from 'next';
import { PublishForm } from '@/components/marketplace/publish-form';

export const metadata: Metadata = {
  title: 'Publish to Marketplace - Loomity',
  description: 'Publish your plugin or theme to the Loomity marketplace',
};

export default function PublishPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Publish to Marketplace</h1>
        <p className="text-muted-foreground mb-6">
          Share your plugin or theme with the Loomity community
        </p>
        <PublishForm />
      </div>
    </div>
  );
}
