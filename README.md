# Campus Lost & Found Board

A small **dynamic web application** built for the Cloud Computing and DevOps (CSE30040) CCA-2 individual assessment.

Students can report lost or found items through a form. The home page is **server-rendered** from in-memory data on every request. The app includes automated tests, ESLint, a Docker image, and a full GitHub Actions CI/CD pipeline that deploys to Render only when all checks pass.

---

## Features (minimum required + extras)

| Feature | Implemented |
|---------|-------------|
| Home page showing data from the server | ✅ Lost & Found lists + live counters |
| Form that adds new data (POST) with validation | ✅ Title, description, type, contact |
| JSON API route | ✅ `GET /api/items` |
| `/health` route | ✅ `{"status":"ok","commit":"..."}` |
| Footer showing running commit ID | ✅ Reads `RENDER_GIT_COMMIT` / `GIT_SHA` |
| At least 3 automated tests | ✅ Health, create + list, invalid input |
| Lint | ✅ ESLint |
| Docker | ✅ Multi-stage ready Dockerfile |
| GitHub Actions CI/CD | ✅ Lint → Test → Docker build + smoke → Deploy |

---

## Tech stack

- **Runtime:** Node.js 20+ / 22
- **Framework:** Express
- **Tests:** built-in `node:test`
- **Lint:** ESLint 9
- **Container:** Docker
- **CI/CD:** GitHub Actions
- **Hosting:** Render (free tier)

---

## Project structure

```
campus-lost-found/
├── .github/workflows/ci-cd.yml   # CI/CD pipeline
├── test/app.test.js              # Automated tests
├── app.js                        # Express routes & logic
├── server.js                     # Entry point
├── Dockerfile
├── eslint.config.js
├── package.json
├── .gitignore
└── README.md
```

---

## Run locally

```bash
# 1. Install dependencies
npm install

# 2. Run tests
npm test

# 3. Run lint
npm run lint

# 4. Start the server
npm start
# Open http://localhost:3000
```

### Docker (optional but recommended)

```bash
docker build -t campus-lost-found .
docker run -p 3000:3000 campus-lost-found
```

---

## Git workflow (as required by the assignment)

```bash
git init -b main
echo "node_modules/" > .gitignore   # already present
git add .
git commit -m "feat: initial dynamic Lost & Found app with tests"

# Create GitHub repo (public) under YOUR account, then:
git remote add origin https://github.com/<your-username>/campus-lost-found.git
git push -u origin main

# For every new feature use a branch + PR:
git checkout -b feature/add-search
# ... make changes, run tests ...
git add . && git commit -m "feat: add search box"
git push -u origin feature/add-search
# Open Pull Request on GitHub → wait for green checks → Merge
```

You need **at least 10 meaningful commits** and **1 merged pull request**.

---

## CI/CD pipeline (GitHub Actions)

**File:** `.github/workflows/ci-cd.yml`

| Stage | What it does | Runs on |
|-------|--------------|---------|
| **test** | `npm ci` → lint → `npm test` | Every push & PR |
| **build** | Docker build + smoke test (`/health`) | After test passes |
| **deploy** | Triggers Render Deploy Hook | Push to `main` only |

### Render setup (one-time)

1. Go to [render.com](https://render.com) → New → **Web Service**.
2. Connect your GitHub repository.
3. Settings:
   - **Language:** Docker (or Node)
   - **Build command (Node):** `npm ci`
   - **Start command (Node):** `node server.js`
   - **Auto-Deploy:** **Off** (the pipeline deploys instead)
   - **Health check path:** `/health`
4. After the service is created, open **Settings → Deploy Hook** and copy the URL.
5. In GitHub → **Settings → Secrets and variables → Actions** add a secret:
   - Name: `RENDER_DEPLOY_HOOK`
   - Value: the Deploy Hook URL you copied.
6. Push to `main` and watch the **Actions** tab.

Render automatically injects `RENDER_GIT_COMMIT`. The workflow also sends `&ref=<commit>` so the exact commit that passed tests is deployed. The footer on the live site shows the short commit ID.

---

## Prove the pipeline works (required screenshots)

1. **Failure demo**  
   On a branch, deliberately break a test (e.g. change an assertion), push, open a PR.  
   Screenshot the **red** run – the deploy job must be skipped.

2. **Success demo**  
   Fix the test, merge to `main`.  
   Screenshot the **green** run (all jobs green).

3. **Live site**  
   Open the live URL and screenshot the page showing the **same commit ID** that appears in the latest green run footer.

---

## Pipeline diagram (for your report)

```
Git push / PR
     │
     ▼
┌─────────────┐
│  Lint + Test│  (CI – every push & PR)
└──────┬──────┘
       │ pass
       ▼
┌─────────────┐
│ Docker Build│  + smoke test /health
│  + Smoke    │
└──────┬──────┘
       │ pass  (and only on main push)
       ▼
┌─────────────┐
│   Deploy    │  curl Render Deploy Hook
└──────┬──────┘
       │
       ▼
   Live site (footer shows commit)
```

---

## What to submit (checklist)

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Public GitHub repo (own account, ≥10 commits + 1 merged PR) | You do this |
| 2 | Live application URL (footer shows commit ID) | After Render deploy |
| 3 | `.github/workflows/ci-cd.yml` present | ✅ in this repo |
| 4 | Screenshot: successful (green) pipeline | You capture |
| 5 | Screenshot: failed pipeline (deploy skipped) | You capture |
| 6 | Screenshot: live site with matching commit ID | You capture |
| 7 | README.md | ✅ this file |
| 8 | Short report PDF (4–6 pages) | You write using the structure in the assignment |

---

## Report structure reminder

1. Title page (student details table)
2. Problem statement and features
3. Architecture and pipeline diagram
4. Explanation of each pipeline stage (with screenshots)
5. Failure demo and how the pipeline prevented a bad deploy
6. Challenges faced and what you learned
7. Links: repository, live site, Actions page

**File name:** `CCA2_<PRN>_<StudentName>.pdf`

---

## Viva preparation (quick answers)

1. **CI vs CD** – CI = every push is automatically linted & tested. CD = code that passes on `main` is released automatically.
2. **`needs:`** – makes a job wait for another job; if the dependency fails, later jobs are skipped.
3. **Deploy URL as secret** – prevents anyone from triggering your production deploy.
4. **One test fails** – the `test` job fails → `build` and `deploy` are skipped.
5. **Rollback** – `git revert <bad-commit>` or redeploy a previous commit via the Deploy Hook.
6. **Why Docker** – same environment locally, in CI, and on the server; no “works on my machine” issues.

---

## Common mistakes already avoided in this project

- `node_modules` is in `.gitignore`
- Deploy hook is stored as a GitHub Secret (never hard-coded)
- At least 3 real tests
- Deploy job has `needs: build` and only runs on `main` push
- App reads `PORT` from the environment
- Auto-Deploy on Render must be turned **Off** by you

---

Made for **MIT World Peace University – Cloud Computing and DevOps (CSE30040) – CCA 2 Individual Submission**.
