import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { configRouter } from '../routes/config.js';
import { chatRouter } from '../routes/chat.js';
import { jest } from '@jest/globals';
import fs from 'fs/promises';
import * as groqService from '../services/groq.js';

// Mock fs and groq service
jest.mock('fs/promises');
jest.mock('../services/groq.js');

// Create a test app with all routes
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/config', configRouter);
app.use('/api/chat', chatRouter);

describe('API Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock directory creation
    fs.mkdir.mockImplementation(() => Promise.resolve());
    
    // Default mock for file read (empty configs)
    fs.readFile.mockImplementation(() => {
      throw { code: 'ENOENT' }; // File not found error
    });
    
    // Default mock for file write
    fs.writeFile.mockImplementation(() => Promise.resolve());
    
    // Mock Groq service
    groqService.createSystemPrompt.mockImplementation(config => 
      `System prompt for ${config.lessonTitle}`
    );
    groqService.generateAIResponse.mockImplementation(() => 
      Promise.resolve('Mock AI response')
    );
  });
  
  describe('Configuration API', () => {
    test('Full config lifecycle (create, get, update, delete)', async () => {
      // 1. Initially no configs
      let response = await request(app).get('/api/config');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
      
      // 2. Create a config
      const newConfig = {
        lessonTitle: 'Integration Test Lesson',
        gradeLevel: 'Test Grade',
        subject: 'Testing',
        learningObjective: 'Learn about testing',
        phases: ['Test', 'Debug'],
        validHypotheses: 'test hypothesis',
        misconceptions: 'test misconception',
        correctConcepts: 'test concept',
        reflectionPrompt: 'What did you learn?'
      };
      
      // Mock the file read to return empty array
      fs.readFile.mockImplementation(() => Promise.resolve('[]'));
      
      response = await request(app)
        .post('/api/config')
        .send(newConfig);
      
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(newConfig);
      const createdId = response.body.id;
      
      // 3. Get configs should now return the new config
      // Mock the file read to return the created config
      const mockConfigs = [{ ...newConfig, id: createdId, createdAt: response.body.createdAt }];
      fs.readFile.mockImplementation(() => Promise.resolve(JSON.stringify(mockConfigs)));
      
      response = await request(app).get('/api/config');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(newConfig);
      
      // 4. Get config by ID
      response = await request(app).get(`/api/config/${createdId}`);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(newConfig);
      
      // 5. Update the config
      const updatedConfig = {
        ...newConfig,
        lessonTitle: 'Updated Lesson Title'
      };
      
      response = await request(app)
        .put(`/api/config/${createdId}`)
        .send(updatedConfig);
      
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(updatedConfig);
      
      // 6. Delete the config
      response = await request(app).delete(`/api/config/${createdId}`);
      expect(response.status).toBe(200);
      
      // Mock empty configs again to simulate deletion
      fs.readFile.mockImplementation(() => Promise.resolve('[]'));
      
      // 7. Get configs should now be empty
      response = await request(app).get('/api/config');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });
  });
  
  describe('Chat API', () => {
    test('Chat message with valid config ID', async () => {
      // Setup mock config
      const mockConfig = {
        id: 'test-config-id',
        lessonTitle: 'Test Lesson',
        gradeLevel: 'Test Grade',
        subject: 'Testing',
        learningObjective: 'Learn about testing',
        phases: ['Test', 'Debug'],
        validHypotheses: 'test hypothesis',
        misconceptions: 'test misconception',
        correctConcepts: 'test concept',
        reflectionPrompt: 'What did you learn?',
        scaffoldingLevel: 'Low',
        tone: 'Direct'
      };
      
      // Mock file read to return the config
      fs.readFile.mockImplementation(() => 
        Promise.resolve(JSON.stringify([mockConfig]))
      );
      
      // Send chat request
      const chatRequest = {
        configId: 'test-config-id',
        messages: [
          { role: 'user', content: 'Test message' }
        ]
      };
      
      const response = await request(app)
        .post('/api/chat')
        .send(chatRequest);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ response: 'Mock AI response' });
      
      // Verify that the groq service was called correctly
      expect(groqService.createSystemPrompt).toHaveBeenCalledWith(mockConfig);
      expect(groqService.generateAIResponse).toHaveBeenCalledWith([
        { 
          role: 'system', 
          content: `System prompt for ${mockConfig.lessonTitle}` 
        },
        ...chatRequest.messages
      ]);
    });
    
    test('Chat message with invalid config ID', async () => {
      // Mock file read to return empty array
      fs.readFile.mockImplementation(() => Promise.resolve('[]'));
      
      // Send chat request with invalid configId
      const chatRequest = {
        configId: 'non-existent-id',
        messages: [
          { role: 'user', content: 'Test message' }
        ]
      };
      
      const response = await request(app)
        .post('/api/chat')
        .send(chatRequest);
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
      expect(groqService.generateAIResponse).not.toHaveBeenCalled();
    });
  });
}); 