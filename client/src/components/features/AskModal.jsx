import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { askAI } from '../../models/aiModel';
import { getErrorMessage } from '../../lib/errorMessage';

function AskModal({ isOpen, onClose }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null); // { answer: string, communities: [] }
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  async function handleAsk(e) {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer(null);

    try {
      // POST to /api/ai/ask
      const res = await askAI(question);
      setAnswer(res.data);
    } catch (err) {
      console.error("Failed to ask AI", err);
      setAnswer({ 
        answer: getErrorMessage(err, "Could not reach the AI service right now. Please try again."), 
        communities: [] 
      });
    } finally {
      setLoading(false);
    }
  }

  function handleCommunityClick(communityName) {
    // Navigate to community page
    // Extract name from "r/name" or just "name"
    const name = communityName.replace(/^r\//, '');
    navigate(`/r/${name}`);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ask-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Ask Reddit AI 🤖</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          {!answer ? (
            <div className="ask-input-section">
              <p className="ask-intro">
                Got a question? Ask it below and get a quick answer plus valid community recommendations from Reddit's AI.
              </p>
              <form onSubmit={handleAsk}>
                <textarea
                  className="ask-textarea"
                  placeholder="e.g., What is the best way to learn React?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows="4"
                  autoFocus
                />
                <button 
                  type="submit" 
                  className="ask-submit-btn" 
                  disabled={loading || !question.trim()}
                >
                  {loading ? 'Thinking...' : 'Ask AI'}
                </button>
              </form>
            </div>
          ) : (
            <div className="answer-section">
              <div className="ai-answer-box">
                <h4>Answer:</h4>
                <p>{answer.answer}</p>
              </div>
              
              {answer.communities && answer.communities.length > 0 && (
                <div className="recommendations-box">
                  <h4>Recommended Communities:</h4>
                  <div className="community-tags">
                    {answer.communities.map((comm, idx) => (
                      <button 
                        key={idx} 
                        className="community-tag"
                        onClick={() => handleCommunityClick(comm)}
                      >
                        {comm}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button 
                className="ask-another-btn" 
                onClick={() => { setAnswer(null); setQuestion(""); }}
              >
                Ask Another Question
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AskModal;
