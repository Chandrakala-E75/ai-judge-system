import { useState } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [sideA, setSideA] = useState('')
  const [sideB, setSideB] = useState('')
  const [caseDetails, setCaseDetails] = useState('')
  const [verdict, setVerdict] = useState('')
  const [argCountA, setArgCountA] = useState(0)
  const [argCountB, setArgCountB] = useState(0)
  const [loading, setLoading] = useState(false)
  
  const [conversation, setConversation] = useState([])
  

  const handleSubmitCase = async () => {
    if (!sideA || !sideB || !caseDetails) {
      alert('Please fill in all fields')
      return
    }
    
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5000/submit-case', {
        sideA, sideB, caseDetails
      })
      setVerdict(response.data.verdict)
      setConversation([{ role: 'judge', text: response.data.verdict }])
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleArgument = async (side) => {
    const textarea = document.getElementById(`arg${side}`)
    const argument = textarea.value
    if (!argument) {
      alert('Please enter an argument')
      return
    }
    
    const currentCount = side === 'A' ? argCountA : argCountB
    if (currentCount >= 5) {
      alert('Maximum 5 arguments per side reached')
      return
    }
    setLoading(true)
    try {
      const conversationText = conversation.map(c => `${c.role}: ${c.text}`).join('\n\n')
      const response = await axios.post('http://localhost:5000/submit-argument', {
        conversation: conversationText,
        argument,
        side: `Side ${side}`
      })
      
      setConversation([...conversation, 
        { role: `Side ${side}`, text: argument },
        { role: 'judge', text: response.data.response }
      ])
      
      if (side === 'A') setArgCountA(argCountA + 1)
      else setArgCountB(argCountB + 1)
      
      textarea.value = ''
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e, side) => {
    const file = e.target.files[0]
    if (!file) return
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await axios.post('http://localhost:5000/upload-file', formData)
      if (side === 'A') {
        setSideA(sideA + '\n\n' + response.data.text)
      } else {
        setSideB(sideB + '\n\n' + response.data.text)
      }
      alert(`✅ Successfully uploaded!\n\nFile: ${response.data.filename}`)
    } catch (error) {
      alert('Error uploading file: ' + (error.response?.data?.error || error.message))
    }
  }

  const cleanText = (text) => {
    // Remove ** markdown
    let cleaned = text.replace(/\*\*/g, '');
    
    // Add single line break before numbered points (not double)
    cleaned = cleaned.replace(/(\d+\))/g, '\n$1');
    
    // Remove the colon line break - keep it inline
    
    return cleaned;
  }

  return (
    <div className="app">
      <h1>⚖️ AI Judge - Mock Trial System</h1>
      
      <div className="case-input-section">
        <div className="side-input">
          <h3>Side A (Plaintiff)</h3>
          <input type="file" accept=".pdf,.docx,.txt" onChange={(e) => handleFileUpload(e, 'A')} style={{marginBottom: '10px'}} />
          <textarea value={sideA} onChange={(e) => setSideA(e.target.value)} placeholder="Enter Side A evidence and arguments..."></textarea>
        </div>
        
        <div className="side-input">
          <h3>Side B (Defendant)</h3>
          <input type="file" accept=".pdf,.docx,.txt" onChange={(e) => handleFileUpload(e, 'B')} style={{marginBottom: '10px'}} />
          <textarea value={sideB} onChange={(e) => setSideB(e.target.value)} placeholder="Enter Side B evidence and arguments..."></textarea>
        </div>
      </div>
      
      <div className="case-details">
        <h3>Case Details</h3>
        <textarea value={caseDetails} onChange={(e) => setCaseDetails(e.target.value)} placeholder="Enter case background and details..."></textarea>
      </div>

      <button className="submit-btn" onClick={handleSubmitCase} disabled={loading}>
        {loading ? 'Analyzing Case...' : 'Get Initial Verdict'}
      </button>
      
      {verdict && (
        <div className="verdict-section">
          <h2>🏛️ Judge's Verdict</h2>
          <div className="verdict-content">{cleanText(verdict)}</div>
        </div>
      )}


      {verdict && (argCountA < 5 || argCountB < 5) && (
        <div className="argument-section">
          <h3>Present Arguments</h3>
          <div className="argument-inputs">
            <div className="arg-side">
              <h4>Side A Argument ({5 - argCountA} remaining)</h4>
              <textarea id="argA" placeholder="Side A: Present your counter-argument..." disabled={argCountA >= 5}></textarea>
              <button onClick={() => handleArgument('A')} disabled={argCountA >= 5}>Submit Argument</button>
            </div>
            <div className="arg-side">
              <h4>Side B Argument ({5 - argCountB} remaining)</h4>
              <textarea id="argB" placeholder="Side B: Present your counter-argument..." disabled={argCountB >= 5}></textarea>
              <button onClick={() => handleArgument('B')} disabled={argCountB >= 5}>Submit Argument</button>
            </div>
          </div>
        </div>
      )}

      {conversation.length > 1 && (
        <div className="conversation-history">
          <h3>📜 Case Proceedings</h3>
          {conversation.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role.includes('Side') ? 'side-msg' : 'judge-msg'}`}>
              <strong>{msg.role}:</strong>
              <p>{cleanText(msg.text)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App