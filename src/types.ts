export interface ScheduleItem {
  id: string;
  day: string;
  time: string;
  subject: string;
  room: string;
  status: string; // 'optimized' | 'conflict' | 'burnout'
  conflictText?: string;
  credits: number;
  notes?: string;
  professor?: string; // Optional, defaults to "Elena Kostic"
}

export interface ApprovalItem {
  id: string;
  title: string;
  subtitle: string;
  type: string; // 'assignment' | 'warning'
  icon: string; // 'assignment' | 'grade'
  status: string; // 'pending' | 'approved' | 'rejected'
}

export interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  status: string; // 'pending' | 'approved' | 'declined'
  notifiedSubstitutes: string[];
}

export interface Substitute {
  id: string;
  name: string;
  matchRate: string;
  statusText: string;
  avatar: string;
}

export interface OptimizerRecommendation {
  id: string;
  title: string;
  description: string;
  conflictResolved: string;
  impact: string;
}

export interface OptimizationResult {
  aiGenerated: boolean;
  analysis: string;
  recommendations: OptimizerRecommendation[];
  optimizedSchedule: ScheduleItem[];
}
