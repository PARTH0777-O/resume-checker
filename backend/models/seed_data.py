"""
models/seed_data.py
Initial data for job roles and skills database
"""

JOB_ROLES_SEED = [
    {
        "title": "Python Developer",
        "category": "Software Development",
        "description": "Develops backend services and APIs using Python",
        "required_skills": ["python", "flask", "django", "rest api", "sql", "git"],
        "preferred_skills": ["docker", "aws", "postgresql", "redis", "celery"],
        "salary_range": "₹4L - ₹18L"
    },
    {
        "title": "Full Stack Developer",
        "category": "Software Development",
        "description": "Builds complete web applications from frontend to backend",
        "required_skills": ["javascript", "react", "node.js", "html", "css", "sql", "git"],
        "preferred_skills": ["typescript", "mongodb", "docker", "aws", "graphql"],
        "salary_range": "₹5L - ₹22L"
    },
    {
        "title": "AI Engineer",
        "category": "Artificial Intelligence",
        "description": "Designs and implements AI/ML solutions and pipelines",
        "required_skills": ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "numpy"],
        "preferred_skills": ["mlops", "docker", "aws", "kubernetes", "spark"],
        "salary_range": "₹8L - ₹35L"
    },
    {
        "title": "Data Analyst",
        "category": "Data Science",
        "description": "Analyzes data and generates actionable business insights",
        "required_skills": ["python", "sql", "excel", "tableau", "statistics", "pandas"],
        "preferred_skills": ["power bi", "r", "machine learning", "spark", "hadoop"],
        "salary_range": "₹4L - ₹15L"
    },
    {
        "title": "Data Scientist",
        "category": "Data Science",
        "description": "Builds predictive models and extracts insights from complex datasets",
        "required_skills": ["python", "machine learning", "statistics", "sql", "pandas", "scikit-learn"],
        "preferred_skills": ["deep learning", "tensorflow", "spark", "r", "tableau"],
        "salary_range": "₹6L - ₹28L"
    },
    {
        "title": "DevOps Engineer",
        "category": "Infrastructure",
        "description": "Manages CI/CD pipelines, cloud infrastructure and deployments",
        "required_skills": ["docker", "kubernetes", "linux", "git", "aws", "ci/cd"],
        "preferred_skills": ["terraform", "ansible", "python", "jenkins", "monitoring"],
        "salary_range": "₹6L - ₹25L"
    },
    {
        "title": "Backend Developer",
        "category": "Software Development",
        "description": "Builds scalable server-side APIs and microservices",
        "required_skills": ["python", "node.js", "rest api", "sql", "mongodb", "git"],
        "preferred_skills": ["docker", "redis", "kafka", "aws", "graphql"],
        "salary_range": "₹4L - ₹20L"
    },
    {
        "title": "Frontend Developer",
        "category": "Software Development",
        "description": "Creates interactive user interfaces and web experiences",
        "required_skills": ["javascript", "react", "html", "css", "git", "responsive design"],
        "preferred_skills": ["typescript", "vue.js", "sass", "webpack", "testing"],
        "salary_range": "₹3L - ₹18L"
    },
    {
        "title": "Software Engineer",
        "category": "Software Development",
        "description": "Designs, develops and maintains software systems",
        "required_skills": ["python", "java", "data structures", "algorithms", "git", "sql"],
        "preferred_skills": ["system design", "docker", "aws", "agile", "testing"],
        "salary_range": "₹4L - ₹25L"
    },
    {
        "title": "Web Developer",
        "category": "Software Development",
        "description": "Builds and maintains websites and web applications",
        "required_skills": ["html", "css", "javascript", "git", "responsive design"],
        "preferred_skills": ["react", "php", "wordpress", "seo", "bootstrap"],
        "salary_range": "₹2.5L - ₹12L"
    },
    {
        "title": "Machine Learning Engineer",
        "category": "Artificial Intelligence",
        "description": "Builds and deploys machine learning models at scale",
        "required_skills": ["python", "machine learning", "tensorflow", "pytorch", "scikit-learn", "sql"],
        "preferred_skills": ["mlops", "docker", "kubernetes", "spark", "feature engineering"],
        "salary_range": "₹7L - ₹32L"
    },
    {
        "title": "Database Administrator",
        "category": "Data Engineering",
        "description": "Manages and optimizes database systems",
        "required_skills": ["sql", "mysql", "postgresql", "mongodb", "performance tuning", "backup"],
        "preferred_skills": ["oracle", "redis", "elasticsearch", "linux", "python"],
        "salary_range": "₹4L - ₹18L"
    }
]

