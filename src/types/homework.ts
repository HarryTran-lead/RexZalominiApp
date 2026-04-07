export enum SubmissionType {
  FILE = 'File',
  IMAGE = 'Image',
  TEXT = 'Text',
  LINK = 'Link',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE'
}

export enum HomeworkStatus {
  ASSIGNED = 'Assigned', // 0
  SUBMITTED = 'Submitted', // 1
  GRADED = 'Graded', // 2
  LATE = 'Late', // 3
  MISSING = 'Missing' // 4
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages?: number;
  };
  message?: string;
}

export enum HomeworkQuestionType {
  MULTIPLE_CHOICE = 'MultipleChoice',
  TEXT_INPUT = 'TextInput'
}

export interface WordFeedback {
  word: string;
  heardAs: string;
  issue: string;
  tip: string;
}


export interface CreateHomeworkRequest {
  classId: string;
  sessionId?: string;
  title: string;
  description?: string;
  dueAt?: string; // ISO string
  book?: string;
  pages?: string;
  skills?: string;
  submissionType: SubmissionType;
  maxScore?: number;
  rewardStars?: number;
  timeLimitMinutes?: number;
  allowResubmit?: boolean;
  missionId?: string;
  instructions?: string;
  expectedAnswer?: string;
  rubric?: string;
  attachment?: string;
}

export interface MultipleChoiceQuestionRequest {
  questionText: string;
  questionType: HomeworkQuestionType;
  options?: string[]; // Bắt buộc nếu type = MultipleChoice
  correctAnswer: string;
  points: number;
  explanation?: string;
}

export interface CreateMultipleChoiceHomeworkRequest extends Omit<CreateHomeworkRequest, 'submissionType' | 'expectedAnswer' | 'rubric' | 'attachment'> {
  questions: MultipleChoiceQuestionRequest[];
}

export interface UpdateHomeworkRequest extends Partial<CreateHomeworkRequest> {}


export interface HomeworkAssignmentListItem {
  id: string;
  classId: string;
  classCode?: string;
  classTitle: string;
  title: string;
  description?: string;
  sessionId?: string;
  sessionName?: string;
  dueAt?: string;
  submissionType: SubmissionType;
  maxScore?: number;
  rewardStars?: number;
  createdAt: string;
  submissionCount: number;
  gradedCount: number;
}

export interface HomeworkAssignmentDetail extends HomeworkAssignmentListItem {
  sessionId?: string;
  sessionName?: string;
  book?: string;
  pages?: string;
  skills?: string;
  missionId?: string;
  instructions?: string;
  expectedAnswer?: string;
  rubric?: string;
  attachmentUrl?: string;
  createdBy?: string;
  questions: any[]; // Hoặc define Interface riêng cho Question lúc Get
  averageScore?: number;
  students?: HomeworkStudentProgressItem[];
}

export interface HomeworkStudentProgressItem {
  id: string;
  studentProfileId: string;
  studentName: string;
  status: HomeworkStatus | string;
  submittedAt?: string | null;
  gradedAt?: string | null;
  score?: number | null;
  teacherFeedback?: string | null;
}

export interface HomeworkSubmissionListItem {
  id: string; // ID của bản ghi HomeworkStudent
  homeworkId: string;
  homeworkTitle: string;
  studentProfileId: string;
  studentName: string;
  classId: string;
  classTitle: string;
  status: HomeworkStatus;
  submittedAt?: string;
  gradedAt?: string;
  score?: number;
  teacherFeedback?: string;
}

export interface HomeworkSubmissionDetailTeacher extends HomeworkSubmissionListItem {
  studentEmail?: string;
  maxScore?: number;
  aiFeedback?: string;
  textAnswer?: string;
  attachmentUrls?: string[];
  linkUrl?: string;
  dueAt?: string;
  isLate: boolean;
}

export interface GradeHomeworkRequest {
  score: number;
  teacherFeedback?: string;
}

export interface MarkHomeworkStatusRequest {
  status: HomeworkStatus.LATE | HomeworkStatus.MISSING;
}

export interface AIQuickGradeResponse {
  id: string;
  assignmentId: string;
  isSpeakingAnalysis: boolean;
  aiUsed: boolean;
  persisted: boolean;
  status: HomeworkStatus;
  score: number;
  rawAiScore: number;
  rawAiMaxScore: number;
  summary: string;
  strengths: string[];
  issues: string[];
  suggestions: string[];
  stars: number;
  pronunciationScore?: number;
  fluencyScore?: number;
  accuracyScore?: number;
  mispronouncedWords?: string[];
  wordFeedback?: WordFeedback[];
  practicePlan?: string[];
  warnings?: string[];
  gradedAt: string;
}

// ==========================================
// 3.1 STUDENT HOMEWORK VIEWS (GET)
// ==========================================
export interface MyHomeworkListItem {
  id: string; // HomeworkStudentId
  assignmentId: string; // AssignmentId
  assignmentTitle: string;
  classId: string;
  classCode?: string;
  classTitle?: string;
  description?: string;
  sessionId?: string;
  sessionName?: string;
  status: HomeworkStatus;
  dueAt?: string;
  submissionType: SubmissionType;
  maxScore?: number;
  score?: number;
  teacherFeedback?: string;
  submittedAt?: string;
  gradedAt?: string;
  rewardStars?: number;
  instructions?: string;
  attachmentUrl?: string;
  isOverdue?: boolean;
  isLate: boolean;
}

