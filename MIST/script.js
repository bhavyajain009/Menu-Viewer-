document.addEventListener('DOMContentLoaded', () => {
    // Initialize variables
    const menuContainer = document.querySelector('.menu-container');
    const nextMealNameElement = document.getElementById('next-meal-name');
    const countdownElement = document.getElementById('countdown');
    const currentWeekElement = document.getElementById('current-week');
    const prevWeekButton = document.getElementById('prev-week');
    const nextWeekButton = document.getElementById('next-week');
    
    // Settings modal elements
    const settingsBtn = document.getElementById('settings-btn');
    const modal = document.getElementById('settings-modal');
    const closeBtn = document.querySelector('.close');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const saveSettingsBtn = document.getElementById('save-settings');
    const resetSettingsBtn = document.getElementById('reset-settings');
    
    // Menu editor elements
    const daySelect = document.getElementById('day-select');
    const mealSelect = document.getElementById('meal-select');
    const menuItemsInput = document.getElementById('menu-items-input');
    
    // Time input elements
    const breakfastStart = document.getElementById('breakfast-start');
    const breakfastEnd = document.getElementById('breakfast-end');
    const lunchStart = document.getElementById('lunch-start');
    const lunchEnd = document.getElementById('lunch-end');
    const eveningSnackStart = document.getElementById('evening-snack-start');
    const eveningSnackEnd = document.getElementById('evening-snack-end');
    const dinnerStart = document.getElementById('dinner-start');
    const dinnerEnd = document.getElementById('dinner-end');
    
    // Create success message element
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    document.body.appendChild(successMessage);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-title">Meal Time</div>
            <div class="notification-message">
                It's time for your meal!
                <div class="meal-items"></div>
            </div>
            <div class="notification-buttons">
                <button class="notification-btn dismiss-btn">Dismiss</button>
                <button class="notification-btn snooze-btn">Snooze 5 min</button>
            </div>
        </div>
    `;
    document.body.appendChild(notification);
    
    // Variables for notifications
    let notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
    let notificationSnoozed = false;
    let notifiedMeals = {};
    
    // Week offset for navigation (0 = current week)
    let weekOffset = 0;
    
    // Days of the week
    const daysOfWeek = [
        'sunday', 'monday', 'tuesday', 'wednesday', 
        'thursday', 'friday', 'saturday'
    ];

    // Create a copy of the original menu data for reset functionality
    const originalMessMenu = JSON.parse(JSON.stringify(messMenu));
    
    // Check if there's a custom menu saved in localStorage
    function loadCustomSettings() {
        const savedMenu = localStorage.getItem('customMessMenu');
        if (savedMenu) {
            try {
                // Merge saved settings with original menu structure to handle any new fields
                const customMenu = JSON.parse(savedMenu);
                // Update the messMenu object with saved values
                Object.assign(messMenu, customMenu);
                console.log("Custom settings loaded successfully from localStorage");
            } catch (error) {
                console.error("Error loading saved settings:", error);
                localStorage.removeItem('customMessMenu');
            }
        }
        
        // Load notification preferences
        const savedNotificationSettings = localStorage.getItem('mealNotifications');
        if (savedNotificationSettings) {
            try {
                const settings = JSON.parse(savedNotificationSettings);
                notificationsEnabled = settings.enabled;
            } catch (error) {
                console.error("Error loading notification settings:", error);
            }
        }
    }
    
    // Call this on page load
    loadCustomSettings();
    
    // Format time function (24h format to 12h format)
    function formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    }
    
    // Convert HH:MM to 24-hour format for input fields
    function formatTimeForInput(timeString) {
        const [time] = timeString.split(' ');
        return time;
    }

    // Update week display
    function updateWeekDisplay() {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const startMonth = startOfWeek.toLocaleString('default', { month: 'short' });
        const endMonth = endOfWeek.toLocaleString('default', { month: 'short' });
        
        currentWeekElement.textContent = 
            `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}`;
        
        // Disable previous week button if we're in current week
        prevWeekButton.disabled = weekOffset === 0;
    }

    // Get meal time boundaries from messMenu
    function getMealTimeBoundaries(mealType) {
        try {
            const meal = messMenu.meals[mealType];
            const startHour = parseInt(meal.defaultStartTime.split(':')[0]);
            const startMinute = parseInt(meal.defaultStartTime.split(':')[1]);
            const endHour = parseInt(meal.defaultEndTime.split(':')[0]);
            const endMinute = parseInt(meal.defaultEndTime.split(':')[1]);
            
            return { startHour, startMinute, endHour, endMinute };
        } catch (error) {
            console.error(`Error parsing time for ${mealType}:`, error);
            // Return default values if there's an error
            return { startHour: 0, startMinute: 0, endHour: 23, endMinute: 59 };
        }
    }

    // Render menu function
    function renderMenu() {
        menuContainer.innerHTML = '';
        
        const today = new Date();
        const currentDay = daysOfWeek[today.getDay()];
        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();
        
        // Determine current meal based on custom times
        let currentMeal = null;
        const breakfastTime = getMealTimeBoundaries('breakfast');
        const lunchTime = getMealTimeBoundaries('lunch');
        const eveningSnackTime = getMealTimeBoundaries('eveningSnack');
        const dinnerTime = getMealTimeBoundaries('dinner');
        
        if (
            (currentHour > breakfastTime.startHour || 
             (currentHour === breakfastTime.startHour && currentMinute >= breakfastTime.startMinute)) && 
            (currentHour < breakfastTime.endHour || 
             (currentHour === breakfastTime.endHour && currentMinute <= breakfastTime.endMinute))
        ) {
            currentMeal = 'breakfast';
        } else if (
            (currentHour > lunchTime.startHour || 
             (currentHour === lunchTime.startHour && currentMinute >= lunchTime.startMinute)) && 
            (currentHour < lunchTime.endHour || 
             (currentHour === lunchTime.endHour && currentMinute <= lunchTime.endMinute))
        ) {
            currentMeal = 'lunch';
        } else if (
            (currentHour > eveningSnackTime.startHour || 
             (currentHour === eveningSnackTime.startHour && currentMinute >= eveningSnackTime.startMinute)) && 
            (currentHour < eveningSnackTime.endHour || 
             (currentHour === eveningSnackTime.endHour && currentMinute <= eveningSnackTime.endMinute))
        ) {
            currentMeal = 'eveningSnack';
        } else if (
            (currentHour > dinnerTime.startHour || 
             (currentHour === dinnerTime.startHour && currentMinute >= dinnerTime.startMinute)) && 
            (currentHour < dinnerTime.endHour || 
             (currentHour === dinnerTime.endHour && currentMinute <= dinnerTime.endMinute))
        ) {
            currentMeal = 'dinner';
        }
        
        // Loop through each day and create a card
        daysOfWeek.forEach(day => {
            const dayMenu = messMenu.weeklyMenu[day];
            const isCurrentDay = day === currentDay && weekOffset === 0;
            
            const dayCard = document.createElement('div');
            dayCard.className = `day-card ${isCurrentDay ? 'current-day' : ''}`;
            
            // Create day header
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day.charAt(0).toUpperCase() + day.slice(1);
            dayCard.appendChild(dayHeader);
            
            // Create meals
            Object.keys(messMenu.meals).forEach(mealType => {
                const meal = document.createElement('div');
                meal.className = `meal ${isCurrentDay && mealType === currentMeal ? 'current-meal' : ''}`;
                
                // Meal header
                const mealHeader = document.createElement('div');
                mealHeader.className = 'meal-header';
                
                const mealTitle = document.createElement('div');
                mealTitle.className = 'meal-title';
                mealTitle.innerHTML = `${messMenu.meals[mealType].icon} ${mealType === 'eveningSnack' ? 'Evening Snack' : mealType.charAt(0).toUpperCase() + mealType.slice(1)}`;
                
                const mealTime = document.createElement('div');
                mealTime.className = 'meal-time';
                mealTime.textContent = messMenu.meals[mealType].time;
                
                mealHeader.appendChild(mealTitle);
                mealHeader.appendChild(mealTime);
                meal.appendChild(mealHeader);
                
                // Meal content
                const mealContent = document.createElement('div');
                mealContent.className = `meal-content ${mealType}`;
                
                // Add menu items
                if (dayMenu && dayMenu[mealType]) {
                    dayMenu[mealType].forEach(item => {
                        const menuItem = document.createElement('div');
                        menuItem.className = 'menu-item';
                        menuItem.textContent = item;
                        mealContent.appendChild(menuItem);
                    });
                } else {
                    const noMenu = document.createElement('div');
                    noMenu.className = 'menu-item';
                    noMenu.textContent = 'No menu available';
                    mealContent.appendChild(noMenu);
                }
                
                meal.appendChild(mealContent);
                dayCard.appendChild(meal);
            });
            
            menuContainer.appendChild(dayCard);
        });
        
        updateWeekDisplay();
    }

    // Find the next meal and set up countdown
    function updateNextMealCountdown() {
        const now = new Date();
        const currentDay = daysOfWeek[now.getDay()];
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        let nextMealType = null;
        let nextMealDay = currentDay;
        let hoursToNextMeal = 0;
        let minutesToNextMeal = 0;
        
        // Get all meal times
        const breakfastTime = getMealTimeBoundaries('breakfast');
        const lunchTime = getMealTimeBoundaries('lunch');
        const eveningSnackTime = getMealTimeBoundaries('eveningSnack');
        const dinnerTime = getMealTimeBoundaries('dinner');
        
        // Create date objects for each meal time today
        const breakfastStartToday = new Date(now);
        breakfastStartToday.setHours(breakfastTime.startHour, breakfastTime.startMinute, 0, 0);
        
        const lunchStartToday = new Date(now);
        lunchStartToday.setHours(lunchTime.startHour, lunchTime.startMinute, 0, 0);
        
        const eveningSnackStartToday = new Date(now);
        eveningSnackStartToday.setHours(eveningSnackTime.startHour, eveningSnackTime.startMinute, 0, 0);
        
        const dinnerStartToday = new Date(now);
        dinnerStartToday.setHours(dinnerTime.startHour, dinnerTime.startMinute, 0, 0);
        
        // Create date object for breakfast tomorrow
        const breakfastStartTomorrow = new Date(now);
        breakfastStartTomorrow.setDate(now.getDate() + 1);
        breakfastStartTomorrow.setHours(breakfastTime.startHour, breakfastTime.startMinute, 0, 0);
        
        // Find the next meal
        let nextMealTime;
        
        if (now < breakfastStartToday) {
            nextMealType = 'breakfast';
            nextMealTime = breakfastStartToday;
        } else if (now < lunchStartToday) {
            nextMealType = 'lunch';
            nextMealTime = lunchStartToday;
        } else if (now < eveningSnackStartToday) {
            nextMealType = 'eveningSnack';
            nextMealTime = eveningSnackStartToday;
        } else if (now < dinnerStartToday) {
            nextMealType = 'dinner';
            nextMealTime = dinnerStartToday;
        } else {
            // After dinner, show next day's breakfast
            nextMealType = 'breakfast';
            nextMealTime = breakfastStartTomorrow;
            const nextDayIndex = (now.getDay() + 1) % 7;
            nextMealDay = daysOfWeek[nextDayIndex];
        }
        
        // Calculate the time difference
        const timeDiff = nextMealTime - now;
        hoursToNextMeal = Math.floor(timeDiff / (1000 * 60 * 60));
        minutesToNextMeal = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        // Check if it's time to show a notification for any meal
        checkMealNotifications();
        
        // Update the UI
        const nextMealCapitalized = nextMealType === 'eveningSnack' ? 'Evening Snack' : 
            nextMealType.charAt(0).toUpperCase() + nextMealType.slice(1);
        const nextDayCapitalized = nextMealDay === currentDay ? '' : 
            ` (${nextMealDay.charAt(0).toUpperCase() + nextMealDay.slice(1)})`;
        
        nextMealNameElement.textContent = `${nextMealCapitalized}${nextDayCapitalized}`;
        countdownElement.textContent = `${hoursToNextMeal.toString().padStart(2, '0')}h ${minutesToNextMeal.toString().padStart(2, '0')}m`;
    }
    
    // Check if it's time to show meal notifications
    function checkMealNotifications() {
        if (!notificationsEnabled || notificationSnoozed) {
            return;
        }
        
        const now = new Date();
        const today = daysOfWeek[now.getDay()];
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Check each meal time
        const meals = [
            { type: 'breakfast', name: 'Breakfast' },
            { type: 'lunch', name: 'Lunch' },
            { type: 'eveningSnack', name: 'Evening Snack' },
            { type: 'dinner', name: 'Dinner' }
        ];
        
        meals.forEach(meal => {
            const mealTime = getMealTimeBoundaries(meal.type);
            
            // Check if it's exactly meal time (or within 1 minute after)
            if (
                (currentHour === mealTime.startHour && 
                 currentMinute >= mealTime.startMinute && 
                 currentMinute <= mealTime.startMinute + 1)
            ) {
                // Check if we've already notified for this meal today
                const mealKey = `${today}-${meal.type}`;
                if (!notifiedMeals[mealKey]) {
                    showNotification(meal.name, today);
                    notifiedMeals[mealKey] = true;
                    
                    // Reset this key at midnight
                    const midnight = new Date();
                    midnight.setHours(24, 0, 0, 0);
                    const timeToMidnight = midnight - now;
                    
                    setTimeout(() => {
                        delete notifiedMeals[mealKey];
                    }, timeToMidnight);
                }
            }
        });
    }
    
    // Show meal notification
    function showNotification(mealName, day) {
        // Get the menu items for this meal
        const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
        let menuItemsText = '';
        
        // Find the meal type from name
        const mealType = mealName === 'Evening Snack' ? 'eveningSnack' : 
                        mealName.toLowerCase();
        
        if (messMenu.weeklyMenu[day] && messMenu.weeklyMenu[day][mealType]) {
            menuItemsText = messMenu.weeklyMenu[day][mealType].join(', ');
        }
        
        // Set notification message
        const messageElement = notification.querySelector('.notification-message');
        messageElement.innerHTML = `<strong>${mealName} Time!</strong><br>
            <span class="meal-items">${menuItemsText}</span>`;
        
        // Show notification
        notification.classList.add('show');
        
        // Play notification sound if available
        playNotificationSound();
        
        // Set up dismiss and snooze buttons
        const dismissBtn = notification.querySelector('.dismiss-btn');
        const snoozeBtn = notification.querySelector('.snooze-btn');
        
        dismissBtn.onclick = () => {
            notification.classList.remove('show');
        };
        
        snoozeBtn.onclick = () => {
            notification.classList.remove('show');
            notificationSnoozed = true;
            
            if (snoozeTimeout) {
                clearTimeout(snoozeTimeout);
            }
            
            snoozeTimeout = setTimeout(() => {
                notificationSnoozed = false;
            }, 5 * 60 * 1000); // 5 minutes
        };
    }
    
    // Play notification sound
    function playNotificationSound() {
        try {
            const audio = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=notification-sound-7062.mp3');
            audio.volume = 0.5;
            audio.play();
        } catch (error) {
            console.error("Could not play notification sound:", error);
        }
    }
    
    // Toggle notification settings
    function toggleNotifications(enabled) {
        notificationsEnabled = enabled;
        
        // Save to localStorage
        localStorage.setItem('mealNotifications', JSON.stringify({
            enabled: notificationsEnabled
        }));
        
        showSuccessMessage(notificationsEnabled ? 
            "Meal notifications enabled" : 
            "Meal notifications disabled");
    }

    // Week navigation event listeners
    prevWeekButton.addEventListener('click', () => {
        if (weekOffset > 0) {
            weekOffset--;
            renderMenu();
        }
    });
    
    nextWeekButton.addEventListener('click', () => {
        weekOffset++;
        renderMenu();
    });

    // Show success message
    function showSuccessMessage(message) {
        successMessage.textContent = message;
        successMessage.classList.add('show');
        
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 3000);
    }

    // Settings Modal Functions
    function openModal() {
        modal.style.display = 'block';
        loadSettingsIntoForm();
        
        // Use setTimeout to ensure the display:block is applied before adding visible class
        setTimeout(() => {
            modal.classList.add('visible');
        }, 10);
    }
    
    function closeModal() {
        modal.classList.remove('visible');
        
        // Wait for the transition to complete before hiding the modal
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    function switchTab(tabName) {
        // Hide all tab contents
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all tab buttons
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Activate the selected tab
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }
    
    // Load current settings into the form
    function loadSettingsIntoForm() {
        try {
            // Set time input values
            breakfastStart.value = messMenu.meals.breakfast.defaultStartTime;
            breakfastEnd.value = messMenu.meals.breakfast.defaultEndTime;
            lunchStart.value = messMenu.meals.lunch.defaultStartTime;
            lunchEnd.value = messMenu.meals.lunch.defaultEndTime;
            eveningSnackStart.value = messMenu.meals.eveningSnack.defaultStartTime;
            eveningSnackEnd.value = messMenu.meals.eveningSnack.defaultEndTime;
            dinnerStart.value = messMenu.meals.dinner.defaultStartTime;
            dinnerEnd.value = messMenu.meals.dinner.defaultEndTime;
            
            // Load menu items for the selected day and meal
            updateMenuItemsTextarea();
            
            // Update notification toggle state
            const notificationToggle = document.getElementById('notification-toggle');
            if (notificationToggle) {
                notificationToggle.checked = notificationsEnabled;
            }
        } catch (error) {
            console.error("Error loading settings into form:", error);
            showSuccessMessage("Error loading settings. Using defaults.");
        }
    }
    
    // Update the menu items textarea when day or meal selection changes
    function updateMenuItemsTextarea() {
        const selectedDay = daySelect.value;
        const selectedMeal = mealSelect.value;
        
        if (messMenu.weeklyMenu[selectedDay] && messMenu.weeklyMenu[selectedDay][selectedMeal]) {
            menuItemsInput.value = messMenu.weeklyMenu[selectedDay][selectedMeal].join('\n');
        } else {
            menuItemsInput.value = '';
        }
    }
    
    // Save settings
    function saveSettings() {
        try {
            // Validate time inputs
            if (!breakfastStart.value || !breakfastEnd.value || 
                !lunchStart.value || !lunchEnd.value || 
                !eveningSnackStart.value || !eveningSnackEnd.value || 
                !dinnerStart.value || !dinnerEnd.value) {
                showSuccessMessage("Please fill in all time fields");
                return;
            }
            
            // Save time settings
            messMenu.meals.breakfast.defaultStartTime = breakfastStart.value;
            messMenu.meals.breakfast.defaultEndTime = breakfastEnd.value;
            messMenu.meals.breakfast.time = `${breakfastStart.value} - ${breakfastEnd.value}`;
            
            messMenu.meals.lunch.defaultStartTime = lunchStart.value;
            messMenu.meals.lunch.defaultEndTime = lunchEnd.value;
            messMenu.meals.lunch.time = `${lunchStart.value} - ${lunchEnd.value}`;
            
            messMenu.meals.eveningSnack.defaultStartTime = eveningSnackStart.value;
            messMenu.meals.eveningSnack.defaultEndTime = eveningSnackEnd.value;
            messMenu.meals.eveningSnack.time = `${eveningSnackStart.value} - ${eveningSnackEnd.value}`;
            
            messMenu.meals.dinner.defaultStartTime = dinnerStart.value;
            messMenu.meals.dinner.defaultEndTime = dinnerEnd.value;
            messMenu.meals.dinner.time = `${dinnerStart.value} - ${dinnerEnd.value}`;
            
            // Save menu items for the selected day and meal
            const selectedDay = daySelect.value;
            const selectedMeal = mealSelect.value;
            const menuItems = menuItemsInput.value.split('\n').filter(item => item.trim() !== '');
            
            if (!messMenu.weeklyMenu[selectedDay]) {
                messMenu.weeklyMenu[selectedDay] = {};
            }
            
            messMenu.weeklyMenu[selectedDay][selectedMeal] = menuItems;
            
            // Save notification settings
            const notificationToggle = document.getElementById('notification-toggle');
            if (notificationToggle) {
                notificationsEnabled = notificationToggle.checked;
                localStorage.setItem('mealNotifications', JSON.stringify({
                    enabled: notificationsEnabled
                }));
            }
            
            // Save to localStorage
            localStorage.setItem('customMessMenu', JSON.stringify(messMenu));
            
            // Update the UI
            renderMenu();
            updateNextMealCountdown();
            
            // Reset notification tracking
            notifiedMeals = {};
            
            // Inform user of success
            showSuccessMessage("Settings saved successfully!");
            
            // Close the modal
            closeModal();
        } catch (error) {
            console.error("Error saving settings:", error);
            showSuccessMessage("Error saving settings. Please try again.");
        }
    }
    
    // Reset to default settings
    function resetSettings() {
        if (confirm("Are you sure you want to reset all settings to default?")) {
            try {
                // Reset to original menu
                Object.assign(messMenu, JSON.parse(JSON.stringify(originalMessMenu)));
                
                // Clear localStorage
                localStorage.removeItem('customMessMenu');
                
                // Reset notification tracking
                notifiedMeals = {};
                
                // Reload settings into form
                loadSettingsIntoForm();
                
                // Update the UI
                renderMenu();
                updateNextMealCountdown();
                
                showSuccessMessage("Settings have been reset to default.");
            } catch (error) {
                console.error("Error resetting settings:", error);
                showSuccessMessage("Error resetting settings. Please try again.");
            }
        }
    }
    
    // Request notification permission
    function requestNotificationPermission() {
        if ("Notification" in window) {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    showSuccessMessage("Notifications enabled!");
                    notificationsEnabled = true;
                    localStorage.setItem('mealNotifications', JSON.stringify({
                        enabled: true
                    }));
                    
                    // Update the toggle if it exists
                    const notificationToggle = document.getElementById('notification-toggle');
                    if (notificationToggle) {
                        notificationToggle.checked = true;
                    }
                } else {
                    showSuccessMessage("Notification permission denied");
                }
            });
        }
    }
    
    // Event Listeners for Settings
    settingsBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.getAttribute('data-tab'));
        });
    });
    
    daySelect.addEventListener('change', updateMenuItemsTextarea);
    mealSelect.addEventListener('change', updateMenuItemsTextarea);
    
    saveSettingsBtn.addEventListener('click', saveSettings);
    resetSettingsBtn.addEventListener('click', resetSettings);

    // Initial render
    renderMenu();
    updateNextMealCountdown();
    
    // Set up timers for updates
    setInterval(updateNextMealCountdown, 60000); // Update countdown every minute
    
    // Request notification permission on first visit
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
        // Show a message to encourage enabling notifications
        showSuccessMessage("Enable meal notifications for alerts");
        
        // Add a button to request permission
        const notificationBtn = document.createElement('button');
        notificationBtn.textContent = "🔔 Enable Notifications";
        notificationBtn.className = 'notification-enable-btn';
        notificationBtn.onclick = requestNotificationPermission;
        document.querySelector('.container').appendChild(notificationBtn);
    }
    
    // Log initialization
    console.log("Mess Menu Viewer initialized successfully");
}); 