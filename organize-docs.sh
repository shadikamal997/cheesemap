#!/bin/bash
# CheeseMap Documentation Organization Script
# Moves all .md files from root to appropriate docs/ subfolders
# Usage: Run from project root directory
# Safety: No files are deleted, only moved

echo "🧹 Organizing CheeseMap documentation..."
echo ""

# Backend API Documentation
echo "📁 Moving backend files to docs/backend/"
mv API_TESTING.md docs/backend/ 2>/dev/null && echo "  ✓ API_TESTING.md"
mv AUTHENTICATION_IMPLEMENTATION.md docs/backend/ 2>/dev/null && echo "  ✓ AUTHENTICATION_IMPLEMENTATION.md"
mv AUTH_TESTING_COMPLETE.md docs/backend/ 2>/dev/null && echo "  ✓ AUTH_TESTING_COMPLETE.md"
mv BUSINESS_SIGNUP_INTEGRATION.md docs/backend/ 2>/dev/null && echo "  ✓ BUSINESS_SIGNUP_INTEGRATION.md"
mv DASHBOARD_API_INTEGRATION.md docs/backend/ 2>/dev/null && echo "  ✓ DASHBOARD_API_INTEGRATION.md"

# Delivery & Implementation
echo ""
echo "📁 Moving delivery files to docs/delivery/"
mv QUICKSTART.md docs/delivery/ 2>/dev/null && echo "  ✓ QUICKSTART.md"
mv QUICK_START_COMMANDS.md docs/delivery/ 2>/dev/null && echo "  ✓ QUICK_START_COMMANDS.md"
mv IMPLEMENTATION_SUMMARY.md docs/delivery/ 2>/dev/null && echo "  ✓ IMPLEMENTATION_SUMMARY.md"
mv TESTING_GUIDE.md docs/delivery/ 2>/dev/null && echo "  ✓ TESTING_GUIDE.md"
mv DEPLOYMENT.md docs/delivery/ 2>/dev/null && echo "  ✓ DEPLOYMENT.md"

# Reports & Assessments
echo ""
echo "📁 Moving report files to docs/reports/"
mv CLEANUP_REPORT.md docs/reports/ 2>/dev/null && echo "  ✓ CLEANUP_REPORT.md"
mv CLEANUP_COMPLETE.md docs/reports/ 2>/dev/null && echo "  ✓ CLEANUP_COMPLETE.md"
mv PROJECT_COMPLETE.md docs/reports/ 2>/dev/null && echo "  ✓ PROJECT_COMPLETE.md"
mv README_SESSION_COMPLETE.md docs/reports/ 2>/dev/null && echo "  ✓ README_SESSION_COMPLETE.md"
mv SESSION_SUMMARY.md docs/reports/ 2>/dev/null && echo "  ✓ SESSION_SUMMARY.md"
mv STEP_11_COMPLETION.md docs/reports/ 2>/dev/null && echo "  ✓ STEP_11_COMPLETION.md"
mv CHANGES_DETAILED.md docs/reports/ 2>/dev/null && echo "  ✓ CHANGES_DETAILED.md"

# AI Guidelines
echo ""
echo "📁 Copying AI guidelines to docs/ai/"
cp .github/copilot-instructions.md docs/ai/copilot-instructions.md 2>/dev/null && echo "  ✓ copilot-instructions.md"

# Architecture - Move existing PHASE1 if needed
if [ -f docs/PHASE1_COMPLETION.md ]; then
  echo ""
  echo "📁 Moving architecture files to docs/architecture/"
  mv docs/PHASE1_COMPLETION.md docs/architecture/ 2>/dev/null && echo "  ✓ PHASE1_COMPLETION.md"
fi

# Verification
echo ""
echo "✅ Documentation organization complete!"
echo ""
echo "📋 Verification:"
echo "  Backend files: $(ls -1 docs/backend/ 2>/dev/null | wc -l) files"
echo "  Delivery files: $(ls -1 docs/delivery/ 2>/dev/null | wc -l) files"
echo "  Report files: $(ls -1 docs/reports/ 2>/dev/null | wc -l) files"
echo "  Architecture files: $(ls -1 docs/architecture/ 2>/dev/null | wc -l) files"
echo "  AI files: $(ls -1 docs/ai/ 2>/dev/null | wc -l) files"
echo ""
echo "📖 Documentation index:"
echo "  → docs/INDEX.md (quick reference)"
echo "  → docs/FILE_ORGANIZATION.md (detailed mapping)"
echo ""
echo "🎯 Next: Run 'git diff' to verify only file paths changed"
