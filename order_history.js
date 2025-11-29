// order_history.js

import { db } from "./firebase.js"; 
import { collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const orderListContainer = document.getElementById('order-list');

// --- Utility Functions ---

const getCurrentUserId = () => {
    const userString = localStorage.getItem('user');
    if (userString) {
        try {
            const user = JSON.parse(userString);
            return user.uid; 
        } catch (e) {
            console.error("Error parsing user data from localStorage:", e);
            return null;
        }
    }
    return null;
};

const formatDate = (timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') {
        try {
            const date = new Date(timestamp);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return 'N/A';
        }
    }
    const date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// --- Rendering Functions ---

const renderOrderHistory = (orders) => {
    if (orders.length === 0) {
        if (orderListContainer) orderListContainer.innerHTML = '<h2>No orders found.</h2><p>You haven\'t placed any orders yet!</p>';
        return;
    }

    let htmlContent = orders.map(order => {
        
        const itemsListHtml = order.items.map(item => {
            let itemDetails = '';
            
            // Use defensive checks for item quantities
            if ((item.fullPortionQty || 0) > 0) {
                itemDetails += `<li class="order-item">
                                    <span class="item-name">${item.name} (Full)</span>
                                    <span class="item-qty">Qty: ${item.fullPortionQty} @ Rs.${item.fullPortionPrice || 0}</span>
                                </li>`;
            }
            if ((item.halfPortionQty || 0) > 0) {
                itemDetails += `<li class="order-item">
                                    <span class="item-name">${item.name} (Half)</span>
                                    <span class="item-qty">Qty: ${item.halfPortionQty} @ Rs.${item.halfPortionPrice || 0}</span>
                                </li>`;
            }
            return itemDetails;
        }).join('');

        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <div class="order-id">Order ID: #${order.id.substring(0, 8)}</div>
                        <div class="order-date">${formatDate(order.orderDate)}</div>
                    </div>
                    <span class="order-status status-${order.status}">${order.status}</span>
                </div>
                
                <p>Table Number: <strong>${order.tableNumber}</strong></p>
                
                <ul class="order-items-list">
                    ${itemsListHtml}
                </ul>
                
                <div class="order-total">
                    Total: Rs.${(order.totalAmount || 0).toFixed(2)}
                </div>
            </div>
        `;
    }).join('');

    if (orderListContainer) orderListContainer.innerHTML = htmlContent;
};


// --- Data Fetching ---

const loadOrderHistory = async () => {
    const userId = getCurrentUserId();
    
    if (!userId) {
        if (orderListContainer) orderListContainer.innerHTML = '<h2>Please log in to view your order history.</h2>';
        return;
    }

    if (orderListContainer) orderListContainer.innerHTML = '<p>Fetching your past orders...</p>';

    try {
        const ordersRef = collection(db, 'orders');
        
        const q = query(
            ordersRef, 
            where("userId", "==", userId),
            orderBy("orderDate", "desc")
        );
        
        const snapshot = await getDocs(q);

        const orders = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        }));
        
        renderOrderHistory(orders);

    } catch (error) {
        console.error("Error loading order history:", error);
        if (orderListContainer) orderListContainer.innerHTML = '<p class="error">Failed to load order history. Check network and Firestore rules.</p>';
    }
};


// ----------------------------------------------------
// 🎯 EXECUTION BLOCK
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', loadOrderHistory);