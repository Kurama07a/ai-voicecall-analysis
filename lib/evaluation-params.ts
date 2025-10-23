export enum INPUT_TYPES {
  PASS_FAIL = 'PASS_FAIL',
  SCORE = 'SCORE'
}

export interface EvaluationParameter {
  name: string;
  key: string;
  type: INPUT_TYPES;
  weight: number;
  description: string;
}

export const EVALUATION_PARAMETERS: EvaluationParameter[] = [
  {
    name: 'Greeting',
    key: 'greeting',
    type: INPUT_TYPES.SCORE,
    weight: 5,
    description: 'Agent greets the customer warmly and professionally'
  },
  {
    name: 'Collection Urgency',
    key: 'collectionUrgency',
    type: INPUT_TYPES.SCORE,
    weight: 12,
    description: 'Agent conveys urgency to pay and potential consequences'
  },
  {
    name: 'Customer Verification',
    key: 'customerVerification',
    type: INPUT_TYPES.PASS_FAIL,
    weight: 10,
    description: 'Agent verifies customer identity before discussing account details'
  },
  {
    name: 'Active Listening',
    key: 'activeListening',
    type: INPUT_TYPES.SCORE,
    weight: 8,
    description: 'Agent demonstrates understanding of customer concerns and responds appropriately'
  },
  {
    name: 'Empathy',
    key: 'empathy',
    type: INPUT_TYPES.SCORE,
    weight: 8,
    description: 'Agent shows understanding and compassion for customer situation'
  },
  {
    name: 'Payment Options Explained',
    key: 'paymentOptions',
    type: INPUT_TYPES.SCORE,
    weight: 10,
    description: 'Agent clearly explains available payment options and terms'
  },
  {
    name: 'Objection Handling',
    key: 'objectionHandling',
    type: INPUT_TYPES.SCORE,
    weight: 12,
    description: 'Agent effectively addresses customer objections and concerns'
  },
  {
    name: 'Compliance Disclosure',
    key: 'complianceDisclosure',
    type: INPUT_TYPES.PASS_FAIL,
    weight: 15,
    description: 'Agent provides required legal disclosures (e.g., call recording notice, debt collection notice)'
  },
  {
    name: 'Call Control',
    key: 'callControl',
    type: INPUT_TYPES.SCORE,
    weight: 8,
    description: 'Agent maintains control of conversation and guides toward resolution'
  },
  {
    name: 'Commitment Secured',
    key: 'commitmentSecured',
    type: INPUT_TYPES.PASS_FAIL,
    weight: 10,
    description: 'Agent obtains a clear payment commitment from customer'
  },
  {
    name: 'Professional Closing',
    key: 'professionalClosing',
    type: INPUT_TYPES.SCORE,
    weight: 5,
    description: 'Agent closes call professionally with clear next steps'
  }
];

export interface CallScores {
  [key: string]: number;
}

export interface AnalysisResult {
  scores: CallScores;
  overallFeedback: string;
  observation: string;
  transcript?: string;
}

export function calculateTotalScore(scores: CallScores): number {
  return Object.values(scores).reduce((sum, score) => sum + score, 0);
}

export function calculateMaxScore(): number {
  return EVALUATION_PARAMETERS.reduce((sum, param) => sum + param.weight, 0);
}

export function getScorePercentage(scores: CallScores): number {
  const total = calculateTotalScore(scores);
  const max = calculateMaxScore();
  return Math.round((total / max) * 100);
}
