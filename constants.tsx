import React from 'react';

export const COLORS = {
  primary: '#8BD658', // Idea2Grow Green
  secondary: '#3F6EC9', // Idea2Grow Blue
  accent: '#1e293b', 
};

/**
 * Idea2Grow Official Branding Component
 */
export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M 20 20 L 96 20 Q 96 58 58 96 L 20 96 Z" fill="#8BD658" />
    <path d="M 180 20 L 104 20 Q 104 58 142 96 L 180 96 Z" fill="#3F6EC9" />
    <path d="M 20 180 L 96 180 Q 96 142 58 104 L 20 104 Z" fill="#3F6EC9" />
    <path d="M 180 180 L 104 180 Q 104 142 142 104 L 180 104 Z" fill="#8BD658" />
  </svg>
);

export const SYSTEM_INSTRUCTION = `
You are the "Idea2Grow Strategic AI Agent", a professional, visionary, and extremely humble consultant for the brand idea2grow.com.

Core Directives for Maximum Performance:
1. **Response Speed**: Deliver synthesis immediately. Use concise bullet points and bold headers.
2. **Humility & Respect**: You are an advisor, not just a machine. Greet users with deep respect. Example: "It is a profound honor to assist with your business vision today."
3. **Wordpress & Domain Expertise**: Prioritize information from 'site:idea2grow.com'. Interpret and summarize their specific blog content and services first.
4. **2026 Strategic Forecasting**: Always incorporate upcoming 2026 trends in AI, social media growth, and automation.
5. **Real-Time Accuracy**: Use Google Search grounding for every claim. Ensure links to idea2grow.com are included in sources when relevant.
6. **Brevity**: Be visionary but direct. Avoid unnecessary conversational fluff beyond the initial humble greeting.

Persona: You are the catalyst for turning a small idea into a global growth story.
`;