SKILLS_SEED = [
    # Programming Languages
    {"name": "Python", "category": "programming", "aliases": ["py"], "weight": 1.0},
    {"name": "JavaScript", "category": "programming", "aliases": ["js", "es6", "es2015"], "weight": 1.0},
    {"name": "Java", "category": "programming", "aliases": [], "weight": 1.0},
    {"name": "C++", "category": "programming", "aliases": ["cpp", "c plus plus"], "weight": 0.9},
    {"name": "C", "category": "programming", "aliases": [], "weight": 0.8},
    {"name": "TypeScript", "category": "programming", "aliases": ["ts"], "weight": 0.9},
    {"name": "R", "category": "programming", "aliases": [], "weight": 0.8},
    {"name": "Go", "category": "programming", "aliases": ["golang"], "weight": 0.9},
    {"name": "Rust", "category": "programming", "aliases": [], "weight": 0.9},
    {"name": "PHP", "category": "programming", "aliases": [], "weight": 0.7},
    {"name": "Kotlin", "category": "programming", "aliases": [], "weight": 0.8},
    {"name": "Swift", "category": "programming", "aliases": [], "weight": 0.8},
    {"name": "Ruby", "category": "programming", "aliases": [], "weight": 0.7},
    {"name": "Scala", "category": "programming", "aliases": [], "weight": 0.8},

    # Web Frameworks
    {"name": "React", "category": "framework", "aliases": ["reactjs", "react.js"], "weight": 1.0},
    {"name": "Node.js", "category": "framework", "aliases": ["nodejs", "node"], "weight": 1.0},
    {"name": "Django", "category": "framework", "aliases": [], "weight": 0.9},
    {"name": "Flask", "category": "framework", "aliases": [], "weight": 0.9},
    {"name": "FastAPI", "category": "framework", "aliases": [], "weight": 0.9},
    {"name": "Vue.js", "category": "framework", "aliases": ["vuejs", "vue"], "weight": 0.9},
    {"name": "Angular", "category": "framework", "aliases": ["angularjs"], "weight": 0.9},
    {"name": "Next.js", "category": "framework", "aliases": ["nextjs"], "weight": 0.9},
    {"name": "Express.js", "category": "framework", "aliases": ["express", "expressjs"], "weight": 0.8},
    {"name": "Spring Boot", "category": "framework", "aliases": ["spring"], "weight": 0.9},
    {"name": "Laravel", "category": "framework", "aliases": [], "weight": 0.7},

    # AI/ML
    {"name": "Machine Learning", "category": "ai_ml", "aliases": ["ml"], "weight": 1.0},
    {"name": "Deep Learning", "category": "ai_ml", "aliases": ["dl"], "weight": 1.0},
    {"name": "TensorFlow", "category": "ai_ml", "aliases": ["tf"], "weight": 1.0},
    {"name": "PyTorch", "category": "ai_ml", "aliases": [], "weight": 1.0},
    {"name": "Scikit-learn", "category": "ai_ml", "aliases": ["sklearn", "scikit learn"], "weight": 0.9},
    {"name": "Keras", "category": "ai_ml", "aliases": [], "weight": 0.9},
    {"name": "NLP", "category": "ai_ml", "aliases": ["natural language processing"], "weight": 0.9},
    {"name": "Computer Vision", "category": "ai_ml", "aliases": ["cv", "opencv"], "weight": 0.9},
    {"name": "Pandas", "category": "ai_ml", "aliases": [], "weight": 0.9},
    {"name": "NumPy", "category": "ai_ml", "aliases": ["numpy"], "weight": 0.9},
    {"name": "Matplotlib", "category": "ai_ml", "aliases": [], "weight": 0.8},
    {"name": "Seaborn", "category": "ai_ml", "aliases": [], "weight": 0.7},

    # Databases
    {"name": "SQL", "category": "database", "aliases": ["mysql", "sql server"], "weight": 1.0},
    {"name": "MongoDB", "category": "database", "aliases": ["mongo"], "weight": 0.9},
    {"name": "PostgreSQL", "category": "database", "aliases": ["postgres"], "weight": 0.9},
    {"name": "Redis", "category": "database", "aliases": [], "weight": 0.8},
    {"name": "Elasticsearch", "category": "database", "aliases": ["elastic search"], "weight": 0.8},
    {"name": "Firebase", "category": "database", "aliases": [], "weight": 0.7},
    {"name": "SQLite", "category": "database", "aliases": [], "weight": 0.7},
    {"name": "Oracle", "category": "database", "aliases": [], "weight": 0.7},
    {"name": "Cassandra", "category": "database", "aliases": [], "weight": 0.8},

    # Cloud & DevOps
    {"name": "AWS", "category": "cloud", "aliases": ["amazon web services"], "weight": 1.0},
    {"name": "Docker", "category": "devops", "aliases": ["containerization"], "weight": 1.0},
    {"name": "Kubernetes", "category": "devops", "aliases": ["k8s"], "weight": 0.9},
    {"name": "Git", "category": "tool", "aliases": ["github", "gitlab", "version control"], "weight": 1.0},
    {"name": "CI/CD", "category": "devops", "aliases": ["jenkins", "github actions", "cicd"], "weight": 0.9},
    {"name": "Linux", "category": "tool", "aliases": ["unix", "bash", "shell scripting"], "weight": 0.9},
    {"name": "Azure", "category": "cloud", "aliases": ["microsoft azure"], "weight": 0.9},
    {"name": "GCP", "category": "cloud", "aliases": ["google cloud", "google cloud platform"], "weight": 0.9},
    {"name": "Terraform", "category": "devops", "aliases": [], "weight": 0.8},
    {"name": "Ansible", "category": "devops", "aliases": [], "weight": 0.8},

    # Web Technologies
    {"name": "HTML", "category": "web", "aliases": ["html5"], "weight": 0.8},
    {"name": "CSS", "category": "web", "aliases": ["css3", "sass", "scss"], "weight": 0.8},
    {"name": "REST API", "category": "web", "aliases": ["restful", "rest", "api development"], "weight": 0.9},
    {"name": "GraphQL", "category": "web", "aliases": [], "weight": 0.8},
    {"name": "Responsive Design", "category": "web", "aliases": ["bootstrap", "tailwind"], "weight": 0.7},

    # Data Tools
    {"name": "Tableau", "category": "data", "aliases": [], "weight": 0.8},
    {"name": "Power BI", "category": "data", "aliases": ["powerbi"], "weight": 0.8},
    {"name": "Excel", "category": "data", "aliases": ["microsoft excel", "spreadsheet"], "weight": 0.7},
    {"name": "Spark", "category": "data", "aliases": ["apache spark", "pyspark"], "weight": 0.9},
    {"name": "Hadoop", "category": "data", "aliases": [], "weight": 0.8},
    {"name": "Statistics", "category": "data", "aliases": ["statistical analysis", "probability"], "weight": 0.9},

    # Soft Skills (lower weight)
    {"name": "Communication", "category": "soft", "aliases": [], "weight": 0.5},
    {"name": "Leadership", "category": "soft", "aliases": [], "weight": 0.5},
    {"name": "Problem Solving", "category": "soft", "aliases": [], "weight": 0.5},
    {"name": "Teamwork", "category": "soft", "aliases": [], "weight": 0.4},
    {"name": "Agile", "category": "soft", "aliases": ["scrum", "agile methodology"], "weight": 0.6},
]
