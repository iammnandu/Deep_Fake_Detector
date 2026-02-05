import { useEffect, useMemo, useState } from 'react'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [result, setResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')

  const previewUrl = useMemo(() => {
    if (!selectedFile) return null
    return URL.createObjectURL(selectedFile)
  }, [selectedFile])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    setResult(null)
    setError('')
    if (file) {
      setSelectedFile(file)
      return
    }
    setSelectedFile(null)
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return
    setIsAnalyzing(true)
    setError('')

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/detect'
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Detection failed')
      }

      const data = await response.json()
      setResult({ verdict: data.verdict, confidence: data.confidence })
    } catch (err) {
      setError(err.message || 'Detection failed')
      setResult(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setResult(null)
    setError('')
  }

  return (
    <div className="app">
      <header className="nav">
        <div className="logo">VeriScan AI</div>
        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#detect">Detect</a>
          <a href="#how">How it works</a>
          <a href="#contact">Contact</a>
        </nav>
        <button className="nav-cta">Request Demo</button>
      </header>

      <section id="home" className="hero">
        <div className="hero-content">
          <p className="pill">AI Image Authenticity Detection</p>
          <h1>
            Detect synthetic images.
            <span> Protect trust at scale.</span>
          </h1>
          <p className="subtitle">
            Analyze images for AI-generation artifacts from diffusion models,
            GANs, and large multimodal systems. Built for platforms, media
            teams, and cyber defense units.
          </p>
          <div className="hero-actions">
            <a className="primary" href="#detect">
              Start Detection
            </a>
            <button className="ghost">View Architecture</button>
          </div>
          <div className="hero-metrics">
            <div>
              <h3>97.8%</h3>
              <p>Detection accuracy</p>
            </div>
            <div>
              <h3>250ms</h3>
              <p>Avg response time</p>
            </div>
            <div>
              <h3>30M+</h3>
              <p>Images analyzed</p>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <div className="glow" />
          <div className="hero-card-inner">
            <h2>Live Detection Preview</h2>
            <p>Upload an image and get a verdict with confidence.</p>
            <div className="preview-frame">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" />
              ) : (
                <div className="placeholder">
                  Drop a file to preview
                </div>
              )}
            </div>
            {error ? (
              <div className="result ai">
                <strong>Error</strong>
                <span>{error}</span>
              </div>
            ) : result ? (
              <div className={`result ${result.verdict === 'Real' ? 'real' : 'ai'}`}>
                <strong>{result.verdict}</strong>
                <span>{result.confidence}% confidence</span>
              </div>
            ) : (
              <div className="result muted">Awaiting analysis…</div>
            )}
          </div>
        </div>
      </section>

      <section id="detect" className="detect">
        <div className="section-head">
          <h2>Detect AI-Generated Images</h2>
          <p>
            Upload a file and receive a classification with confidence score.
            Replace the demo logic with your backend API.
          </p>
        </div>

        <div className="detect-grid">
          <div className="upload-card">
            <label className="upload-area">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <div>
                <h3>Upload image</h3>
                <p>PNG, JPG, JPEG up to 10MB</p>
              </div>
            </label>

            {selectedFile && (
              <div className="file-row">
                <div>
                  <strong>{selectedFile.name}</strong>
                  <p>{Math.round(selectedFile.size / 1024)} KB</p>
                </div>
                <button className="link" onClick={handleReset}>
                  Remove
                </button>
              </div>
            )}

            <div className="actions">
              <button
                className="primary"
                onClick={handleAnalyze}
                disabled={!selectedFile || isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing…' : 'Analyze Image'}
              </button>
              <button className="ghost" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>

          <div className="result-card">
            <h3>Detection Result</h3>
            <p className="muted">
              Results are generated by the running detection service.
            </p>
            {error ? (
              <div className="result-block">
                <div className="badge ai">Error</div>
                <h4>{error}</h4>
              </div>
            ) : result ? (
              <div className="result-block">
                <div className={`badge ${result.verdict === 'Real' ? 'real' : 'ai'}`}>
                  {result.verdict}
                </div>
                <h4>{result.confidence}% confidence</h4>
                <p>
                  The image exhibits artifacts consistent with{' '}
                  {result.verdict === 'Real' ? 'authentic capture.' : 'AI synthesis.'}
                </p>
              </div>
            ) : (
              <div className="empty-state">
                Upload an image to view the result.
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="how" className="how">
        <div className="section-head">
          <h2>How the system works</h2>
          <p>Multi-signal analysis for fast and reliable detection.</p>
        </div>
        <div className="steps">
          <div>
            <h3>1. Feature Extraction</h3>
            <p>Frequency, texture, and lighting inconsistencies are captured.</p>
          </div>
          <div>
            <h3>2. Model Ensemble</h3>
            <p>Diffusion, GAN, and watermark classifiers vote on the output.</p>
          </div>
          <div>
            <h3>3. Confidence Score</h3>
            <p>Calibrated probabilities guide your final decision.</p>
          </div>
        </div>
      </section>

      <footer id="contact" className="footer">
        <div>
          <h3>VeriScan AI</h3>
          <p>Secure digital trust with AI authenticity detection.</p>
        </div>
        <div className="footer-links">
          <a href="#home">Home</a>
          <a href="#detect">Detect</a>
          <a href="#how">How it works</a>
        </div>
        <button className="primary">Contact Sales</button>
      </footer>
    </div>
  )
}

export default App
