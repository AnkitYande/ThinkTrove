import express from 'express';
import { createSystemPrompt, generateAIResponse } from '../services/groq.js';
import { readConfigurations, validateChatRequest } from '../utils/config.js';
import { 
  badRequest, 
  notFound, 
  unauthorized, 
  tooManyRequests, 
  badGateway, 
  serverError 
} from '../utils/errors.js';

export const chatRouter = express.Router();

// Process a chat message
chatRouter.post('/', async (req, res, next) => {
  try {
    // Validate request
    try {
      validateChatRequest(req.body);
    } catch (error) {
      return next(badRequest(error.message));
    }
    
    const { configId, messages } = req.body;
    
    // Get the lesson configuration
    const configs = await readConfigurations();
    const config = configs.find(c => c.id === configId);
    
    if (!config) {
      return next(notFound('Configuration not found'));
    }
    
    try {
      // Create system prompt from configuration
      const systemPrompt = createSystemPrompt(config);
      
      // Prepare messages for Groq API
      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];
      
      // Generate response from Groq API
      const aiResponse = await generateAIResponse(formattedMessages);
      
      // Store the conversation history if needed in a future version
      
      res.json({ response: aiResponse });
    } catch (error) {
      // Handle specific errors from Groq service
      if (error.message.includes('Authentication failed')) {
        return next(unauthorized('API authentication failed'));
      } else if (error.message.includes('Rate limit')) {
        return next(tooManyRequests('Rate limit exceeded, please try again later'));
      } else if (error.message.includes('Groq service error')) {
        return next(badGateway('AI service temporarily unavailable'));
      }
      
      throw error;
    }
  } catch (error) {
    next(serverError('Failed to process chat message'));
  }
}); 