// =============================================================================
// Candidate Search Service
// Simulates People Search APIs (Apollo.io, PDL, Proxycurl, Coresignal)
// =============================================================================

const { CANDIDATES } = require('../mockData/candidatesDb');

class SearchService {
  /**
   * Search candidates by job description keywords, skills, location, experience
   */
  search(query = {}) {
    let results = [...CANDIDATES];
    const { keywords, skills, location, min_experience, max_experience, title, source } = query;

    // Keyword search across name, title, skills, company
    if (keywords) {
      const kw = keywords.toLowerCase().split(/[\s,]+/).filter(Boolean);
      results = results.filter(c => {
        const searchable = `${c.name} ${c.title} ${c.company} ${c.skills.join(' ')} ${c.location} ${c.education}`.toLowerCase();
        return kw.some(k => searchable.includes(k));
      });
    }

    // Skill-based filtering
    if (skills) {
      const skillList = (Array.isArray(skills) ? skills : skills.split(',')).map(s => s.trim().toLowerCase());
      results = results.filter(c =>
        skillList.some(s => c.skills.some(cs => cs.toLowerCase().includes(s)))
      );
    }

    // Location filter
    if (location) {
      const loc = location.toLowerCase();
      results = results.filter(c => c.location.toLowerCase().includes(loc));
    }

    // Title filter
    if (title) {
      const t = title.toLowerCase();
      results = results.filter(c => c.title.toLowerCase().includes(t));
    }

    // Experience range
    if (min_experience) {
      results = results.filter(c => c.experience_years >= parseInt(min_experience));
    }
    if (max_experience) {
      results = results.filter(c => c.experience_years <= parseInt(max_experience));
    }

    // Source filter
    if (source) {
      results = results.filter(c => c.source === source);
    }

    // Calculate match scores
    results = results.map(c => ({
      ...c,
      match_score: this.calculateMatchScore(c, query)
    }));

    // Sort by match score descending
    results.sort((a, b) => b.match_score - a.match_score);

    return {
      count: results.length,
      query: query,
      sources: ['Apollo.io', 'People Data Labs', 'Proxycurl'],
      results
    };
  }

  /**
   * Calculate a match score (0-100) based on query relevance
   */
  calculateMatchScore(candidate, query) {
    let score = 50; // Base score

    if (query.keywords) {
      const kw = query.keywords.toLowerCase().split(/[\s,]+/).filter(Boolean);
      const searchable = `${candidate.title} ${candidate.skills.join(' ')} ${candidate.company}`.toLowerCase();
      const matchCount = kw.filter(k => searchable.includes(k)).length;
      score += Math.min(30, matchCount * 10);
    }

    if (query.skills) {
      const skillList = (Array.isArray(query.skills) ? query.skills : query.skills.split(',')).map(s => s.trim().toLowerCase());
      const matchedSkills = skillList.filter(s => candidate.skills.some(cs => cs.toLowerCase().includes(s)));
      score += Math.min(20, (matchedSkills.length / skillList.length) * 20);
    }

    if (query.location) {
      if (candidate.location.toLowerCase().includes(query.location.toLowerCase())) {
        score += 10;
      }
    }

    if (query.min_experience && query.max_experience) {
      const mid = (parseInt(query.min_experience) + parseInt(query.max_experience)) / 2;
      const diff = Math.abs(candidate.experience_years - mid);
      score += Math.max(0, 10 - diff * 2);
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Parse a job description and extract search parameters
   */
  parseJobDescription(jdText) {
    const text = jdText.toLowerCase();

    // Extract skills
    const allSkills = ['javascript', 'react', 'node.js', 'python', 'java', 'spring boot', 'aws', 'docker', 'kubernetes',
      'typescript', 'go', 'golang', 'rust', 'sql', 'mongodb', 'redis', 'kafka', 'graphql', 'rest api',
      'machine learning', 'ml', 'ai', 'tensorflow', 'pytorch', 'data science', 'nlp', 'computer vision',
      'devops', 'ci/cd', 'terraform', 'jenkins', 'git', 'linux', 'agile', 'scrum',
      'figma', 'adobe xd', 'ui/ux', 'product management', 'system design', 'microservices',
      'react native', 'flutter', 'swift', 'kotlin', 'firebase', 'next.js', 'tailwind',
      'selenium', 'cypress', 'jest', 'testing', 'qa', 'automation',
      'leadership', 'communication', 'problem solving'];

    const foundSkills = allSkills.filter(s => text.includes(s));

    // Extract experience
    const expMatch = text.match(/(\d+)\s*[-+to]*\s*(\d+)?\s*years?\s*(of\s+)?experience/i);
    let minExp = null, maxExp = null;
    if (expMatch) {
      minExp = parseInt(expMatch[1]);
      maxExp = expMatch[2] ? parseInt(expMatch[2]) : minExp + 3;
    }

    // Extract location
    const cities = ['bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'noida', 'gurgaon', 'kolkata',
      'new york', 'san francisco', 'london', 'remote'];
    const foundLocation = cities.find(c => text.includes(c)) || null;

    // Extract title hints
    const titleHints = ['engineer', 'developer', 'manager', 'designer', 'analyst', 'architect', 'lead', 'scientist'];
    const foundTitle = titleHints.find(t => text.includes(t)) || null;

    return {
      skills: foundSkills.join(','),
      keywords: foundSkills.slice(0, 5).join(' '),
      location: foundLocation,
      min_experience: minExp,
      max_experience: maxExp,
      title: foundTitle
    };
  }
}

module.exports = new SearchService();
