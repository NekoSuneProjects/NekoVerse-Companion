# Publish NekoVerse Companion to NekoSuneProjects

The project is already laid out as a standalone public repository named **NekoVerse-Companion**.

## GitHub web + command line

1. In the `NekoSuneProjects` organization, create a new **public** repository named `NekoVerse-Companion`.
2. Leave it empty (do not pre-create a README, license, or `.gitignore`; this project already contains them).
3. From this project folder run:

```bash
git init -b main
git add .
git commit -m "feat: initial NekoVerse Companion MVP"
git remote add origin https://github.com/NekoSuneProjects/NekoVerse-Companion.git
git push -u origin main
```

## First release

After the initial push:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The included `.github/workflows/build.yml` builds the Windows NSIS installer and portable executable. Tag builds also publish the generated files to a GitHub Release.

## Connected ChatGPT GitHub note

The GitHub connection available while this source was generated can write files/branches to an existing repository but does not expose a create-repository operation. Once the empty repository exists, the source can be pushed/committed into it with repository write access.
