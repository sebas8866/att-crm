# Nano Banana Pro API Configuration
# AT&T Fiber Ad Image Generation

## API Endpoint
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=AIzaSyDztwrP_UGHY--aNmQy1jfswsvbPppkjCk
```

## Headers
```
Content-Type: application/json
```

## Request Body Structure
```json
{
  "contents": [{
    "parts": [{
      "text": "PROMPT_TEXT_HERE"
    }]
  }],
  "generationConfig": {
    "responseModalities": ["Text", "Image"],
    "temperature": 0.7,
    "maxOutputTokens": 2048
  }
}
```

## Image Generation Prompts (16 Total)

### Offer 1: $15/mo Bundle
1. **1A - Predictable Cost**: Professional woman at home office, warm lighting, AT&T blue accents
2. **1B - Future-Proof**: Smart home family, multiple devices, connected home
3. **1C - Work From Home**: Professional video call, crisp quality
4. **1D - Bundle Value**: Couple with phone + laptop, savings concept

### Offer 2: 1000 Mbps $60/mo
5. **2A - No Buffering**: Family movie night, 4K streaming
6. **2B - Gaming**: RGB gaming setup, no lag
7. **2C - Content Creator**: Uploading 4K video, studio setup
8. **2D - Power Family**: Multiple devices connected

### Offer 3: 300 Mbps $35/mo
9. **3A - No Contract**: Relaxed couple, freedom concept
10. **3B - Zoom Calls**: Professional video conference
11. **3C - Everyday Value**: Family evening routine
12. **3D - Budget Hero**: Celebrating savings

### Offer 4: 1st Month FREE
13. **4A - Risk-Free**: Unboxing excitement
14. **4B - Switch & Save**: Upgrading from old equipment
15. **4C - Test Drive**: Speed visualization
16. **4D - No Risk**: Confident choice

## Output Specifications
- Resolution: 1024x1024 (Nano Banana Pro max)
- Format: JPEG/PNG
- Style: Photorealistic
- Brand Colors: AT&T Blue #00A8E0

## Delivery
- Generate all 16 images
- Save to output/images/
- Email to: info@myhomepromotions.com
- Include generation metadata
