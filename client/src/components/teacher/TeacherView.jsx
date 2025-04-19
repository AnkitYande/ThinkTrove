import { useState, useEffect } from 'react';
import { saveConfiguration, getConfigurations, deleteConfiguration, updateConfiguration } from '../../services/api';
import './TeacherView.css';

function TeacherView({ configs, onConfigSaved, onConfigDeleted }) {
  const [formData, setFormData] = useState({
    lessonTitle: "Mystery of the Sick Students",
    gradeLevel: "Middle School",
    subject: "Science / Health",
    estimatedTime: "20-30 minutes",
    learningObjective: "Students will apply the scientific method to identify environmental causes of illness.",
    tags: "Scientific Method, Environmental Science, Critical Thinking",
    phases: ["Observation", "Question", "Hypothesis", "Investigation", "Data", "Conclusion"],
    validHypotheses: "poor air quality, lack of food, contaminated water",
    misconceptions: "viruses cause immediate illness, stress alone causes nausea",
    correctConcepts: "chronic exposure to poor air quality can cause illness, environmental factors impact health",
    tone: "Socratic but friendly",
    nudgeOnWrongAnswers: true,
    reinforceGoodReasoning: true,
    offerHintsIfStuck: true,
    scaffoldingLevel: "Moderate",
    maxHints: "2",
    reflectionPrompt: "What do you think caused the illness, and how confident are you in your conclusion?",
    additionalInstructions: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [mode, setMode] = useState('create'); // 'create', 'edit', 'manage'
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handlePhasesChange = (phase) => {
    setFormData(prev => {
      if (prev.phases.includes(phase)) {
        return { ...prev, phases: prev.phases.filter(p => p !== phase) };
      } else {
        return { ...prev, phases: [...prev.phases, phase] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    
    try {
      let savedConfig;
      if (mode === 'edit' && selectedLessonId) {
        savedConfig = await updateConfiguration(selectedLessonId, formData);
        setSubmitSuccess('Lesson updated successfully!');
      } else {
        savedConfig = await saveConfiguration(formData);
        setSubmitSuccess('Lesson configuration saved successfully!');
      }
      
      onConfigSaved(savedConfig);
      
      // Reset form after success
      if (mode === 'edit') {
        setMode('manage');
        setEditingLesson(null);
      }
    } catch (error) {
      setSubmitError('Failed to save configuration. Please try again.');
      console.error('Error saving configuration:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (lesson) => {
    setMode('edit');
    setSelectedLessonId(lesson.id);
    setFormData(lesson);
    setEditingLesson(lesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await deleteConfiguration(id);
      onConfigDeleted(id);
      
      if (selectedLessonId === id) {
        setSelectedLessonId(null);
      }
      
      setSubmitSuccess('Lesson deleted successfully!');
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setSubmitError('Failed to delete lesson. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      lessonTitle: "",
      gradeLevel: "",
      subject: "",
      estimatedTime: "",
      learningObjective: "",
      tags: "",
      phases: ["Observation", "Question", "Hypothesis", "Investigation", "Data", "Conclusion"],
      validHypotheses: "",
      misconceptions: "",
      correctConcepts: "",
      tone: "Socratic but friendly",
      nudgeOnWrongAnswers: true,
      reinforceGoodReasoning: true,
      offerHintsIfStuck: true,
      scaffoldingLevel: "Moderate",
      maxHints: "2",
      reflectionPrompt: "",
      additionalInstructions: ""
    });
    setMode('create');
    setSelectedLessonId(null);
    setEditingLesson(null);
  };

  const cancelEdit = () => {
    setMode('manage');
    setSelectedLessonId(null);
    setEditingLesson(null);
  };

  const availablePhases = ["Observation", "Question", "Hypothesis", "Investigation", "Data", "Conclusion"];
  const toneOptions = ["Socratic but friendly", "Direct", "Inspirational", "Playful"];
  const scaffoldingOptions = ["Low", "Moderate", "High"];

  return (
    <div className="teacher-view">
      {mode === 'edit' ? (
        <div className="edit-mode-banner">
          <div className="edit-mode-info">
            <h2>Editing Lesson: {editingLesson?.lessonTitle}</h2>
            <p>Make changes to your lesson below, then click "Update Lesson" to save your changes.</p>
          </div>
          <div className="edit-mode-actions">
            <button className="secondary-button" onClick={cancelEdit}>
              Cancel Editing
            </button>
          </div>
        </div>
      ) : (
        <div className="teacher-tabs">
          <button 
            className={mode === 'create' ? 'active' : ''} 
            onClick={() => mode !== 'create' && setMode('create')}
          >
            Create Lesson
          </button>
          <button 
            className={mode === 'manage' ? 'active' : ''} 
            onClick={() => mode !== 'manage' && setMode('manage')}
          >
            Manage Lessons
          </button>
        </div>
      )}
      
      {submitSuccess && <div className="success-message">{submitSuccess}</div>}
      {submitError && <div className="error-message">{submitError}</div>}
      
      {mode === 'manage' ? (
        <div className="lessons-management">
          <h2>Manage Lessons</h2>
          
          {isLoading ? (
            <div className="loading-message">Loading lessons...</div>
          ) : configs.length === 0 ? (
            <div className="no-lessons">
              <p>No lessons available. Create your first lesson!</p>
              <button onClick={() => setMode('create')} className="primary-button">Create Lesson</button>
            </div>
          ) : (
            <div className="lessons-list">
              {configs.map(lesson => (
                <div key={lesson.id} className="lesson-card">
                  <div className="lesson-info">
                    <h3>{lesson.lessonTitle}</h3>
                    <div className="lesson-meta">
                      <span className="grade-level">{lesson.gradeLevel}</span>
                      <span className="subject">{lesson.subject}</span>
                      <span className="estimated-time">{lesson.estimatedTime}</span>
                    </div>
                    <p className="lesson-objective">{lesson.learningObjective}</p>
                  </div>
                  <div className="lesson-actions">
                    <button 
                      onClick={() => handleEdit(lesson)}
                      className="edit-button"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(lesson.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="form-container">
          <form className="teacher-form" onSubmit={handleSubmit}>
            {!editingLesson && (
              <h2>Create New Lesson</h2>
            )}
            
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="lessonTitle">Lesson Title</label>
                <input 
                  type="text" 
                  id="lessonTitle" 
                  name="lessonTitle" 
                  value={formData.lessonTitle}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="gradeLevel">Grade Level</label>
                <input 
                  type="text" 
                  id="gradeLevel" 
                  name="gradeLevel" 
                  value={formData.gradeLevel}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  name="subject" 
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="estimatedTime">Estimated Time</label>
                <input 
                  type="text" 
                  id="estimatedTime" 
                  name="estimatedTime" 
                  value={formData.estimatedTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-section">
              <h3>Learning Details</h3>
              
              <div className="form-group">
                <label htmlFor="learningObjective">Learning Objective</label>
                <textarea 
                  id="learningObjective" 
                  name="learningObjective" 
                  value={formData.learningObjective}
                  onChange={handleInputChange}
                  rows="3"
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="tags">Tags / Keywords</label>
                <input 
                  type="text" 
                  id="tags" 
                  name="tags" 
                  value={formData.tags}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Phases</label>
                <div className="checkbox-group">
                  {availablePhases.map(phase => (
                    <label key={phase} className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={formData.phases.includes(phase)}
                        onChange={() => handlePhasesChange(phase)}
                      />
                      {phase}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h3>Concepts & Guidance</h3>
              
              <div className="form-group">
                <label htmlFor="validHypotheses">Valid Hypotheses (comma-separated)</label>
                <textarea 
                  id="validHypotheses" 
                  name="validHypotheses" 
                  value={formData.validHypotheses}
                  onChange={handleInputChange}
                  rows="2"
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="misconceptions">Misconceptions (comma-separated)</label>
                <textarea 
                  id="misconceptions" 
                  name="misconceptions" 
                  value={formData.misconceptions}
                  onChange={handleInputChange}
                  rows="2"
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="correctConcepts">Correct Concepts (comma-separated)</label>
                <textarea 
                  id="correctConcepts" 
                  name="correctConcepts" 
                  value={formData.correctConcepts}
                  onChange={handleInputChange}
                  rows="2"
                  required
                ></textarea>
              </div>
            </div>
            
            <div className="form-section">
              <h3>Teaching Approach</h3>
              
              <div className="form-group">
                <label htmlFor="tone">Tone</label>
                <select 
                  id="tone" 
                  name="tone" 
                  value={formData.tone}
                  onChange={handleInputChange}
                  required
                >
                  {toneOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Intervention Rules</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      name="nudgeOnWrongAnswers"
                      checked={formData.nudgeOnWrongAnswers}
                      onChange={handleInputChange}
                    />
                    Nudge on Wrong Answers
                  </label>
                  
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      name="reinforceGoodReasoning"
                      checked={formData.reinforceGoodReasoning}
                      onChange={handleInputChange}
                    />
                    Reinforce Good Reasoning
                  </label>
                  
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      name="offerHintsIfStuck"
                      checked={formData.offerHintsIfStuck}
                      onChange={handleInputChange}
                    />
                    Offer Hints If Stuck
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="scaffoldingLevel">Scaffolding Level</label>
                <select 
                  id="scaffoldingLevel" 
                  name="scaffoldingLevel" 
                  value={formData.scaffoldingLevel}
                  onChange={handleInputChange}
                  required
                >
                  {scaffoldingOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="maxHints">Maximum Hints</label>
                <input 
                  type="number" 
                  id="maxHints" 
                  name="maxHints" 
                  value={formData.maxHints}
                  onChange={handleInputChange}
                  min="0"
                  max="5"
                  required
                />
              </div>
            </div>
            
            <div className="form-section">
              <h3>Reflection</h3>
              
              <div className="form-group">
                <label htmlFor="reflectionPrompt">Reflection Prompt</label>
                <textarea 
                  id="reflectionPrompt" 
                  name="reflectionPrompt" 
                  value={formData.reflectionPrompt}
                  onChange={handleInputChange}
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="additionalInstructions">Additional Instructions (Optional)</label>
                <textarea 
                  id="additionalInstructions" 
                  name="additionalInstructions" 
                  value={formData.additionalInstructions}
                  onChange={handleInputChange}
                  rows="3"
                ></textarea>
              </div>
            </div>
            
            <div className="form-actions">
              {mode === 'edit' ? (
                <>
                  <button type="submit" disabled={isSubmitting} className="update-button">
                    {isSubmitting ? 'Saving...' : 'Update Lesson'}
                  </button>
                  <button 
                    type="button" 
                    className="secondary-button" 
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button type="submit" disabled={isSubmitting} className="create-button">
                  {isSubmitting ? 'Creating...' : 'Create Lesson'}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default TeacherView; 