import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Get environment variables
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_KEY_2 = process.env.GROQ_API_KEY_2;
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const TEMPERATURE = parseFloat(process.env.TEMPERATURE) || 0.7;
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS) || 500;
const NODE_ENV = process.env.NODE_ENV || 'development';
const SUMMARY_THRESHOLD = parseInt(process.env.SUMMARY_THRESHOLD) || 2;
const MAX_RECENT_MESSAGES = parseInt(process.env.MAX_RECENT_MESSAGES) || 2;

// API endpoint
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Track which API key to use - start with 1 so first call uses GROQ_API_KEY (index 0)
let apiKeyIndex = 1;

// Get the next API key in rotation
const getNextApiKey = () => {
  // If second key doesn't exist, always use the first key
  if (!GROQ_API_KEY_2) {
    return GROQ_API_KEY;
  }
  
  // Increment the counter first
  apiKeyIndex = (apiKeyIndex + 1) % 2;
  
  // Return the appropriate key based on the index
  // This way we alternate: 0->GROQ_API_KEY, 1->GROQ_API_KEY_2, 0->GROQ_API_KEY, etc.
  return apiKeyIndex === 0 ? GROQ_API_KEY : GROQ_API_KEY_2;
};

// Create Axios instance with current API key
const createGroqApiInstance = (apiKey) => {
  return axios.create({
    baseURL: GROQ_API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    timeout: 30000 // 30 second timeout
  });
};

// Configure Axios for Groq API - kept for backward compatibility
const groqApi = createGroqApiInstance(GROQ_API_KEY);

/**
 * Creates a system prompt from the lesson configuration
 * @param {Object} config - Lesson configuration object
 * @returns {string} - Formatted system prompt
 */
export const createSystemPrompt = (config) => {
  if (!config) {
    throw new Error('Config object is required to create a system prompt');
  }
  
  // Ensure required fields exist
  const requiredFields = [
    'lessonTitle', 'gradeLevel', 'subject', 'learningObjective', 
    'phases', 'validHypotheses', 'misconceptions', 'correctConcepts',
    'reflectionPrompt'
  ];
  
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Missing required field in config: ${field}`);
    }
  }

  // return `
  //   You are an AI educational guide for a ${config.gradeLevel} ${config.subject} mystery lesson titled "${config.lessonTitle}".

  //   LESSON OBJECTIVE: ${config.learningObjective}

  //   GUIDANCE APPROACH:
  //   - Use thoughtful, Socratic questioning to prompt students to think critically without revealing the final answer.
  //   - Maintain a ${config.tone || 'neutral'} tone that is supportive and instructive.
  //   - Walk students through the following phases of the scientific inquiry process: ${Array.isArray(config.phases) ? config.phases.join(', ') : config.phases}.
  //   - ${config.nudgeOnWrongAnswers ? 'When students stray from the evidence, gently prompt them with questions that guide their thinking without disclosing the correct answer.' : 'Allow students to explore their ideas with minimal corrections.'}
  //   - ${config.reinforceGoodReasoning ? 'Acknowledge and praise good reasoning without confirming that it is the final correct answer.' : 'Focus on encouraging deeper inquiry rather than commenting on correctness.'}
  //   - ${config.offerHintsIfStuck ? `Provide up to ${config.maxHints} hints if students are stuck, but ensure that each hint only leads them one step further without giving away the solution.` : 'Allow students the space to work through the problem on their own.'}
  //   - Provide scaffolding at a ${config.scaffoldingLevel || 'moderate'} level.

  //   SUBJECT KNOWLEDGE:
  //   - Ensure that the discussion centers on exploring valid hypotheses such as: ${config.validHypotheses}.
  //   - When common misconceptions arise, ask probing questions to help students recognize them without confirming error.
  //   - Emphasize correct concepts and evidence-based reasoning, but do not explicitly state the full correct answer; instead, ask questions that encourage further investigation.

  //   When the investigation phase is complete, guide the student with a final reflective question without summarizing or providing the final conclusion: ${config.reflectionPrompt}

  //   ${config.additionalInstructions ? `Additional Instructions: ${config.additionalInstructions}` : ''}
  //   `.trim();
  return `
You are an AI educational socratic guide for ThinkTrove.io, an inquiry-based mystery learning platform. Support critical thinking by facilitating student discovery rather than providing answers. Act as if the student is a detective exploring a mystery.

ThinkTrove.io develops:
- Critical thinking and problem-solving
- Creativity
- Scientific literacy
- Multiple perspective consideration

LESSON CONTEXT:
- Title: ${config.lessonTitle}
- Subject: ${config.subject}
- Grade Level: ${config.gradeLevel}
- Learning Objective: ${config.learningObjective}

INTERACTION GUIDELINES:
1. **Use Socratic Method:**
  - Ask open-ended questions that prompt reflection
  - Never reveal answers or confirm hypotheses
  - Redirect answer requests with questions

2. **Guide Through Inquiry Stages:**
  - Follow these stages in sequential order, spending as much time as needed in each stage before progressing:
  - Stage 1: **Ask Questions** - Encourage student questions to gather context and define the core issue
  - Stage 2: **Form a Hypothesis** - Guide students to make predictions
  - Stage 3: **Investigate** - Help decide what data to gather
  - Stage 4: **Analyze Data** - Present information for interpretation
  - Stage 5: **Draw Conclusions** - Guide students toward logical conclusions
  - Stage 6: **Reflect** - Consider implications of findings
  - Progress when student shows readiness for next stage
  - Subtly signal current stage in responses (e.g., "As we continue questioning...")

3. **Provide Minimal Support:**
  - Offer up to ${config.hintLimit} subtle hints when needed
  - Address misconceptions with questions, not corrections

4. **Be Supportive:**
  - Maintain a ${config.tone || 'neutral'}, encouraging tone
  - Praise evidence-based reasoning without confirming correctness

5. **Focus Content:**
  - Explore: ${config.validHypotheses}
  - Consider: ${config.correctConcepts}

6. **End With Reflection:**
  - Conclude with: ${config.reflectionPrompt}
  - Avoid providing definitive answers

7. **Maintain Narrative Continuity:**
  - Keep characters, settings, and plot elements consistent throughout all stages
  - Reference previous discoveries and insights as the investigation progresses
  - Develop the mystery narrative alongside the learning progression
  - Ensure that new information builds upon previously established facts

ADDITIONAL: ${config.additionalInstructions || 'No additional instructions.'}

KEEP RESPONSES TO 350 WORDS OR LESS

Begin with a brief mystery scenario and character who shares basic facts. Provide enough detail to engage but leave room for discovery.
  `.trim();
  
};

