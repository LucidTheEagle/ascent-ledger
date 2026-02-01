// ============================================
// scripts/test-checkpoint-3-5.ts
// Automated Test for Graph Sync + Pattern Detection
// FIXED: Graph cleanup + Fog detection
// ============================================

// 1. Load environment variables IMMEDIATELY
import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Load .env.local first (takes precedence), then .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// 2. Import external libs
import { PrismaClient } from '@prisma/client';

// Setup Adapter
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

// Test user data
const TEST_USER = {
  id: '00000000-0000-0000-0000-000000000001', // UUID format
  email: 'test-checkpoint-5@ascentledger.test',
  fullName: 'Checkpoint Test User',
};

const TEST_VISION = {
  currentState: 'I am 3 years into account management at a marketing agency.',
  desiredState: 'Leading a team of 5 people in a strategic marketing role where I combine technical understanding with creative strategy.',
  successDefinition: 'Autonomy over my projects, mentoring junior team members, earning $75K+.',
  uniqueSkills: 'Web development background, marketing strategy, strong client relationships.',
  purposeStatement: 'I want to build work I am proud of - campaigns that my past self would respect.',
  antiGoal: 'micromanagement',
};

const TEST_LOGS = [
  {
    leverageBuilt: 'None - spent the week researching product management courses and reading "Inspired".',
    learnedInsight: 'I learned that product strategy requires deep customer understanding.',
    opportunitiesCreated: 'Bookmarked 5 PM job postings and downloaded roadmap templates.',
    hadLeverage: false,
  },
  {
    leverageBuilt: 'None - completed 2 online courses on product strategy and OKRs.',
    learnedInsight: 'I realized that frameworks are important but execution matters more.',
    opportunitiesCreated: 'Updated my resume with product-focused language.',
    hadLeverage: false,
  },
  {
    leverageBuilt: 'None - attended 2 webinars and read "Escaping the Build Trap".',
    learnedInsight: 'I learned about discovery vs delivery and team empowerment.',
    opportunitiesCreated: 'Created a mock product brief for a client campaign.',
    hadLeverage: false,
  },
  {
    leverageBuilt: 'None - finished another course on agile. My manager has been micromanaging heavily this week.',
    learnedInsight: 'I realized I have been avoiding reaching out to actual PMs because I fear they will see I lack experience.',
    opportunitiesCreated: 'Found 3 more courses to take and added 15 people to my "PMs to follow" list.',
    hadLeverage: false,
  },
];

