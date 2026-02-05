const express = require('express')
const cors = require('cors')
const multer = require('multer')
const axios = require('axios')
const FormData = require('form-data')
require('dotenv').config()

const app = express()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000/detect'

app.post('/api/detect', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' })
  }

  try {
    const form = new FormData()
    form.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    })

    const response = await axios.post(PYTHON_SERVICE_URL, form, {
      headers: {
        ...form.getHeaders()
      },
      timeout: 60000
    })

    res.json(response.data)
  } catch (error) {
    const status = error.response?.status || 500
    res.status(status).json({
      error: 'Model inference failed',
      details: error.response?.data || error.message
    })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
