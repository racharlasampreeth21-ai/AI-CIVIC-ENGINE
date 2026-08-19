// API Sanity Check for Civic Action Engine
// Run with: node api_sanity_check.js

const BACKEND_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting API Sanity Verification Tests...');
  let failed = false;

  // Test Helper
  const assert = (condition, message) => {
    if (!condition) {
      console.error(`❌ FAILED: ${message}`);
      failed = true;
    } else {
      console.log(`✅ PASSED: ${message}`);
    }
  };

  try {
    // 1. Health check
    console.log('\n--- Test 1: Health Check ---');
    const healthRes = await fetch(`${BACKEND_URL}/api/health`);
    assert(healthRes.ok, `Health endpoint returned status ${healthRes.status}`);
    const healthData = await healthRes.json();
    assert(healthData.status === 'healthy', 'Health status is "healthy"');
    assert(healthData.hasOwnProperty('hasKey'), 'Health response has key check field');

    // 2. Intelligent Routing
    console.log('\n--- Test 2: Intelligent Routing ---');
    const routeRes = await fetch(`${BACKEND_URL}/api/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'My landlord did not return my security deposit.' })
    });
    assert(routeRes.ok, `Route endpoint returned status ${routeRes.status}`);
    const routeData = await routeRes.json();
    assert(routeData.category === 'RIGHTS_NAVIGATOR', `Query routed to: ${routeData.category} (Expected: RIGHTS_NAVIGATOR)`);

    // 3. Rights Navigator
    console.log('\n--- Test 3: Rights Analysis ---');
    const rightsRes = await fetch(`${BACKEND_URL}/api/rights/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'My landlord is refusing to return my security deposit.' })
    });
    assert(rightsRes.ok, `Rights endpoint returned status ${rightsRes.status}`);
    const rightsData = await rightsRes.json();
    assert(rightsData.type === 'RIGHTS_NAVIGATOR', 'Session type is RIGHTS_NAVIGATOR');
    assert(rightsData.response.whatWeUnderstand !== undefined, 'Rights analysis whatWeUnderstand is populated');
    assert(rightsData.response.whatYouMayDoNext.length > 0, 'Rights analysis returned next steps list');

    // 4. Scheme Eligibility
    console.log('\n--- Test 4: Scheme Eligibility ---');
    const schemeRes = await fetch(`${BACKEND_URL}/api/schemes/eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: {
          category: 'OBC',
          annualIncome: '180000',
          currentClass: '11',
          previousMarks: '85'
        }
      })
    });
    assert(schemeRes.ok, `Scheme endpoint returned status ${schemeRes.status}`);
    const schemeData = await schemeRes.json();
    assert(schemeData.response.status === 'LIKELY ELIGIBLE', `Scheme checker status: ${schemeData.response.status} (Expected: LIKELY ELIGIBLE)`);
    assert(schemeData.response.evaluation.income.satisfied === true, 'Income criteria check satisfied');

    // 5. RTI Drafting Agent
    console.log('\n--- Test 5: RTI Draft Generation ---');
    const rtiRes = await fetch(`${BACKEND_URL}/api/rti/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'road construction funds MG Road',
        applicantName: 'Sampreeth Racharla',
        applicantAddress: 'Delhi'
      })
    });
    assert(rtiRes.ok, `RTI endpoint returned status ${rtiRes.status}`);
    const rtiData = await rtiRes.json();
    assert(rtiData.response.rtiDraft.includes('Sampreeth Racharla'), 'RTI Draft successfully replaced name placeholder');
    assert(rtiData.response.rtiDraft.includes('Section 6(1)'), 'RTI Draft has statutory headers');

    // 6. Conversational Form-Filler Workflow
    console.log('\n--- Test 6: Conversational Form Filler ---');
    const startRes = await fetch(`${BACKEND_URL}/api/forms/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formId: 'form-income-01' })
    });
    assert(startRes.ok, `Form start returned status ${startRes.status}`);
    const startData = await startRes.json();
    const sessionId = startData.sessionId;
    assert(sessionId !== undefined, 'Form session ID created successfully');
    assert(startData.currentField.name === 'fullName', 'Initial prompt field is fullName');

    // Submit answer to first field
    const answerRes = await fetch(`${BACKEND_URL}/api/forms/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        answer: 'Sampreeth Racharla'
      })
    });
    assert(answerRes.ok, `Form respond returned status ${answerRes.status}`);
    const answerData = await answerRes.json();
    assert(answerData.currentField.name === 'fatherHusbandName', `Advanced to next field: ${answerData.currentField.name} (Expected: fatherHusbandName)`);

    // 7. Form Filler Inline Correction
    console.log('\n--- Test 7: Form Filler Inline Correction ---');
    const editRes = await fetch(`${BACKEND_URL}/api/forms/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        fieldName: 'fullName',
        answer: 'Sampreeth R'
      })
    });
    assert(editRes.ok, `Form edit returned status ${editRes.status}`);
    const editData = await editRes.json();
    assert(editData.answers.fullName === 'Sampreeth R', 'Inline correction updated fullName answer successfully');

  } catch (err) {
    console.error('💥 Test execution threw an error:', err);
    failed = true;
  }

  console.log('\n======================================');
  if (failed) {
    console.log('❌ SOME TESTS FAILED. CHECK LOGS ABOVE.');
    process.exit(1);
  } else {
    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  }
}

runTests();
