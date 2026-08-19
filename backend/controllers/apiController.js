const geminiService = require('../services/ai/geminiService');
const retrievalService = require('../services/retrieval/retrievalService');
const dbHelper = require('../models/dbHelper');

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

const apiController = {
  // 1. Intelligent Route classification
  routeRequest: async (req, res, next) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Text prompt is required' });
      }
      const routingResult = await geminiService.routeRequest(text);
      res.json(routingResult);
    } catch (err) {
      next(err);
    }
  },

  // 2. Rights Navigator Analyzer
  analyzeRights: async (req, res, next) => {
    try {
      const { text, sessionId } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Text prompt is required' });
      }

      const analysis = await geminiService.analyzeRights(text);
      
      // Save session history
      const session = {
        id: sessionId || generateId(),
        type: 'RIGHTS_NAVIGATOR',
        prompt: text,
        response: analysis,
        timestamp: new Date().toISOString()
      };
      dbHelper.saveSession(session);

      res.json(session);
    } catch (err) {
      next(err);
    }
  },

  // 3. Scheme Eligibility Evaluator
  checkSchemeEligibility: async (req, res, next) => {
    try {
      const { profile, sessionId } = req.body;
      // profile contains: { category, annualIncome, currentClass, previousMarks }
      if (!profile) {
        return res.status(400).json({ error: 'Profile details are required' });
      }

      // Fetch the scholarship scheme from knowledge base
      const schemes = retrievalService.search('Yashasvi', 'Education Schemes');
      if (!schemes.length) {
        return res.status(500).json({ error: 'Scholarship scheme source document not found' });
      }
      const scheme = schemes[0];
      const criteria = scheme.criteria;

      // Check for missing fields
      const isMissingField = 
        !profile.category || 
        profile.annualIncome === undefined || profile.annualIncome === null || profile.annualIncome === '' ||
        !profile.currentClass || 
        profile.previousMarks === undefined || profile.previousMarks === null || profile.previousMarks === '';

      // Evaluation comparisons
      const evaluation = {
        category: {
          label: 'Category Requirement (OBC/EBC/DNT)',
          satisfied: !profile.category ? null : criteria.category.map(c => c.toLowerCase()).includes((profile.category || '').trim().toLowerCase()),
          details: !profile.category ? 'Category detail missing.' : `Applicant is in "${profile.category || 'Unknown'}" category. Allowed: ${criteria.category.join(', ')}.`
        },
        income: {
          label: 'Parental Annual Income Limit',
          satisfied: (profile.annualIncome === undefined || profile.annualIncome === null || profile.annualIncome === '') ? null : (Number(profile.annualIncome) <= criteria.max_parental_income_inr),
          details: (profile.annualIncome === undefined || profile.annualIncome === null || profile.annualIncome === '') ? 'Income detail missing.' : `Applicant income is INR ${Number(profile.annualIncome).toLocaleString()}. Limit: <= INR ${criteria.max_parental_income_inr.toLocaleString()}.`
        },
        class: {
          label: 'Academic Class Level',
          satisfied: !profile.currentClass ? null : (Number(profile.currentClass) >= criteria.min_class && Number(profile.currentClass) <= criteria.max_class),
          details: !profile.currentClass ? 'Class level detail missing.' : `Applicant is studying in Class ${profile.currentClass || 'Unknown'}. Required: Class ${criteria.min_class} or ${criteria.max_class}.`
        },
        marks: {
          label: 'Previous Class Academic Performance',
          satisfied: (profile.previousMarks === undefined || profile.previousMarks === null || profile.previousMarks === '') ? null : (Number(profile.previousMarks) >= criteria.min_previous_marks_percentage),
          details: (profile.previousMarks === undefined || profile.previousMarks === null || profile.previousMarks === '') ? 'Previous grade marks detail missing.' : `Applicant scored ${profile.previousMarks || 0}%. Required: >= ${criteria.min_previous_marks_percentage}%.`
        }
      };

      // Calculate final status
      let eligibilityStatus = 'LIKELY NOT ELIGIBLE';
      if (isMissingField) {
        eligibilityStatus = 'INSUFFICIENT INFORMATION';
      } else {
        const allPassed = Object.values(evaluation).every(crit => crit.satisfied === true);
        if (allPassed) {
          eligibilityStatus = 'LIKELY ELIGIBLE';
        }
      }

      // Prepare response payload
      const response = {
        schemeTitle: scheme.title,
        status: eligibilityStatus,
        evaluation,
        requiredDocuments: scheme.required_documents,
        benefits: scheme.benefits,
        source: {
          title: scheme.title,
          authority: scheme.authority,
          source_url: scheme.source_url
        },
        disclaimer: "Informational assessment only. Final award depends on official vetting and budget availability by the government portal.",
        mode: "LOCAL_EVALUATION"
      };

      // Save to sessions
      const session = {
        id: sessionId || generateId(),
        type: 'SCHEME_ELIGIBILITY',
        profile,
        response,
        timestamp: new Date().toISOString()
      };
      dbHelper.saveSession(session);

      res.json(session);
    } catch (err) {
      next(err);
    }
  },

  // 4. RTI Drafting Agent
  draftRti: async (req, res, next) => {
    try {
      const { text, sessionId, applicantName, applicantAddress } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Text request is required' });
      }

      const result = await geminiService.draftRti(text);

      // Customize the draft text if name/address provided
      let customizedDraft = result.rtiDraft;
      if (applicantName) {
        customizedDraft = customizedDraft.replace(/\[Needs your input: Applicant Name\]/g, applicantName);
      }
      if (applicantAddress) {
        customizedDraft = customizedDraft.replace(/\[Needs your input: Applicant Complete Address\]/g, applicantAddress);
      }

      const response = {
        ...result,
        rtiDraft: customizedDraft
      };

      // Save to sessions
      const session = {
        id: sessionId || generateId(),
        type: 'RTI_DRAFTING',
        prompt: text,
        response,
        timestamp: new Date().toISOString()
      };
      dbHelper.saveSession(session);

      res.json(session);
    } catch (err) {
      next(err);
    }
  },

  // 5. Conversational Form Filler: Start
  startFormFiller: async (req, res, next) => {
    try {
      const { formId } = req.body;
      
      // Fetch Income Certificate schema
      const forms = retrievalService.search('Income', 'Revenue Services');
      if (!forms.length) {
        return res.status(500).json({ error: 'Income certificate form schema not found' });
      }
      const formSchema = forms[0];

      const sessionId = generateId();
      
      const newSession = {
        id: sessionId,
        type: 'FORM_FILLER',
        formTitle: formSchema.title,
        authority: formSchema.authority,
        source_url: formSchema.source_url,
        currentFieldIndex: 0,
        fields: formSchema.fields,
        answers: {},
        status: 'IN_PROGRESS',
        progressPercent: 0
      };

      dbHelper.saveSession(newSession);

      // Return current state + first question
      const currentField = formSchema.fields[0];
      res.json({
        sessionId,
        status: 'IN_PROGRESS',
        formTitle: formSchema.title,
        currentField: {
          name: currentField.name,
          label: currentField.label,
          type: currentField.type,
          prompt: currentField.prompt,
          options: currentField.options
        },
        answers: {},
        progressPercent: 0
      });
    } catch (err) {
      next(err);
    }
  },

  // 6. Conversational Form Filler: Respond to Field
  respondFormFiller: async (req, res, next) => {
    try {
      const { sessionId, answer, fieldName } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      const session = dbHelper.getSession(sessionId);
      if (!session || session.type !== 'FORM_FILLER') {
        return res.status(404).json({ error: 'Form session not found' });
      }

      const fields = session.fields;

      // Handle specific field editing (Priority 7: inline correction)
      if (fieldName) {
        const editField = fields.find(f => f.name === fieldName);
        if (!editField) {
          return res.status(400).json({ error: 'Field not found in schema.' });
        }

        // Validate answer
        if (editField.validation && editField.validation.pattern) {
          const regex = new RegExp(editField.validation.pattern);
          const strAns = String(answer).trim();
          if (!regex.test(strAns)) {
            return res.status(400).json({
              error: 'ValidationError',
              message: editField.validation.errorMessage || 'Invalid format.'
            });
          }
        }

        session.answers[fieldName] = answer;
        dbHelper.saveSession(session);

        // Return updated details
        return res.json({
          sessionId,
          status: session.status,
          formTitle: session.formTitle,
          answers: session.answers,
          progressPercent: session.progressPercent,
          summary: fields.map(f => ({
            name: f.name,
            label: f.label,
            value: session.answers[f.name] || '',
            status: session.answers[f.name] ? 'VALID' : 'MISSING'
          }))
        });
      }

      if (session.status === 'COMPLETED') {
        return res.json({
          sessionId,
          status: 'COMPLETED',
          formTitle: session.formTitle,
          answers: session.answers,
          progressPercent: 100,
          summary: fields.map(f => ({
            name: f.name,
            label: f.label,
            value: session.answers[f.name],
            status: 'VALID'
          }))
        });
      }

      const currentIdx = session.currentFieldIndex;
      const currentField = fields[currentIdx];

      // Perform validation check
      if (currentField.validation && currentField.validation.pattern) {
        const regex = new RegExp(currentField.validation.pattern);
        // Normalize strings for regex matching
        const strAns = String(answer).trim();
        if (!regex.test(strAns)) {
          return res.status(400).json({
            error: 'ValidationError',
            message: currentField.validation.errorMessage || 'Invalid format.',
            currentField: {
              name: currentField.name,
              label: currentField.label,
              type: currentField.type,
              prompt: currentField.prompt,
              options: currentField.options
            }
          });
        }
      }

      // Record valid answer
      session.answers[currentField.name] = answer;

      // Advance index
      const nextIdx = currentIdx + 1;
      session.currentFieldIndex = nextIdx;
      
      // Calculate progress
      const progressPercent = Math.round((nextIdx / fields.length) * 100);
      session.progressPercent = progressPercent;

      if (nextIdx >= fields.length) {
        session.status = 'COMPLETED';
        dbHelper.saveSession(session);
        return res.json({
          sessionId,
          status: 'COMPLETED',
          formTitle: session.formTitle,
          answers: session.answers,
          progressPercent: 100,
          summary: fields.map(f => ({
            name: f.name,
            label: f.label,
            value: session.answers[f.name],
            status: 'VALID'
          }))
        });
      }

      // Save ongoing session
      dbHelper.saveSession(session);

      const nextField = fields[nextIdx];
      res.json({
        sessionId,
        status: 'IN_PROGRESS',
        formTitle: session.formTitle,
        currentField: {
          name: nextField.name,
          label: nextField.label,
          type: nextField.type,
          prompt: nextField.prompt,
          options: nextField.options
        },
        answers: session.answers,
        progressPercent
      });
    } catch (err) {
      next(err);
    }
  },

  // 7. Conversational Form Filler: Generate Final review
  generateFormDraft: async (req, res, next) => {
    try {
      const { sessionId } = req.body;
      const session = dbHelper.getSession(sessionId);
      if (!session || session.status !== 'COMPLETED') {
        return res.status(400).json({ error: 'Session is not complete or not found.' });
      }

      const answers = session.answers;
      const draftText = `APPLICATION FOR INCOME CERTIFICATE
-------------------------------------
Authority: ${session.authority}
Reference URL: ${session.source_url}
Date of Generation: ${new Date().toLocaleDateString()}

APPLICANT DETAILS:
Name of Applicant:   ${answers.fullName || ''}
Father/Husband Name: ${answers.fatherHusbandName || ''}
Date of Birth:       ${answers.dob || ''}
Residential Address: ${answers.address || ''}

FINANCIAL DETAILS:
Annual Family Income: INR ${Number(answers.annualIncome).toLocaleString()}
Primary Source:      ${answers.incomeSource || ''}
Purpose of App:      ${answers.purpose || ''}

DECLARATION:
I hereby declare that the details furnished above are true and correct to the best of my knowledge and belief. In case any of the information is found to be false or incorrect, I shall be liable for legal action under relevant laws.

Signature of Applicant: _____________________
Date: _________________
`;

      res.json({
        formTitle: session.formTitle,
        answers,
        draftText,
        disclaimer: "Verify all details carefully. This document is a draft application and must be submitted through your local e-District portal or government office."
      });
    } catch (err) {
      next(err);
    }
  },

  // 8. Fetch Source Details
  getSourceById: (req, res, next) => {
    try {
      const { id } = req.params;
      const source = retrievalService.getById(id);
      if (!source) {
        return res.status(404).json({ error: 'Source document not found' });
      }
      res.json(source);
    } catch (err) {
      next(err);
    }
  },

  // 9. Fetch Session History
  getSessionsList: (req, res, next) => {
    try {
      const list = dbHelper.getSessions();
      res.json(list);
    } catch (err) {
      next(err);
    }
  },

  // 10. Delete session
  deleteSession: (req, res, next) => {
    try {
      const { id } = req.params;
      dbHelper.deleteSession(id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = apiController;
