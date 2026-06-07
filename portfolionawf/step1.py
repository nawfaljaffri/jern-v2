import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

new_dir = """const DIRECTORY: any[] = [
  {
    name: '01. PROJECTS',
    type: 'folder',
    children: [
      {
        name: 'neural-net-arch',
        type: 'project',
        date: '2024-03-15',
        lang: 'Python / PyTorch',
        status: 'ONLINE',
        desc: 'Neural architecture search experiments.\\nExplores evolutionary algorithms to\\noptimize network topologies for low-power\\nedge devices.',
        links: '[GitHub] [Live Demo]'
      },
      {
        name: 'noter-app',
        type: 'project',
        date: '2024-01-20',
        lang: 'TypeScript / React',
        status: 'DEPRECATED',
        desc: 'A minimal note-taking PWA.\\nFeatures offline-first sync using IndexedDB\\nand CRDTs for conflict resolution.',
        links: '[GitHub]'
      },
      {
        name: 'portfolio-site',
        type: 'project',
        date: '2024-06-01',
        lang: 'Next.js / WebGL',
        status: 'ACTIVE',
        desc: 'This very website. Swiss Punk graphic\\ndesign meets high-performance React\\narchitecture.',
        links: '[GitHub]'
      },
      {
        name: 'game-engine',
        type: 'project',
        date: '2024-04-10',
        lang: 'C++ / OpenGL',
        status: 'ARCHIVED',
        desc: 'Custom 2D game engine built from scratch.\\nImplements an Entity Component System (ECS)\\nand custom physics solvers.',
        links: '[GitHub]'
      }
    ]
  },
  {
    name: '02. EXPERIENCE',
    type: 'page',
    content: [
      'IDENTITY',
      'Muhammad Nawfal Aleem Jaffri',
      'nawfaljaffri@gmail.com | linkedin.com/in/nawfaljaffri | +971 50 4945990',
      '',
      'EDUCATION',
      'University Of Birmingham: BSc. Artificial Intelligence and Computer Science (01/2025)',
      'Language Proficiency: IELTS 8.5/9 Band - C2 CEFR Level (06/2024)',
      '',
      'PROFESSIONAL EXPERIENCE',
      'Susty (Dubai, UAE) | Application Content Developer (05/2025-Present)',
      '- Developed over 70+ interactive sustainability experiences.',
      '- Increased new users by 53% and engagement by 48%.',
      '- Collaborated with 40+ local brands, partners, and universities.'
    ]
  },
  {
    name: '03. ABOUT',
    type: 'page',
    content: [
      'I am a 1st-year AI and Computer Science student at the',
      'University of Birmingham Dubai. My work is defined by',
      'a hybrid methodology: the logical rigor of artificial',
      'intelligence and the emotional resonance of graphic design.',
      '',
      'Whether I am leading a team as a Vice President at AIESEC,',
      'leading the google developers group at Uni of Birmingham',
      'Dubai, or Teaching people, I am driven by the same goal:',
      'turning abstract data into meaningful human experiences.'
    ]
  },
  {
    name: '04. CONTACT',
    type: 'page',
    content: [
      'Email: nawfaljaffri@gmail.com',
      'LinkedIn: linkedin.com/in/nawfaljaffri',
      'GitHub: github.com/nawfaljaffri',
      'Phone: +971 50 4945990',
      '',
      'Available for freelance projects, open source collaboration,',
      'and full-time internships.'
    ]
  }
];"""
dir_match = re.search(r'const DIRECTORY: any\[\] = \[.*?\];', content, re.DOTALL)
if dir_match:
    content = content[:dir_match.start()] + new_dir + content[dir_match.end():]
    with open('app/coding/page.tsx', 'w') as f:
        f.write(content)
    print("Step 1 done")
else:
    print("Step 1 failed")
