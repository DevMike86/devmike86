
export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
  IDLE = 'IDLE'
}

export enum OnboardingStep {
  LOGIN = 'LOGIN',
  IDENTITY = 'IDENTITY',
  VERIFYING = 'VERIFYING',
  PROFILE_BUILDER = 'PROFILE_BUILDER',
  COMPLETED = 'COMPLETED'
}

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  tiktok?: string;
  threads?: string;
  facebook?: string;
  snapchat?: string;
}

export interface NotificationSettings {
  matches: boolean;
  messages: boolean;
  icebreakers: boolean;
  browserPermission: 'default' | 'granted' | 'denied';
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  bio: string;
  location: string;
  photo: string;
  photos?: string[];
  verificationScore: number;
  verificationReport: string;
  interests: string[];
  socialLinks?: SocialLinks;
}

export interface Match {
  profile: Profile;
  messagesSent: number;
  callsMade: number;
  isUnlimited: boolean;
  chatHistory: Message[];
  isTyping?: boolean;
}

export interface Message {
  sender: 'me' | 'them';
  text: string;
  timestamp: number;
}

export interface Transaction {
  id: string;
  amount: number;
  date: number;
  matchName: string;
  type: 'membership' | 'text_unlock' | 'personal_check' | 'global_search_check';
}

export interface Report {
  id: string;
  reportedProfileId: string;
  reportedProfileName: string;
  reporterName: string;
  reason: string;
  timestamp: number;
}

export interface AdminSettings {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  totalRevenue: number;
  transactions: Transaction[];
  reports: Report[];
}

export interface UserState {
  onboardingStep: OnboardingStep;
  isVerified: boolean;
  isMember: boolean;
  profile: Profile | null;
  matches: Match[];
  theme: 'light' | 'dark';
  notificationSettings: NotificationSettings;
}
