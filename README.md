# Log Viewer

A modern, high-performance web dashboard engineered to parse, index, and view operational server logs. Built using **Next.js** and structured strictly according to **Clean Architecture** patterns to ensure decoupled core business domains, reliable state tracking, and isolated presentation layers.

---

## 🏗️ Architecture & Directory Structure

The project decouples business rules from external UI frameworks or databases by separating features into bounded context models.

Here is how our feature layout maps directly across the workspace:

```text
features/
└── drawer/                             # Core UI Navigation & Log Index Domain
    ├── domain/                         # Enterprise Domain Rules
    │   ├── model/                      # Immutable Pure Types & Entities (LogSession, LogDate)
    │   ├── repository/                 # Repository Abstract Contracts / Interfaces
    │   └── usecase/                    # Pure Single-Responsibility Business Actions
    ├── data/                           # Data Access & Operations Layer
    │   └── repository/                 # Infrastructure implementations
    ├── di/                             # Dependency Injection Module Containers
    └── presentation/                   # Frontend UI Component Layer
        ├── components/                 # Isolated Presentation Sub-layouts (React Components)
        ├── drawer-screen-state.ts      # ViewModel Reactive Core State Blueprints
        └── drawer-screen-viewmodel.ts  # Zustand Store Managing Component Reactive Flows

```

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have Node.js installed on your machine matching our CI target environment:

- **Node.js:** `^20.x.x`
- **Package Manager:** `npm`

### 2. Setup & Installation

Install all project dependencies matching the strict lockfile graph:

```bash
npm ci
```

### 3. Spin Up Local Environment

Launch the development server on your machine:

```bash
npm run dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to explore the log workspace interface.

---

## 🧪 Testing and Quality Control

We enforce rigorous test coverage standards across both business logic and user interface interaction matrices.

### Run Code Linter & Formatters

Check and fix stylistic rules instantly using ESLint 10 (Flat Config) and Prettier:

```bash
npm run lint
```

### Run All Unit & UI Tests

Execute our entire Jest and React Testing Library (RTL) validation suites:

```bash
npm run test
```

### Run Background Watch Mode

To keep a persistent test runner panel active during development:

```bash
npm run test:watch
```

### 📊 Code Coverage & Quality Gates

Our system uses native Jest coverage configurations to act as a quality gateway. We enforce a **strict baseline requirement** directly on all changes. If code edits drop total coverage values below these markers, Jest exits with an error status and prevents commits:

- **Lines:** 85% minimum
- **Branches:** 80% minimum
- **Functions:** 85% minimum

To compile the latest testing data report on your machine, run:

```bash
npm run test:coverage
```

#### Visualizing Coverage in the Editor

1. Install the **Coverage Gutters** extension in VS Code.
2. Run `npm run test:coverage` to update your report file.
3. Click **"Watch"** in the blue bottom status bar of VS Code to display inline green (covered) and red (uncovered) indicators directly inside your active source code files.

---

## 🔀 Continuous Integration (CI)

Every time code is pushed or a Pull Request is submitted targeting the `main` branch, an automated **GitHub Actions Pipeline** executes on a virtual Ubuntu cluster runner. The workflow executes these verification steps sequentially:

1. **Environment Initialization:** Boots a secure Node.js 20 runner box and restores dependency memory caches.
2. **Quality Verification:** Runs the project linters to ensure code consistency.
3. **Build Compilation:** Bundles and transpiles the code to catch any hidden TypeScript syntax conflicts or compiler issues.
4. **Coverage Evaluation:** Runs our full test catalog with the strict coverage gates activated.

If any stage fails, the pipeline will halt immediately and prevent deployment.
