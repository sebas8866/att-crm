#!/bin/bash
# Nano Banana Pro Image Generation Script
# Uses curl to call Gemini API for image generation

API_KEY="AIzaSyDztwrP_UGHY--aNmQy1jfswsvbPppkjCk"
API_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${API_KEY}"
OUTPUT_DIR="/Users/henryads/.openclaw/workspace/att-crm/output/images"

mkdir -p "$OUTPUT_DIR"

echo "=========================================="
echo "NANO BANANA PRO IMAGE GENERATION"
echo "=========================================="
echo "Output: $OUTPUT_DIR"
echo ""

# Function to generate image
generate_image() {
    local key=$1
    local prompt=$2
    local output_file="$OUTPUT_DIR/${key}.png"
    
    echo "Generating: $key..."
    
    # Create JSON payload
    json_payload=$(cat <<EOF
{
  "contents": [{
    "parts": [{
      "text": "$prompt"
    }]
  }],
  "generationConfig": {
    "responseModalities": ["Text", "Image"],
    "temperature": 0.7,
    "maxOutputTokens": 2048
  }
}
EOF
)
    
    # Make API call
    response=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "$json_payload" \
        -m 120)
    
    # Check if response contains image data
    if echo "$response" | grep -q "inlineData"; then
        # Extract base64 image data
        image_data=$(echo "$response" | grep -o '"data": "[^"]*"' | head -1 | sed 's/"data": "//;s/"$//')
        
        if [ -n "$image_data" ]; then
            # Decode and save
            echo "$image_data" | base64 -d > "$output_file"
            echo "✓ Saved: $output_file"
            return 0
        fi
    fi
    
    echo "✗ Failed: $key"
    echo "Response: $response" | head -100
    return 1
}

# Generate images for each prompt
echo "[1/16] Offer 1A - Predictable Cost..."
generate_image "offer-1a-predictable-cost" "Professional advertising photography, happy young professional woman in her early 30s working on sleek laptop at modern minimalist home office, genuine confident smile, warm golden hour natural lighting, AT&T blue accent items, photorealistic, 8K, commercial advertising style"

echo "[2/16] Offer 1B - Future-Proof..."
generate_image "offer-1b-future-proof" "Professional advertising photography, happy modern family of four enjoying technology together in bright contemporary living room, smart TV, tablets, laptops, connected home aesthetic, warm afternoon sunlight, AT&T blue on devices, photorealistic, 8K"

echo "[3/16] Offer 1C - Work From Home..."
generate_image "offer-1c-work-from-home" "Professional corporate advertising photography, confident professional man on video conference call, laptop showing clear video meeting, modern home office with standing desk, ring light, professional attire, AT&T blue accents, photorealistic, 8K"

echo "[4/16] Offer 1D - Bundle Value..."
generate_image "offer-1d-bundle-value" "Professional advertising photography, young couple smiling looking at smartphone together in modern kitchen, laptop in background, AT&T branded phone visible, warm morning light, savings concept, photorealistic, 8K"

echo "[5/16] Offer 2A - No Buffering..."
generate_image "offer-2a-no-buffering" "Cinematic advertising photography, family movie night in modern living room, large 4K TV displaying vibrant movie content, family on couch with popcorn, cozy atmosphere, seamless streaming, home theater setup, photorealistic, 8K"

echo "[6/16] Offer 2B - Gaming..."
generate_image "offer-2b-gaming" "Dynamic advertising photography, young gamer at professional RGB gaming setup, multiple monitors showing smooth gameplay, gaming headset, LED strip lighting in purple and blue, competitive gaming atmosphere, photorealistic, 8K"

echo "[7/16] Offer 2C - Content Creator..."
generate_image "offer-2c-content-creator" "Professional advertising photography, young content creator in modern studio, DSLR camera, laptop showing video editing with upload progress, ring light, microphone, fast upload visualization, photorealistic, 8K"

echo "[8/16] Offer 2D - Power Family..."
generate_image "offer-2d-power-family" "Professional advertising photography, busy family of five in open-concept living room, each with different devices - laptop, tablet, phones, 4K TV, multiple connectivity, warm evening lighting, photorealistic, 8K"

echo "[9/16] Offer 3A - No Contract..."
generate_image "offer-3a-no-contract" "Lifestyle advertising photography, happy young couple relaxing on modern couch in bright living room, using tablet and smartphone, relaxed body language, freedom concept, warm afternoon light, photorealistic, 8K"

echo "[10/16] Offer 3B - Zoom Calls..."
generate_image "offer-3b-zoom-calls" "Corporate advertising photography, professional woman on crystal-clear video call, laptop showing HD video conference, modern minimalist home office, blazer, ring light, crisp video quality, photorealistic, 8K"

echo "[11/16] Offer 3C - Everyday Value..."
generate_image "offer-3c-everyday-value" "Authentic lifestyle advertising photography, middle-class family of four in living room evening routine, father on TV, mother on tablet, teen on laptop, child on phone, warm interior lighting, photorealistic, 8K"

echo "[12/16] Offer 3D - Budget Hero..."
generate_image "offer-3d-budget-hero" "Bright advertising photography, excited young professional celebrating with smartphone showing savings, fist pump gesture, bright modern apartment, daylight, budget success story, photorealistic, 8K"

echo "[13/16] Offer 4A - Risk-Free..."
generate_image "offer-4a-risk-free" "Bright advertising photography, excited young couple unboxing AT&T fiber internet equipment, opening modem box with smiles, modern living room, free trial concept, bright morning light, photorealistic, 8K"

echo "[14/16] Offer 4B - Switch & Save..."
generate_image "offer-4b-switch-save" "Conceptual advertising photography, person happily discarding old modem into trash, setting up new AT&T fiber equipment, upgrade concept, modern home, transformation moment, photorealistic, 8K"

echo "[15/16] Offer 4C - Test Drive..."
generate_image "offer-4c-test-drive" "Creative advertising photography, speed test concept with fiber optic light trails forming speedometer, person excited watching speed test on phone showing gigabit speeds, fast internet visualization, photorealistic, 8K"

echo "[16/16] Offer 4D - No Risk..."
generate_image "offer-4d-no-risk" "Professional advertising photography, confident smiling person making thumbs up gesture, modern living room with AT&T equipment, assurance and confidence, bright optimistic lighting, photorealistic, 8K"

echo ""
echo "=========================================="
echo "GENERATION COMPLETE"
echo "=========================================="
echo "Images saved to: $OUTPUT_DIR"
ls -la "$OUTPUT_DIR"
