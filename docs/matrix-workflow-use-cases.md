# Matrix Strategy: Use Cases & Documentation

This document explains **why** and **how** we use a matrix in our GitHub Actions workflow, with examples you can reuse.

---

## Table of contents

1. [What is a matrix?](#what-is-a-matrix)
2. [Use cases for matrix builds](#use-cases-for-matrix-builds)
3. [Our workflow: Node.js matrix](#our-workflow-nodejs-matrix)
4. [Examples](#examples)
5. [Options and tips](#options-and-tips)

---

## What is a matrix?

A **matrix** in GitHub Actions lets you run the **same job multiple times** with different values (e.g. different Node.js versions, OSes, or environment variables). Instead of copying the same steps into several jobs, you define one job and a set of values; GitHub runs one job per combination.

**Benefits:**

- **Compatibility** – Ensure your app works on every Node version (or OS) you care about.
- **Less duplication** – One job definition, many runs.
- **Parallel runs** – Matrix jobs run in parallel (within limits), so feedback is fast.

---

## Use cases for matrix builds

| Use case | What you vary | Why |
|----------|----------------|-----|
| **Node/version compatibility** | `node-version: [18.x, 20.x, 22.x]` | Support LTS and current; catch version-specific bugs. |
| **Operating systems** | `os: [ubuntu-latest, windows-latest, macos-latest]` | Ensure code works on Linux, Windows, and macOS. |
| **Package manager** | `pm: [npm, yarn, pnpm]` | Support different ways users install dependencies. |
| **Environment / config** | `env: [development, staging, production]` | Test with different env vars or configs. |
| **Python/Ruby/etc.** | `python-version: [3.9, 3.10, 3.11]` | Same idea as Node for other runtimes. |

Our workflow focuses on **Node.js version compatibility**.

---

## Our workflow: Node.js matrix

**File:** `.github/workflows/nodejs-matrix.yml`

### What it does

On every push to `main`, the **validate** job runs **four times** in parallel, once per Node version:

- Node **18.x** (LTS)
- Node **20.x** (LTS)
- Node **22.x** (Current)
- Node **24.x** (Current)

Each run:

1. Checks out the repo
2. Sets up the matrix Node version
3. Installs dependencies with `npm ci`
4. Runs the linter (`npm run lint`)
5. Starts the server and hits `/version` and `/check`

So we **validate** the app on multiple Node versions in one workflow.

### Relevant snippet

```yaml
strategy:
  fail-fast: false   # if one version fails, others still run
  matrix:
    node-version: [18.x, 20.x, 22.x, 24.x]
# ...
- name: Use Node.js ${{ matrix.node-version }}
  uses: actions/setup-node@v4
  with:
    node-version: ${{ matrix.node-version }}
```

`matrix.node-version` is the variable that changes per job; we pass it into `setup-node` and use it in the job name in the Actions UI.

---

## Examples

### Example 1: Single dimension (what we use)

One variable, several values. One job per value.

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```

Result: 3 jobs (Node 18, 20, 22).

---

### Example 2: Multiple dimensions (Node × OS)

Two variables. Jobs run for **every combination**.

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
    os: [ubuntu-latest, windows-latest]
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
runs-on: ${{ matrix.os }}
```

Result: 4 jobs (2 Node × 2 OS).

---

### Example 3: Exclude specific combinations

Use `exclude` to skip combinations you don’t need.

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]
    os: [ubuntu-latest, windows-latest]
    exclude:
      - node-version: 22.x
        os: windows-latest   # don’t run Node 22 on Windows
```

---

### Example 4: Include extra combinations

Use `include` to add specific combinations (e.g. one “allow failure” job).

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
    include:
      - node-version: 24.x
        experimental: true
```

Then in a step you can use `if: matrix.experimental != 'true'` to skip heavy checks on the experimental run, or mark it as allowed to fail.

---

### Example 5: Dynamic matrix from output

You can build the matrix from a script (e.g. “supported” versions from a config file).

```yaml
jobs:
  prepare:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.set-matrix.outputs.matrix }}
    steps:
      - id: set-matrix
        run: |
          echo 'matrix={"node-version":["18.x","20.x"]}' >> $GITHUB_OUTPUT
  validate:
    needs: prepare
    strategy:
      matrix: ${{ fromJson(needs.prepare.outputs.matrix) }}
    # ... same steps as before
```

(Our workflow doesn’t need this; it’s for when versions are defined elsewhere.)

---

## Options and tips

### `fail-fast`

- **`fail-fast: true`** (default): If one matrix job fails, the rest are cancelled.
- **`fail-fast: false`**: All matrix jobs run to completion even if one fails. We use this so we see results for every Node version.

### Naming jobs in the UI

You can give each matrix run a readable name:

```yaml
jobs:
  validate:
    name: Node ${{ matrix.node-version }}
    strategy:
      matrix:
        node-version: [18.x, 20.x]
```

### Max parallel jobs

GitHub has limits on concurrent jobs per plan. Large matrices (e.g. 10 versions × 3 OSes) may be throttled; you can split into multiple workflows or reduce combinations if needed.

### When to use a matrix

- **Use:** Testing compatibility (runtimes, OSes, package managers, envs).
- **Avoid:** Using matrix only to run the same job 10 times with the same inputs; that just burns minutes.

---

## Summary

| Item | In this repo |
|------|----------------------|
| **What we matrix** | Node.js version (`18.x`, `20.x`, `22.x`, `24.x`) |
| **Why** | Ensure the app runs on current and LTS Node versions |
| **Where** | `.github/workflows/nodejs-matrix.yml` |
| **Strategy** | `fail-fast: false` so all versions are tested even if one fails |

For more on matrix syntax, see [GitHub’s documentation](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstrategymatrix).
