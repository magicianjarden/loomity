import { NextResponse } from 'next/server';
import { withAuth } from '../../../../utils/auth';

// Mock resource data
const mockResourceData = {
  currentMemory: 45,
  maxMemory: 100,
  memoryHistory: [
    { time: '1h ago', usage: 30 },
    { time: '45m ago', usage: 45 },
    { time: '30m ago', usage: 40 },
    { time: '15m ago', usage: 35 },
    { time: 'now', usage: 45 }
  ],
  totalApiCalls: 150,
  apiCallsByPlugin: [
    { plugin: 'Code Formatter', calls: 75 },
    { plugin: 'Spell Checker', calls: 45 }
  ],
  storageUsed: 5,
  storageLimit: 10,
  storageByPlugin: [
    { plugin: 'Code Formatter', storage: 3 },
    { plugin: 'Spell Checker', storage: 2 }
  ]
};

export async function GET() {
  return withAuth(async () => {
    return NextResponse.json(mockResourceData);
  });
}
