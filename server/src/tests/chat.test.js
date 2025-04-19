import request from 'supertest';
import express from 'express';
import { chatRouter } from '../routes/chat.js';
import fs from 'fs/promises';
import path from 'path';
import * as groqService from '../services/groq.js';
import { jest } from '@jest/globals';

// Mock fs and groq service
jest.mock('fs/promises');
jest.mock('../services/groq.js');
jest.mock('path', () => {
  const originalPath = jest.requireActual('path');
  return {
    ...originalPath,
    join: jest.fn((...args) => {
      if (args[args.length - 1] === 'config.json') {
        return 'test_config.json';
      }
      return originalPath.join(...args);
    })
  };
});

// Create a test app using the chat router
const app = express();
app.use(express.json());
app.use('/api/chat', chatRouter);

describe('Chat API', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });
  
  test('POST /api/chat should return an AI response', async () => {
    // Mock config data
    const mockConfigs = [
      { 
        id: '123', 
        lessonTitle: 'Test Lesson',
        // Add all required fields that the system prompt generator needs
        gradeLevel: 'Middle School',
        subject: 'Science',
        learningObjective: 'Learn about plants',
        tone: 'Friendly',
        phases: ['Observation', 'Question'],
        nudgeOnWrongAnswers: true,
        reinforceGoodReasoning: true,
        offerHintsIfStuck: true,
        maxHints: 2,
        scaffoldingLevel: 'Moderate',
        validHypotheses: 'test',
        misconceptions: 'test',
        correctConcepts: 'test',
        reflectionPrompt: 'What did you learn?'
      }
    ];
    
    // Mock fs.readFile to return the mock data
    fs.readFile.mockResolvedValue(JSON.stringify(mockConfigs));
    
    // Mock groq service to return a response
    groqService.createSystemPrompt.mockReturnValue('System prompt');
    groqService.generateAIResponse.mockResolvedValue('AI response to the question');
    
    // Test request
    const chatRequest = {
      configId: '123',
      messages: [
        { role: 'user', content: 'Tell me about plants' }
      ]
    };
    
    const response = await request(app)
      .post('/')
      .send(chatRequest);
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ response: 'AI response to the question' });
    
    // Check that the groq service was called with the right arguments
    expect(groqService.createSystemPrompt).toHaveBeenCalledWith(mockConfigs[0]);
    expect(groqService.generateAIResponse).toHaveBeenCalledWith([
      { role: 'system', content: 'System prompt' },
      ...chatRequest.messages
    ]);
  });
  
  test('POST /api/chat should return 404 for non-existent config', async () => {
    // Mock empty config data
    const mockConfigs = [];
    fs.readFile.mockResolvedValue(JSON.stringify(mockConfigs));
    
    // Test request with non-existent config ID
    const chatRequest = {
      configId: 'non-existent',
      messages: [{ role: 'user', content: 'Test message' }]
    };
    
    const response = await request(app)
      .post('/')
      .send(chatRequest);
    
    expect(response.status).toBe(404);
    expect(response.body.error).toBeDefined();
    expect(groqService.generateAIResponse).not.toHaveBeenCalled();
  });
  
  test('POST /api/chat should validate required fields', async () => {
    // Test missing configId
    const response1 = await request(app)
      .post('/')
      .send({ messages: [{ role: 'user', content: 'Test' }] });
    
    expect(response1.status).toBe(400);
    
    // Test missing messages
    const response2 = await request(app)
      .post('/')
      .send({ configId: '123' });
    
    expect(response2.status).toBe(400);
    
    // Test invalid messages format
    const response3 = await request(app)
      .post('/')
      .send({ configId: '123', messages: 'not an array' });
    
    expect(response3.status).toBe(400);
  });
}); 