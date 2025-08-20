const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Event templates
const eventTemplates = {
  userLogin: {
    name: "User Login Success",
    payload: {
      eventType: "user.login",
      userId: "user_123",
      email: "user@example.com",
      timestamp: new Date().toISOString(),
      success: true,
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0..."
    }
  },
  userLoginFailure: {
    name: "User Login Failure", 
    payload: {
      eventType: "user.login.failed",
      email: "user@example.com",
      reason: "invalid_password",
      timestamp: new Date().toISOString(),
      attemptCount: 3,
      ipAddress: "192.168.1.1"
    }
  },
  accountCreated: {
    name: "Account Created",
    payload: {
      eventType: "account.created",
      userId: "user_456",
      email: "newuser@example.com",
      plan: "free",
      timestamp: new Date().toISOString(),
      source: "signup"
    }
  }
};

// Helper function to save event history
async function saveEventHistory(eventData) {
  try {
    const historyPath = path.join(__dirname, '../data/events.json');
    let history = [];
    
    try {
      const data = await fs.readFile(historyPath, 'utf8');
      history = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, start with empty array
    }
    
    history.push(eventData);
    
    // Keep only last 50 events
    if (history.length > 50) {
      history = history.slice(-50);
    }
    
    await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Error saving event history:', error);
  }
}

// Send webhook endpoint
router.post('/send', async (req, res) => {
  const { url, eventType, customPayload, customHeaders } = req.body;
  
  // Validate input
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  // URL validation
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return res.status(400).json({ error: 'URL must use HTTP or HTTPS' });
    }
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }
  
  // Get payload
  let payload = customPayload;
  if (!payload && eventType && eventTemplates[eventType]) {
    payload = eventTemplates[eventType].payload;
  }
  
  if (!payload) {
    return res.status(400).json({ error: 'No payload provided' });
  }
  
  // Send webhook
  const startTime = Date.now();
  let result;
  
  try {
    // Merge default and custom headers
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Webhook-Playground/1.0',
      ...(customHeaders && typeof customHeaders === 'object' ? customHeaders : {})
    };
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      timeout: 10000 // 10 second timeout
    });
    
    const responseText = await response.text();
    
    result = {
      success: true,
      status: response.status,
      statusText: response.statusText,
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      url: url,
      payload: payload,
      response: responseText.slice(0, 1000) // Limit response size
    };
    
  } catch (error) {
    result = {
      success: false,
      error: error.message,
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      url: url,
      payload: payload
    };
  }
  
  // Save to history
  await saveEventHistory(result);

  // Log the URL to the terminal for easy clicking
  console.log(`Click to open: ${url}`);
  
  res.json(result);
});

// Get event templates
router.get('/templates', (req, res) => {
  res.json(eventTemplates);
});

// Get event history
router.get('/history', async (req, res) => {
  try {
    const historyPath = path.join(__dirname, '../data/events.json');
    const data = await fs.readFile(historyPath, 'utf8');
    const history = JSON.parse(data);
    
    // Return last 10 events, most recent first
    res.json(history.slice(-10).reverse());
  } catch (error) {
    // Return empty array if file doesn't exist
    res.json([]);
  }
});

module.exports = router;