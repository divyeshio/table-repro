export type PersonStatus = "Active" | "Inactive";

export interface Person {
  id: string;
  name: string;
  email: string;
  age: number;
  role: string;
  department: string;
  status: PersonStatus;
  salary: number;
  isLiked: boolean;
  tags: string[];
  joinedAt: string;
  notes: string;
  avatarUrl?: string;
  updatedOn: string;
  lastAccessedOn: string;
}
