#!/usr/bin/env python3
"""
Nano Banana Pro Image Generator
Generates 4K ad images for AT&T Fiber campaign
"""

import requests
import json
import base64
import os
from pathlib import Path

API_KEY = "AIzaSyDztwtP_UGHY--aNmQy1jfswsvbPppkjCk"
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key={API_KEY}"

OUTPUT_DIR = Path("/Users/henryads/.openclaw/workspace/att-crm/output/images")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Image prompts from the campaign
PROMPTS = {
    "offer-1a-predictable-cost": """
Professional advertising photography, happy young professional woman in her early 30s working on sleek laptop at modern minimalist home office, genuine confident smile, clean white desk with subtle AT&T blue accent items, large window with warm golden hour natural lighting streaming in, contemporary home interior with neutral tones, organized workspace with indoor plant, subject wearing smart casual business attire, sharp focus on face with shallow depth of field, photorealistic, commercial advertising campaign style, warm color grading with orange and amber tones complemented by AT&T blue (#00A8E0) accent lighting, lifestyle photography, aspirational yet approachable mood
""",
    "offer-1b-future-proof": """
Professional advertising photography, happy modern family of four enjoying technology together in bright contemporary living room, father reading on tablet, kids on laptops, smart TV displaying 4K content visible in background, smart home devices subtly placed, warm afternoon golden hour sunlight streaming through large windows, connected home aesthetic, comfortable sectional sofa, indoor plants, tasteful contemporary decor, photorealistic, lifestyle advertising photography, warm and inviting color palette with amber and cream tones accented by AT&T blue (#00A8E0) on tech devices, authentic family moment
""",
    "offer-1c-work-from-home": """
Professional corporate advertising photography, confident professional man in mid-30s on video conference call, laptop screen showing clear video meeting with colleagues visible, professional home office setup with standing desk, large curved monitor, ring light providing even professional lighting, modern ergonomic chair, indoor plants in background, large window with diffused natural light, wearing smart business casual attire, sharp focus on subject's confident expression, shallow depth of field, photorealistic, business lifestyle photography, clean color grading with neutral tones and AT&T blue (#00A8E0) accent on tech, successful remote worker aesthetic
""",
    "offer-1d-bundle-value": """
Professional advertising photography, young couple smiling while looking at smartphone together in modern kitchen, laptop open showing connected devices in background, AT&T branded smartphone visible, wireless router subtly placed on counter, savings concept visualization, warm morning light through kitchen window, contemporary home interior, casual comfortable clothing, genuine happiness and satisfaction expressions, photorealistic, lifestyle advertising, warm color grading with soft green and cream tones, AT&T blue (#00A8E0) on devices, authentic couple moment
""",
    "offer-2a-no-buffering": """
Cinematic advertising photography, family movie night in modern living room, large 85-inch 4K TV displaying vibrant crisp movie content, family of three on comfortable sectional couch with popcorn bowls, cozy blankets, genuine expressions of enjoyment and relaxation, warm ambient lighting with subtle bias lighting behind TV, no buffering symbols or loading screens, seamless streaming concept, contemporary home theater setup with soundbar visible, photorealistic, lifestyle advertising, warm color grading with deep blacks and vibrant movie colors, cinematic atmosphere, immersive entertainment experience
""",
    "offer-2b-gaming": """
Dynamic advertising photography, young gamer in their 20s with intense focus at professional gaming setup, RGB keyboard and mouse with colorful lighting, multiple monitors showing smooth high-frame-rate gameplay, gaming headset with microphone, ergonomic racing-style gaming chair, mechanical keyboard with tactile switches, modern gaming room with LED strip lighting in purple and blue tones, low ping concept visualization, competitive gaming atmosphere, photorealistic, gaming lifestyle photography, vibrant RGB color palette with purple, blue, and AT&T blue (#00A8E0) accents, dramatic lighting with RGB glow
""",
    "offer-2c-content-creator": """
Professional advertising photography, young content creator in modern studio apartment, DSLR camera on desk next to laptop showing video editing software with upload progress bar at 100%, ring light providing even professional lighting, professional microphone on boom arm, shelves with camera gear and equipment in background, fast upload speed visualization with digital light trails streaming from laptop, YouTube creator aesthetic, photorealistic, creator economy lifestyle photography, clean color grading with neutral tones and AT&T blue (#00A8E0) on screen elements, successful content creator environment
""",
    "offer-2d-power-family": """
Professional advertising photography, busy family of five in spacious open-concept living room, each family member engaged with different devices simultaneously - father on laptop working, mother streaming on tablet, teenager gaming on console, two kids on phones, 4K TV displaying content in background, multiple device connectivity concept, contemporary suburban home interior, warm evening lighting, comfortable modern furniture, organized chaos of family life, photorealistic, family lifestyle advertising, warm color grading with soft amber and blue tones, AT&T blue (#00A8E0) on device screens, authentic family moment
""",
    "offer-3a-no-contract": """
Lifestyle advertising photography, happy young couple in their late 20s relaxing on comfortable modern couch in bright living room, each casually using tablet and smartphone, genuine laughter and relaxed body language, no stress or worry expressions, open concept living room with large windows, contemporary furniture in neutral tones, warm afternoon light streaming in, freedom and flexibility concept with open space and uncluttered environment, casual comfortable clothing, photorealistic, lifestyle advertising, warm and inviting color palette with soft creams and sage green, AT&T blue (#00A8E0) subtle accents, authentic couple enjoying stress-free moment
""",
    "offer-3b-zoom-calls": """
Corporate advertising photography, professional woman in her 40s on crystal-clear video call, laptop screen showing professional video conference with colleagues in high definition, confident expression and professional posture, modern minimalist home office, professional attire with blazer, clean background with subtle indoor plants, ring light providing even professional lighting, crisp video quality concept with sharp focus and clarity, photorealistic, business professional photography, neutral color grading with professional blue-gray tones, AT&T blue (#00A8E0) on laptop screen elements, executive presence, reliable connection implied
""",
    "offer-3c-everyday-value": """
Authentic lifestyle advertising photography, middle-class family of four in living room during evening routine, father watching TV news, mother browsing on tablet, teenager doing homework on laptop, younger child on phone, everyone content and engaged, comfortable suburban home setting, warm interior lighting, value and affordability concept with comfortable but not luxury setting, authentic family time, photorealistic, authentic family lifestyle photography, warm color grading with soft amber and cream tones, AT&T blue (#00A8E0) subtle on screens, relatable family scene
""",
    "offer-3d-budget-hero": """
Bright advertising photography, excited young professional in their late 20s celebrating with smartphone showing savings app or low bill, fist pump gesture of victory, bright modern apartment living room, natural daylight, savings concept with subtle coin or piggy bank elements, affordable luxury concept, genuine excitement and relief expression, casual smart clothing, photorealistic, lifestyle advertising, bright and optimistic color palette with yellow and white tones, AT&T blue (#00A8E0) on phone screen, bright natural lighting, budget-conscious success story
""",
    "offer-4a-risk-free": """
Bright advertising photography, excited young couple unboxing new AT&T fiber internet equipment, opening modem/router box with genuine smiles and anticipation, living room setting with modern decor, free trial concept with bright optimistic lighting, new beginning concept, AT&T branded packaging visible, unboxing experience with protective packaging and cables, bright morning light from window, fresh start aesthetic, photorealistic, product advertising photography, bright and optimistic color grading with whites and light blues, AT&T blue (#00A8E0) on packaging, excitement of trying new service
""",
    "offer-4b-switch-save": """
Conceptual advertising photography, person happily unplugging and discarding old slow modem/router into trash bin, setting up sleek new AT&T fiber equipment with satisfaction expression, modern home setting, upgrade concept visualization with old vs new comparison, relief and improvement concept, out with old slow technology in with new fast fiber, dramatic lighting highlighting the upgrade moment, photorealistic, conceptual lifestyle photography, dynamic composition with action, transformation moment
""",
    "offer-4c-test-drive": """
Creative advertising photography, speed test concept visualization, fiber optic light trails forming speedometer or racing track design, modern home interior with person excitedly watching speed test results on smartphone showing gigabit speeds, test drive concept with automotive racing visual metaphors, fast internet visualization with blue and white light streaks, excited expression of amazement at speed, photorealistic, creative concept photography, blue and orange light trails, speed motion blur effects, dynamic speed visualization
""",
    "offer-4d-no-risk": """
Professional advertising photography, confident smiling person making decisive choice gesture, thumbs up or confident nod, modern living room with AT&T fiber equipment visible in background, nothing to lose concept with open arms or confident posture, assurance and confidence expression, bright optimistic lighting, risk-free decision visualization, photorealistic, lifestyle advertising, bright and confident color palette with blues and whites, AT&T blue (#00A8E0) prominent, bright studio-quality lighting, confident consumer moment
"""
}

