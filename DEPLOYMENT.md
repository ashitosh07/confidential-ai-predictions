# 🚀 Deployment Guide - Z-AI Predictor

## Vercel Deployment Configuration

### 📁 **Files Added**
- `.gitignore` - Comprehensive ignore patterns
- `vercel.json` - Root deployment config
- `frontend/vercel.json` - Frontend-specific config
- `backend/vercel.json` - Backend-specific config

---

## 🔧 **Deployment Steps**

### **1. Environment Variables Setup**

#### **Backend Environment Variables (Vercel Secrets)**
```bash
# Add secrets to Vercel
vercel secrets add gemini-api-key "your-google-gemini-api-key"
vercel secrets add weather-api-key "your-weatherapi-key"
```

#### **Frontend Environment Variables**
```bash
# Set in Vercel dashboard or CLI
NEXT_PUBLIC_API_URL=https://z-ai-predictor-backend.vercel.app
NEXT_PUBLIC_CONTRACT_ADDRESS=""
NEXT_PUBLIC_CHAIN_ID=31337
```

### **2. Deploy Backend First**
```bash
cd backend
vercel --prod
# Note the deployment URL for frontend config
```

### **3. Deploy Frontend**
```bash
cd frontend
# Update NEXT_PUBLIC_API_URL with backend URL
vercel --prod
```

### **4. Deploy Full Stack (Alternative)**
```bash
# From root directory
vercel --prod
```

---

## 🌐 **Production URLs**

### **Expected Deployment URLs**:
- **Frontend**: `https://z-ai-predictor.vercel.app`
- **Backend**: `https://z-ai-predictor-backend.vercel.app`
- **Health Check**: `https://z-ai-predictor-backend.vercel.app/health`

---

## ⚙️ **Configuration Details**

### **Root vercel.json**
- Builds both frontend (Next.js) and backend (Node.js)
- Routes API calls to backend, everything else to frontend
- Sets production environment variables
- 30-second timeout for API functions

### **Frontend vercel.json**
- Next.js framework optimization
- Security headers (X-Frame-Options, etc.)
- API URL configuration for production
- 10-second timeout for frontend functions

### **Backend vercel.json**
- Node.js serverless function
- CORS headers for cross-origin requests
- 1GB memory allocation
- 30-second timeout for heavy AI operations

---

## 🔒 **Security Configuration**

### **Headers Applied**:
- `X-Frame-Options: DENY` - Prevent clickjacking
- `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- `Referrer-Policy: origin-when-cross-origin` - Control referrer info
- `Access-Control-Allow-Origin: *` - CORS for API access

### **Environment Security**:
- API keys stored as Vercel secrets
- No sensitive data in repository
- Production-only environment variables

---

## 🧪 **Testing Deployment**

### **Health Check**:
```bash
curl https://z-ai-predictor-backend.vercel.app/health
```

### **API Test**:
```bash
curl -X POST https://z-ai-predictor-backend.vercel.app/api/fetch-prediction \
  -H "Content-Type: application/json" \
  -d '{"domain":"financial","inputs":{"input1":"50000","input2":"2500","input3":"7.5"}}'
```

### **Frontend Test**:
- Visit: `https://z-ai-predictor.vercel.app`
- Test prediction functionality
- Verify live market data loads
- Check error handling

---

## 🚨 **Troubleshooting**

### **Common Issues**:

1. **API Keys Not Working**
   ```bash
   # Check secrets are set
   vercel secrets ls
   
   # Re-add if missing
   vercel secrets add gemini-api-key "your-key"
   ```

2. **CORS Errors**
   - Verify backend CORS headers in `backend/vercel.json`
   - Check frontend API URL points to correct backend

3. **Function Timeouts**
   - Gemini API calls may take 10-30 seconds
   - Increase `maxDuration` if needed
   - Check function logs: `vercel logs`

4. **Build Failures**
   - Ensure all dependencies in `package.json`
   - Check Node.js version compatibility
   - Verify TypeScript compilation

### **Debug Commands**:
```bash
# View deployment logs
vercel logs

# Check function status
vercel inspect [deployment-url]

# Local development with production env
vercel dev
```

---

## 📊 **Performance Optimization**

### **Vercel Configuration**:
- **Memory**: 1GB for backend (AI operations)
- **Timeout**: 30s for backend, 10s for frontend
- **Regions**: Auto (global edge network)
- **Caching**: Static assets cached at edge

### **Next.js Optimization**:
- Static generation where possible
- Image optimization enabled
- Bundle analysis available
- Tree shaking for smaller bundles

---

## 🎯 **Production Checklist**

- [ ] Environment variables configured
- [ ] API keys added as Vercel secrets
- [ ] Backend deployed and health check passes
- [ ] Frontend deployed and loads correctly
- [ ] CORS configured for cross-origin requests
- [ ] All API endpoints working in production
- [ ] Error handling tested
- [ ] Performance monitoring enabled

---

## 🌟 **Demo URLs for Judges**

Once deployed, share these URLs for easy testing:

- **Live Demo**: `https://z-ai-predictor.vercel.app`
- **API Health**: `https://z-ai-predictor-backend.vercel.app/health`
- **GitHub Repo**: `https://github.com/yourusername/confidential-ai-predictions`

**Ready for Golden Ticket submission! 🎫✨**