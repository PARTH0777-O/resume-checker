"""
utils/ats_scorer.py
ATS Resume Scoring Algorithm – calculates a score out of 100
"""
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)


class ATSScorer:
    """
    Scoring weights (total = 100):
      Skills        → 35
      Education     → 15
      Experience    → 20
      Projects      → 15
      Certifications→ 10
      Completeness  →  5
    """

    WEIGHTS = {
        "skills":         35,
        "education":      15,
        "experience":     20,
        "projects":       15,
        "certifications": 10,
        "completeness":    5,
    }

    # Skills that signal high technical competence
    HIGH_VALUE_SKILLS = {
        "machine learning", "deep learning", "tensorflow", "pytorch",
        "kubernetes", "docker", "aws", "azure", "gcp",
        "react", "node.js", "django", "flask", "fastapi",
        "postgresql", "mongodb", "elasticsearch", "spark",
        "ci/cd", "terraform",
    }

    def calculate(self, parsed_data: dict, extracted_skills: List[str]) -> Dict:
        """
        Main scoring entry point.
        Returns dict with total_score and per-section breakdown.
        """
        breakdown = {}

        # 1. Skills score (0-35)
        breakdown["skills_score"]         = self._score_skills(extracted_skills)

        # 2. Education score (0-15)
        breakdown["education_score"]      = self._score_education(parsed_data.get("education", []))

        # 3. Experience score (0-20)
        breakdown["experience_score"]     = self._score_experience(parsed_data.get("experience", []))

        # 4. Projects score (0-15)
        breakdown["projects_score"]       = self._score_projects(parsed_data.get("projects", []))

        # 5. Certifications score (0-10)
        breakdown["certifications_score"] = self._score_certifications(parsed_data.get("certifications", []))

        # 6. Completeness score (0-5)
        breakdown["completeness_score"]   = self._score_completeness(parsed_data)

        total = sum(breakdown.values())
        total = min(100, max(0, round(total)))

        logger.info(f"ATS Score: {total}/100 | Breakdown: {breakdown}")
        return {
            "total_score": total,
            "breakdown":   breakdown,
        }

    # ── Individual Scorers ────────────────────────────────────────────────

    def _score_skills(self, skills: List[str]) -> float:
        """Score based on number and quality of skills"""
        if not skills:
            return 0.0

        count       = len(skills)
        high_count  = sum(1 for s in skills if s.lower() in self.HIGH_VALUE_SKILLS)

        # Quantity sub-score (0-20)
        if count >= 15:
            qty = 20
        elif count >= 10:
            qty = 15
        elif count >= 6:
            qty = 10
        elif count >= 3:
            qty = 5
        else:
            qty = 2

        # Quality sub-score (0-15)
        quality = min(15, high_count * 3)

        return min(self.WEIGHTS["skills"], qty + quality)

    def _score_education(self, education: List[dict]) -> float:
        """Score based on highest degree and institution quality signals"""
        if not education:
            return 0.0

        text = " ".join(e.get("description", "") for e in education).lower()

        if any(kw in text for kw in ["ph.d", "phd", "doctorate"]):
            return self.WEIGHTS["education"]
        if any(kw in text for kw in ["m.tech", "mtech", "m.e", "mca", "mba", "master"]):
            return self.WEIGHTS["education"]
        if any(kw in text for kw in ["b.tech", "btech", "b.e", "bca", "bachelor", "engineering"]):
            return self.WEIGHTS["education"] * 0.9
        if any(kw in text for kw in ["diploma", "hsc", "12th", "intermediate"]):
            return self.WEIGHTS["education"] * 0.5
        # Has some education entry
        return self.WEIGHTS["education"] * 0.4

    def _score_experience(self, experience: List[dict]) -> float:
        """Score based on number of experience entries + description quality"""
        if not experience:
            return 0.0

        count       = len(experience)
        has_intern  = any(
            "intern" in str(e).lower() for e in experience
        )

        if count >= 3:
            base = self.WEIGHTS["experience"]
        elif count == 2:
            base = self.WEIGHTS["experience"] * 0.8
        elif count == 1:
            base = self.WEIGHTS["experience"] * (0.7 if has_intern else 0.5)
        else:
            base = 0.0

        # Bonus for quality descriptions
        total_desc_len = sum(len(e.get("description", "")) for e in experience)
        if total_desc_len > 300:
            base = min(self.WEIGHTS["experience"], base * 1.1)

        return round(base, 2)

    def _score_projects(self, projects: List[dict]) -> float:
        """Score based on number of projects and technology depth"""
        if not projects:
            return 0.0

        count = len(projects)

        if count >= 4:
            base = self.WEIGHTS["projects"]
        elif count == 3:
            base = self.WEIGHTS["projects"] * 0.9
        elif count == 2:
            base = self.WEIGHTS["projects"] * 0.7
        elif count == 1:
            base = self.WEIGHTS["projects"] * 0.5
        else:
            base = 0.0

        # Bonus for projects with listed technologies
        tech_count = sum(1 for p in projects if p.get("technologies"))
        bonus = min(3, tech_count * 0.5)

        return min(self.WEIGHTS["projects"], round(base + bonus, 2))

    def _score_certifications(self, certifications: List[dict]) -> float:
        """Score based on number of certifications"""
        count = len(certifications)
        if count == 0:
            return 0.0
        if count >= 3:
            return self.WEIGHTS["certifications"]
        if count == 2:
            return self.WEIGHTS["certifications"] * 0.8
        return self.WEIGHTS["certifications"] * 0.5

    def _score_completeness(self, parsed: dict) -> float:
        """Bonus for having key profile fields filled"""
        score = 0.0
        checks = {
            "full_name":  0.5,
            "email":      1.0,
            "phone":      0.5,
            "linkedin":   1.0,
            "github":     1.0,
            "summary":    1.0,
        }
        for field, pts in checks.items():
            if parsed.get(field):
                score += pts

        return min(self.WEIGHTS["completeness"], score)

    # ── Suggestions ───────────────────────────────────────────────────────

    def generate_suggestions(self, parsed: dict, skills: List[str], score: int) -> List[str]:
        """Return tailored improvement suggestions based on resume gaps"""
        suggestions = []

        if not parsed.get("github"):
            suggestions.append("Add your GitHub profile URL to showcase your code")
        if not parsed.get("linkedin"):
            suggestions.append("Add your LinkedIn profile URL for better visibility")
        if not parsed.get("summary"):
            suggestions.append("Add a professional summary/objective statement (3-5 sentences)")
        if len(parsed.get("projects", [])) < 2:
            suggestions.append("Add at least 2-3 projects with tech stack and impact")
        if len(parsed.get("certifications", [])) == 0:
            suggestions.append("Add industry certifications (AWS, Google, Coursera, etc.)")
        if len(skills) < 8:
            suggestions.append("Expand your skills section — aim for 10+ relevant technical skills")
        if not any(s.lower() in {"docker", "kubernetes"} for s in skills):
            suggestions.append("Learn Docker/Kubernetes for better DevOps employability")
        if not any(s.lower() in {"git", "github"} for s in skills):
            suggestions.append("Mention Git/GitHub proficiency prominently")
        if len(parsed.get("experience", [])) == 0:
            suggestions.append("Add internship experience, freelance work, or open-source contributions")
        if len(parsed.get("education", [])) == 0:
            suggestions.append("Ensure your education section is clearly formatted")

        # Score-based suggestions
        if score < 50:
            suggestions.append("Use ATS-friendly formatting: standard fonts, clear section headings, no tables in headers")
            suggestions.append("Quantify achievements (e.g., 'Reduced load time by 40%')")
        elif score < 70:
            suggestions.append("Tailor your resume keywords to match specific job descriptions")
        
        return suggestions[:8]  # Return top 8 suggestions