/**
 * Summarizes conversation history to reduce token usage
 * @param {Array} messages - Array of message objects excluding system message
 * @returns {Promise<Array>} - Summarized messages array
 */
export const summarizeConversation = async (messages) => {
  // If we don't have enough messages to summarize, return the original messages
  if (messages.length <= SUMMARY_THRESHOLD) {
    return messages;
  }

  try {
    // Extract messages to summarize (all except the most recent MAX_RECENT_MESSAGES)
    const messagesToSummarize = messages.slice(0, -MAX_RECENT_MESSAGES);
    const recentMessages = messages.slice(-MAX_RECENT_MESSAGES);
    
    // Format messages for the summarization request
    const summaryPrompt = [
      { 
        role: "system", 
        content: "You are a helpful assistant. Please provide a brief, concise summary of the conversation so far. Focus only on key points and important context. The conversation should flow in the follwoing order:\
        Ask Questions, Form a Hypothesis, Investigate, Analyze Data, Draw Conclusions, and Reflect. Finsish youre response whith what steps have been completed and what steps are next." 
      },
      ...messagesToSummarize,
      { 
        role: "user", 
        content: "Please summarize our conversation so far in a concise way that retains all important context." 
      }
    ];
    
    // Get the next API key in rotation
    const currentApiKey = getNextApiKey();
    
    if (!currentApiKey) {
      throw new Error('No valid Groq API key is set in environment variables');
    }
    
    const requestData = {
      model: MODEL,
      messages: summaryPrompt,
      temperature: 0.5, // Lower temperature for more consistent summaries
      max_tokens: MAX_TOKENS,
      top_p: 1,
      stream: false
    };
    
    // Create API instance with current key
    const currentGroqApi = createGroqApiInstance(currentApiKey);
    
    // Log the summarization request
    console.log('Sending request to Groq API for conversation summary:');
    console.log('URL:', GROQ_API_URL);
    
    // Log which API key is being used (safely - only show first and last few chars)
    const keyPrefix = currentApiKey.substring(0, 4);
    const keySuffix = currentApiKey.substring(currentApiKey.length - 4);
    console.log(`Using API key ${apiKeyIndex} (${keyPrefix}...${keySuffix})`);
    
    const response = await currentGroqApi.post('', requestData);

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid response from Groq API during summarization');
    }

    // Log token usage for the summary request
    logTokenUsage(response.data.usage, 'Summary');

    // Create a new messages array with the summary and recent messages
    const summary = response.data.choices[0].message.content;
    const summarizedMessages = [
      { role: "assistant", content: `Summary of previous conversation: ${summary}` },
      ...recentMessages
    ];

    return summarizedMessages;
  } catch (error) {
    console.log('Summarization Error:', error);
    // If summarization fails, return the original messages as a fallback
    return messages;
  }
};

