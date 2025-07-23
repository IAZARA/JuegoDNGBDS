const Exercise = require('../models/Exercise');

async function simulateApiResponse() {
  try {
    console.log('=== SIMULATING FRONTEND API RESPONSE ===\n');
    
    // This simulates what the controller does
    const exercise = await Exercise.findById(55);
    
    if (!exercise) {
      console.log('❌ Exercise not found');
      return;
    }
    
    // This is what gets sent to the frontend (same as controller line 69)
    const apiResponse = {
      id: exercise.id,
      title: exercise.title,
      description: exercise.description,
      difficulty: exercise.difficulty,
      points: exercise.points,
      category: exercise.category,
      type: exercise.type,
      problem_data: exercise.problem_data,  // This is the key field
      hints: exercise.hints,
      time_limit: exercise.time_limit
    };
    
    console.log('📡 API Response structure:');
    console.log(`  - ID: ${apiResponse.id}`);
    console.log(`  - Title: ${apiResponse.title}`);
    console.log(`  - Type: ${apiResponse.type}`);
    console.log(`  - problem_data type: ${typeof apiResponse.problem_data}`);
    
    console.log('\n🔍 problem_data content:');
    console.log('  - Is object:', typeof apiResponse.problem_data === 'object');
    console.log('  - Has crime_sequence:', !!apiResponse.problem_data.crime_sequence);
    console.log('  - Has next_targets:', !!apiResponse.problem_data.next_targets);
    
    console.log('\n📝 What frontend receives (JSON.stringify result):');
    const jsonResponse = JSON.stringify(apiResponse, null, 2);
    console.log('JSON length:', jsonResponse.length, 'characters');
    
    // Show a portion of the JSON that would be sent
    console.log('\n📦 JSON structure preview:');
    const parsed = JSON.parse(jsonResponse);
    console.log('  - problem_data.crime_sequence length:', parsed.problem_data.crime_sequence.length);
    console.log('  - problem_data.next_targets length:', parsed.problem_data.next_targets.length);
    console.log('  - First crime:', parsed.problem_data.crime_sequence[0].crime);
    console.log('  - First target:', parsed.problem_data.next_targets[0]);
    
    console.log('\n✅ Data is properly structured for frontend consumption');
    console.log('✅ No JSON parsing needed on frontend - data is already an object');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

simulateApiResponse();