import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# 1. Update DIRECTORY: Merge HOME and ABOUT, and remove old ABOUT.
old_dir = """const DIRECTORY: any[] = [
  {
    name: '01. HOME',
    type: 'page',
    content: [
      'Currently navigating the intersection of machine learning,',
      'data, management, and branding. I build systems that',
      'bridge the gap between algorithmic precision and',
      'human-centric design.',
      '',
      'Status: Online',
      'Primary Focus: Data Science & AI Engineering,',
      'Brand Architecture, UI/UX Design.'
    ]
  },
  {
    name: '02. EXPERIENCE',"""

new_dir = """const DIRECTORY: any[] = [
  {
    name: '01. ABOUT',
    type: 'page',
    content: [
      'Currently navigating the intersection of machine learning,',
      'data, management, and branding. I build systems that',
      'bridge the gap between algorithmic precision and',
      'human-centric design.',
      '',
      'I am a 1st-year AI and Computer Science student at the',
      'University of Birmingham Dubai. My work is defined by',
      'a hybrid methodology: the logical rigor of artificial',
      'intelligence and the emotional resonance of graphic design.',
      '',
      'Whether I am leading a team as a Vice President at AIESEC,',
      'leading the Google Developers Group at Uni of Birmingham',
      'Dubai, or teaching people, I am driven by the same goal:',
      'turning abstract data into meaningful human experiences.',
      '',
      'Status: Online',
      'Primary Focus: Data Science & AI Engineering,',
      'Brand Architecture, UI/UX Design.'
    ]
  },
  {
    name: '02. EXPERIENCE',"""

content = content.replace(old_dir, new_dir)

# Remove old ABOUT
old_about = """  {
    name: '05. ABOUT',
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
"""

content = content.replace(old_about, "")

# 2. Change unselected tabs to color 0
old_tabs = """        let color = 1;
        if (isHovered || (isSelected && uiState.focusColumn === 1)) color = 2;
        else if (isSelected) color = 0;"""

new_tabs = """        let color = 0; // Use bright foreground for unselected to make it prominent
        if (isHovered || (isSelected && uiState.focusColumn === 1)) color = 2;
        else if (isSelected) color = 0;"""

content = content.replace(old_tabs, new_tabs)

# 3. Move [ CREATIVE / ENGINEER ]
old_subtitle = """writeUI(40, 4, "[ CREATIVE / ENGINEER ]", 1);"""
new_subtitle = """writeUI(2, 6, "[ CREATIVE / ENGINEER ]", 1);"""
content = content.replace(old_subtitle, new_subtitle)

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)

print("Patch 7 applied.")
