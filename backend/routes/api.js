const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// Intelligent Routing
router.post('/route', apiController.routeRequest);

// Rights Navigator
router.post('/rights/analyze', apiController.analyzeRights);

// Scheme Eligibility Checker
router.post('/schemes/eligibility', apiController.checkSchemeEligibility);

// RTI Drafting Agent
router.post('/rti/draft', apiController.draftRti);

// Conversational Form Filler
router.post('/forms/start', apiController.startFormFiller);
router.post('/forms/respond', apiController.respondFormFiller);
router.post('/forms/generate', apiController.generateFormDraft);

// Sources and Sessions
router.get('/sources/:id', apiController.getSourceById);
router.get('/sessions', apiController.getSessionsList);
router.delete('/sessions/:id', apiController.deleteSession);

module.exports = router;
