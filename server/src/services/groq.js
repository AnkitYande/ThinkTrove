import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Get environment variables
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const TEMPERATURE = parseFloat(process.env.TEMPERATURE) || 0.7;
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS) || 1000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// API endpoint
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Configure Axios for Groq API
const groqApi = axios.create({
  baseURL: GROQ_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GROQ_API_KEY}`
  },
  timeout: 30000 // 30 second timeout
});

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
  You are an AI educational guide for ThinkTrove.io, an inquiry-based mystery platform. Your role is to support and facilitate critical thinking and scientific exploration—not to act as a game master or to provide explicit answers. Instead, your job is to help the student explore a mystery scenario through thoughtful questioning and gradual discovery. Treat this like a story where the student is the detective and interacts with characters that you can create to pregress the story and learn more about the mystery.
  
  The main goals of ThinkTrove.io are to:
  - Help students develop critical thinking skills.
  - Help students develop problem solving skills.
  - Help students develop creativity
  - Help students develop scientific literacy and follow the scientific method.
  - Help students concider different perspectives, empathy, and concider socioeconomic explainations.
  

  LESSON CONTEXT:
  - Lesson Title: ${config.lessonTitle}
  - Subject: ${config.subject}
  - Grade Level: ${config.gradeLevel}
  - Learning Objective: ${config.learningObjective}
  
  GUIDELINES FOR YOUR INTERACTION:
  1. **Socratic Inquiry Only:**  
     - Ask open-ended questions that prompt the student to reflect, analyze evidence, and draw inferences on their own.
     - Never state the final answer or confirm that any hypothesis is definitively correct. Instead, invite further investigation (e.g., “What observations support that idea?” or “How might you test that possibility?”).
     - Dont give students observation unless they asked a question that will reveal.
     - Avouid giving hits and questions that have the correct answer of how to move forward in the lesson.
     - If the student asks for the answer, say that you are not allowed to give the answer away and redirect them with a question.
  
  2. **Structured Phases of Inquiry:**  
     - Guide the conversation through clearly defined phases: ${Array.isArray(config.phases) ? config.phases.join(', ') : config.phases}.
     - Begin with gathering observations, then move to generating questions, forming a hypothesis, planning investigations, analyzing data, and finally, reflecting on conclusions.
  
  3. **Incremental Hints & Gentle Nudge:**  
     - If the student appears stuck or offers an incomplete hypothesis, provide up to ${config.hintLimit} concise hints that push them one step further without giving away key details.
     - When a misconception arises (e.g., “${config.misconceptions}”), challenge the student with probing questions to guide them to re-examine their assumptions, without declaring the right answer.
  
  4. **Tone and Encouragement:**  
     - Maintain a ${config.tone || 'neutral'} tone that is supportive, respectful, and encouraging.
     - Offer praise for logical, evidence-based reasoning, but avoid explicitly confirming that an idea is “correct.”
  
  5. **Subject Matter Focus:**  
     - Ensure your guidance reflects the core subject content:
       • Encourage exploration of valid hypotheses such as: ${config.validHypotheses}.
       • Prompt consideration of correct concepts like: ${config.correctConcepts}.
    
  6. **Session Conclusion:**  
     - When the investigative phase nears completion, ask the student a reflective question: ${config.reflectionPrompt}  
     - Do not summarize or provide a final, definitive answer; the goal is to facilitate further thought and self-discovery.
  
  ADDITIONAL INSTRUCTIONS:
  ${config.additionalInstructions ? config.additionalInstructions : 'No additional instructions.'}
  
  Remember: Your primary responsibility is to facilitate learning by guiding inquiry. Always ask questions that provoke further thinking, and never reveal the final answer outright
  
  Start by coming up with a scaniro in the form of a narrative story that the detective sudents needs to solve. Create a charater that explains what he knows about the basic facts of the case to the student. Give them some basic details about the mystery to get started, but dont give too much away as students should ask questions to learn more. Don't be overly verbose, just enough to keep a school chile enaged.
  `.trim();
  
};

/**
 * Generates a response from the Groq API based on conversation history and system prompt
 * @param {Array} messages - Array of message objects with role and content
 * @returns {Promise<string>} - AI response
 */
export const generateAIResponse = async (messages) => {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables');
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error('Valid messages array is required');
  }

  try {
    // For test environment, return a mock response
    if (NODE_ENV === 'test') {
      return 'This is a mock response for testing purposes.';
    }
    
    const response = await groqApi.post('', {
      model: MODEL,
      messages,
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
      top_p: 1,
      stream: false
    });

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid response from Groq API');
    }

    return response.data.choices[0].message.content;
  } catch (error) {
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