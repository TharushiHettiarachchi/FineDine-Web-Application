// drawer/home.js (inside the drawer folder)

import { db } from "../firebase.js"; 
import { collection, query, getDocs } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

let currentUser = null;

// ===============================================
// 🏠 1. FUNCTION DEFINITIONS (MUST BE FIRST)
// ===============================================

const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.replace('../index.html');
};

const groupItemsByCategory = (docs) => {
    const categories = {};
    docs.forEach(doc => {
        const item = doc.data();
        const categoryName = item.category || 'Uncategorized'; 
        
        if (!categories[categoryName]) {
            categories[categoryName] = [];
        }
        categories[categoryName].push({ ...item, id: doc.id }); 
    });
    return categories;
};

const loadFullMenu = async () => {
    const menuContainer = document.getElementById('menu-container');
    if (!menuContainer) {
        console.error("Menu container not found.");
        return;
    }
    menuContainer.innerHTML = '<p>Fetching full menu...</p>';

    try {
        const q = query(collection(db, 'foods'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            menuContainer.innerHTML = '<h3>The menu is currently empty.</h3>';
            return;
        }

        const categorizedMenu = groupItemsByCategory(querySnapshot.docs);
        
        let htmlContent = '';
        const categoryNames = Object.keys(categorizedMenu).sort(); 
        
        categoryNames.forEach((categoryName) => {
            htmlContent += `<div class="category-section">`;
            htmlContent += `<h3 class="category-header">${categoryName}</h3>`;
            htmlContent += `<div class="food-list-horizontal">`; 
            
            categorizedMenu[categoryName].forEach((item) => {
                let priceHtml = '';
                if (item.fullPortionPrice) {
                    priceHtml += `<span>Full: Rs.${item.fullPortionPrice}</span>`;
                }
                if (item.halfPortionPrice) {
                    if (priceHtml) priceHtml += ' | '; 
                    priceHtml += `<span>Half: Rs.${item.halfPortionPrice}</span>`;
                }
                if (!priceHtml) priceHtml = 'Price not listed';

                const imageUrl = item.imageUrl || 'https://via.placeholder.com/250x170?text=Food'; 
                const productUrl = `../product.html?id=${item.id}`; 
                
                const vegLabel = item.isVegetarian 
                    ? '<span style="color: darkgreen; margin-left: 5px; font-size: 0.9em; font-weight: bold;">(Veg.)</span>' 
                    : '';

                htmlContent += `
                    <div class="food-item-card">
                        <img src="${imageUrl}" alt="${item.name}" class="food-item-image">
                        <div class="item-details">
                            <h4>${item.name} ${vegLabel}</h4>
                            <p class="description">${item.description}</p>
                            <p class="price-info">${priceHtml}</p>
                            <a href="${productUrl}" class="view-button">View</a>
                        </div>
                    </div>
                `;
            });

            htmlContent += `</div>`;
            htmlContent += `</div>`;
        });

        menuContainer.innerHTML = htmlContent;

    } catch (error) {
        console.error("Error loading menu:", error);
        menuContainer.innerHTML = '<p class="error">Could not load the full menu. Check connection/permissions.</p>';
    }
};
const initializeHomeLayout = () => {

    const welcomeElement = document.getElementById('welcome-message');
    if (welcomeElement) {
        const fullName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
        welcomeElement.textContent = `Hello, ${fullName || 'User'}!`;
    }

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    loadFullMenu().then(() => {
        enableSearchFilter(); // ✅ Activate search AFTER menu loads
    });
};


// ===============================================
// 🛑 2. IMMEDIATE AUTHENTICATION CHECK (MUST BE LAST)
// ===============================================

const userString = localStorage.getItem('user');

if (!userString) {
    window.location.replace('../index.html');
    throw new Error("User not logged in. Redirecting.");
}

try {
    // 1. Safely parse the user data.
    currentUser = JSON.parse(userString);
    
    // 2. CRITICAL CHECK: Ensure the required 'uid' field exists.
    if (!currentUser || !currentUser.uid) {
        throw new Error("User data is invalid or missing UID.");
    }

    // 3. CALL FUNCTION: Now that all definitions are above, this will execute successfully.
    initializeHomeLayout();

} catch (e) {
    // Fallback: This block will only execute if JSON parsing fails or the UID check fails.
    console.error("Home Script Critical Error: Failed to parse/validate user data. Logging out.", e);
    localStorage.removeItem('user');
    window.location.replace('../index.html');
}

const enableSearchFilter = () => {
    const searchInput = document.getElementById('search-input');
    const menuContainer = document.getElementById('menu-container');

    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase();
        const cards = menuContainer.querySelectorAll(".food-item-card");

        cards.forEach(card => {
            const name = card.querySelector("h4")?.textContent.toLowerCase() || "";
            const desc = card.querySelector(".description")?.textContent.toLowerCase() || "";

            if (name.includes(term) || desc.includes(term)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });

        // Hide empty category sections
        document.querySelectorAll(".category-section").forEach(section => {
            const visible = section.querySelectorAll(".food-item-card:not([style*='display: none'])").length;
            section.style.display = visible > 0 ? "block" : "none";
        });
    });
};
