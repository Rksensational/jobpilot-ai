import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ParsedResume } from "@/types/resume";
import { Briefcase, GraduationCap, Award, Mail, Phone, MapPin } from "lucide-react";

export function ResumeProfileView({ parsed }: { parsed: ParsedResume }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{parsed.name || "Candidate Profile"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-4 text-sm text-slate-400">
            {parsed.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" /> {parsed.email}
              </span>
            )}
            {parsed.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" /> {parsed.phone}
              </span>
            )}
            {parsed.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {parsed.location}
              </span>
            )}
          </div>
          {parsed.summary && <p className="text-slate-300">{parsed.summary}</p>}
          {parsed.total_experience_years != null && (
            <p className="mt-3 text-sm text-slate-400">
              Estimated total experience:{" "}
              <span className="font-semibold text-slate-200">
                {parsed.total_experience_years} years
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      {parsed.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {parsed.skills.map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {parsed.experience.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" /> Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsed.experience.map((exp, i) => (
              <div key={i} className="border-l-2 border-brand-500/40 pl-4">
                <p className="font-medium text-slate-100">
                  {exp.title} · {exp.company}
                </p>
                <p className="text-xs text-slate-500">
                  {exp.start_date} — {exp.end_date} {exp.location ? `· ${exp.location}` : ""}
                </p>
                {exp.description && <p className="mt-1 text-sm text-slate-400">{exp.description}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {parsed.education.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" /> Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {parsed.education.map((ed, i) => (
              <div key={i}>
                <p className="font-medium text-slate-100">{ed.degree}</p>
                <p className="text-sm text-slate-400">
                  {ed.institution} {ed.field_of_study ? `· ${ed.field_of_study}` : ""}
                </p>
                <p className="text-xs text-slate-500">
                  {ed.start_year} — {ed.end_year}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {parsed.certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" /> Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {parsed.certifications.map((cert, i) => (
              <Badge key={i} variant="success">
                {cert.name}
                {cert.year ? ` · ${cert.year}` : ""}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
