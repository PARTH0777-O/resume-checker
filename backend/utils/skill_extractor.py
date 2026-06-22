"""
utils/skill_extractor.py
NLP-based skill extraction and matching using spaCy + NLTK
"""
import re
import sys
import logging
from typing import List, Dict, Tuple

logger = logging.getLogger(__name__)

# Attempt to load spaCy model; fall back to regex only
try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_sm")
        SPACY_AVAILABLE = True
        logger.info("spaCy model loaded")
    except OSError:
        SPACY_AVAILABLE = False
        nlp = None
except ImportError:
    SPACY_AVAILABLE = False
    nlp = None

# NLTK setup
try:
    import nltk
    for pkg in ["punkt", "stopwords", "averaged_perceptron_tagger"]:
        try:
            nltk.data.find(f"tokenizers/{pkg}")
        except LookupError:
            nltk.download(pkg, quiet=True)
    from nltk.corpus import stopwords
    STOP_WORDS = set(stopwords.words("english"))
    NLTK_AVAILABLE = True
except Exception:
    NLTK_AVAILABLE = False
    STOP_WORDS = set()


# ── Built-in skills database (fallback when MongoDB is not available) ──
BUILTIN_SKILLS = {
    # key → (display_name, aliases, weight)
    "python":           ("Python",           ["py", "python3", "python2"],                  1.0),
    "javascript":       ("JavaScript",       ["js", "es6", "ecmascript", "es2015"],          1.0),
    "java":             ("Java",             ["java8", "java11", "java17"],                  1.0),
    "c++":              ("C++",              ["cpp", "c plus plus"],                         0.9),
    "typescript":       ("TypeScript",       ["ts"],                                         0.9),
    "react":            ("React",            ["reactjs", "react.js", "react native"],        1.0),
    "node.js":          ("Node.js",          ["nodejs", "node", "express"],                  1.0),
    "django":           ("Django",           [],                                              0.9),
    "flask":            ("Flask",            [],                                              0.9),
    "fastapi":          ("FastAPI",          ["fast api"],                                   0.9),
    "vue.js":           ("Vue.js",           ["vuejs", "vue"],                               0.9),
    "angular":          ("Angular",          ["angularjs"],                                  0.9),
    "next.js":          ("Next.js",          ["nextjs"],                                     0.9),
    "machine learning": ("Machine Learning", ["ml", "ml algorithms"],                        1.0),
    "deep learning":    ("Deep Learning",    ["dl", "neural network", "neural networks"],    1.0),
    "tensorflow":       ("TensorFlow",       ["tf", "tensorflow2"],                          1.0),
    "pytorch":          ("PyTorch",          ["torch"],                                      1.0),
    "scikit-learn":     ("Scikit-learn",     ["sklearn", "scikit learn"],                    0.9),
    "keras":            ("Keras",            [],                                              0.9),
    "nlp":              ("NLP",              ["natural language processing", "text mining"], 0.9),
    "computer vision":  ("Computer Vision",  ["cv", "opencv", "image processing"],           0.9),
    "pandas":           ("Pandas",           [],                                              0.9),
    "numpy":            ("NumPy",            ["numpy", "numerical python"],                  0.9),
    "sql":              ("SQL",              ["mysql", "tsql", "sql server", "structured query language"], 1.0),
    "mongodb":          ("MongoDB",          ["mongo", "nosql"],                              0.9),
    "postgresql":       ("PostgreSQL",       ["postgres", "pg"],                              0.9),
    "redis":            ("Redis",            [],                                              0.8),
    "elasticsearch":    ("Elasticsearch",    ["elastic search"],                             0.8),
    "aws":              ("AWS",              ["amazon web services", "amazon aws"],           1.0),
    "azure":            ("Azure",            ["microsoft azure", "ms azure"],                 0.9),
    "gcp":              ("GCP",              ["google cloud", "google cloud platform"],       0.9),
    "docker":           ("Docker",           ["containerization", "container"],               1.0),
    "kubernetes":       ("Kubernetes",       ["k8s", "container orchestration"],              0.9),
    "git":              ("Git",              ["github", "gitlab", "bitbucket", "version control"], 1.0),
    "linux":            ("Linux",            ["unix", "ubuntu", "centos", "bash"],            0.9),
    "html":             ("HTML",             ["html5"],                                       0.8),
    "css":              ("CSS",              ["css3", "sass", "scss"],                        0.8),
    "rest api":         ("REST API",         ["restful api", "rest", "api development"],      0.9),
    "graphql":          ("GraphQL",          [],                                              0.8),
    "spring boot":      ("Spring Boot",      ["spring", "spring framework"],                  0.9),
    "tableau":          ("Tableau",          [],                                              0.8),
    "power bi":         ("Power BI",         ["powerbi", "microsoft power bi"],               0.8),
    "spark":            ("Spark",            ["apache spark", "pyspark"],                     0.9),
    "hadoop":           ("Hadoop",           ["apache hadoop"],                               0.8),
    "statistics":       ("Statistics",       ["statistical analysis", "probability", "statistical modeling"], 0.9),
    "agile":            ("Agile",            ["scrum", "kanban", "agile methodology"],        0.6),
    "ci/cd":            ("CI/CD",            ["jenkins", "github actions", "devops pipeline", "continuous integration"], 0.9),
    "terraform":        ("Terraform",        ["infrastructure as code"],                      0.8),
    "r":                ("R",                ["r programming", "r language"],                 0.8),
    "go":               ("Go",               ["golang"],                                      0.9),
    "kotlin":           ("Kotlin",           [],                                              0.8),
    "swift":            ("Swift",            [],                                              0.8),
    "php":              ("PHP",              [],                                              0.7),
    "ruby":             ("Ruby",             ["ruby on rails", "rails"],                      0.7),
    "excel":            ("Excel",            ["microsoft excel", "spreadsheet"],              0.7),
}


