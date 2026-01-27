// ============================================
// test-graph.ts
// FalkorDB Connection Test Script
// Explicitly loads .env.local before testing
// ============================================

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables (Next.js doesn't do this for standalone scripts)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { 
  testGraphConnection, 
  getGraphStats, 
  getGraphName 
} from './lib/graph/falkordb-client';

async function run() {
  console.log('🦅 Testing Graph Connection...');
  console.log('📝 Graph Name:', getGraphName());
  console.log('🔗 URL Configured:', !!process.env.FALKORDB_URL);
  
  if (!process.env.FALKORDB_URL) {
    console.error('❌ FALKORDB_URL not set in .env.local');
    process.exit(1);
  }

  // Test connection
  const isHealthy = await testGraphConnection();
  
  if (isHealthy) {
    console.log('✅ Connection Successful!');
    
    // Get stats
    const stats = await getGraphStats();
    console.log('📊 Graph Statistics:');
    console.log(`   - Nodes: ${stats.nodeCount}`);
    console.log(`   - Edges: ${stats.edgeCount}`);
    console.log(`   - Labels: ${stats.labels.join(', ') || 'None'}`);
  } else {
    console.error('❌ Connection Failed.');
    process.exit(1);
  }
  
  process.exit(0);
}

run().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});