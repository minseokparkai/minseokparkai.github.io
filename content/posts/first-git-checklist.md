---
title: "A Simple Git Checklist"
date: 2026-04-24T00:20:00+09:00
description: "A compact Git flow for writing and publishing blog changes."
tags: ["git", "github", "checklist"]
categories: ["notes"]
draft: false
---

Here is the basic flow for changing this blog.

```powershell
git status
git add .
git commit -m "Describe the change"
git push
```

The most useful command is `git status`. It tells you what changed before you commit.

Use short commit messages that explain the result, such as:

- `Add Hugo deployment workflow`
- `Write first Git note`
- `Update About page`
