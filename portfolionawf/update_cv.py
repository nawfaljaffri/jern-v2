import json

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# We need to replace the EXPERIENCE content array
start_str = """  {
    name: '02. EXPERIENCE',
    type: 'page',
    content: ["""
end_str = """    ]
  },"""

start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx) + len(end_str)

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

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_cv + content[end_idx:]

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)
print("done")
