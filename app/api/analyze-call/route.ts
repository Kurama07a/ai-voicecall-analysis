import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { 
  EVALUATION_PARAMETERS, 
  INPUT_TYPES, 
  AnalysisResult, 
  CallScores 
} from '@/lib/evaluation-params';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
    const fileExtension = audioFile.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(audioFile.type) && !['mp3', 'wav'].includes(fileExtension || '')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload .mp3 or .wav file' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not configured. Please add it to your .env.local file' },
        { status: 500 }
      );
    }

    console.log('Starting transcription...');
    
    // Step 1: Transcribe audio using Groq Whisper
    const transcript = await transcribeAudio(audioFile);
    
    console.log('Transcription complete. Starting analysis...');
    
    // Step 2: Analyze transcript using Groq Llama
    const analysis = await analyzeTranscript(transcript);
    
    console.log('Analysis complete.');

    const result: AnalysisResult = {
      ...analysis,
      transcript
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error processing audio:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process audio file', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

async function transcribeAudio(audioFile: File): Promise<string> {
  try {
    // Convert File to Buffer for Groq API
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create a File-like object that Groq SDK expects
    const file = new File([buffer], audioFile.name, { type: audioFile.type });

    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: 'whisper-large-v3-turbo', // Free tier model
      response_format: 'json',
      language: 'en',
      temperature: 0.0,
    });

    return transcription.text || '';
  } catch (error: any) {
    console.error('Transcription error:', error);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

async function analyzeTranscript(transcript: string): Promise<Omit<AnalysisResult, 'transcript'>> {
  // Build evaluation criteria for the AI
  const criteriaText = EVALUATION_PARAMETERS.map(param => {
    const scoreType = param.type === INPUT_TYPES.PASS_FAIL 
      ? `PASS/FAIL (0 or ${param.weight} points)` 
      : `SCORE (0 to ${param.weight} points)`;
    return `- ${param.name} (${param.key}): ${param.description} [${scoreType}]`;
  }).join('\n');

  const prompt = `You are an expert call quality analyst for a debt collection agency. Analyze the following call transcript and evaluate the agent's performance.

CALL TRANSCRIPT:
${transcript}

EVALUATION CRITERIA:
${criteriaText}

IMPORTANT SCORING RULES:
1. For PASS/FAIL parameters: Score must be either 0 (failed) or the full weight value (passed)
2. For SCORE parameters: Score can be any number from 0 to the weight value
3. Be strict but fair in your evaluation
4. Base scores only on what you can verify from the transcript

Please provide your analysis in the following JSON format:
{
  "scores": {
    "greeting": <number>,
    "collectionUrgency": <number>,
    "customerVerification": <number>,
    "activeListening": <number>,
    "empathy": <number>,
    "paymentOptions": <number>,
    "objectionHandling": <number>,
    "complianceDisclosure": <number>,
    "callControl": <number>,
    "commitmentSecured": <number>,
    "professionalClosing": <number>
  },
  "overallFeedback": "<2-3 sentences summarizing the agent's overall performance>",
  "observation": "<detailed observations about what the agent did well and areas for improvement, including specific examples from the call>"
}

Respond ONLY with valid JSON, no additional text.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a professional call quality analyst. Respond only with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile', // Free tier model
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const analysis = JSON.parse(responseText);

    // Validate and sanitize scores
    const sanitizedScores: CallScores = {};
    EVALUATION_PARAMETERS.forEach(param => {
      const score = analysis.scores?.[param.key] || 0;
      
      if (param.type === INPUT_TYPES.PASS_FAIL) {
        // For PASS/FAIL: must be 0 or full weight
        sanitizedScores[param.key] = score >= param.weight / 2 ? param.weight : 0;
      } else {
        // For SCORE: clamp between 0 and weight
        sanitizedScores[param.key] = Math.min(Math.max(0, score), param.weight);
      }
    });

    return {
      scores: sanitizedScores,
      overallFeedback: analysis.overallFeedback || 'Analysis complete.',
      observation: analysis.observation || 'No specific observations.'
    };
  } catch (error: any) {
    console.error('Analysis error:', error);
    throw new Error(`Analysis failed: ${error.message}`);
  }
}

// Configure API route
export const config = {
  api: {
    bodyParser: false,
  },
};
