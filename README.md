# Personal Website

A beautiful, modern personal website built with HTML, TailwindCSS, and vanilla JavaScript. Features responsive design, smooth animations, and interactive elements.

## 🚀 Features

- **Modern Design**: Clean, professional layout with gradient accents
- **Fully Responsive**: Works perfectly on all devices (mobile, tablet, desktop)
- **Smooth Animations**: Typing effects, fade-ins, and scroll animations
- **Interactive Navigation**: Smooth scrolling with active section highlighting
- **Contact Form**: Functional contact form with validation
- **Skill Bars**: Animated progress bars for technical skills
- **Project Showcase**: Portfolio section with project cards
- **Social Links**: Integrated social media links
- **Dark Mode Ready**: Easy to implement dark mode toggle
- **SEO Optimized**: Semantic HTML5 structure
- **Fast Loading**: Optimized for performance

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **TailwindCSS**: Utility-first CSS framework
- **JavaScript ES6+**: Modern JavaScript features
- **Font Awesome**: Icon library
- **Google Fonts**: Typography (Inter)

## 📁 Project Structure

```
personal-website/
├── index.html          # Main HTML file
├── script.js           # JavaScript functionality
├── README.md           # This file
└── assets/             # Images and other assets (create as needed)
    ├── profile.jpg     # Your profile picture
    ├── about.jpg       # About section image
    └── projects/       # Project screenshots
```

## 🎨 Customization Guide

### Personal Information

Update the following in `index.html`:

1. **Name and Title**:
   ```html
   <h1 class="text-5xl md:text-6xl font-bold mb-4">
       Hi, I'm <span class="typing-effect" id="typed-text">Your Name</span>
   </h1>
   ```

2. **Hero Section Roles**:
   In `script.js`, update the roles array:
   ```javascript
   const roles = ['Full Stack Developer', 'Creative Problem Solver', 'Tech Enthusiast', 'UI/UX Designer'];
   ```

3. **Contact Information**:
   Update email, phone, and location in the contact section.

4. **Social Links**:
   Replace `#` with your actual social media URLs.

### Images

Replace placeholder images with your own:

1. **Profile Picture**: Update the hero section image
2. **About Section**: Add your personal photo
3. **Project Images**: Add screenshots of your projects

### Colors

The main gradient colors are defined in the CSS:
```css
.gradient-text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

Change `#667eea` and `#764ba2` to your preferred colors.

### Skills

Update the skills section in `index.html`:
- Change skill names
- Adjust percentage values
- Add or remove skill categories

### Projects

Update the projects section with your actual projects:
- Change project titles and descriptions
- Update technology tags
- Add live demo and GitHub links

## 🚀 Deployment

### Option 1: GitHub Pages

1. Push your code to a GitHub repository
2. Go to repository Settings > Pages
3. Select "Deploy from a branch" and choose `main`
4. Your site will be live at `https://username.github.io/repository-name`

### Option 2: Netlify

1. Drag and drop your project folder to netlify.com
2. Or connect your GitHub repository for continuous deployment

### Option 3: Vercel

1. Sign up for Vercel
2. Import your GitHub repository
3. Deploy with one click

### Option 4: Traditional Hosting

Upload the entire folder to your web hosting server's public directory.

## 📱 Mobile Optimization

The website is fully responsive and includes:
- Hamburger menu for mobile navigation
- Touch-friendly buttons and links
- Optimized font sizes for mobile
- Proper viewport meta tag

## 🎯 Performance Tips

1. **Optimize Images**: Compress images before uploading
2. **Minify Code**: Use minification tools for production
3. **Enable Caching**: Configure server caching headers
4. **Use CDN**: Serve assets from a CDN for better performance

## 🔧 Advanced Customizations

### Adding Dark Mode

1. Add dark mode toggle button to navigation
2. Define dark mode CSS variables
3. Implement JavaScript toggle functionality

### Adding Blog Section

1. Create new section with blog posts
2. Add pagination for multiple posts
3. Include categories and tags

### Adding Testimonials

1. Create testimonials section
2. Add carousel or slider functionality
3. Include client photos and quotes

## 🐛 Troubleshooting

### Common Issues

1. **Images not loading**: Check file paths and ensure images are in the correct folder
2. **Form not working**: Ensure you have a backend service or use a service like Formspree
3. **Animations not smooth**: Check browser compatibility and reduce animation complexity

### Browser Compatibility

The website works on all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📞 Support

If you need help customizing your website, feel free to reach out or check the documentation.

---

**Built with ❤️ using modern web technologies**
