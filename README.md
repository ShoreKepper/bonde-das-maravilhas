# 🎉 Bonde das Maravilhas

Agenda compartilhada do grupo para organizar e programar rolês.

## Stack
- **React + Vite** — frontend
- **Framer Motion** — animações
- **Supabase** — banco de dados + realtime
- **GitHub Pages** — hospedagem

---

## ⚙️ Setup local

### 1. Clone e instale dependências
```bash
git clone https://github.com/SEU_USUARIO/bonde-das-maravilhas.git
cd bonde-das-maravilhas
npm install
```

### 2. Configure o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Crie um novo projeto
3. Vá em **SQL Editor** e cole todo o conteúdo do arquivo `src/lib/schema.sql`
4. Rode o SQL para criar as tabelas
5. Vá em **Settings → API** e copie:
   - `Project URL`
   - `anon public` key

### 3. Crie o arquivo `.env.local`
```bash
cp .env.example .env.local
```
Abra `.env.local` e preencha:
```
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyXXXXXXXXXXXXXXXXXX
```

### 4. Rode localmente
```bash
npm run dev
```
Acesse `http://localhost:5173/bonde-das-maravilhas/`

---

## 🚀 Deploy no GitHub Pages

### 1. Crie o repositório no GitHub
- Nome: `bonde-das-maravilhas` (deve bater com o `base` no `vite.config.js`)

### 2. Adicione as secrets do Supabase no GitHub
- Vá em **Settings → Secrets and variables → Actions**
- Adicione:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### 3. Crie o workflow de deploy
Crie o arquivo `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 4. Ative o GitHub Pages
- Vá em **Settings → Pages**
- Source: `Deploy from a branch`
- Branch: `gh-pages`

Após o primeiro push na `main`, o site estará em:
`https://SEU_USUARIO.github.io/bonde-das-maravilhas/`

---

## 👥 Membros

| Nome | Personagem | Cor |
|------|-----------|-----|
| João Pedro | Patolino | Azul |
| Luís Felipe | McQueen | Vermelho |
| José Felype | Kirito | Azul escuro |
| Nauane | Barbie | Rosa |
| Tatiane | Bibble | Lilás |
| Aryane | Pernalonga | Cinza |

---

## ✨ Funcionalidades

- 📅 Calendário mensal com navegação animada
- 🎉 Criação de rolês com título, horário, local e notas
- ✅ Confirmação de presença por membro (avatar animado)
- 🎊 Confetti quando todo mundo confirma!
- 💬 Comentários em tempo real
- 🔥 Reações nos comentários
- 📡 Realtime — atualizações instantâneas para todo o grupo
- 💾 Status do rolê: Ideia → Confirmado → Aconteceu
