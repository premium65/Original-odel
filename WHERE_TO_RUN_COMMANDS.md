# 📍 WHERE TO RUN COMMANDS

## Quick Answer

**Run `npm run dev` from the project root directory where `package.json` is located.**

---

## Visual Guide

### Your Computer Directory Structure

```
💻 YOUR COMPUTER
│
├── 📁 Documents/
│   ├── 📁 Photos/
│   ├── 📁 Work/
│   └── 📁 Projects/
│       │
│       ├── 📁 my-website/
│       ├── 📁 todo-app/
│       └── 📁 Original-odel/    ← THIS IS THE PROJECT ROOT
│           │
│           ├── 📄 package.json   ← This file marks the root
│           ├── 📄 README.md
│           ├── 📁 server/
│           ├── 📁 client/
│           ├── 📁 shared/
│           └── 📁 [other files]
│
└── [other folders]
```

### Where You Should Be

```
✅ CORRECT LOCATION (Project Root):
   /Documents/Projects/Original-odel/
   
   Files you see here:
   - package.json  ← KEY FILE - must be present
   - server/
   - client/
   - README.md
   
   Commands work: ✅
   npm run dev    ✅
   npm install    ✅

❌ WRONG LOCATION (Subfolder):
   /Documents/Projects/Original-odel/server/
   
   You're inside a subfolder!
   Commands will fail: ❌
   
   Solution: Go up one level
   cd ..
```

---

## Step-by-Step: How to Get There

### Method 1: Navigate from Scratch

```bash
# 1. Open Terminal/Command Prompt

# 2. Navigate to your projects folder
cd ~/Documents/Projects/

# 3. List available projects
ls
# You should see: Original-odel

# 4. Enter the project
cd Original-odel

# 5. Verify you're in the right place
ls package.json
# Should show: package.json

# 6. Now run commands!
npm run dev
```

### Method 2: Direct Path

```bash
# If you know the full path, go directly:
cd /full/path/to/Original-odel

# For example:
cd /home/user/Documents/Projects/Original-odel
# or
cd C:\Users\YourName\Documents\Projects\Original-odel

# Verify
ls package.json

# Run command
npm run dev
```

### Method 3: From File Explorer

**Windows:**
1. Navigate to `Original-odel` folder in File Explorer
2. Click in the address bar
3. Type `cmd` and press Enter
4. Terminal opens in the correct folder
5. Run: `npm run dev`

**Mac:**
1. Navigate to `Original-odel` folder in Finder
2. Right-click the folder
3. Select "New Terminal at Folder"
4. Terminal opens in the correct folder
5. Run: `npm run dev`

**Linux:**
1. Navigate to `Original-odel` folder in file manager
2. Right-click in empty space
3. Select "Open Terminal Here"
4. Terminal opens in the correct folder
5. Run: `npm run dev`

---

## How to Verify You're in the Right Place

### Check #1: List Files
```bash
ls
# or on Windows:
dir

# You should see:
# - package.json
# - server/
# - client/
# - README.md
```

### Check #2: Check for package.json
```bash
ls package.json
# or on Windows:
dir package.json

# Should output: package.json
# If it says "not found", you're in the wrong place!
```

### Check #3: Print Current Directory
```bash
pwd
# or on Windows:
cd

# Should show something like:
# /home/user/Projects/Original-odel
# or
# C:\Users\YourName\Projects\Original-odel

# The path should END with "Original-odel"
```

### Check #4: Check package.json Content
```bash
cat package.json | grep "rest-express"
# or on Windows:
type package.json | findstr "rest-express"

# Should show: "name": "rest-express"
# This confirms it's the right project!
```

---

## Common Mistakes

### ❌ Mistake 1: Running from Subfolder

```bash
# WRONG - Inside server folder
/Original-odel/server/ $ npm run dev
# Error: Cannot find module...

# CORRECT - In project root
/Original-odel/ $ npm run dev
# Success! ✅
```

### ❌ Mistake 2: Running from Parent Folder

```bash
# WRONG - Parent folder
/Projects/ $ npm run dev
# Error: Missing script: "dev"

# CORRECT - Inside Original-odel
/Projects/Original-odel/ $ npm run dev
# Success! ✅
```

### ❌ Mistake 3: Running from Home Directory

```bash
# WRONG - Home directory
~/ $ npm run dev
# Error: Missing script: "dev"

# CORRECT - Navigate to project first
~/ $ cd Documents/Projects/Original-odel
~/Documents/Projects/Original-odel/ $ npm run dev
# Success! ✅
```

---

## Troubleshooting

### Problem: "npm: command not found"

**Solution:** Install Node.js first
- Download from: https://nodejs.org/
- Includes npm automatically
- Restart terminal after installing

### Problem: "Cannot find module 'tsx'"

**Cause:** Dependencies not installed
**Solution:**
```bash
# Make sure you're in project root
ls package.json

# Install dependencies
npm install

# Try again
npm run dev
```

### Problem: "Missing script: dev"

**Cause:** Wrong directory
**Solution:**
```bash
# Check current location
pwd

# If not in Original-odel, navigate there
cd path/to/Original-odel

# Verify
ls package.json

# Try again
npm run dev
```

### Problem: "ENOENT: no such file or directory"

**Cause:** Wrong directory or project not cloned
**Solution:**
```bash
# Check if project exists
ls ~/Documents/Projects/Original-odel

# If not, clone it first
cd ~/Documents/Projects/
git clone https://github.com/premium65/Original-odel.git
cd Original-odel
npm install
npm run dev
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  WHERE TO RUN: npm run dev                              │
│                                                         │
│  LOCATION: Project Root (where package.json is)         │
│                                                         │
│  STEPS:                                                 │
│  1. cd Original-odel                                    │
│  2. ls package.json    (verify)                         │
│  3. npm run dev        (run command)                    │
│                                                         │
│  VERIFY YOU'RE IN RIGHT PLACE:                          │
│  - package.json exists                                  │
│  - server/ folder exists                                │
│  - client/ folder exists                                │
│  - pwd shows: .../Original-odel                         │
│                                                         │
│  IF COMMANDS FAIL:                                      │
│  - Check you're in project root                         │
│  - Run: npm install first                               │
│  - Verify Node.js installed                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Example Session

Here's what a typical session looks like:

```bash
# Starting from home directory
user@computer:~$ cd Documents/Projects/Original-odel
user@computer:~/Documents/Projects/Original-odel$ 

# Verify location
user@computer:~/Documents/Projects/Original-odel$ ls package.json
package.json

# All good! Run the command
user@computer:~/Documents/Projects/Original-odel$ npm run dev

> rest-express@1.0.0 dev
> cross-env NODE_ENV=development tsx server/index-dev.ts

Server running at http://localhost:5000
✅ Success!

# Now open browser to http://localhost:5000
```

---

## Summary

**The key point:** `npm run dev` must be run from the **Original-odel** directory (project root) where **package.json** exists.

**Quick checklist:**
- [ ] Terminal/Command Prompt open
- [ ] Navigated to Original-odel folder
- [ ] Can see package.json (`ls package.json`)
- [ ] Run `npm run dev`
- [ ] Access http://localhost:5000

**Need more help?** See [README.md](README.md) for comprehensive setup guide.
