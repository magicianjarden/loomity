import { NextResponse } from 'next/server';
import { withAuth } from '../../../../utils/auth';

// Mock log data
const mockLogs = [
  {
    id: 1,
    timestamp: new Date().toISOString(),
    plugin: 'Code Formatter',
    level: 'info',
    message: 'Plugin initialized successfully',
    category: 'system'
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 5000).toISOString(),
    plugin: 'Code Formatter',
    level: 'warning',
    message: 'High memory usage detected',
    category: 'performance'
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 10000).toISOString(),
    plugin: 'Spell Checker',
    level: 'error',
    message: 'Failed to process document',
    category: 'operation'
  }
];

export async function GET() {
  return withAuth(async () => {
    return NextResponse.json(mockLogs);
  });
}
