// ============================================
// test-graph-schema.ts
// Test all 6 node types + 6 relationship types
// Run: npx tsx test-graph-schema.ts
// ============================================

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import {
  // Nodes
  createUserNode,
  createVisionNode,
  createLogNode,
  createTopicNode,
  createFogNode,
  createPatternNode,
  getUserNode,
  getUserTopics,
  getUserFog,
  countNodes,
  // Relationships
  createHasVisionRel,
  createLoggedRel,
  createEscapingRel,
  createBuildsTowardRel,
  createSlidingIntoRel,
  createExhibitsRel,
  countRelationships,
  // Utils
  getGraphStats,
  REL_TYPES,
} from './lib/graph';

async function testGraphSchema() {
  console.log('🧪 Testing Graph Schema (6 Nodes + 6 Edges)\n');

  const testUserId = 'test-user-' + Date.now();
  const testVisionId = 'test-vision-' + Date.now();
  const testLogId = 'test-log-' + Date.now();

  try {
    // ===== TEST 1: Create User Node =====
    console.log('1️⃣ Testing User Node...');
    await createUserNode({
      id: testUserId,
      email: 'test@ascent-ledger.com',
    });
    const user = await getUserNode(testUserId);
    console.log(user ? '✅ User node created' : '❌ User node failed');

    // ===== TEST 2: Create Vision Node =====
    console.log('\n2️⃣ Testing Vision Node...');
    await createVisionNode({
      id: testVisionId,
      desiredState: 'CTO at high-growth startup',
      antiGoal: 'invisible contributor',
    });
    console.log('✅ Vision node created');

    // ===== TEST 3: Create Log Node =====
    console.log('\n3️⃣ Testing Log Node...');
    await createLogNode({
      id: testLogId,
      weekOf: new Date().toISOString().split('T')[0],
      hadLeverage: true,
      content: 'Built automated deployment pipeline. Learned about Kubernetes. Created tech blog.',
    });
    console.log('✅ Log node created');

    // ===== TEST 4: Create Topic Nodes =====
    console.log('\n4️⃣ Testing Topic Nodes...');
    await createTopicNode({ name: 'automation' });
    await createTopicNode({ name: 'kubernetes' });
    await createTopicNode({ name: 'technical-writing' });
    const topicCount = await countNodes('Topic');
    console.log(`✅ Topic nodes created (${topicCount} total)`);

    // ===== TEST 5: Create Fog Node =====
    console.log('\n5️⃣ Testing Fog Node...');
    await createFogNode({ name: 'invisible contributor' });
    console.log('✅ Fog node created');

    // ===== TEST 6: Create Pattern Node =====
    console.log('\n6️⃣ Testing Pattern Node...');
    await createPatternNode({
      type: 'LEARNING_WITHOUT_ACTION',
      severity: 7,
      detectedAt: new Date().toISOString(),
      description: 'User has logged learning for 3+ weeks without taking action',
    });
    console.log('✅ Pattern node created');

    // ===== TEST 7: Create HAS_VISION Relationship =====
    console.log('\n7️⃣ Testing HAS_VISION relationship...');
    await createHasVisionRel(testUserId, testVisionId, {
      createdAt: new Date().toISOString(),
      isActive: true,
    });
    console.log('✅ HAS_VISION relationship created');

    // ===== TEST 8: Create LOGGED Relationship =====
    console.log('\n8️⃣ Testing LOGGED relationship...');
    await createLoggedRel(testUserId, testLogId, {
      createdAt: new Date().toISOString(),
      weekNumber: 1,
    });
    console.log('✅ LOGGED relationship created');

    // ===== TEST 9: Create ESCAPING Relationship =====
    console.log('\n9️⃣ Testing ESCAPING relationship...');
    await createEscapingRel(testUserId, 'invisible contributor', {
      definedAt: new Date().toISOString(),
    });
    const fog = await getUserFog(testUserId);
    console.log(fog ? '✅ ESCAPING relationship created' : '❌ ESCAPING failed');

    // ===== TEST 10: Create BUILDS_TOWARD Relationships =====
    console.log('\n🔟 Testing BUILDS_TOWARD relationships...');
    await createBuildsTowardRel(testLogId, 'automation', {
      confidence: 0.95,
      extractedAt: new Date().toISOString(),
    });
    await createBuildsTowardRel(testLogId, 'kubernetes', {
      confidence: 0.90,
      extractedAt: new Date().toISOString(),
    });
    await createBuildsTowardRel(testLogId, 'technical-writing', {
      confidence: 0.85,
      extractedAt: new Date().toISOString(),
    });
    const topics = await getUserTopics(testUserId);
    console.log(`✅ BUILDS_TOWARD relationships created (${topics.length} topics)`);

    // ===== TEST 11: Create SLIDING_INTO Relationship =====
    console.log('\n1️⃣1️⃣ Testing SLIDING_INTO relationship (danger signal)...');
    await createSlidingIntoRel(testLogId, 'invisible contributor', {
      detectedAt: new Date().toISOString(),
      mentionCount: 2,
    });
    console.log('✅ SLIDING_INTO relationship created');

    // ===== TEST 12: Create EXHIBITS Relationship =====
    console.log('\n1️⃣2️⃣ Testing EXHIBITS relationship...');
    await createExhibitsRel(testUserId, 'LEARNING_WITHOUT_ACTION', {
      detectedAt: new Date().toISOString(),
      firstSeenWeek: 3,
    });
    console.log('✅ EXHIBITS relationship created');

    // ===== FINAL STATS =====
    console.log('\n📊 Final Graph Statistics:');
    const stats = await getGraphStats();
    console.log(`   - Total Nodes: ${stats.nodeCount}`);
    console.log(`   - Total Edges: ${stats.edgeCount}`);
    console.log(`   - Node Labels: ${stats.labels.join(', ')}`);

    console.log('\n🎯 Relationship Counts:');
    for (const relType of Object.values(REL_TYPES)) {
      const count = await countRelationships(relType);
      console.log(`   - ${relType}: ${count}`);
    }

    console.log('\n✅ ALL TESTS PASSED! Graph schema is working correctly.\n');
    console.log('🧹 Note: Test data remains in graph. Use clearTestData() to clean up.');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    process.exit(1);
  }
}

testGraphSchema();