/**
 * Log token usage data from API responses
 * @param {Object} usage - Token usage data from Groq API response
 * @param {string} requestType - Type of request (e.g., 'Chat', 'Summary')
 */
const logTokenUsage = (usage, requestType = 'Chat') => {
  if (!usage) {
    console.log(`${requestType} token usage: Unknown (not provided in response)`);
    return;
  }
  
  console.log(`${requestType} token usage:`, {
    prompt_tokens: usage.prompt_tokens || 0,
    completion_tokens: usage.completion_tokens || 0,
    total_tokens: usage.total_tokens || 0
  });
};

/**
 * Generates a response from the Groq API based on conversation history and system prompt
 * @param {Array} messages - Array of message objects with role and content
 * @returns {Promise<string>} - AI response
 */
export const generateAIResponse = async (messages) => {
  // Get the next API key in rotation
  const currentApiKey = getNextApiKey();
  
  if (!currentApiKey) {
    throw new Error('No valid Groq API key is set in environment variables');
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error('Valid messages array is required');
  }

  try {
    // For test environment, return a mock response
    if (NODE_ENV === 'test') {
      return 'This is a mock response for testing purposes.';
    }
    
    // Extract system message and user/assistant messages
    const systemMessage = messages.find(msg => msg.role === 'system');
    const conversationMessages = messages.filter(msg => msg.role !== 'system');
    
    // Summarize conversation if it exceeds the threshold
    // This reduces token usage by replacing older messages with a summary
    // The system message and MAX_RECENT_MESSAGES most recent messages are preserved
    let processedMessages;
    if (conversationMessages.length > SUMMARY_THRESHOLD) {
      console.log(`Conversation length (${conversationMessages.length}) exceeds threshold (${SUMMARY_THRESHOLD}). Summarizing...`);
      processedMessages = await summarizeConversation(conversationMessages);
    } else {
      processedMessages = conversationMessages;
    }
    
    // Reconstruct messages with system prompt and processed conversation
    const finalMessages = systemMessage ? [systemMessage, ...processedMessages] : processedMessages;
    
    const requestData = {
      model: MODEL,
      messages: finalMessages,
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
      top_p: 1,
      stream: false
    };
    
    // Create API instance with current key
    const currentGroqApi = createGroqApiInstance(currentApiKey);
    
    // Log the request data before sending
    console.log('Sending request to Groq API:');
    console.log('URL:', GROQ_API_URL);
    console.log('Request data:', JSON.stringify(requestData, null, 2));
    
    // Log which API key is being used (safely - only show first and last few chars)
    const keyPrefix = currentApiKey.substring(0, 4);
    const keySuffix = currentApiKey.substring(currentApiKey.length - 4);
    console.log(`Using API key ${apiKeyIndex} (${keyPrefix}...${keySuffix})`);
    
    const response = await currentGroqApi.post('', requestData);

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid response from Groq API');
    }
    
    // Log token usage
    logTokenUsage(response.data.usage);

    return response.data.choices[0].message.content;
  } catch (error) {
    console.log('AI Error:', error);
    // Handle different types of errors with more specific messaging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401) {
        throw new Error('Authentication failed: Invalid API key');
      } else if (status === 429) {
        throw new Error('Rate limit exceeded: Too many requests');
      } else if (status >= 500) {
        throw new Error('Groq service error: Please try again later');
      }
      
      throw new Error(`Groq API error: ${data.error?.message || JSON.stringify(data)}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from Groq API: Network issue or service unavailable');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up Groq request:', error.message);
      throw new Error('Failed to communicate with Groq API');
    }
  }
}; 