def generate_image(prompt_key, prompt_text):
    """Generate image using Nano Banana Pro API"""
    headers = {
        "Content-Type": "application/json"
    }
    
    payload = {
        "contents": [{
            "parts": [{
                "text": prompt_text.strip()
            }]
        }],
        "generationConfig": {
            "responseModalities": ["Text", "Image"],
            "temperature": 0.7,
            "maxOutputTokens": 2048
        }
    }
    
    try:
        print(f"Generating {prompt_key}...")
        response = requests.post(API_URL, headers=headers, json=payload, timeout=120)
        response.raise_for_status()
        
        data = response.json()
        
        # Extract image from response
        if "candidates" in data and len(data["candidates"]) > 0:
            candidate = data["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"]:
                for part in candidate["content"]["parts"]:
                    if "inlineData" in part:
                        image_data = part["inlineData"]["data"]
                        mime_type = part["inlineData"].get("mimeType", "image/png")
                        
                        # Save image
                        ext = "png" if "png" in mime_type else "jpg"
                        output_file = OUTPUT_DIR / f"{prompt_key}.{ext}"
                        
                        with open(output_file, "wb") as f:
                            f.write(base64.b64decode(image_data))
                        
                        print(f"✓ Saved: {output_file}")
                        return str(output_file)
        
        print(f"✗ No image found in response for {prompt_key}")
        return None
        
    except Exception as e:
        print(f"✗ Error generating {prompt_key}: {e}")
        return None

def main():
    """Generate all 16 images"""
    print("=" * 60)
    print("NANO BANANA PRO - AT&T FIBER AD GENERATION")
    print("=" * 60)
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Total prompts: {len(PROMPTS)}")
    print("=" * 60)
    
    generated = []
    failed = []
    
    for i, (key, prompt) in enumerate(PROMPTS.items(), 1):
        print(f"\n[{i}/{len(PROMPTS)}] Processing: {key}")
        result = generate_image(key, prompt)
        if result:
            generated.append(key)
        else:
            failed.append(key)
    
    print("\n" + "=" * 60)
    print("GENERATION COMPLETE")
    print("=" * 60)
    print(f"Generated: {len(generated)}/{len(PROMPTS)}")
    print(f"Failed: {len(failed)}")
    
    if failed:
        print(f"\nFailed items: {', '.join(failed)}")
    
    print(f"\nImages saved to: {OUTPUT_DIR}")
    return generated, failed

if __name__ == "__main__":
    main()
