# 🔑 API Key Setup Instructions

## Quick Start

1. **Get Your Free Groq API Key**
   - Visit: https://console.groq.com/keys
   - Sign in with GitHub or Google
   - Click "Create API Key"
   - Give it a name (e.g., "AI Voice Analyzer")
   - Copy the generated key (it starts with `gsk_`)

2. **Add to Your Project**
   ```bash
   # Run the setup script
   ./setup.sh
   
   # Or manually create .env.local
   cp .env.local.example .env.local
   ```

3. **Edit .env.local**
   ```env
   GROQ_API_KEY=gsk_your_actual_api_key_here
   ```

4. **Restart the Development Server**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

## Why Groq?

- ✅ **100% Free**: Generous free tier with no credit card required
- ⚡ **Super Fast**: Fastest inference speed for Whisper and Llama
- 🎯 **High Accuracy**: Uses Whisper Large v3 Turbo for transcription
- 🧠 **Smart Analysis**: Llama 3.3 70B for intelligent call evaluation
- 📊 **Free Tier Limits**:
  - Whisper: 14,400 requests/day
  - Llama 3.3 70B: 14,400 requests/day
  - More than enough for development and testing!

## Testing the API

Once you've added your API key:

1. Upload a sample audio file (.mp3 or .wav)
2. Click "Process Recording"
3. Wait for transcription and analysis (usually 5-15 seconds)
4. View the detailed results!

## Troubleshooting

**Error: "GROQ_API_KEY not configured"**
- Make sure you created `.env.local` in the root directory
- Check that you pasted the full API key (starts with `gsk_`)
- Restart the dev server after adding the key

**Error: "Failed to process audio"**
- Check your internet connection
- Verify the audio file is .mp3 or .wav format
- Ensure the file isn't corrupted or too large (< 25MB recommended)
- Check the browser console for detailed error messages

**Transcription is empty**
- Make sure the audio file contains clear speech
- Check that the audio isn't muted or silent
- Try a different audio file

## Sample Test Files

You can test with any call recording, or record a sample conversation. The system works best with:
- Clear audio quality
- English language (Whisper supports 99+ languages though!)
- Call duration: 30 seconds to 10 minutes
- File size: < 25MB

## Need Help?

- Check the main README.md for full documentation
- Review the evaluation parameters in `lib/evaluation-params.ts`
- Look at the API implementation in `app/api/analyze-call/route.ts`
