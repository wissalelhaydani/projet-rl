# RLReco — Interface Premium

Fichiers à intégrer dans ton projet Next.js.

## Structure

```
app/
  globals.css          ← Remplace ton globals.css actuel
  page.js              ← Page principale (layout sidebar + main)
  components/
    ProfilForm.js
    ProjetsList.js
    EtatRL.js
    GrapheRL.js
```

## Étapes d'intégration

### 1. globals.css
Remplace le contenu de ton `app/globals.css` par le fichier fourni.
Il contient l'import Google Fonts (Syne + DM Sans) et toutes les CSS variables du thème.

### 2. layout.js
Assure-toi que ton `app/layout.js` importe bien le globals.css :

```js
import './globals.css'
```

### 3. Composants
Place les 4 fichiers dans `app/components/` :
- ProfilForm.js
- ProjetsList.js
- EtatRL.js
- GrapheRL.js

### 4. page.js
Remplace ton `app/page.js` par le fichier fourni.

### 5. Recharts (déjà utilisé dans GrapheRL)
Si pas encore installé :
```bash
npm install recharts
```

## Variables CSS disponibles

Toutes les couleurs du thème sont dans `:root` dans `globals.css`.
Tu peux les utiliser n'importe où : `color: var(--accent)`, `background: var(--surface2)`, etc.

| Variable       | Usage                          |
|----------------|-------------------------------|
| `--bg`         | Fond de page principal         |
| `--surface`    | Cards, sidebar                 |
| `--surface2`   | Éléments imbriqués, inputs     |
| `--accent`     | Violet principal (#7c6aff)     |
| `--accent2`    | Violet clair (#a78bfa)         |
| `--green`      | Like, succès (#22d3a0)         |
| `--amber`      | Intermédiaire (#f59e0b)        |
| `--red`        | Skip, erreur (#f87171)         |
| `--blue`       | Complété (#60a5fa)             |
| `--text`       | Texte principal                |
| `--muted`      | Texte secondaire (50% alpha)   |
| `--muted2`     | Texte tertiaire (28% alpha)    |