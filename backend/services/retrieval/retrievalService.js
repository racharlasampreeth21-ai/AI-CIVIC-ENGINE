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

function mapQueryToEnglish(query) {
  const q = query.toLowerCase();
  
  // 1. Tenant/Housing
  if (q.includes('భూస్వామి') || q.includes('అద్దె') || q.includes('డిపాజిట్') || q.includes('అద్దెదారు') || q.includes('టెనెంట్') ||
      q.includes('మకాన్') || q.includes('मकान मालिक') || q.includes('किराया') || q.includes('जमा') || q.includes('किरायेदार')) {
    return "landlord deposit rent tenant housing tenancy";
  }
  
  // 2. Wages/Employment
  if (q.includes('యజమాని') || q.includes('జీతం') || q.includes('వేతనం') || q.includes('ఉద్యోగం') ||
      q.includes('नियोक्ता') || q.includes('वेतन') || q.includes('नौकरी') || q.includes('मालिक') || q.includes('मजदूरी')) {
    return "employer salary wages workplace employment wage unpaid";
  }
  
  // 3. Consumer/Refund
  if (q.includes('విక్రేత') || q.includes('రీఫండ్') || q.includes('కొనుగోలు') || q.includes('దుకాణం') || q.includes('ఫోన్') ||
      q.includes('विक्रेता') || q.includes('रिफंड') || q.includes('खरीदा') || q.includes('दुकान') || q.includes('फ़ोन') || q.includes('फोन')) {
    return "refund seller consumer phone product store defective";
  }
  
  // 4. Police Misconduct
  if (q.includes('పోలీస్') || q.includes('అరెస్టు') || q.includes('నిర్బంధం') ||
      q.includes('पुलिस') || q.includes('गिरफ्तारी') || q.includes('हिरासत') || q.includes('दुर्व्यवहार')) {
    return "police force brutality arrest detained public authority misconduct";
  }
  
  // 5. Sanitation
  if (q.includes('చెత్త') || q.includes('శుభ్రం') || q.includes('వ్యర్థాల') ||
      q.includes('कचरा') || q.includes('सफाई') || q.includes('स्वच्छता')) {
    return "garbage waste sanitation rubbish cleaning collect street";
  }
  
  // 6. Roads/Infrastructure
  if (q.includes('రోడ్డు') || q.includes('గుంత') || q.includes('వీధి') ||
      q.includes('सड़क') || q.includes('गड्ढा') || q.includes('गली')) {
    return "road pothole street infrastructure pavement repair construction";
  }

  return query;
}

const retrievalService = {
  // Simple search function
  search: (query = '', category = null) => {
    const mappedQuery = mapQueryToEnglish(query);
    console.log(`[Retrieval] Searching for: "${query}" (Mapped: "${mappedQuery}") in category: ${category || 'ALL'}`);
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

    const cleanQuery = mappedQuery.trim().toLowerCase();
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