async function runTest() {
  console.log('\n🦅 CHECKPOINT 3-5 AUTOMATED TEST\n');
  console.log('='.repeat(60));

  // 3. DYNAMIC IMPORTS
  console.log('[SETUP] Loading libraries...');
  const { executeQuery } = await import('../lib/graph/falkordb-client');
  const { syncVisionToGraph } = await import('../lib/graph/sync-vision');
  const { syncLogToGraph } = await import('../lib/graph/sync-log');
  const { detectAllPatterns } = await import('../lib/graph/patterns');
  console.log('✅ Libraries loaded');

  try {
    // ============================================
    // STEP 1: Clean up any existing test data
    // ============================================
    console.log('\n[STEP 1] Cleaning up existing test data...');
    
    // Clean Postgres
    try {
        await prisma.fogCheck.deleteMany({ where: { userId: TEST_USER.id } });
        await prisma.strategicLog.deleteMany({ where: { userId: TEST_USER.id } });
        await prisma.visionCanvas.deleteMany({ where: { userId: TEST_USER.id } });
        await prisma.user.deleteMany({ where: { id: TEST_USER.id } });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        // Ignore deletion errors
    }
    
    // Clean FalkorDB graph
    try {
        await executeQuery(`
          MATCH (u:User {id: '${TEST_USER.id}'})
          OPTIONAL MATCH (u)-[r]-()
          OPTIONAL MATCH (u)-[]-(connected)
          OPTIONAL MATCH (connected)-[r2]-()
          DELETE r, r2, u, connected
        `);
        console.log('✅ Graph cleaned');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        // Ignore if no data
    }
    
    console.log('✅ Cleanup complete');

    // ============================================
    // STEP 2: Create test user
    // ============================================
    console.log('\n[STEP 2] Creating test user...');
    
    const user = await prisma.user.create({
      data: {
        id: TEST_USER.id,
        email: TEST_USER.email,
        fullName: TEST_USER.fullName,
        tokenBalance: 0,
        totalTokensEarned: 0,
        operatingMode: 'ASCENT',
      },
    });
    
    console.log(`✅ User created: ${user.email}`);

    // ============================================
    // STEP 3: Create Vision Canvas + Sync to Graph
    // ============================================
    console.log('\n[STEP 3] Creating Vision Canvas...');
    
    const vision = await prisma.visionCanvas.create({
      data: {
        userId: TEST_USER.id,
        currentState: TEST_VISION.currentState,
        desiredState: TEST_VISION.desiredState,
        successDefinition: TEST_VISION.successDefinition,
        uniqueSkills: TEST_VISION.uniqueSkills,
        purposeStatement: TEST_VISION.purposeStatement,
        antiGoal: TEST_VISION.antiGoal,
        aiSynthesis: 'Test vision synthesis',
        isActive: true,
      },
    });
    
    console.log(`✅ Vision Canvas created: ${vision.id}`);
    
    // Sync to graph
    console.log('   Syncing Vision to graph...');
    const visionSyncResult = await syncVisionToGraph({
      userId: TEST_USER.id,
      userEmail: TEST_USER.email,
      visionId: vision.id,
      currentState: TEST_VISION.currentState,
      desiredState: TEST_VISION.desiredState,
      successDefinition: TEST_VISION.successDefinition,
      uniqueSkills: TEST_VISION.uniqueSkills,
      purposeStatement: TEST_VISION.purposeStatement,
      antiGoal: TEST_VISION.antiGoal,
    });
    
    console.log(`   Vision sync result:`, visionSyncResult);

    // ============================================
    // STEP 4: Submit 4 Strategic Logs + Sync to Graph
    // ============================================
    console.log('\n[STEP 4] Submitting 4 Strategic Logs...');
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const logIds: string[] = [];
    
    for (let i = 0; i < TEST_LOGS.length; i++) {
      const logData = TEST_LOGS[i];
      const weekOf = new Date();
      weekOf.setDate(weekOf.getDate() - ((3 - i) * 7)); // Week 1, 2, 3, 4
      
      const log = await prisma.strategicLog.create({
        data: {
          userId: TEST_USER.id,
          weekOf,
          leverageBuilt: logData.leverageBuilt,
          learnedInsight: logData.learnedInsight,
          opportunitiesCreated: logData.opportunitiesCreated,
          hadNoLeverage: true,
          isSurvivalMode: false,
        },
      });
      
      logIds.push(log.id);
      console.log(`   ✅ Log ${i + 1} created: ${log.id.substring(0, 8)}...`);
      
      // Sync to graph
      const logSyncResult = await syncLogToGraph({
        userId: TEST_USER.id,
        logId: log.id,
        weekOf,
        weekNumber: i + 1,
        leverageBuilt: logData.leverageBuilt,
        learnedInsight: logData.learnedInsight,
        opportunitiesCreated: logData.opportunitiesCreated,
        hadLeverage: logData.hadLeverage,
      });
      
      console.log(`   Log ${i + 1} sync: ${logSyncResult.topicsCreated} topics, fog=${logSyncResult.fogDetected}`);
    }

    // ============================================
    // STEP 5: Verify Graph Structure
    // ============================================
    console.log('\n[STEP 5] Verifying graph structure...');
    
    // Check User + Vision + Fog
    const graphCheck1 = await executeQuery(`
      MATCH (u:User {id: '${TEST_USER.id}'})
      OPTIONAL MATCH (u)-[:HAS_VISION]->(v:Vision)
      OPTIONAL MATCH (u)-[:ESCAPING]->(f:Fog)
      RETURN count(u) as userCount, count(v) as visionCount, count(f) as fogCount
    `);
    
    const row1 = graphCheck1.data[0] as unknown as Record<string, unknown>;
    console.log(`   User nodes: ${row1.userCount}`);
    console.log(`   Vision nodes: ${row1.visionCount}`);
    console.log(`   Fog nodes: ${row1.fogCount}`);
    
    // Check Logs
    const graphCheck2 = await executeQuery(`
      MATCH (u:User {id: '${TEST_USER.id}'})-[:LOGGED]->(l:Log)
      RETURN count(l) as logCount
    `);
    
    const row2 = graphCheck2.data[0] as unknown as Record<string, unknown>;
    console.log(`   Log nodes: ${row2.logCount}`);
    
    // Check Topics
    const graphCheck3 = await executeQuery(`
      MATCH (u:User {id: '${TEST_USER.id}'})-[:LOGGED]->(l:Log)-[:BUILDS_TOWARD]->(t:Topic)
      RETURN count(DISTINCT t) as topicCount
    `);
    
    const row3 = graphCheck3.data[0] as unknown as Record<string, unknown>;
    console.log(`   Topic nodes: ${row3.topicCount}`);
    
    // Check SLIDING_INTO
    const graphCheck4 = await executeQuery(`
      MATCH (u:User {id: '${TEST_USER.id}'})-[:LOGGED]->(l:Log)-[:SLIDING_INTO]->(f:Fog)
      RETURN count(l) as slidingCount
    `);
    
    const row4 = graphCheck4.data[0] as unknown as Record<string, unknown>;
    console.log(`   SLIDING_INTO relationships: ${row4.slidingCount}`);

    // ============================================
    // STEP 6: Run Pattern Detection
    // ============================================
    console.log('\n[STEP 6] Running pattern detection...');
    
    const patterns = await detectAllPatterns(
      TEST_USER.id,
      TEST_VISION.desiredState,
      4
    );
    
    console.log(`   Patterns detected: ${patterns.hasPatterns}`);
    console.log(`   Learning Without Action: ${patterns.learningWithoutAction.detected} (${patterns.learningWithoutAction.streakWeeks} weeks)`);
    console.log(`   Sliding Into Fog: ${patterns.slidingIntoFog.detected} (${patterns.slidingIntoFog.mentionCount} mentions)`);
    console.log(`   Vision Misalignment: ${patterns.visionMisalignment.detected}`);
    
    if (patterns.hasPatterns) {
      console.log('\n   Pattern Summary:');
      patterns.summary.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s}`);
      });
    }

    // ============================================
    // STEP 7: Verify Expected Patterns
    // ============================================
    console.log('\n[STEP 7] Verification...');
    
    const checks = {
      graphSyncWorking: (row2.logCount as number) === 4,
      topicsExtracted: (row3.topicCount as number) > 0,
      fogDetected: (row4.slidingCount as number) > 0,
      learningPatternDetected: patterns.learningWithoutAction.detected && patterns.learningWithoutAction.streakWeeks >= 3,
      fogPatternDetected: patterns.slidingIntoFog.detected,
    };
    
    console.log('');
    console.log('   Graph Sync Working:', checks.graphSyncWorking ? '✅' : '❌');
    console.log('   Topics Extracted:', checks.topicsExtracted ? '✅' : '❌');
    console.log('   Fog Detection:', checks.fogDetected ? '✅' : '❌');
    console.log('   Learning Pattern:', checks.learningPatternDetected ? '✅' : '❌');
    console.log('   Fog Pattern:', checks.fogPatternDetected ? '✅' : '❌');
    
    const allPassed = Object.values(checks).every(Boolean);
    
    console.log('\n' + '='.repeat(60));
    console.log(allPassed ? '\n✅ ALL TESTS PASSED' : '\n❌ SOME TESTS FAILED');
    console.log('\n' + '='.repeat(60));
    
    return allPassed;

  } catch (error) {
    console.error('\n❌ TEST FAILED WITH ERROR:');
    console.error(error);
    return false;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// Run the test
runTest()
  .then((passed) => {
    process.exit(passed ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });