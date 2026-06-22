#!/bin/bash
# setup.sh – one-click development setup

echo "🚀 Smart Resume Analyzer – Setup Script"
echo "========================================"

# Backend
echo ""
echo "📦 Setting up Backend..."
cd backend

if [ ! -d "venv" ]; then
  python3 -m venv venv
  echo "✅ Virtual environment created"
fi

source venv/bin/activate

pip install -r requirements.txt --quiet
echo "✅ Python packages installed"

python -m spacy download en_core_web_sm --quiet 2>/dev/null || true
echo "✅ spaCy model downloaded"

python -c "
import nltk
for pkg in ['punkt','stopwords','averaged_perceptron_tagger']:
    nltk.download(pkg, quiet=True)
" 2>/dev/null || true
echo "✅ NLTK data downloaded"

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "✅ .env created from template — please update MONGO_URI if needed"
fi

mkdir -p uploads
cd ..

# Frontend
echo ""
echo "📦 Setting up Frontend..."
cd frontend
npm install --silent
echo "✅ Node packages installed"
cd ..

echo ""
echo "========================================"
echo "✅ Setup complete!"
echo ""
echo "Start backend:  cd backend && source venv/bin/activate && python app.py"
echo "Start frontend: cd frontend && npm start"
echo ""
echo "Admin login:    admin@resumeanalyzer.com / Admin@123"
echo "API health:     http://localhost:5000/api/health"
echo "========================================"
