# Singh Studios Portfolio Website

## Project Overview
A modern dark-themed portfolio website for Singh Studios featuring:
- Terminal entry experience requiring "enter" command to access the main site
- Blue and black color scheme with modern UI/UX design
- Live GitHub integration for repository display and statistics
- Auto-refresh functionality (30-second intervals) for real-time repository updates
- Responsive design with smooth animations and interactive elements

## User Preferences
- Prefers vanilla HTML, CSS, and JavaScript (no frameworks)
- Wants modern dark theme with blue (#0080ff) and black color scheme
- Requires live GitHub data integration (username: Sanvir28)
- Wants terminal interaction before site entry
- Needs auto-refresh every 30 seconds for repository updates

## Project Architecture

### File Structure
```
/
├── index.html          # Main HTML file with all sections
├── styles.css          # Complete CSS with dark theme styling
├── script.js           # JavaScript with GitHub API integration
├── replit.md          # Project documentation
└── server.js          # Simple static file server
```

### Key Features Implemented
1. **Terminal Entry Screen**
   - Interactive terminal with typing functionality
   - Command validation (only "enter" allows access)
   - Smooth transition to main site

2. **GitHub API Integration**
   - Real-time repository fetching from GitHub API
   - Repository statistics (stars, forks, views, language)
   - User profile data (followers, following, public repos)
   - Language statistics calculation and display

3. **Auto-Refresh System**
   - 30-second countdown timer display
   - Automatic data refresh every 30 seconds
   - Network status handling (online/offline detection)
   - Pause/resume on tab visibility changes

4. **Responsive Design**
   - Mobile-first approach with breakpoints
   - Grid layouts for different screen sizes
   - Interactive hover effects and animations

### Sections
- **Home**: Hero section with Singh Studios branding and key statistics
- **Repositories**: Live GitHub repository grid with search and filtering
- **Statistics**: GitHub profile overview and language usage charts
- **Terms**: Terms and conditions page
- **Footer**: Contact information and social links

## Technical Implementation

### GitHub API Endpoints Used
- `/users/{username}` - User profile data
- `/users/{username}/repos` - Repository list
- `/repos/{username}/{repo}/traffic/views` - Repository view counts (requires auth)

### Styling Approach
- CSS custom properties for consistent theming
- Blue (#0080ff) and black color palette
- Glassmorphism effects with backdrop blur
- Smooth transitions and micro-interactions
- Terminal-style monospace fonts

### JavaScript Features
- Class-based architecture for maintainability
- Error handling and fallback states
- Local caching with cache invalidation
- Event delegation for performance
- Smooth scrolling navigation

## Recent Changes
- **2025-07-18**: Initial project setup with vanilla HTML/CSS/JS
- **2025-07-18**: Implemented terminal entry experience
- **2025-07-18**: Added GitHub API integration with auto-refresh
- **2025-07-18**: Created responsive dark theme design
- **2025-07-18**: Added comprehensive error handling and loading states

## Deployment Notes
- Uses vanilla technologies only (no build process required)
- Requires simple static file server
- GitHub API calls are made client-side (CORS-enabled)
- No external dependencies or package managers needed

## Future Enhancements
- Add GitHub authentication for private repository access
- Implement repository search and filtering
- Add more detailed repository analytics
- Include contribution graph visualization
- Add contact form integration