class SkillExtractor:
    """Extracts and normalises skills from resume text"""

    def __init__(self, skills_db: List[Dict] = None):
        self.skills_db = skills_db or []
        self._build_lookup()

    def _build_lookup(self):
        """Build a fast lookup table: normalised_term → canonical display name"""
        self.lookup: Dict[str, str] = {}

        # From MongoDB seed
        for skill in self.skills_db:
            canon = skill.get("display_name") or skill.get("name", "")
            for alias in [skill["name"]] + skill.get("aliases", []):
                self.lookup[alias.lower().strip()] = canon

        # Fill from builtin (don't override DB entries)
        for key, (display, aliases, _) in BUILTIN_SKILLS.items():
            if key not in self.lookup:
                self.lookup[key] = display
            for alias in aliases:
                if alias.lower() not in self.lookup:
                    self.lookup[alias.lower()] = display

    # ── Public API ────────────────────────────────────────────────────────

    def extract(self, text: str, skills_list: List[str] = None) -> List[str]:
        """
        Extract skills from free text.
        Returns a de-duplicated, sorted list of canonical skill names.
        """
        text_lower = text.lower()
        found: Dict[str, bool] = {}

        # 1. Regex matching against lookup
        for term, display in self.lookup.items():
            pattern = r'\b' + re.escape(term) + r'\b'
            if re.search(pattern, text_lower):
                found[display] = True

        # 2. Match explicit skills list from parser (from the Skills section)
        if skills_list:
            for raw in skills_list:
                norm = raw.lower().strip()
                if norm in self.lookup:
                    found[self.lookup[norm]] = True
                # partial match
                for term, display in self.lookup.items():
                    if term in norm or norm in term:
                        found[display] = True

        return sorted(found.keys())

    def get_skill_weight(self, skill_name: str) -> float:
        """Return importance weight for a skill"""
        norm = skill_name.lower()
        for key, (_, _, weight) in BUILTIN_SKILLS.items():
            if key == norm or norm in [a.lower() for a in _]:
                return weight
        return 0.5

    def compute_similarity(self, resume_skills: List[str], role_skills: List[str]) -> float:
        """Compute Jaccard similarity between skill sets"""
        if not role_skills:
            return 0.0
        r_set = {s.lower() for s in resume_skills}
        j_set = {s.lower() for s in role_skills}
        intersection = len(r_set & j_set)
        union = len(r_set | j_set)
        return intersection / union if union > 0 else 0.0

    def get_missing_skills(self, resume_skills: List[str], role_required: List[str]) -> List[str]:
        """Return skills required by the role but not found in resume"""
        r_norm = {s.lower() for s in resume_skills}
        missing = []
        for skill in role_required:
            if skill.lower() not in r_norm:
                # Check aliases
                found_alias = False
                for term, display in self.lookup.items():
                    if display.lower() == skill.lower() and term in r_norm:
                        found_alias = True
                        break
                if not found_alias:
                    missing.append(skill)
        return missing
