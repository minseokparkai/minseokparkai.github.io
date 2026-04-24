---
title: "How to Write a New Post"
date: 2026-04-24T00:10:00+09:00
description: "A short reminder for publishing new Hugo posts."
tags: ["hugo", "workflow", "markdown"]
categories: ["notes"]
draft: false
---

New posts live in `content/posts`.

To create one:

```powershell
hugo new content content/posts/my-new-post.md
```

Open the new file, write the post, and make sure this line is set:

```toml
draft = false
```

Then publish it:

```powershell
git add .
git commit -m "Add new post"
git push
```

GitHub Actions will build the Hugo site and deploy it to GitHub Pages.
