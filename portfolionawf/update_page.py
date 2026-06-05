import sys

with open('app/coding/page.tsx', 'r') as f:
    text = f.read()

start = text.find("export default function WebGLTerminalPage()")

page_text = text[start:].strip()

imports = """'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { THEMES, FONTS, PROJECTS } from './constants'
import { CRTScreen } from './CRTScreen'

"""

with open('app/coding/page.tsx', 'w') as f:
    f.write(imports + page_text + "\n")

