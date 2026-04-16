from pathlib import Path

path = Path("src/components/header/NotificationDropdown.tsx")
text = path.read_text(encoding="utf-8")

broken = '''</span>
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      Projeto - Obra Integrada
                  <span>Project</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>5 min ago</span>'''
fixed = '''</span>
                  <span className="font-medium text-gray-800 dark:text-white/90">
                    Projeto - Obra Integrada
                  </span>
                </span>

                <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                  <span>Projeto</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>5 min atrás</span>
                </span>'''

if broken in text:
    text = text.replace(broken, fixed)

replacements = {
    'requests permission to change': 'solicitou alteração em',
    'Project - Nganter App': 'Projeto - Obra Integrada',
    '<span>Project</span>': '<span>Projeto</span>',
    '5 min ago': '5 min atrás',
    '8 min ago': '8 min atrás',
    '15 min ago': '15 min atrás',
    '1 hr ago': '1 h atrás',
}

for old, new in replacements.items():
    text = text.replace(old, new)

path.write_text(text, encoding="utf-8")
print("updated", path)
