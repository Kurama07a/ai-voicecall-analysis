# AI Voice Call Analyzer

A Next.js application that analyzes call recordings using AI to provide detailed performance feedback and scores.

## Features

- 🎵 **Audio Upload**: Drag-and-drop or click to upload .mp3 or .wav files
- 🎧 **Audio Player**: Play/pause audio recordings before processing
- 🤖 **AI-Powered Analysis**: Uses Groq's Whisper for transcription and Llama for analysis
- 📊 **Detailed Scoring**: 11 evaluation parameters including PASS/FAIL and scored criteria
- 📝 **Comprehensive Feedback**: Overall feedback and detailed observations
- 📄 **Full Transcript**: View the complete transcription of the call

## Evaluation Parameters

The system evaluates calls based on the following criteria:

### Scored Parameters (0 to max points):
- **Greeting** (5 points): Warm and professional greeting
- **Collection Urgency** (12 points): Conveys urgency and consequences
- **Active Listening** (8 points): Demonstrates understanding
- **Empathy** (8 points): Shows compassion for customer situation
- **Payment Options** (10 points): Clearly explains payment terms
- **Objection Handling** (12 points): Addresses concerns effectively
- **Call Control** (8 points): Maintains conversation control
- **Professional Closing** (5 points): Closes with clear next steps

### Pass/Fail Parameters (0 or full points):
- **Customer Verification** (10 points): Verifies identity before discussing details
- **Compliance Disclosure** (15 points): Provides required legal disclosures
- **Commitment Secured** (10 points): Obtains payment commitment

**Total Possible Score: 103 points**

## Setup Instructions

### 1. Get Your Free Groq API Key

1. Go to [Groq Console](https://console.groq.com/keys)
2. Sign up for a free account (requires GitHub or Google login)
3. Create a new API key
4. Copy the API key

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Install Dependencies (if not already done)

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. **Upload Audio**: Drag and drop a call recording (.mp3 or .wav) or click to browse
2. **Preview**: Use the Play/Pause button to listen to the recording
3. **Process**: Click "Process Recording" to start the AI analysis
4. **Review Results**: 
   - View overall performance score
   - Check detailed scores for each parameter
   - Read the AI-generated feedback and observations
   - Review the full transcript

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **AI Services**: 
  - Groq Whisper Large v3 Turbo (Audio Transcription)
  - Groq Llama 3.3 70B (Call Analysis)
- **Icons**: Lucide React

## API Routes

### POST `/api/analyze-call`

Analyzes an uploaded audio file and returns evaluation scores.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Audio file (mp3 or wav)

**Response:**
```json
{
  "scores": {
    "greeting": 5,
    "collectionUrgency": 10,
    "customerVerification": 10,
    "activeListening": 7,
    "empathy": 6,
    "paymentOptions": 8,
    "objectionHandling": 10,
    "complianceDisclosure": 0,
    "callControl": 7,
    "commitmentSecured": 10,
    "professionalClosing": 4
  },
  "overallFeedback": "The agent demonstrated strong collection urgency...",
  "observation": "Detailed observations about the call performance...",
  "transcript": "Full transcription of the call..."
}
```

## Project Structure

```
ai-voice/
├── app/
│   ├── api/
│   │   └── analyze-call/
│   │       └── route.ts          # Main API endpoint
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main application page
├── components/
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── evaluation-params.ts       # Scoring parameters and types
│   └── utils.ts                   # Utility functions
├── .env.local.example             # Environment variables template
└── package.json
```

## Notes

- The Groq API offers generous free tier limits (14,400 requests/day for Whisper)
- Whisper-large-v3-turbo is used for fast and accurate transcription
- Llama-3.3-70b-versatile is used for intelligent call analysis
- All scoring follows strict PASS/FAIL or scaled scoring rules
- PASS/FAIL parameters score either 0 or the full weight value
- SCORE parameters can score anywhere from 0 to the weight value

## Troubleshooting

- **"GROQ_API_KEY not configured" error**: Make sure you've created a `.env.local` file and added your API key
- **Audio file not uploading**: Check that the file is in .mp3 or .wav format
- **Transcription fails**: Ensure the audio quality is clear and the file size is reasonable (< 25MB recommended)
