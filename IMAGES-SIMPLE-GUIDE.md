# Simple Image Guide

## One Folder, All Your Images

Just put ALL your images in the `images` folder. Name them whatever you want!

```
JustRoam/
├── images/               ← ALL your photos go here
│   ├── hero.jpg
│   ├── truck-1.jpg
│   ├── truck-2.jpg
│   ├── ... (any other photos)
├── index.html
├── rent.html
├── build.html
├── stories.html
├── contact.html
├── styles.css
└── script.js
```

---

## Current Image References

Here's what images the website is currently looking for. You can either:
1. **Name your photos to match these**, OR
2. **Edit the HTML to use your own photo names**

### Homepage (index.html)
- **hero.jpg** - Background image (line 31)

### Rent Page (rent.html) - Gallery
- **truck-1.jpg** - Main photo + thumbnail 1
- **truck-2.jpg** - Photo 2
- **truck-3.jpg** - Photo 3
- **truck-4.jpg** - Photo 4
- **truck-5.jpg** - Photo 5
- **truck-6.jpg** - Photo 6

### Build Page (build.html) - Products
- **product-tent.jpg** - Rooftop tents (line 80)
- **product-suspension.jpg** - Suspension (line 102)
- **product-storage.jpg** - Storage system (line 124)

### Stories Page (stories.html) - Blog
- **blog-morocco.jpg** - Featured story
- **blog-veluwe.jpg** - Story 1
- **blog-suspension.jpg** - Story 2
- **blog-tent.jpg** - Story 3
- **blog-coast.jpg** - Story 4
- **blog-family.jpg** - Story 5
- **blog-start.jpg** - Story 6

---

## How to Use Your Own Image Names

### Option 1: Rename Your Photos
Just rename your photos to match the list above and drop them in the `images` folder.

### Option 2: Edit the HTML
If you want to keep your original filenames, just find and replace in the HTML.

**Example:**
Your photo is named `ranger-exterior.jpg`

In rent.html, find:
```html
<img src="images/truck-1.jpg" alt="...">
```

Change to:
```html
<img src="images/ranger-exterior.jpg" alt="...">
```

---

## Reusing Images

Want to use the same photo on multiple pages? No problem!

**Example:** Use your best truck photo as both:
- Homepage hero: `hero.jpg`
- Main rental photo: `truck-1.jpg`

Just save the same image twice with different names, OR edit the HTML to point both to the same file.

---

## Tips

**Image Sizes:**
- Hero: 1920x1080px (landscape)
- Gallery: 1200x800px (landscape)
- Products: 600x400px (landscape)
- Blog: 800x600px (landscape)

**Optimization:**
- Compress images before uploading (use TinyPNG.com)
- Keep files under 500KB each
- Use .jpg for photos

**Quick Start - Minimum Required:**
1. hero.jpg (homepage)
2. truck-1.jpg (main rental photo)
3. truck-2.jpg through truck-6.jpg (rental gallery)

Everything else can be added later!

---

## Finding Images in HTML

**Need to change an image reference?**

Open the HTML file in VS Code and search (Cmd + F):
- Search for: `images/truck-1.jpg`
- Replace with: `images/your-photo-name.jpg`

Done! 🎯
