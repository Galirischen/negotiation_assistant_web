import React, { useState, useRef, useEffect } from 'react';
import './LiveCopilot.css';

function LiveCopilot() {
  const [conversationLog, setConversationLog] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const conversationEndRef = useRef(null);

  // 自动滚动到最新对话
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationLog]);

  // 处理对方发言输入
  const handleOpponentSpeech = async () => {
    if (!currentInput.trim()) {
      return;
    }

    const newMessage = {
      id: Date.now(),
      type: 'opponent',
      content: currentInput,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    // 添加到对话记录
    setConversationLog([...conversationLog, newMessage]);
    setLoading(true);

    try {
      // 调用话术推荐API
      const response = await fetch('http://localhost:8000/api/playbook/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_input: currentInput
        })
      });

      const data = await response.json();

      if (data.success) {
        setRecommendations(data.data);
      }
    } catch (error) {
      console.error('获取话术推荐失败:', error);
    } finally {
      setLoading(false);
      setCurrentInput('');
    }
  };

  // 使用推荐话术
  const useRecommendation = (script) => {
    const newMessage = {
      id: Date.now(),
      type: 'self',
      content: script.content,
      scriptName: script.name,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    setConversationLog([...conversationLog, newMessage]);
    setRecommendations([]);
  };

  // 自定义回复
  const addCustomReply = () => {
    const customReply = prompt('请输入您的回复:');
    if (customReply && customReply.trim()) {
      const newMessage = {
        id: Date.now(),
        type: 'self',
        content: customReply,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };
      setConversationLog([...conversationLog, newMessage]);
      setRecommendations([]);
    }
  };

  // 开始/停止录音和实时转写
  const toggleRecording = () => {
    if (!isRecording) {
      // 开始录音和转写
      setIsRecording(true);
      setTranscribing(true);
      setTranscriptText('');

      // 模拟实时转写（Demo版）
      let demoText = '';
      const demoWords = [
        '嗯', '各位领导好', '关于这个', '保证金比例的问题',
        '我们', '确实', '理解', '评审委员会的考虑',
        '但是', '10%', '的比例', '确实', '比较高',
        '我想', '提一个', '阶梯式', '的方案'
      ];

      let wordIndex = 0;
      const interval = setInterval(() => {
        if (wordIndex < demoWords.length) {
          demoText += demoWords[wordIndex] + ' ';
          setTranscriptText(demoText);
          wordIndex++;
        } else {
          clearInterval(interval);
          setTranscribing(false);
        }
      }, 500);

      // 保存interval ID以便停止时清除
      window.transcriptInterval = interval;
    } else {
      // 停止录音
      setIsRecording(false);
      setTranscribing(false);
      if (window.transcriptInterval) {
        clearInterval(window.transcriptInterval);
      }

      // 如果有转写内容，添加到输入框
      if (transcriptText.trim()) {
        setCurrentInput(transcriptText.trim());
      }
    }
  };

  // 生成复盘报告
  const generateReview = () => {
    if (conversationLog.length === 0) {
      alert('暂无对话记录，无法生成复盘报告');
      return;
    }

    // 跳转到复盘页面，传递对话记录
    const reviewData = {
      conversation: conversationLog,
      timestamp: new Date().toISOString(),
      duration: '待计算'
    };

    localStorage.setItem('currentReview', JSON.stringify(reviewData));
    alert('复盘报告已生成，请前往"战后复盘"页面查看');
  };

  // 清空对话
  const clearConversation = () => {
    if (window.confirm('确定要清空当前对话记录吗？')) {
      setConversationLog([]);
      setRecommendations([]);
    }
  };

  return (
    <div className="live-copilot-page">
      {/* Header */}
      <div className="copilot-header">
        <h1 className="page-title">实时谈判辅助</h1>
        <p className="page-subtitle">Live Copilot - 0.5秒话术推荐</p>

        <div className="copilot-actions">
          <button
            className={`record-btn ${isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
          >
            {isRecording ? '⏹️ 停止录音' : '🎤 开始录音'}
          </button>
          <button className="review-btn" onClick={generateReview}>
            📋 生成复盘
          </button>
          <button className="clear-btn" onClick={clearConversation}>
            🗑️ 清空对话
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="copilot-main">
        {/* Left: Conversation Timeline */}
        <div className="conversation-panel">
          <div className="panel-header">
            <h3>💬 对话记录</h3>
            <span className="conversation-count">{conversationLog.length} 条</span>
          </div>

          <div className="conversation-timeline">
            {conversationLog.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💭</div>
                <p>暂无对话记录</p>
                <p className="empty-hint">请在下方输入对方发言开始谈判</p>
              </div>
            ) : (
              conversationLog.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-item ${msg.type === 'opponent' ? 'opponent' : 'self'}`}
                >
                  <div className="message-time">{msg.timestamp}</div>
                  <div className="message-bubble">
                    <div className="message-label">
                      {msg.type === 'opponent' ? '🔴 对方' : '✅ 我方'}
                    </div>
                    {msg.scriptName && (
                      <div className="script-badge">📝 {msg.scriptName}</div>
                    )}
                    <div className="message-content">{msg.content}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={conversationEndRef} />
          </div>
        </div>

        {/* Right: AI Recommendations */}
        <div className="recommendations-panel">
          <div className="panel-header">
            <h3>🤖 AI推荐话术</h3>
            {loading && <span className="loading-badge">分析中...</span>}
          </div>

          <div className="recommendations-content">
            {recommendations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🤖</div>
                <p>等待话术推荐</p>
                <p className="empty-hint">系统将在0.5秒内推荐最佳应对话术</p>
              </div>
            ) : (
              recommendations.map((script, index) => (
                <div key={script.id} className="recommendation-card">
                  <div className="recommendation-header">
                    <span className="recommendation-badge">推荐 {index + 1}</span>
                    <span className="scene-badge">{script.scene}</span>
                  </div>

                  <h4 className="recommendation-title">{script.name}</h4>

                  <div className="recommendation-content">
                    <p>{script.content}</p>
                  </div>

                  <div className="recommendation-tips">
                    <span className="tips-icon">💡</span>
                    <span className="tips-text">{script.tips}</span>
                  </div>

                  <div className="recommendation-actions">
                    <button
                      className="use-btn"
                      onClick={() => useRecommendation(script)}
                    >
                      ✅ 使用此话术
                    </button>
                  </div>
                </div>
              ))
            )}

            {recommendations.length > 0 && (
              <div className="custom-reply-section">
                <button className="custom-reply-btn" onClick={addCustomReply}>
                  ✏️ 自定义回复
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Transcription */}
      {transcribing && (
        <div className="transcription-area">
          <div className="transcription-header">
            <span className="transcription-icon">🎙️ 实时转写中...</span>
            <span className="transcription-status">正在识别语音</span>
          </div>
          <div className="transcription-content">
            {transcriptText || '等待语音输入...'}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="input-area">
        <div className="input-container">
          <textarea
            className="opponent-input"
            placeholder="请输入对方的发言内容..."
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleOpponentSpeech();
              }
            }}
            rows={3}
          />
          <button
            className="submit-btn"
            onClick={handleOpponentSpeech}
            disabled={!currentInput.trim() || loading}
          >
            {loading ? '分析中...' : '🚀 获取推荐'}
          </button>
        </div>

        <div className="input-tips">
          <span>💡 提示: 按 Enter 提交，Shift+Enter 换行</span>
          <span>⚡ 系统将在0.5秒内推荐最佳话术</span>
        </div>
      </div>
    </div>
  );
}

export default LiveCopilot;
