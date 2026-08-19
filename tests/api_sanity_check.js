const assert = require('assert');

const BACKEND_URL = 'http://localhost:5000';

async function runTestMatrix() {
  console.log('🧪 Starting Phase 3 12-Case Test Matrix Verification...\n');
  let failed = false;

  const testCases = [
    {
      id: 1,
      name: "Tenant Problem",
      query: "My landlord hasn't returned my deposit.",
      expectedModule: "RIGHTS_NAVIGATOR",
      expectedCategory: "Housing / Tenant",
      expectedConfidence: "HIGH"
    },
    {
      id: 2,
      name: "Workplace Wages",
      query: "My employer hasn't paid my wages.",
      expectedModule: "RIGHTS_NAVIGATOR",
      expectedCategory: "Employment / Wage",
      expectedConfidence: "HIGH"
    },
    {
      id: 3,
      name: "Consumer Refund",
      query: "My phone seller refuses a refund.",
      expectedModule: "RIGHTS_NAVIGATOR",
      expectedCategory: "Consumer / Refund",
      expectedConfidence: "HIGH"
    },
    {
      id: 4,
      name: "Police misconduct",
      query: "Police used excessive force during an incident.",
      expectedModule: "RIGHTS_NAVIGATOR",
      expectedCategory: "Police / Public Authority",
      expectedConfidence: "MEDIUM"
    },
    {
      id: 5,
      name: "Civic Sanitation",
      query: "Garbage hasn't been collected in my street.",
      expectedModule: "RIGHTS_NAVIGATOR",
      expectedCategory: "Sanitation / Waste",
      expectedConfidence: "HIGH"
    },
    {
      id: 6,
      name: "Road / Infrastructure",
      query: "Pothole damaged street repair required.",
      expectedModule: "RIGHTS_NAVIGATOR",
      expectedCategory: "Roads / Public Infrastructure",
      expectedConfidence: "HIGH"
    },
    {
      id: 7,
      name: "Scheme Query",
      query: "Can I qualify for government scholarship Yashasvi?",
      expectedModule: "SCHEME_ELIGIBILITY",
      expectedCategory: "Education",
      expectedConfidence: "HIGH"
    },
    {
      id: 8,
      name: "RTI Query",
      query: "allocated road budget MG Road spent under RTI",
      expectedModule: "RTI_DRAFTING",
      expectedCategory: "Roads / Public Infrastructure",
      expectedConfidence: "HIGH"
    },
    {
      id: 9,
      name: "Form Query",
      query: "help fill out income certificate application form",
      expectedModule: "FORM_FILLER",
      expectedCategory: "Identity / Public Documents",
      expectedConfidence: "HIGH"
    },
    {
      id: 10,
      name: "Ambiguous Query",
      query: "my employer is treating me unfairly",
      expectedModule: "RIGHTS_NAVIGATOR",
      expectedCategory: "Employment / Wage",
      expectedConfidence: "MEDIUM"
    },
    {
      id: 11,
      name: "Completely Unsupported",
      query: "how to cook pasta at home",
      expectedModule: "RIGHTS_NAVIGATOR",
      expectedCategory: "Other Civic Issue",
      expectedConfidence: "LOW"
    },
    {
      id: 12,
      name: "Empty Input",
      query: "",
      expectedModule: "RIGHTS_NAVIGATOR",
      expectedCategory: "Other Civic Issue",
      expectedConfidence: "LOW"
    }
  ];

  for (const tc of testCases) {
    try {
      console.log(`--- Test ${tc.id}: ${tc.name} ---`);
      console.log(`Query: "${tc.query}"`);

      // 1. Check Routing
      const routeRes = await fetch(`${BACKEND_URL}/api/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: tc.query })
      });
      assert(routeRes.ok, `Routing status: ${routeRes.status}`);
      const routeData = await routeRes.json();
      
      console.log(`Routed Module: ${routeData.module} (Expected: ${tc.expectedModule})`);
      console.log(`Category: ${routeData.category} (Expected: ${tc.expectedCategory})`);
      console.log(`Confidence: ${routeData.confidence} (Expected: ${tc.expectedConfidence})`);

      assert.strictEqual(routeData.module, tc.expectedModule, "Module mismatch");
      assert.strictEqual(routeData.category, tc.expectedCategory, "Category mismatch");
      assert.strictEqual(routeData.confidence, tc.expectedConfidence, "Confidence mismatch");

      // For Rights Navigator modules, evaluate source retrieval and fallbacks
      if (tc.expectedModule === 'RIGHTS_NAVIGATOR') {
        const analyzeRes = await fetch(`${BACKEND_URL}/api/rights/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: tc.query })
        });
        assert(analyzeRes.ok, `Analysis status: ${analyzeRes.status}`);
        const analyzeData = await analyzeRes.json();

        if (tc.expectedConfidence === 'LOW') {
          console.log(`✅ UNSUPPORTED FALLBACK TRIGGERED`);
          assert.strictEqual(analyzeData.status, 'UNSUPPORTED_FALLBACK', "Expected fallback status");
          assert(analyzeData.response.unsupported === true, "Marked unsupported");
          assert(analyzeData.response.whatWeCannotVerifyYet.includes('not guess'), "Grounding check");
        } else {
          console.log(`✅ GROUNDED RESPONSE RETRIEVED`);
          assert(analyzeData.response.whatWeUnderstand !== undefined, "whatWeUnderstand populated");
          assert(analyzeData.response.whatYouMayDoNext.length > 0, "Action steps populated");
          // Ensure we don't bleed tenant info into police complaints or vice versa
          if (tc.name === "Police misconduct") {
            assert(!analyzeData.response.whatWeUnderstand.includes('landlord'), "Police query should not return landlord details");
          }
          if (tc.name === "Tenant Problem") {
            assert(!analyzeData.response.whatWeUnderstand.includes('police'), "Tenant query should not return police details");
          }
        }
      }

      console.log(`✅ Test ${tc.id} PASSED\n`);
    } catch (err) {
      console.error(`❌ Test ${tc.id} FAILED:`, err.message);
      failed = true;
    }
  }

  // 13. Conversational form filler check
  try {
    console.log(`--- Test 13: Conversational Form Filler Corrections ---`);
    const startRes = await fetch(`${BACKEND_URL}/api/forms/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formId: 'form-income-01' })
    });
    assert(startRes.ok);
    const startData = await startRes.json();
    const sessionId = startData.sessionId;

    // Submit answer to first field
    const answerRes = await fetch(`${BACKEND_URL}/api/forms/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        answer: 'Sampreeth Racharla'
      })
    });
    assert(answerRes.ok);

    // Edit the answer
    const editRes = await fetch(`${BACKEND_URL}/api/forms/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        fieldName: 'fullName',
        answer: 'Sampreeth R'
      })
    });
    assert(editRes.ok);
    const editData = await editRes.json();
    assert.strictEqual(editData.answers.fullName, 'Sampreeth R', 'Inline correction updated fullName answer successfully');
    console.log(`✅ Test 13 PASSED\n`);
  } catch (err) {
    console.error(`❌ Test 13 FAILED:`, err.message);
    failed = true;
  }

  console.log('======================================');
  if (failed) {
    console.log('❌ SOME TESTS FAILED. CHECK LOGS ABOVE.');
    process.exit(1);
  } else {
    console.log('🎉 ALL 13 TEST MATRIX CHECKS PASSED SUCCESSFULLY!');
    process.exit(0);
  }
}

runTestMatrix();
