import './Navbar.css';

function Navbar({ activeTab, setActiveTab }) {
  return (
    <div className="navbar">
      <button 
        className={activeTab === 'chat' ? 'active' : ''}
        onClick={() => setActiveTab('chat')}
      >
        Student
      </button>
      <button 
        className={activeTab === 'teacher' ? 'active' : ''}
        onClick={() => setActiveTab('teacher')}
      >
        Teacher
      </button>
    </div>
  );
}

export default Navbar; 