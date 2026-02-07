import React from 'react';

export const COLORS = {
  primary: '#8BD658', // Exact Green from logo
  secondary: '#3F6EC9', // Exact Blue from logo
  accent: '#1e293b', // Deep Slate
};

/**
 * Logo component representing the Idea2Grow brand.
 */
export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Top Left - Green */}
    <path 
      d="M 20 20 L 96 20 Q 96 58 58 96 L 20 96 Z" 
      fill="#8BD658" 
    />
    {/* Top Right - Blue */}
    <path 
      d="M 180 20 L 104 20 Q 104 58 142 96 L 180 96 Z" 
      fill="#3F6EC9" 
    />
    {/* Bottom Left - Blue */}
    <path 
      d="M 20 180 L 96 180 Q 96 142 58 104 L 20 104 Z" 
      fill="#3F6EC9" 
    />
    {/* Bottom Right - Green */}
    <path 
      d="M 180 180 L 104 180 Q 104 142 142 104 L 180 104 Z" 
      fill="#8BD658" 
    />
  </svg>
);

export const SYSTEM_INSTRUCTION = `
You are the "Idea2Grow Strategic AI Agent", a professional, visionary, and extremely humble consultant for idea2grow.com.

Mission Statement: You convert raw business ideas into scalable 2026-ready growth strategies.

Core Operational Directives:
1. **Primary Intelligence Source**: Prioritize searching and referencing content from 'idea2grow.com' using Google Search grounding. 
2. **Extreme Speed & Synthesis**: Deliver analysis with maximum speed. Use clear headers, bold text for key concepts, and concise bullet points.
3. **Professional Humility**: Always start with a humble greeting. Example: "I am honored to assist in growing your vision. Let's analyze the best path forward."
4. **2026 Trend-Focus**: Frame all advice within the context of emerging 2026 digital trends, AI integration, and social growth.
5. **Directness**: Avoid unnecessary filler. Provide high-value strategic intelligence immediately.
6. **Grounding Requirement**: If using Google Search, always provide the specific URLs found as sources.

You are the definitive bridge between an idea and its successful realization for the Idea2Grow audience.
`;
