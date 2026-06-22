"""
utils/resume_parser.py
PDF parsing and information extraction from resumes
"""
import re
import pdfplumber
import fitz  # PyMuPDF
import logging

logger = logging.getLogger(__name__)


class ResumeParser:
    """Extracts structured information from PDF resumes"""

    # ── Regex Patterns ──────────────────────────────────────────────────
    EMAIL_PATTERN = re.compile(
        r'\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Z|a-z]{2,7}\b'
    )
    PHONE_PATTERN = re.compile(
        r'(?:\+?91[\-\s]?)?(?:\+?1[\-\s]?)?'
        r'(?:\(?\d{3}\)?[\-\s]?)?\d{3}[\-\s]?\d{4}'
        r'|\+?\d{10,13}'
        r'|\+?\d{2,3}[\-\s]\d{4,5}[\-\s]\d{4,5}'
    )
    LINKEDIN_PATTERN = re.compile(
        r'(?:linkedin\.com/in/|linkedin:\s*)([A-Za-z0-9\-_%]+)',
        re.IGNORECASE
    )
    GITHUB_PATTERN = re.compile(
        r'(?:github\.com/)([A-Za-z0-9\-_%]+)',
        re.IGNORECASE
    )

    # Section headers
    SECTION_HEADERS = {
        "education":      re.compile(r'\b(education|academic|qualification|degree)\b', re.I),
        "experience":     re.compile(r'\b(experience|employment|work history|professional background|internship)\b', re.I),
        "skills":         re.compile(r'\b(skills|technical skills|core competencies|technologies|expertise)\b', re.I),
        "projects":       re.compile(r'\b(projects|personal projects|academic projects|portfolio)\b', re.I),
        "certifications": re.compile(r'\b(certifications?|certificates?|licenses?|credentials)\b', re.I),
        "summary":        re.compile(r'\b(summary|objective|profile|about me|overview)\b', re.I),
        "languages":      re.compile(r'\b(languages?|spoken languages?)\b', re.I),
    }

    # Education keywords
    EDUCATION_KEYWORDS = re.compile(
        r'\b(B\.?Tech|B\.?E|B\.?Sc|M\.?Tech|M\.?E|M\.?Sc|MCA|BCA|MBA|'
        r'Ph\.?D|Bachelor|Master|B\.?A|M\.?A|Diploma|'
        r'University|Institute|College|School|'
        r'Engineering|Computer Science|Information Technology|'
        r'CGPA|GPA|percentage|%|10th|12th|SSC|HSC)\b',
        re.I
    )

    # ── Public API ────────────────────────────────────────────────────────

    def parse(self, file_path: str) -> dict:
        """Main entry point: parse a PDF resume and return structured data"""
        raw_text = self._extract_text(file_path)
        if not raw_text:
            return self._empty_result()

        lines  = [l.strip() for l in raw_text.splitlines() if l.strip()]
        result = {
            "raw_text":       raw_text,
            "full_name":      self._extract_name(lines),
            "email":          self._extract_email(raw_text),
            "phone":          self._extract_phone(raw_text),
            "linkedin":       self._extract_linkedin(raw_text),
            "github":         self._extract_github(raw_text),
            "summary":        self._extract_section(lines, "summary"),
            "education":      self._extract_education(lines),
            "experience":     self._extract_experience(lines),
            "projects":       self._extract_projects(lines),
            "certifications": self._extract_certifications(lines),
            "skills":         self._extract_skills_section(lines),
            "languages":      self._extract_languages(lines),
        }
        logger.info(f"Parsed resume: {result['full_name']} | {result['email']}")
        return result

    # ── Text Extraction ───────────────────────────────────────────────────

    def _extract_text(self, file_path: str) -> str:
        """Try pdfplumber first, fall back to PyMuPDF"""
        text = self._extract_with_pdfplumber(file_path)
        if not text or len(text.strip()) < 100:
            text = self._extract_with_pymupdf(file_path)
        return text

    def _extract_with_pdfplumber(self, file_path: str) -> str:
        try:
            with pdfplumber.open(file_path) as pdf:
                pages = [page.extract_text() or "" for page in pdf.pages]
            return "\n".join(pages)
        except Exception as e:
            logger.warning(f"pdfplumber failed: {e}")
            return ""

    def _extract_with_pymupdf(self, file_path: str) -> str:
        try:
            doc  = fitz.open(file_path)
            text = "\n".join(page.get_text() for page in doc)
            doc.close()
            return text
        except Exception as e:
            logger.warning(f"PyMuPDF failed: {e}")
            return ""

    # ── Field Extractors ──────────────────────────────────────────────────

    def _extract_name(self, lines: list) -> str:
        """Heuristic: first 5 non-email lines, longest that looks like a name"""
        name_re = re.compile(r'^[A-Za-z]+(?: [A-Za-z]+){1,4}$')
        for line in lines[:8]:
            clean = line.strip()
            if name_re.match(clean) and not self.EMAIL_PATTERN.search(clean):
                if 3 <= len(clean) <= 50:
                    return clean
        return lines[0] if lines else ""

    def _extract_email(self, text: str) -> str:
        m = self.EMAIL_PATTERN.search(text)
        return m.group(0) if m else ""

    def _extract_phone(self, text: str) -> str:
        m = self.PHONE_PATTERN.search(text)
        if m:
            phone = re.sub(r'[\s\-]', '', m.group(0))
            if len(phone) >= 10:
                return phone
        return ""

    def _extract_linkedin(self, text: str) -> str:
        m = self.LINKEDIN_PATTERN.search(text)
        return f"linkedin.com/in/{m.group(1)}" if m else ""

    def _extract_github(self, text: str) -> str:
        m = self.GITHUB_PATTERN.search(text)
        return f"github.com/{m.group(1)}" if m else ""

    # ── Section Helpers ───────────────────────────────────────────────────

    def _get_section_lines(self, lines: list, section: str) -> list:
        """Return lines belonging to the requested section"""
        pattern  = self.SECTION_HEADERS[section]
        other    = [p for k, p in self.SECTION_HEADERS.items() if k != section]
        in_sec   = False
        result   = []

        for line in lines:
            if pattern.search(line) and len(line) < 60:
                in_sec = True
                continue
            if in_sec:
                if any(p.search(line) for p in other) and len(line) < 60:
                    break
                result.append(line)

        return result

    def _extract_section(self, lines: list, section: str) -> str:
        return " ".join(self._get_section_lines(lines, section))[:1000]

    def _extract_education(self, lines: list) -> list:
        sec   = self._get_section_lines(lines, "education")
        items = []
        cur   = {}
        for line in sec:
            if self.EDUCATION_KEYWORDS.search(line):
                if cur:
                    items.append(cur)
                cur = {"description": line, "year": self._extract_year(line)}
            elif cur:
                cur["description"] += " " + line
        if cur:
            items.append(cur)
        return items[:6]

    def _extract_experience(self, lines: list) -> list:
        sec  = self._get_section_lines(lines, "experience")
        exp  = []
        cur  = None
        date = re.compile(r'\b(19|20)\d{2}\b|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b', re.I)
        for line in sec:
            if date.search(line) or re.search(r'\b(intern|engineer|developer|analyst|manager|lead)\b', line, re.I):
                if cur:
                    exp.append(cur)
                cur = {"title": line, "duration": self._extract_year(line), "description": ""}
            elif cur:
                cur["description"] += " " + line
        if cur:
            exp.append(cur)
        return exp[:8]

    def _extract_projects(self, lines: list) -> list:
        sec   = self._get_section_lines(lines, "projects")
        items = []
        cur   = None
        tech  = re.compile(r'\b(using|built with|tech|stack|language|framework)[:–]?\s*(.+)', re.I)
        for line in sec:
            if line and len(line) > 10 and not line.startswith("•"):
                if cur:
                    items.append(cur)
                cur = {"title": line, "description": "", "technologies": []}
            elif cur:
                cur["description"] += " " + line
                m = tech.search(line)
                if m:
                    cur["technologies"] = [t.strip() for t in m.group(2).split(",")]
        if cur:
            items.append(cur)
        return items[:8]

    def _extract_certifications(self, lines: list) -> list:
        sec = self._get_section_lines(lines, "certifications")
        return [{"name": l, "year": self._extract_year(l)} for l in sec if len(l) > 5][:10]

    def _extract_skills_section(self, lines: list) -> list:
        sec  = self._get_section_lines(lines, "skills")
        text = " ".join(sec)
        # split on common delimiters
        raw  = re.split(r'[,|•·\n]+', text)
        return [s.strip() for s in raw if 2 <= len(s.strip()) <= 50][:40]

    def _extract_languages(self, lines: list) -> list:
        sec = self._get_section_lines(lines, "languages")
        return [l.strip() for l in sec if 2 <= len(l.strip()) <= 30][:8]

    # ── Utilities ─────────────────────────────────────────────────────────

    @staticmethod
    def _extract_year(text: str) -> str:
        m = re.search(r'\b(19|20)\d{2}\b', text)
        return m.group(0) if m else ""

    @staticmethod
    def _empty_result() -> dict:
        return {
            "raw_text": "", "full_name": "", "email": "", "phone": "",
            "linkedin": "", "github": "", "summary": "",
            "education": [], "experience": [], "projects": [],
            "certifications": [], "skills": [], "languages": []
        }
