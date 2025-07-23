const { Client } = require('pg');
require('dotenv').config();

async function debugExercise55Data() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await client.connect();
    
    console.log('=== EXERCISE 55 DATA STRUCTURE ANALYSIS ===\n');
    
    // Get the exercise data
    const result = await client.query(`
      SELECT id, title, type, problem_data, solution_data
      FROM exercises 
      WHERE id = 55
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ Exercise 55 not found');
      return;
    }
    
    const exercise = result.rows[0];
    console.log(`📋 Title: ${exercise.title}`);
    console.log(`🔧 Type: ${exercise.type}\n`);
    
    // Analyze problem_data structure
    console.log('--- PROBLEM DATA ANALYSIS ---');
    const problemData = exercise.problem_data;
    console.log(`📊 Data Type: ${typeof problemData}`);
    console.log(`🎯 Is Object: ${typeof problemData === 'object' && problemData !== null}`);
    
    if (typeof problemData === 'object') {
      console.log('\n🔍 Object Properties:');
      Object.keys(problemData).forEach(key => {
        const value = problemData[key];
        console.log(`  - ${key}: ${typeof value} ${Array.isArray(value) ? `(array length: ${value.length})` : ''}`);
      });
      
      // Check specific fields that the frontend expects
      console.log('\n📈 Frontend Expected Fields:');
      console.log(`  ✅ crime_sequence: ${problemData.crime_sequence ? `Found (${problemData.crime_sequence.length} items)` : '❌ Missing'}`);
      console.log(`  ✅ next_targets: ${problemData.next_targets ? `Found (${problemData.next_targets.length} items)` : '❌ Missing'}`);
      console.log(`  ✅ question: ${problemData.question ? 'Found' : '❌ Missing'}`);
      console.log(`  ✅ context: ${problemData.context ? 'Found' : '❌ Missing'}`);
      
      // Show sample data
      if (problemData.crime_sequence && problemData.crime_sequence.length > 0) {
        console.log('\n🔍 Crime Sequence Sample (first item):');
        console.log(JSON.stringify(problemData.crime_sequence[0], null, 2));
      }
      
      if (problemData.next_targets && problemData.next_targets.length > 0) {
        console.log('\n🎯 Next Targets:');
        problemData.next_targets.forEach((target, index) => {
          console.log(`  ${index + 1}. ${target}`);
        });
      }
    }
    
    // Analyze solution_data structure
    console.log('\n--- SOLUTION DATA ANALYSIS ---');
    const solutionData = exercise.solution_data;
    console.log(`📊 Data Type: ${typeof solutionData}`);
    
    if (typeof solutionData === 'object') {
      console.log('\n🔍 Solution Properties:');
      Object.keys(solutionData).forEach(key => {
        const value = solutionData[key];
        console.log(`  - ${key}: ${typeof value} ${Array.isArray(value) ? `(array length: ${value.length})` : ''}`);
      });
      
      console.log('\n📝 Solution Details:');
      console.log(`  ✅ correct_answer: ${solutionData.correct_answer || '❌ Missing'}`);
      console.log(`  ✅ explanation: ${solutionData.explanation ? 'Found' : '❌ Missing'}`);
      if (solutionData.valid_answers) {
        console.log(`  ✅ valid_answers: Found (${solutionData.valid_answers.length} alternatives)`);
      }
    }
    
    // Test JSON serialization/deserialization
    console.log('\n--- JSON SERIALIZATION TEST ---');
    try {
      const serialized = JSON.stringify(problemData);
      const deserialized = JSON.parse(serialized);
      console.log('✅ JSON serialization/deserialization works correctly');
      console.log(`📏 Serialized length: ${serialized.length} characters`);
    } catch (error) {
      console.log('❌ JSON serialization failed:', error.message);
    }
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugExercise55Data();