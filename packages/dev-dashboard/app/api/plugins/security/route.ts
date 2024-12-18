import { NextResponse } from 'next/server';
import { withAuth } from '../../../../utils/auth';

// Mock security data
const mockSecurityData = {
  alerts: [
    {
      id: 1,
      message: 'High memory usage detected in Code Formatter',
      severity: 'warning'
    },
    {
      id: 2,
      message: 'API rate limit approaching for Spell Checker',
      severity: 'low'
    }
  ],
  plugins: [
    {
      id: 'code-formatter',
      name: 'Code Formatter',
      verified: true,
      permissions: [
        { name: 'document:read', granted: true },
        { name: 'document:write', granted: true },
        { name: 'ui:notification', granted: true }
      ]
    },
    {
      id: 'spell-checker',
      name: 'Spell Checker',
      verified: true,
      permissions: [
        { name: 'document:read', granted: true },
        { name: 'document:write', granted: false },
        { name: 'ui:notification', granted: true }
      ]
    }
  ]
};

export async function GET() {
  return withAuth(async () => {
    return NextResponse.json(mockSecurityData);
  });
}
