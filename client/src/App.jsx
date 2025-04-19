import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/navbar/Navbar';
import ChatView from './components/chat/ChatView';
import TeacherView from './components/teacher/TeacherView';
import { getConfigurations } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('chat')
  const [configs, setConfigs] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState(null);

  // Load configurations when app starts
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const loadedConfigs = await getConfigurations();
        setConfigs(loadedConfigs);
        // If there are configs and none selected, select the first one
        if (loadedConfigs.length > 0 && !selectedConfig) {
          setSelectedConfig(loadedConfigs[0].id);
        }
      } catch (error) {
        console.error('Error loading configurations:', error);
      }
    };

    loadConfigs();
  }, []); // Empty dependency array means this runs once when component mounts

  const handleConfigSaved = (newConfig) => {
    setConfigs(prev => {
      // Check if this config already exists (update)
      const existingIndex = prev.findIndex(config => config.id === newConfig.id);
      if (existingIndex >= 0) {
        // Update existing config
        const newConfigs = [...prev];
        newConfigs[existingIndex] = newConfig;
        return newConfigs;
      } else {
        // Add new config
        return [...prev, newConfig];
      }
    });
    setSelectedConfig(newConfig.id);
  };

  const handleConfigDeleted = (configId) => {
    setConfigs(prev => prev.filter(config => config.id !== configId));
    if (selectedConfig === configId) {
      const remainingConfigs = configs.filter(config => config.id !== configId);
      setSelectedConfig(remainingConfigs.length > 0 ? remainingConfigs[0].id : null);
    }
  };

  return (
    <div className="app">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main>
        {activeTab === 'chat' && (
          <ChatView 
            configs={configs}
            selectedConfig={selectedConfig}
            setSelectedConfig={setSelectedConfig}
          />
        )}
        {activeTab === 'teacher' && (
          <TeacherView 
            configs={configs}
            onConfigSaved={handleConfigSaved}
            onConfigDeleted={handleConfigDeleted}
          />
        )}
      </main>
    </div>
  )
}

export default App
