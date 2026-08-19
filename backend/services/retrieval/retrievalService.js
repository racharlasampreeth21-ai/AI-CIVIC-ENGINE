const fs = require('fs');
const path = require('path');

const KB_DIR = path.join(__dirname, '..', '..', '..', 'knowledge-base');

// Load all JSON documents from a folder
function loadDocumentsFromFolder(folderName) {
  const folderPath = path.join(KB_DIR, folderName);
  const documents = [];

  try {
    if (!fs.existsSync(folderPath)) {
      console.warn(`Knowledge base folder not found: ${folderPath}`);
      return documents;
    }

    const files = fs.readdirSync(folderPath);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(folderPath, file);
        const data = fs.readFileSync(filePath, 'utf8');
        try {
          const doc = JSON.parse(data);
          documents.push(doc);
        } catch (jsonErr) {
          console.error(`Error parsing JSON file ${filePath}:`, jsonErr);
        }
      }
    }
  } catch (err) {
    console.error(`Error reading folder ${folderPath}:`, err);
  }

  return documents;
}

// Load all documents in the KB
function loadAllDocuments() {
  return [
    ...loadDocumentsFromFolder('rights'),
    ...loadDocumentsFromFolder('schemes'),
    ...loadDocumentsFromFolder('rti'),
    ...loadDocumentsFromFolder('forms')
  ];
}

const retrievalService = {
  // Simple search function
  search: (query = '', category = null) => {
    console.log(`[Retrieval] Searching for: "${query}" in category: ${category || 'ALL'}`);
    const docs = loadAllDocuments();
    
    let filteredDocs = docs;
    if (category) {
      filteredDocs = docs.filter(doc => doc.category.toLowerCase().includes(category.toLowerCase()));
    }

    if (!query || query.trim() === '') {
      return filteredDocs; // Return all matching category docs if no query string
    }

    const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    
    // Rank documents based on keyword matching count
    const rankedDocs = filteredDocs.map(doc => {
      let score = 0;
      const textToSearch = `${doc.title} ${doc.authority} ${doc.content || ''} ${doc.category} ${JSON.stringify(doc.criteria || '')}`.toLowerCase();
      
      searchTerms.forEach(term => {
        const wordRegex = new RegExp(`\\b${term}\\b`, 'i');
        if (wordRegex.test(textToSearch)) {
          score += 1;
          // Weighted scoring for title matches
          if (wordRegex.test(doc.title)) {
            score += 2;
          }
        }
      });

      return { doc, score };
    });

    // Sort by score descending and filter out docs with 0 match score if search terms were provided
    return rankedDocs
      .filter(item => item.score > 0 || searchTerms.length === 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.doc);
  },

  // Direct fetch by ID
  getById: (id) => {
    const docs = loadAllDocuments();
    return docs.find(doc => doc.id === id);
  }
};

module.exports = retrievalService;
