with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# 1. Add scrollOffset
content = content.replace(
    "const [uiState, setUiState] = useState({",
    "const [uiState, setUiState] = useState({\n    scrollOffset: 0,"
)

# 2. Reset scrollOffset on navigation
content = content.replace("navPath: newPath }", "navPath: newPath, scrollOffset: 0 }")
content = content.replace("navPath: [newPath[0], 0] }", "navPath: [newPath[0], 0], scrollOffset: 0 }")
content = content.replace("navPath: [newPath[0]] }", "navPath: [newPath[0]], scrollOffset: 0 }")
content = content.replace("navPath: [rowIdx, 0], focusDepth: 0 }", "navPath: [rowIdx, 0], focusDepth: 0, scrollOffset: 0 }")
content = content.replace("navPath: [rowIdx], focusDepth: 0 }", "navPath: [rowIdx], focusDepth: 0, scrollOffset: 0 }")
content = content.replace("navPath: s.navPath.slice(0, s.focusDepth) }", "navPath: s.navPath.slice(0, s.focusDepth), scrollOffset: 0 }")

# 3. Add onWheel
wheel_target = "onPointerDown={(e) => handlePointerInteraction(e, true)}"
wheel_new = """onWheel={(e) => {
          if (!uiState.settingsOpen) {
            setUiState(s => ({ ...s, scrollOffset: Math.max(0, s.scrollOffset + (e.deltaY > 0 ? 1 : -1)) }));
          }
        }}
        onPointerDown={(e) => handlePointerInteraction(e, true)}"""
content = content.replace(wheel_target, wheel_new)

# 4. Update the drawing logic for page (EXPERIENCE)
start_page = "if (rootNode.content) {\n                let currentY = 12; // Start immediately after divider"
end_page = "            }"

new_page = """if (rootNode.content) {
                const allLines: string[] = [];
                rootNode.content.forEach((rawLine: string) => {
                    const wrapped = wrapText(rawLine, previewW - 5);
                    allLines.push(...wrapped);
                });
                const maxVisible = 14;
                const maxScroll = Math.max(0, allLines.length - maxVisible);
                const scroll = Math.min(uiState.scrollOffset, maxScroll);
                for (let i = 0; i < maxVisible && i + scroll < allLines.length; i++) {
                    writeUI(colW + 2, 12 + i, allLines[i + scroll], 0);
                }
                if (maxScroll > 0) {
                    const sbH = maxVisible;
                    const sbThumbH = Math.max(1, Math.floor(sbH * (maxVisible / allLines.length)));
                    const sbThumbY = Math.floor((sbH - sbThumbH) * (scroll / maxScroll));
                    for (let i = 0; i < sbH; i++) {
                        const isThumb = i >= sbThumbY && i < sbThumbY + sbThumbH;
                        writeUI(COLS - 2, 12 + i, isThumb ? '█' : '│', 1);
                    }
                }
            }"""

if start_page in content:
    idx1 = content.find(start_page)
    idx2 = content.find(end_page, idx1 + len(start_page)) + len(end_page)
    content = content[:idx1] + new_page + content[idx2:]

# 5. Update the drawing logic for projects
start_proj = "// Wrap the description text"
end_proj = "writeUI(detailX + 2, currentY, `Stack: ${projectNode.lang}  |  Links: ${projectNode.links || ''}`, 0);"

new_proj = """// Wrap the description text
                    const allLines: string[] = [];
                    const rawDescLines = projectNode.desc.split('\\n');
                    rawDescLines.forEach((rawLine: string) => {
                        const wrapped = wrapText(rawLine, detailW - 5);
                        allLines.push(...wrapped);
                    });
                    allLines.push(`Stack: ${projectNode.lang}  |  Links: ${projectNode.links || ''}`);

                    const maxVisible = 26 - (12 + boxH + 1);
                    const maxScroll = Math.max(0, allLines.length - maxVisible);
                    const scroll = Math.min(uiState.scrollOffset, maxScroll);
                    const currentY = 12 + boxH + 1;
                    
                    for (let i = 0; i < maxVisible && i + scroll < allLines.length; i++) {
                        writeUI(detailX + 2, currentY + i, allLines[i + scroll], 0);
                    }
                    if (maxScroll > 0) {
                        const sbH = maxVisible;
                        const sbThumbH = Math.max(1, Math.floor(sbH * (maxVisible / allLines.length)));
                        const sbThumbY = Math.floor((sbH - sbThumbH) * (scroll / maxScroll));
                        for (let i = 0; i < sbH; i++) {
                            const isThumb = i >= sbThumbY && i < sbThumbY + sbThumbH;
                            writeUI(COLS - 2, currentY + i, isThumb ? '█' : '│', 1);
                        }
                    }"""

