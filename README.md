# Minseok GitBlog

This is a Hugo-powered GitHub Pages blog for `minseokparkai.github.io`.

## Run locally

```powershell
hugo server
```

Then open the local URL Hugo prints, usually `http://localhost:1313/`.

## Add a new post

```powershell
hugo new content content/posts/my-new-post.md
```

Edit the new file, set `draft = false`, then publish:

```powershell
git add .
git commit -m "Add new post"
git push
```

GitHub Actions builds and deploys the site automatically.
