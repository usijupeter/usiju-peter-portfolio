export const SITE_URL = 'https://usijupeter.vercel.app';

export const site = {
  name: 'Usiju Peter',
  role: 'Creative Developer',
  /** Contact-form messages are delivered here (via FormSubmit). Leave empty to hide the form's send action. */
  email: 'usijup3@gmail.com',
  cv: '/cv/usiju-peter-cv.pdf',
  socials: {
    linkedin: 'https://www.linkedin.com/in/usiju-peter-115052235/',
    x: 'https://x.com/Usiju_2004',
  },
  headline: 'Creative developer crafting clear, considered websites.',
  intro: 'I’m Usiju, a creative developer crafting clear, considered websites and digital experiences that move with purpose.',
  about: [
    'What I enjoy most is the point where thoughtful design meets technology that works properly.',
    'I believe the smallest details often make the biggest difference — from how a page moves to how naturally someone finds what they’re looking for.',
    'I’m always exploring new ways to make the web more intuitive, expressive, and enjoyable.',
  ],
  skills: ['Frontend development', 'Creative web design', 'Responsive interfaces', 'Motion & interaction', 'User experience', 'Website optimization'],
};

export type Project = {
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string;
  live: string;
  highlights: string[];
};

export const projects: Project[] = [
  { slug: '444-premium', title: '4:44 Premium Solutions', category: 'Interior design / Web experience', description: 'A refined digital experience for an interior design and premium property solutions brand.', image: '444-premium', live: 'https://interiordesignpreview.vercel.app/', highlights: ['Editorial-led browsing', 'Atmospheric premium presentation', 'A clear invitation to explore'] },
  { slug: 'mykaab', title: 'MyKaab', category: 'Mobility / Platform website', description: 'A mobility platform website presenting a driver-first approach to transportation in Nigeria.', image: 'mykaab', live: 'https://mykaab.com.ng/', highlights: ['Product-forward structure', 'Clear service hierarchy', 'Built around movement and access'] },
  { slug: 'ubbcakes', title: 'UbbCakes', category: 'E-commerce / Bakery website', description: 'A warm, visually engaging bakery experience showcasing handcrafted cakes.', image: 'ubbcakes', live: 'https://ubbcakes.vercel.app/', highlights: ['Sensory product storytelling', 'Inviting product presentation', 'Clear ordering pathways'] },
];
