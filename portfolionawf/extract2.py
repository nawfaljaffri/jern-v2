import sys

with open('app/coding/page.tsx', 'r') as f:
    text = f.read()

start = text.find("function CRTScreen({")
end = text.find("export default function WebGLTerminalPage()")

crt_screen_text = text[start:end].strip()

imports = """'use client'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { Effects } from '@react-three/drei'
import * as THREE from 'three'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass'

extend({ ShaderPass, UnrealBloomPass, AfterimagePass })

import { THEMES, FONTS, PROJECTS, SNAKE_COLORS, getRandomSnakeColor } from './constants'
import TextBuffer from './TextBuffer'
import { CRTShader } from './CRTShader'

export """

with open('app/coding/CRTScreen.tsx', 'w') as f:
    f.write(imports + crt_screen_text)

