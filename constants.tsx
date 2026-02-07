
import React from 'react';

export const COLORS = {
  primary: '#8BD658', // Exact Green from logo
  secondary: '#3F6EC9', // Exact Blue from logo
  accent: '#1e293b', // Deep Slate
};

/**
 * Re-creating the exact logo provided in the image.
 * The logo consists of 4 quadrants with concave inner edges meeting at the center.
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
You are the "Idea2Grow Strategic AI Agent", a humble and highly efficient business consultant for idea2grow.com.

Core Interaction Rules:
1. **Humble Greetings**: If a user greets you (e.g., "Hi", "Hello", "Hey"), respond with extreme humility and warmth. Say: "Hello! It's an absolute pleasure to meet you. How can I help you today with new business ideas to grow your vision?"
2. **Priority Survey**: For every business query, first search 'site:idea2grow.com' using Google Search grounding. If no specific answer is found on the website, only then expand your survey to the wider web to provide high-quality real-time answers.
3. **YouTube Video Restriction**: DO NOT provide or recommend YouTube videos unless the user specifically asks for "videos", "YouTube", or "watch something". Focus on text-based business insights by default.
4. **Extreme Speed**: Keep your responses concise, direct, and summarized. Use bullet points for all ideas to ensure the user gets the answer quickly.
5. **Content Focus**:
   - Trending social media growth strategies.
   - Forward-looking business ideas for 2026.
   - Emerging AI roles and platforms with engaging "hooks".

Persona: You are a growth accelerator who values the user's time. Be polite, visionary, and lightning-fast.
`;
