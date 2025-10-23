import { NextRequest, NextResponse } from 'next/server';

interface EvaluationScores {
  clarity: number;
  professionalism: number;
  problemSolving: number;
  customerSatisfaction: number;
  communicationSkills: number;
}

interface ProcessingResult {
  scores: EvaluationScores;
  overallFeedback: string;
  observation: string;
}

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
    const allowedTypes = ['audio/mpeg', 'audio/wav'];
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload .mp3 or .wav file' },
        { status: 400 }
      );
    }

    // Simulate audio processing with a delay
    // In a real application, you would:
    // 1. Convert audio to appropriate format
    // 2. Send to speech-to-text service
    // 3. Analyze the transcript with AI/ML models
    // 4. Generate scores and feedback
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock evaluation scores (random scores for demo)
    const scores: EvaluationScores = {
      clarity: Math.floor(Math.random() * 20) + 75, // 75-95
      professionalism: Math.floor(Math.random() * 20) + 75,
      problemSolving: Math.floor(Math.random() * 20) + 70,
      customerSatisfaction: Math.floor(Math.random() * 20) + 70,
      communicationSkills: Math.floor(Math.random() * 20) + 75,
    };

    // Calculate average score
    const avgScore = Math.round(
      Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
    );

    // Generate feedback based on average score
    let overallFeedback = '';
    if (avgScore >= 85) {
      overallFeedback = 'Excellent performance! The agent demonstrated outstanding communication skills, maintained high professionalism throughout the call, and effectively resolved customer concerns. The clarity of speech and problem-solving approach were exemplary.';
    } else if (avgScore >= 75) {
      overallFeedback = 'Good performance overall. The agent showed strong communication skills and professionalism. There are minor areas for improvement in problem-solving approach and customer engagement. With some refinement, this could be an excellent call.';
    } else {
      overallFeedback = 'Satisfactory performance with room for improvement. The agent handled the call adequately but could benefit from enhanced communication techniques, clearer problem-solving strategies, and improved customer engagement practices.';
    }

    // Generate specific observations
    const observations = [
      `Call duration analysis: The call was handled efficiently with appropriate pacing.`,
      `Tone and demeanor: ${scores.professionalism >= 80 ? 'Professional and courteous throughout' : 'Could benefit from more consistent professional tone'}.`,
      `Problem resolution: ${scores.problemSolving >= 75 ? 'Issues were addressed systematically' : 'Consider a more structured approach to problem-solving'}.`,
      `Customer engagement: ${scores.customerSatisfaction >= 75 ? 'Good rapport established with the customer' : 'More active listening and empathy recommended'}.`,
      `Communication clarity: ${scores.clarity >= 80 ? 'Messages conveyed clearly and concisely' : 'Consider simplifying technical explanations'}.`,
    ];

    const result: ProcessingResult = {
      scores,
      overallFeedback,
      observation: observations.join('\n\n'),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing audio:', error);
    return NextResponse.json(
      { error: 'Failed to process audio file' },
      { status: 500 }
    );
  }
}
