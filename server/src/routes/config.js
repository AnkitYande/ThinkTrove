import express from 'express';
import { 
  readConfigurations, 
  writeConfigurations, 
  validateConfig 
} from '../utils/config.js';
import {
  badRequest,
  notFound,
  serverError
} from '../utils/errors.js';

export const configRouter = express.Router();

// Get all configurations
configRouter.get('/', async (req, res, next) => {
  try {
    const configs = await readConfigurations();
    res.json(configs);
  } catch (error) {
    next(serverError('Failed to get configurations'));
  }
});

// Save a new configuration
configRouter.post('/', async (req, res, next) => {
  try {
    const configData = req.body;
    
    // Validate configuration
    try {
      validateConfig(configData);
    } catch (error) {
      return next(badRequest(error.message));
    }
    
    const newConfig = {
      id: Date.now().toString(), // Simple ID generation
      ...configData,
      createdAt: new Date().toISOString()
    };
    
    const configs = await readConfigurations();
    configs.push(newConfig);
    
    await writeConfigurations(configs);
    
    res.status(201).json(newConfig);
  } catch (error) {
    next(serverError('Failed to save configuration'));
  }
});

// Get configuration by ID
configRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const configs = await readConfigurations();
    const config = configs.find(c => c.id === id);
    
    if (!config) {
      return next(notFound('Configuration not found'));
    }
    
    res.json(config);
  } catch (error) {
    next(serverError('Failed to get configuration'));
  }
});

// Update configuration by ID
configRouter.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const configData = req.body;
    
    // Validate configuration
    try {
      validateConfig(configData);
    } catch (error) {
      return next(badRequest(error.message));
    }
    
    const configs = await readConfigurations();
    const configIndex = configs.findIndex(c => c.id === id);
    
    if (configIndex === -1) {
      return next(notFound('Configuration not found'));
    }
    
    // Update the config while preserving id and createdAt
    const updatedConfig = {
      ...configs[configIndex],
      ...configData,
      updatedAt: new Date().toISOString()
    };
    
    configs[configIndex] = updatedConfig;
    
    await writeConfigurations(configs);
    
    res.json(updatedConfig);
  } catch (error) {
    next(serverError('Failed to update configuration'));
  }
});

// Delete configuration by ID
configRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const configs = await readConfigurations();
    const configIndex = configs.findIndex(c => c.id === id);
    
    if (configIndex === -1) {
      return next(notFound('Configuration not found'));
    }
    
    configs.splice(configIndex, 1);
    
    await writeConfigurations(configs);
    
    res.status(200).json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    next(serverError('Failed to delete configuration'));
  }
}); 