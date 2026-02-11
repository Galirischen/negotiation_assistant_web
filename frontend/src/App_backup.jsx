import React, { useState } from 'react';
import './App.css';
import Intelligence from './pages/Intelligence';
import LiveCopilot from './pages/LiveCopilot';
import Workflow from './pages/Workflow';

function App() {
  const [activeTab, setActiveTab] = useState('intelligence');

  const renderPage = () => {
    switch (activeTab) {
      case 'intelligence':
        return <Intelligence />;
      case 'copilot':
        return <LiveCopilot />;
      case 'workflow':
        return <Workflow />;
      default:
        return <Intelligence />;
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="logo">NegotiaPro AI</h1>
            <p className="logo-subtitle">智能谈判助手</p>
          </div>

          {/* Navigation Tabs */}
          <nav className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'intelligence' ? 'active' : ''}`}
              onClick={() => setActiveTab('intelligence')}
            >
              <span className="tab-icon">🎯</span>
              <span className="tab-text">战前准备</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'copilot' ? 'active' : ''}`}
              onClick={() => setActiveTab('copilot')}
            >
              <span className="tab-icon">🎙️</span>
              <span className="tab-text">战中辅助</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'workflow' ? 'active' : ''}`}
              onClick={() => setActiveTab('workflow')}
            >
              <span className="tab-icon">📋</span>
              <span className="tab-text">战后复盘</span>
            </button>
          </nav>

          {/* User Section */}
          <div className="user-section">
            <div className="user-avatar">👤</div>
            <span className="user-name">商务团队</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
