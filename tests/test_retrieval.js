// Test retrieval service queries
const retrievalService = require('../backend/services/retrieval/retrievalService');

const queries = [
  { text: "My landlord has not returned my security deposit", cat: "rights" },
  { text: "PM Yashasvi scholarship scheme for EBC category", cat: "schemes" },
  { text: "road construction fund allocation ward PWD", cat: "rti" },
  { text: "fill out application details for Income Certificate", cat: "forms" },
  { text: "unpaid salary wages from employer", cat: "rights" }
];

console.log('🧪 Auditing Retrieval Service with 5 Test Queries:\n');

queries.forEach((q, idx) => {
  console.log(`Query ${idx + 1}: "${q.text}" (Category filter: ${q.cat})`);
  const results = retrievalService.search(q.text, q.cat);
  console.log(`- Results count: ${results.length}`);
  if (results.length > 0) {
    results.forEach(doc => {
      console.log(`  * MATCHED: [ID: ${doc.id}] "${doc.title}" (Authority: ${doc.authority})`);
    });
  } else {
    console.log(`  * NO MATCH FOUND`);
  }
  console.log('----------------------------------------------------');
});