export interface MySubmittedHomeworkListItem {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  classTitle: string;
  status: HomeworkStatus;
  dueAt?: string;
  submittedAt?: string;
  gradedAt?: string;
  score?: number;
  maxScore?: number;
  teacherFeedback?: string;
}

// Chi tiết 1 bài tập (Dành cho Form nộp bài hoặc Xem kết quả)
export interface MyHomeworkSubmissionDetail {
  id: string;
  homeworkStudentId: string;
  assignmentId: string;
  assignmentTitle: string;
  classTitle: string;
  status: HomeworkStatus;
  dueAt?: string;
  submissionType: SubmissionType;
  aiHintEnabled: boolean;
  aiRecommendEnabled: boolean;
  speakingMode?: string;
  targetWords?: string[];
  speakingExpectedText?: string;
  timeLimitMinutes?: number;
  allowResubmit: boolean;
  startedAt?: string;
  submittedAt?: string;
  gradedAt?: string;
  score?: number;
  maxScore?: number;
  teacherFeedback?: string;
  aiFeedback?: string;
  textAnswer?: string;
  attachmentUrls?: string[] | string | null;
  linkUrl?: string;
  description?: string;
  submission?: {
    textAnswer?: string | null;
    attachmentUrls?: string[] | string | null;
    links?: string[] | null;
    submittedAt?: string | null;
  };
  
  // Dành riêng cho Multiple Choice
  questions?: StudentMultipleChoiceQuestion[];
  review?: {
    answerResults: AnswerResult[];
  };
  showReview?: boolean;
  showCorrectAnswer?: boolean;
  showExplanation?: boolean;
  isLate: boolean;
  rewardStars?: number;
}

// ==========================================
// 3.2 STUDENT SUBMISSION PAYLOADS (POST)
// ==========================================
export interface SubmitHomeworkRequest {
  homeworkStudentId: string;
  textAnswer?: string;
  attachmentUrls?: string[];
  linkUrl?: string;
  links?: string[];
}

export interface GradeHomeworkPayload {
  score: number;
  teacherFeedback?: string;
}

export interface StudentAnswerPayload {
  questionId: string;
  selectedOptionId?: string | null;
}

export interface SubmitMultipleChoiceRequest {
  homeworkStudentId: string;
  answers: StudentAnswerPayload[];
}

// Response đặc thù khi nộp trắc nghiệm (Tự động chấm)
export interface SubmitMultipleChoiceResponse {
  id: string;
  assignmentId: string;
  status: HomeworkStatus;
  submittedAt: string;
  gradedAt: string;
  score: number;
  maxScore: number;
  rewardStars: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  totalCount: number;
  totalPoints: number;
  earnedPoints: number;
  answerResults: AnswerResult[];
}

// ==========================================
// 3.3 SUB-MODELS (MCQ Options, Review Results)
// ==========================================
export interface QuestionOption {
  id: string;
  text: string;
  orderIndex: number;
}

export interface StudentMultipleChoiceQuestion {
  id: string;
  questionText: string;
  questionType: HomeworkQuestionType;
  points: number;
  options: QuestionOption[];
}

export interface AnswerResult {
  questionId: string;
  questionText: string;
  selectedOptionId?: string;
  selectedOptionText?: string;
  correctOptionId?: string;
  correctOptionText?: string;
  isCorrect: boolean;
  earnedPoints: number;
  maxPoints: number;
  explanation?: string;
}

// ==========================================
// 3.4 AI ENDPOINTS CHO STUDENT
// ==========================================
export interface AIHintRequest {
  currentAnswerText?: string;
  language?: string;
}

export interface AIHintResponse {
  aiUsed: boolean;
  summary: string;
  hints: string[];
  grammarFocus?: string[];
  vocabularyFocus?: string[];
  encouragement?: string;
  warnings?: string[];
}

export interface AIRecommendationRequest {
  currentAnswerText?: string;
  language?: string;
  maxItems?: number;
}

export interface RecommendationItem {
  questionBankItemId: string;
  questionText: string;
  questionType: HomeworkQuestionType;
  options: any[];
  topic: string;
  skill: string;
  grammarTags: string[];
  vocabularyTags: string[];
  level: string;
  points: number;
  reason: string;
}

export interface AIRecommendationResponse {
  aiUsed: boolean;
  summary: string;
  focusSkill: string;
  topics: string[];
  grammarTags: string[];
  vocabularyTags: string[];
  recommendedLevels: string[];
  practiceTypes: string[];
  warnings?: string[];
  items: RecommendationItem[];
}

export interface HomeworkAiFeatureAvailability {
  canUseHint: boolean;
  canUseRecommendation: boolean;
  hintMessage?: string;
  recommendationMessage?: string;
}

export interface HomeworkAiToolContext {
  homeworkStudentId: string;
  currentAnswerText: string;
  hintEnabled?: boolean;
  recommendationEnabled?: boolean;
  availability: HomeworkAiFeatureAvailability;
}

export interface AISpeakingAnalysisRequest {
  currentTranscript?: string;
  language?: string;
}

export interface AISpeakingAnalysisResponse {
  aiUsed: boolean;
  summary: string;
  transcript: string;
  overallScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  accuracyScore: number;
  stars: number;
  strengths: string[];
  issues: string[];
  mispronouncedWords: string[];
  wordFeedback: WordFeedback[];
  suggestions: string[];
  practicePlan: string[];
  confidence: {
    overall: number;
  };
  warnings?: string[];
}

