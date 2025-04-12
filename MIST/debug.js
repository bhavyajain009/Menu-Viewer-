// Debug Utilities for Mess Menu Viewer

// Debug icon
const debugButton = document.createElement('button');
debugButton.innerHTML = '🐛';
debugButton.classList.add('debug-button');
debugButton.style.position = 'fixed';
debugButton.style.bottom = '10px';
debugButton.style.right = '10px';
debugButton.style.borderRadius = '50%';
debugButton.style.width = '40px';
debugButton.style.height = '40px';
debugButton.style.backgroundColor = '#f9bc60';
debugButton.style.color = 'white';
debugButton.style.border = 'none';
debugButton.style.cursor = 'pointer';
debugButton.style.zIndex = '9999';
debugButton.style.fontSize = '18px';
debugButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
document.body.appendChild(debugButton);

// Run all diagnostic tests
function runDiagnostics() {
    console.log('🔍 Running diagnostics...');
    
    // Check localStorage
    testLocalStorage();
    
    // Check menu data
    testMenuData();
    
    // Test meal timings
    testMealTimings();
    
    // Test settings
    testSettings();
    
    // Test notifications
    testNotifications();
    
    console.log('✅ Diagnostics complete');
}

// Test localStorage functionality
function testLocalStorage() {
    console.log('🔍 Testing localStorage...');
    
    try {
        // Test ability to write to localStorage
        localStorage.setItem('debug_test', 'test');
        
        // Test ability to read from localStorage
        const testValue = localStorage.getItem('debug_test');
        
        if (testValue === 'test') {
            console.log('✅ localStorage: Read/write working properly');
        } else {
            console.error('❌ localStorage: Read/write test failed');
        }
        
        // Clean up
        localStorage.removeItem('debug_test');
    } catch (error) {
        console.error('❌ localStorage error: ', error);
    }
}

// Test menu data
function testMenuData() {
    console.log('🔍 Testing menu data...');
    
    // Check if defaultMenu exists
    if (typeof defaultMenu === 'undefined') {
        console.error('❌ Menu data: defaultMenu not found');
        return;
    }
    
    // Check if defaultMenu has the right structure
    let hasError = false;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const meals = ['breakfast', 'lunch', 'eveningSnack', 'dinner'];
    
    days.forEach(day => {
        if (!defaultMenu[day]) {
            console.error(`❌ Menu data: Missing day "${day}" in defaultMenu`);
            hasError = true;
        } else {
            meals.forEach(meal => {
                if (!Array.isArray(defaultMenu[day][meal])) {
                    console.error(`❌ Menu data: Missing meal "${meal}" for day "${day}" or not an array`);
                    hasError = true;
                }
            });
        }
    });
    
    if (!hasError) {
        console.log('✅ Menu data: Structure appears correct');
    }
}

// Test meal timings
function testMealTimings() {
    console.log('🔍 Testing meal timings...');
    
    // Check if defaultMealTimings exists
    if (typeof defaultMealTimings === 'undefined') {
        console.error('❌ Meal timings: defaultMealTimings not found');
        return;
    }
    
    // Check if all meal timings are present
    const meals = ['breakfast', 'lunch', 'eveningSnack', 'dinner'];
    let hasError = false;
    
    meals.forEach(meal => {
        if (!defaultMealTimings[meal]) {
            console.error(`❌ Meal timings: Missing timing for "${meal}"`);
            hasError = true;
        } else if (!defaultMealTimings[meal].start || !defaultMealTimings[meal].end) {
            console.error(`❌ Meal timings: Missing start or end time for "${meal}"`);
            hasError = true;
        }
    });
    
    if (!hasError) {
        console.log('✅ Meal timings: All timings present and correctly formatted');
    }
}

// Test settings
function testSettings() {
    console.log('🔍 Testing settings functionality...');
    
    try {
        // Check if custom settings exist
        const customSettings = localStorage.getItem('customSettings');
        if (customSettings) {
            try {
                const settings = JSON.parse(customSettings);
                console.log('✅ Settings: Custom settings found and valid JSON');
                
                // Check if required properties exist
                if (!settings.mealTimings) {
                    console.warn('⚠️ Settings: Custom settings missing mealTimings');
                }
                
                if (!settings.menuData) {
                    console.warn('⚠️ Settings: Custom settings missing menuData');
                }
            } catch (e) {
                console.error('❌ Settings: Custom settings exist but are not valid JSON');
            }
        } else {
            console.log('ℹ️ Settings: No custom settings found, using defaults');
        }
    } catch (error) {
        console.error('❌ Settings error: ', error);
    }
}

// Test notification functionality
function testNotifications() {
    console.log('🔍 Testing notification functionality...');
    
    // Check browser support
    if (typeof Notification !== 'undefined') {
        console.log('✅ Notifications: Browser supports Notification API');
        console.log('ℹ️ Notification permission status:', Notification.permission);
    } else {
        console.warn('⚠️ Notifications: Browser does not support Notification API');
    }
    
    // Test audio
    try {
        const audio = new Audio();
        audio.volume = 0.1; // Set low volume for testing
        console.log('✅ Notifications: Audio functionality available');
    } catch (e) {
        console.error('❌ Notifications: Audio functionality error:', e);
    }
}

// Debug event listener
debugButton.addEventListener('click', function() {
    runDiagnostics();
});

console.log('Debug utilities loaded'); 