if start_proj in content:
    idx1 = content.find(start_proj)
    idx2 = content.find(end_proj, idx1 + len(start_proj)) + len(end_proj)
    content = content[:idx1] + new_proj + content[idx2:]


# 6. Update CV Content
cv_target = """  {
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
  },"""

new_cv = """  {
    name: '02. EXPERIENCE',
    type: 'page',
    content: [
      "IDENTITY",
      "Muhammad Nawfal Aleem Jaffri",
      "nawfaljaffri@gmail.com | linkedin.com/in/nawfaljaffri | +971 50 4945990",
      "",
      "EDUCATION",
      "University Of Birmingham: BSc. Artificial Intelligence and Computer Science (01/2025-06/2028)",
      "Language Proficiency: IELTS 8.5/9 Band - C2 CEFR Level (06/2024)",
      "",
      "PROFESSIONAL EXPERIENCE",
      "Susty (Dubai, UAE) | Application Content Developer (05/2025-Present)",
      "- Developed over 70+ interactive sustainability experiences.",
      "- Increased new users by 53% and engagement by 48%.",
      "- Collaborated with 40+ local brands, partners, and universities.",
      "",
      "AIESEC in UAE (Abu Dhabi) | Marketing Local Vice President (05/2026-Present)",
      "- Host workshops on Branding, Marketing, & Graphic Design.",
      "- Led the state-level rebranding of the organization.",
      "",
      "University Of Birmingham Dubai | Founder & VP, Food and Health Society (09/2025-Present)",
      "- Led first-of-its-kind campus event: 500+ tickets sold, 10,000+ AED earned.",
      "- Managed marketing, finance, communications, design, and business development.",
      "",
      "University Of Birmingham Dubai | Lead Graphic Designer, Student Association (09/2025-Present)",
      "- Managed social media marketing and designed posters for all university events.",
      "",
      "Alyx Society (Dubai, UAE) | Director of Event Management (10/2023-11/2024)",
      "- Secured partnerships with GITEX, Unipreneur Inc, and AIESEC.",
      "- Handled logistics, staffing, finance, branding, and social media strategies.",
      "- Streamlined recruitment by screening 50+ applicants and conducting interviews.",
      "",
      "Alyx Society (Dubai, UAE) | Media and Marketing Co-Head (04/2023-10/2023)",
      "- Drafted/presented event proposals with Indus Hospital for cancer patient fundraising.",
      "- Led brand design & content creation, resulting in 121,000+ views (783% increase), 450+ applications, and 40,000 AED in sponsorship funding.",
      "",
      "Unipreneur Inc. (Dubai, UAE) | Event Co-ordinator & Ambassador (10/2023-12/2024)",
      "- Co-led management & Emcee hosted at Logimotion'24 (DWTC).",
      "- Youth speaker at AIIC (GETEX '24) and MUN Roundtable Speaker (GITEX '23).",
      "",
      "QuixMun (Dubai, UAE) | Head of Business Development (08/2023-06/2024)",
      "- Developed brand USP, rules of procedure, and departmental setup.",
      "- Secured 800+ applications (435% above cap) and raised 1,200 AED for charity.",
      "",
      "AWARDS, PARTICIPATION & VOLUNTEERING",
      "Bread - Project Aizah: UI & UX Designer (Antler)",
      "Nikon Green Film Festival Dubai: 1st Place",
      "Google Developers Club UOBD: Lead Organizer",
      "AsiesMun'24: Best Head Chair and Committee (UNESCO)",
      "AuschoolMun'24: Best Delegate (UNEP)",
      "WsdMun'23: Best Speaker (DISEC)",
      "Emirates Literature Foundation LitFest: Volunteer",
      "Arab Unity School: Economics Student Teacher"
    ]
  },"""
content = content.replace(cv_target, new_cv)

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)
print("done")
