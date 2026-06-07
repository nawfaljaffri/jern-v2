with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

start = content.find("const [uiState, setUiState] = useState<UIState>({")
end = content.find("const getBar = (pct: number, width: number) => {")
print(content[start:end])
