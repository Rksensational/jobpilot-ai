export interface ExperienceEntry {
  title: string;
  company: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  field_of_study: string | null;
  start_year: string | null;
  end_year: string | null;
}

export interface CertificationEntry {
  name: string;
  issuer: string | null;
  year: string | null;
}

export interface ParsedResume {
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  skills: string[];
  job_titles: string[];
  industries: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
  total_experience_years: number | null;
}

export interface ResumeUploadResponse {
  resume_id: string;
  file_name: string;
  parsed: ParsedResume;
  warnings: string[];
}

export interface ResumeListItem {
  id: string;
  file_name: string;
  is_active: boolean;
  created_at: string;
}
