import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '2cb'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', 'e60'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'ff1'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'dd6'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '23c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '037'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '801'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '0c5'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '663'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', '137'),
            routes: [
              {
                path: '/docs/api/document-api',
                component: ComponentCreator('/docs/api/document-api', '16b'),
                exact: true,
                sidebar: "apiSidebar"
              },
              {
                path: '/docs/api/events/document-events',
                component: ComponentCreator('/docs/api/events/document-events', '739'),
                exact: true,
                sidebar: "apiSidebar"
              },
              {
                path: '/docs/api/events/lifecycle-events',
                component: ComponentCreator('/docs/api/events/lifecycle-events', '0e0'),
                exact: true,
                sidebar: "apiSidebar"
              },
              {
                path: '/docs/api/events/ui-events',
                component: ComponentCreator('/docs/api/events/ui-events', '983'),
                exact: true,
                sidebar: "apiSidebar"
              },
              {
                path: '/docs/api/plugin-api',
                component: ComponentCreator('/docs/api/plugin-api', '1d6'),
                exact: true,
                sidebar: "apiSidebar"
              },
              {
                path: '/docs/api/storage-api',
                component: ComponentCreator('/docs/api/storage-api', 'a76'),
                exact: true,
                sidebar: "apiSidebar"
              },
              {
                path: '/docs/api/ui-api',
                component: ComponentCreator('/docs/api/ui-api', '362'),
                exact: true,
                sidebar: "apiSidebar"
              },
              {
                path: '/docs/examples/basic-plugin',
                component: ComponentCreator('/docs/examples/basic-plugin', 'dd3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/examples/document-plugin',
                component: ComponentCreator('/docs/examples/document-plugin', 'd08'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/examples/ui-plugin',
                component: ComponentCreator('/docs/examples/ui-plugin', '85f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/guides/creating-plugins',
                component: ComponentCreator('/docs/guides/creating-plugins', '839'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/guides/dependencies',
                component: ComponentCreator('/docs/guides/dependencies', 'd9b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/guides/permissions',
                component: ComponentCreator('/docs/guides/permissions', '193'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/guides/plugin-manifest',
                component: ComponentCreator('/docs/guides/plugin-manifest', '7fe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/installation',
                component: ComponentCreator('/docs/installation', '001'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/introduction',
                component: ComponentCreator('/docs/introduction', '457'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/quick-start',
                component: ComponentCreator('/docs/quick-start', 'a57'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', 'fdd'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
