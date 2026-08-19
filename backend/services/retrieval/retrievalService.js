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
          doc._folder = folderName;
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
      filteredDocs = docs.filter(doc => 
        doc._folder === category || 
        (doc.category && doc.category.toLowerCase().includes(category.toLowerCase()))
      );
    }

    if (!query || query.trim() === '') {
      return filteredDocs; // Return all matching category docs if no query string
    }

    const cleanQuery = query.trim().toLowerCase();
    const searchTerms = cleanQuery.split(/\s+/).filter(t => t.length > 2);
    
    // Rank documents based on exact phrase matches and weighted field word matching
    const rankedDocs = filteredDocs.map(doc => {
      let score = 0;
      
      const docTitle = (doc.title || '').toLowerCase();
      const docAuthority = (doc.authority || '').toLowerCase();
      const docContent = (doc.content || '').toLowerCase();
      const docCategory = (doc.category || '').toLowerCase();
      const docCriteria = doc.criteria ? JSON.stringify(doc.criteria).toLowerCase() : '';
      
      const fullText = `${docTitle} ${docAuthority} ${docContent} ${docCategory} ${docCriteria}`;
      
      // 1. Exact phrase matching (weight +5)
      if (fullText.includes(cleanQuery)) {
        score += 5;
      }

      // 2. Individual word matches with word boundaries and specific weights
      searchTerms.forEach(term => {
        const wordRegex = new RegExp(`\\b${term}\\b`, 'i');
        
        // Match in Title (+3)
        if (wordRegex.test(docTitle)) {
          score += 3;
        }
        // Match in Category (+2)
        if (wordRegex.test(docCategory)) {
          score += 2;
        }
        // Match in Authority (+1.5)
        if (wordRegex.test(docAuthority)) {
          score += 1.5;
        }
        // Match in Content (+1)
        if (wordRegex.test(docContent)) {
          score += 1;
        }
        // Match in Criteria (+1)
        if (docCriteria && wordRegex.test(docCriteria)) {
          score += 1;
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
