const axios = require('axios');

class GeminiClient {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
    this.client = axios.create({
      timeout: 30000
    });
  }

  async getPrediction(domain, inputs) {
    try {
      const prompt = this._buildPrompt(domain, inputs);
      
      const response = await this.client.post(`${this.baseURL}/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`, {
        contents: [{
          parts: [{
            text: `You are an AI prediction expert. Provide concise, specific predictions based on the input data. Return only the prediction text without explanations.\n\n${prompt}`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7
        }
      });

      const prediction = response.data.candidates[0].content.parts[0].text.trim();
      
      return {
        prediction,
        model: 'gemini-2.0-flash',
        confidence: this._calculateConfidence(inputs),
        domain
      };
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 429) {
          throw {
            success: false,
            service: 'gemini',
            error: 'Gemini rate limit exceeded - retry later',
            code: '429',
            statusCode: 429
          };
        }
        
        if (status === 400 || status === 401 || status === 403) {
          throw {
            success: false,
            service: 'gemini',
            error: 'Gemini API key invalid or expired',
            code: status.toString(),
            statusCode: status
          };
        }
        
        throw {
          success: false,
          service: 'gemini',
          error: data.error?.message || 'Gemini API error',
          code: status.toString(),
          statusCode: status
        };
      }
      
      if (error.code === 'ECONNABORTED') {
        throw {
          success: false,
          service: 'gemini',
          error: 'Gemini API timeout - service unreachable',
          code: 'TIMEOUT',
          statusCode: 503
        };
      }
      
      throw {
        success: false,
        service: 'gemini',
        error: 'Gemini API unreachable - check network connection',
        code: 'CONNECTION_ERROR',
        statusCode: 503
      };
    }
  }

  _buildPrompt(domain, inputs) {
    switch (domain) {
      case 'financial':
        return `Predict cryptocurrency price trend based on:\nMarket Cap: $${inputs.input1}M\nVolume (24h): $${inputs.input2}M  \nPrice Change: ${inputs.input3}%\nProvide a specific prediction like "Price trend: UP 8.5%" or "Price trend: DOWN 3.2%"`;

      case 'gaming':
        return `Predict gaming match outcome based on:\nPlayer Score: ${inputs.input1}\nMatch Duration: ${inputs.input2} minutes\nTeam Rating: ${inputs.input3}\nProvide a specific prediction like "Win probability: 73.5%" or "Performance: Above Average"`;

      case 'iot':
        return `Predict weather/environmental conditions based on:\nTemperature: ${inputs.input1}°C\nHumidity: ${inputs.input2}%\nPressure: ${inputs.input3} hPa\nProvide a specific prediction like "Forecast: Sunny, 24°C" or "Conditions: Rainy, 18°C"`;

      default:
        return `Analyze the following data and provide a prediction:\nInput 1: ${inputs.input1}\nInput 2: ${inputs.input2}\nInput 3: ${inputs.input3}\nDomain: ${domain}`;
    }
  }

  _calculateConfidence(inputs) {
    const values = [
      parseFloat(inputs.input1) || 0,
      parseFloat(inputs.input2) || 0,
      parseFloat(inputs.input3) || 0
    ];
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const normalizedVariance = Math.min(variance / 10000, 1);
    
    return Math.max(0.6, 1 - normalizedVariance);
  }

  async testConnection() {
    try {
      const response = await this.client.post(`${this.baseURL}/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`, {
        contents: [{
          parts: [{ text: 'Hi' }]
        }],
        generationConfig: {
          maxOutputTokens: 1
        }
      });
      
      return {
        success: true,
        service: 'gemini',
        status: 'connected'
      };
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 401 || error.response?.status === 403) {
        return {
          success: false,
          service: 'gemini',
          error: 'Invalid API key',
          code: error.response.status.toString()
        };
      }
      
      if (error.response?.status === 429) {
        return {
          success: false,
          service: 'gemini',
          error: 'Rate limit exceeded',
          code: '429'
        };
      }
      
      return {
        success: false,
        service: 'gemini',
        error: 'Connection failed',
        code: error.code || 'CONNECTION_ERROR'
      };
    }
  }
}

module.exports = { GeminiClient };