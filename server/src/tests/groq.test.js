import { createSystemPrompt } from '../services/groq.js';
import axios from 'axios';
import { jest } from '@jest/globals';

// Mock axios
jest.mock('axios');

describe('Groq Service', () => {
  test('createSystemPrompt should format the prompt correctly', () => {
    const config = {
      lessonTitle: 'Test Lesson',
      gradeLevel: 'Middle School',
      subject: 'Science',
      learningObjective: 'Learn about photosynthesis',
      tone: 'Socratic but friendly',
      phases: ['Observation', 'Question', 'Hypothesis'],
      nudgeOnWrongAnswers: true,
      reinforceGoodReasoning: true,
      offerHintsIfStuck: true,
      maxHints: 3,
      scaffoldingLevel: 'Moderate',
      validHypotheses: 'plants need sunlight, plants need water',
      misconceptions: 'plants eat soil',
      correctConcepts: 'plants convert light to energy',
      reflectionPrompt: 'What did you learn about plants?',
      additionalInstructions: 'Keep it simple'
    };
    
    const prompt = createSystemPrompt(config);
    
    // Check that all expected fields are in the prompt
    expect(prompt).toContain(config.lessonTitle);
    expect(prompt).toContain(config.gradeLevel);
    expect(prompt).toContain(config.subject);
    expect(prompt).toContain(config.learningObjective);
    expect(prompt).toContain(config.tone);
    expect(prompt).toContain('Observation, Question, Hypothesis');
    expect(prompt).toContain('Nudge students when they make mistakes');
    expect(prompt).toContain('Reinforce good reasoning');
    expect(prompt).toContain(`Offer hints when students are stuck (maximum ${config.maxHints} hints)`);
    expect(prompt).toContain(`Provide scaffolding at a ${config.scaffoldingLevel} level`);
    expect(prompt).toContain(config.validHypotheses);
    expect(prompt).toContain(config.misconceptions);
    expect(prompt).toContain(config.correctConcepts);
    expect(prompt).toContain(config.reflectionPrompt);
    expect(prompt).toContain('ADDITIONAL INSTRUCTIONS: Keep it simple');
  });
  
  test('createSystemPrompt should handle optional fields', () => {
    const config = {
      lessonTitle: 'Test Lesson',
      gradeLevel: 'Middle School',
      subject: 'Science',
      learningObjective: 'Learn about photosynthesis',
      tone: 'Socratic but friendly',
      phases: ['Observation', 'Question', 'Hypothesis'],
      nudgeOnWrongAnswers: false,
      reinforceGoodReasoning: false,
      offerHintsIfStuck: false,
      scaffoldingLevel: 'Low',
      validHypotheses: 'plants need sunlight',
      misconceptions: 'plants eat soil',
      correctConcepts: 'plants convert light to energy',
      reflectionPrompt: 'What did you learn?',
      additionalInstructions: ''
    };
    
    const prompt = createSystemPrompt(config);
    
    expect(prompt).toContain('Do not explicitly point out mistakes');
    expect(prompt).toContain('Focus more on corrections than praise');
    expect(prompt).toContain('Let students work through challenges without hints');
    expect(prompt).not.toContain('ADDITIONAL INSTRUCTIONS:');
  });
}); 