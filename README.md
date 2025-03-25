# HMA Paving Control

## Overview
HMA Paving Control is a Progressive Web Application (PWA) designed for asphalt paving calculations and data management. It provides tools for yield calculations, paver speed estimation, projected length calculations, and tonnage estimation, with data persistence and export capabilities.

## Features
1. **Yield Calculator**
   - Track truck loads with load number, tonnage, start/end stations, and width
   - Real-time calculations for area, weight, and yield
   - Daily summary statistics
   - Data persistence using localStorage
   - CSV export functionality

2. **Data History**
   - View today's loads in a detailed table
   - Archive previous days' data
   - Delete individual entries
   - Export archived data to CSV

3. **Additional Calculators**
   - Paver Speed Calculator
   - Projected Paving Length Calculator
   - HMA Usage (Tonnage) Calculator

4. **User Interface**
   - Responsive design for mobile and desktop
   - Dark/light mode toggle
   - Hamburger menu navigation with swipe support
   - Real-time input validation
   - Smooth scrolling and touch optimization

## Technical Details
- **Platform**: Progressive Web App
- **Languages**: HTML5, CSS3, JavaScript
- **Storage**: LocalStorage for data persistence
- **Dependencies**: None (vanilla JavaScript)
- **Service Worker**: Included for offline capability and updates

## Installation
1. Serve the HTML file through a web server (e.g., `python -m http.server 8000`)
2. Access via browser at `http://localhost:8000`
3. Optional: Install as a PWA on supported devices

## Usage
1. **Yield Calc Tab**
   - Enter truck details
   - Save data to track daily progress
   - Export all data or reset for a new day

2. **Data History Tab**
   - View current day's loads
   - Access archives via "View Previous Days"
   - Export specific archived days

3. **Calculator Tabs**
   - Input values for real-time calculations
   - Results update automatically
   - No data storage for calculator results


## Styling
- Custom CSS with light/dark themes
- CSS Variables for consistent theming
- Responsive layouts with media queries
- Mobile-first design approach

## Data Storage
- **LocalStorage Keys**:
  - `asphaltYieldData`: Current day's truck data
  - `asphaltYieldDate`: Current working date
  - `lastEndValue`: Last end station for auto-fill
  - `lastWidth`: Last width for auto-fill
  - `asphaltYieldArchives`: Archived daily data
  - `theme`: User theme preference

## Calculations
1. **Yield**: `Weight (lbs) / Area (sq yd)`
   - Weight = Tonnage * 2000
   - Area = (Length * Width) / 9

2. **Paver Speed**: `V = (R_p * L) / 60`
   - `L = (2000/9) * W * A`

3. **Projected Length**: `(Tons / ((((LaneWidth*100)/9)*Yield)/2000)) * 100`

4. **Tonnage**: `((Length * Width / 9) * 110 * Depth) / 2000`

## Development Notes
- Built with vanilla JavaScript
- No external dependencies
- Optimized for mobile devices
- Continuous updates via service worker
- Touch event handling for better mobile experience

## License
This project is open-source and available under the MIT License.

## Prerequisites
- Modern web browser with JavaScript enabled
- Local development server for testing
- Basic understanding of construction/paving concepts
- Minimum screen resolution of 320px width (mobile-responsive)

## Browser Compatibility
- Chrome/Chromium (Version 90+)
- Firefox (Version 85+)
- Safari (Version 14+)
- Edge (Version 90+)
- Mobile browsers (iOS Safari, Chrome for Android)

## Security Considerations
- All calculations are performed client-side
- No sensitive data is transmitted to external servers
- Data is stored locally in the browser's localStorage
- Regular data backups recommended via CSV export
- Clear browser data/cache to remove all stored information

## Troubleshooting
1. **App Not Loading**
   - Ensure JavaScript is enabled
   - Clear browser cache and reload
   - Check internet connection for initial load
   
2. **Data Not Saving**
   - Verify localStorage is not full
   - Ensure browser permissions allow storage
   - Export data regularly as backup

3. **Calculation Issues**
   - Verify input values are within reasonable ranges
   - Check unit conversions (tons to lbs, feet to yards)
   - Refresh page if calculator becomes unresponsive

## Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style Guidelines
- Use consistent indentation (2 spaces)
- Follow JavaScript Standard Style
- Comment complex calculations
- Maintain mobile-first responsive design
- Test across multiple browsers before submitting

## Support and Contact
For support, please:
1. Check the troubleshooting guide above
2. Search existing GitHub issues
3. Create a new issue with:
   - Browser and OS details
   - Steps to reproduce the problem
   - Expected vs actual behavior
   - Screenshots if applicable

## Current Version
Last updated: March 24, 2025
