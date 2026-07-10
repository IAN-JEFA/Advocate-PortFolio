const mongoose = require('mongoose');

const caseStudySchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  challenge: { type: String, required: true },
  strategy: { type: String, required: true },
  outcome: { type: String, required: true },
  metricLabel: String,
  metricValue: String,
  clientIndustry: String
}, { timestamps: true });

module.exports = mongoose.model('CaseStudy', caseStudySchema);
