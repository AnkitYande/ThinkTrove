import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

/**
 * Ensures data directory exists
 */
export async function ensureDataDirectory() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
    throw new Error('Failed to create data directory');
  }
}

/**
 * Reads configurations from file
 */
export async function readConfigurations() {
  try {
    await ensureDataDirectory();
    
    try {
      const data = await fs.readFile(CONFIG_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist or has invalid JSON, return empty array
      if (error.code === 'ENOENT' || error instanceof SyntaxError) {
        return [];
      }
      throw error;
    }
  } catch (error) {
    console.error('Error reading configurations:', error);
    throw new Error('Failed to read configurations');
  }
}

/**
 * Writes configurations to file
 */
export async function writeConfigurations(configs) {
  try {
    await ensureDataDirectory();
    await fs.writeFile(CONFIG_FILE, JSON.stringify(configs, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing configurations:', error);
    throw new Error('Failed to write configurations');
  }
}

/**
 * Validates configuration data
 */
export function validateConfig(config) {
  const requiredFields = [
    'lessonTitle', 'gradeLevel', 'subject', 'learningObjective', 
    'phases', 'validHypotheses', 'misconceptions', 'correctConcepts',
    'reflectionPrompt'
  ];
  
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  return true;
}

/**
 * Validates chat request
 */
export function validateChatRequest(body) {
  const { configId, messages } = body;
  
  if (!configId) {
    throw new Error('Configuration ID is required');
  }
  
  if (!messages || !Array.isArray(messages)) {
    throw new Error('Valid message array is required');
  }
  
  // Validate each message has role and content
  const invalidMessages = messages.filter(msg => !msg.role || !msg.content);
  if (invalidMessages.length > 0) {
    throw new Error('Each message must have role and content properties');
  }
  
  return true;
} 