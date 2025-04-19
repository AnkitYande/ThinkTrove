import request from 'supertest';
import express from 'express';
import { configRouter } from '../routes/config.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { jest } from '@jest/globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DATA_DIR = path.join(__dirname, 'test_data');
const TEST_CONFIG_FILE = path.join(TEST_DATA_DIR, 'config.json');

// Create a mock for fs module
jest.mock('fs/promises');
jest.mock('path', () => {
  const originalPath = jest.requireActual('path');
  return {
    ...originalPath,
    join: jest.fn((...args) => {
      if (args[args.length - 1] === 'config.json') {
        return TEST_CONFIG_FILE;
      }
      if (args[args.length - 2] === 'data') {
        return TEST_DATA_DIR;
      }
      return originalPath.join(...args);
    })
  };
});

// Create a test app using the config router
const app = express();
app.use(express.json());
app.use('/api/config', configRouter);

describe('Configuration API', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock directory creation
    fs.mkdir.mockResolvedValue(undefined);
  });
  
  test('GET /api/config should return empty array when no configs exist', async () => {
    // Mock fs.readFile to throw an error (file not found)
    fs.readFile.mockRejectedValue(new Error('File not found'));
    
    const response = await request(app).get('/api/config');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
    expect(fs.mkdir).toHaveBeenCalledWith(TEST_DATA_DIR, { recursive: true });
  });
  
  test('GET /api/config should return configs when they exist', async () => {
    // Mock config data
    const mockConfigs = [
      { id: '1', lessonTitle: 'Test Lesson' },
      { id: '2', lessonTitle: 'Another Test Lesson' }
    ];
    
    // Mock fs.readFile to return the mock data
    fs.readFile.mockResolvedValue(JSON.stringify(mockConfigs));
    
    const response = await request(app).get('/api/config');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockConfigs);
  });
  
  test('POST /api/config should save a new configuration', async () => {
    // Mock existing configs
    const existingConfigs = [];
    fs.readFile.mockResolvedValue(JSON.stringify(existingConfigs));
    
    // Mock fs.writeFile
    fs.writeFile.mockResolvedValue(undefined);
    
    // New config to add
    const newConfig = {
      lessonTitle: 'New Test Lesson',
      gradeLevel: 'Elementary',
      subject: 'Math'
    };
    
    const response = await request(app)
      .post('/api/config')
      .send(newConfig);
    
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newConfig);
    expect(response.body.id).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
    
    // Check that writeFile was called with the correct arguments
    expect(fs.writeFile).toHaveBeenCalledWith(
      TEST_CONFIG_FILE,
      expect.any(String),
      'utf8'
    );
    
    // Parse the data that was written to verify it contains our new config
    const writtenData = JSON.parse(fs.writeFile.mock.calls[0][1]);
    expect(writtenData.length).toBe(1);
    expect(writtenData[0]).toMatchObject(newConfig);
  });
  
  test('GET /api/config/:id should return a specific configuration', async () => {
    // Mock config data
    const mockConfigs = [
      { id: '123', lessonTitle: 'Test Lesson' },
      { id: '456', lessonTitle: 'Another Test Lesson' }
    ];
    
    // Mock fs.readFile to return the mock data
    fs.readFile.mockResolvedValue(JSON.stringify(mockConfigs));
    
    const response = await request(app).get('/api/config/123');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockConfigs[0]);
  });
  
  test('GET /api/config/:id should return 404 for non-existent ID', async () => {
    // Mock config data
    const mockConfigs = [
      { id: '123', lessonTitle: 'Test Lesson' },
      { id: '456', lessonTitle: 'Another Test Lesson' }
    ];
    
    // Mock fs.readFile to return the mock data
    fs.readFile.mockResolvedValue(JSON.stringify(mockConfigs));
    
    const response = await request(app).get('/api/config/999');
    
    expect(response.status).toBe(404);
    expect(response.body.error).toBeDefined();
  });
}); 