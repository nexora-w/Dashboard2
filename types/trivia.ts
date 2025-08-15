export interface TriviaQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface GameAnswer {
  _id?: string;
  date: string;
  status: 'draft' | 'scheduled' | 'active' | 'archived';
  questions: TriviaQuestion[];
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt?: string;
  updatedAt?: string;
} 