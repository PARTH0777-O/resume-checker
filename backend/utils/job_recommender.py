"""
utils/job_recommender.py
Job role recommendation engine using skill matching
"""
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)


class JobRecommender:
    """
    Recommends job roles based on resume skills.
    Uses weighted skill matching with bonus for high-value skills.
    """

    # Default job roles if MongoDB is empty
    DEFAULT_ROLES = [
        {
            "title": "Python Developer",
            "category": "Software Development",
            "required_skills": ["python", "flask", "django", "rest api", "sql", "git"],
            "preferred_skills": ["docker", "aws", "postgresql", "redis"],
        },
        {
            "title": "Full Stack Developer",
            "category": "Software Development",
            "required_skills": ["javascript", "react", "node.js", "html", "css", "sql", "git"],
            "preferred_skills": ["typescript", "mongodb", "docker", "aws"],
        },
        {
            "title": "AI Engineer",
            "category": "Artificial Intelligence",
            "required_skills": ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "numpy"],
            "preferred_skills": ["mlops", "docker", "aws", "kubernetes"],
        },
        {
            "title": "Data Analyst",
            "category": "Data Science",
            "required_skills": ["python", "sql", "excel", "tableau", "statistics", "pandas"],
            "preferred_skills": ["power bi", "r", "machine learning"],
        },
        {
            "title": "Data Scientist",
            "category": "Data Science",
            "required_skills": ["python", "machine learning", "statistics", "sql", "pandas", "scikit-learn"],
            "preferred_skills": ["deep learning", "tensorflow", "spark"],
        },
        {
            "title": "DevOps Engineer",
            "category": "Infrastructure",
            "required_skills": ["docker", "kubernetes", "linux", "git", "aws", "ci/cd"],
            "preferred_skills": ["terraform", "ansible", "python"],
        },
        {
            "title": "Backend Developer",
            "category": "Software Development",
            "required_skills": ["python", "node.js", "rest api", "sql", "mongodb", "git"],
            "preferred_skills": ["docker", "redis", "kafka", "aws"],
        },
        {
            "title": "Frontend Developer",
            "category": "Software Development",
            "required_skills": ["javascript", "react", "html", "css", "git"],
            "preferred_skills": ["typescript", "vue.js", "sass"],
        },
        {
            "title": "Software Engineer",
            "category": "Software Development",
            "required_skills": ["python", "java", "data structures", "algorithms", "git", "sql"],
            "preferred_skills": ["system design", "docker", "aws"],
        },
        {
            "title": "Machine Learning Engineer",
            "category": "Artificial Intelligence",
            "required_skills": ["python", "machine learning", "tensorflow", "pytorch", "scikit-learn", "sql"],
            "preferred_skills": ["mlops", "docker", "kubernetes"],
        },
        {
            "title": "Web Developer",
            "category": "Software Development",
            "required_skills": ["html", "css", "javascript", "git"],
            "preferred_skills": ["react", "php", "bootstrap"],
        },
        {
            "title": "Database Administrator",
            "category": "Data Engineering",
            "required_skills": ["sql", "mysql", "postgresql", "mongodb", "linux"],
            "preferred_skills": ["redis", "elasticsearch", "python"],
        },
    ]

    def __init__(self, job_roles_db: List[Dict] = None):
        self.roles = job_roles_db if job_roles_db else self.DEFAULT_ROLES

    def recommend(self, skills: List[str], top_n: int = 6) -> List[Dict]:
        """
        Recommend top N job roles based on skills.
        Returns list sorted by match_percentage descending.
        """
        resume_skills = {s.lower() for s in skills}
        results = []

        for role in self.roles:
            req    = [s.lower() for s in role.get("required_skills", [])]
            pref   = [s.lower() for s in role.get("preferred_skills", [])]

            req_match  = self._count_matches(resume_skills, req)
            pref_match = self._count_matches(resume_skills, pref)

            if not req:
                continue

            # Required skills score (70% weight)
            req_score  = (req_match / len(req)) * 70 if req else 0

            # Preferred skills score (30% weight)
            pref_score = (pref_match / len(pref)) * 30 if pref else 0

            match_pct  = round(req_score + pref_score)

            # Only recommend if there's at least one required skill match
            if req_match > 0:
                missing = [s for s in req if s not in resume_skills and
                           not self._has_alias_match(resume_skills, s)]
                results.append({
                    "title":            role["title"],
                    "category":         role.get("category", ""),
                    "match_percentage": min(99, match_pct),  # cap at 99 for honesty
                    "required_skills":  role.get("required_skills", []),
                    "preferred_skills": role.get("preferred_skills", []),
                    "missing_skills":   missing[:5],
                })

        results.sort(key=lambda x: x["match_percentage"], reverse=True)
        return results[:top_n]

    # ── Helpers ───────────────────────────────────────────────────────────

    def _count_matches(self, resume_skills: set, role_skills: List[str]) -> int:
        count = 0
        for skill in role_skills:
            if skill in resume_skills or self._has_alias_match(resume_skills, skill):
                count += 1
        return count

    @staticmethod
    def _has_alias_match(resume_skills: set, skill: str) -> bool:
        """Check if a skill or its common aliases appear in resume skills"""
        ALIASES = {
            "javascript": ["js", "es6"],
            "node.js":    ["nodejs", "node"],
            "react":      ["reactjs", "react.js"],
            "python":     ["py"],
            "sql":        ["mysql", "postgresql", "sqlite"],
            "machine learning": ["ml"],
            "deep learning":    ["dl"],
            "tensorflow": ["tf"],
            "kubernetes": ["k8s"],
            "git":        ["github", "gitlab", "version control"],
            "linux":      ["unix", "ubuntu", "bash"],
            "aws":        ["amazon web services"],
            "ci/cd":      ["jenkins", "github actions"],
        }
        aliases = ALIASES.get(skill, [])
        return any(a in resume_skills for a in aliases)
