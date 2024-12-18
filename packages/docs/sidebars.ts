import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'introduction',
        'quick-start',
        'installation',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/creating-plugins',
        'guides/plugin-manifest',
        'guides/permissions',
        'guides/dependencies',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/basic-plugin',
        'examples/ui-plugin',
        'examples/document-plugin',
      ],
    },
  ],
  apiSidebar: [
    {
      type: 'category',
      label: 'Core API',
      items: [
        'api/plugin-api',
        'api/document-api',
        'api/ui-api',
        'api/storage-api',
      ],
    },
    {
      type: 'category',
      label: 'Events',
      items: [
        'api/events/lifecycle-events',
        'api/events/document-events',
        'api/events/ui-events',
      ],
    },
  ],
};

export default sidebars;
