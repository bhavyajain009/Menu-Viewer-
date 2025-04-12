# Mess Menu Viewer + Meal Countdown

A responsive web application that displays the weekly mess menu with a countdown timer to the next meal.

## Features

- Display of full weekly mess menu (Breakfast, Lunch, Evening Snack, Dinner) for each day of the week
- Responsive card layout with different background colors for each meal type
- Automatic highlighting of the current day and current meal
- Live countdown timer to the next meal
- Week navigation to view future weeks' menus
- Clean and modern UI with a light, calming theme
- Customizable meal times and menu items
- Settings are saved in your browser's localStorage

## Technologies Used

- HTML5
- CSS3 (Flexbox and Grid for responsive layout)
- Vanilla JavaScript
- Google Fonts (Poppins)
- localStorage for saving custom settings

## How to Use

1. Open `index.html` in any modern web browser
2. The current day and current meal (if any) will be automatically highlighted
3. The countdown timer at the top will show time remaining until the next meal
4. Use the "Previous Week" and "Next Week" buttons to navigate between weeks
5. Click the "⚙️ Settings" button to customize meal times and menu items

## Customization

### Via Settings Panel
Click the "⚙️ Settings" button to open the settings panel where you can:

1. **Meal Times Tab**:
   - Adjust start and end times for all meals (Breakfast, Lunch, Evening Snack, Dinner)
   
2. **Menu Items Tab**:
   - Select a day and meal
   - Add or edit menu items (one per line)
   - Click "Save Changes" to update the menu

All changes are automatically saved to your browser's localStorage and will persist between visits.

### Via Code
You can also customize the menu by editing the `data.js` file. The menu is structured as a JavaScript object with days of the week and corresponding meals.

## Meal Schedule (Default)

- **Breakfast**: 07:30 - 09:30
- **Lunch**: 12:30 - 14:30
- **Evening Snack**: 16:30 - 17:30
- **Dinner**: 19:30 - 21:30

## License

MIT License 