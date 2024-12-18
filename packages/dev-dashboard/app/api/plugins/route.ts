import { NextResponse } from 'next/server';
import { withAuth } from '../../../utils/auth';

// Mock data for development
const mockPlugins = [
  {
    id: 'code-formatter',
    name: 'Code Formatter',
    version: '1.0.0',
    status: 'active',
    author: 'test@example.com',
    description: 'A plugin to format code'
  },
  {
    id: 'spell-checker',
    name: 'Spell Checker',
    version: '1.0.0',
    status: 'warning',
    author: 'test@example.com',
    description: 'A plugin to check spelling'
  }
];

export async function GET() {
  return withAuth(async (session) => {
    // Filter plugins by the current user's email
    const userPlugins = mockPlugins.filter(
      plugin => plugin.author === session.user.email
    );

    return NextResponse.json(userPlugins);
  });
}
