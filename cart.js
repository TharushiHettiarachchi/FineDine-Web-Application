// cart.js

import { db } from "./firebase.js"; 
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, getDoc, addDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const cartListContainer = document.getElementById('cart-list');
const cartSummaryBar = document.getElementById('cart-summary-bar');
const checkoutModal = document.getElementById('checkout-modal');
const tableNumberInput = document.getElementById('table-number-input');

let cartItems = [];
let foodCache = {}; 
let totalCartValue = 0;



const getCurrentUserId = () => {
    const userString = localStorage.getItem('user');
    if (userString) {
        try {
            const user = JSON.parse(userString);
          
            return user.uid; 
        } catch (e) {
            console.error("UTILITY ERROR: Error parsing user data from localStorage:", e);
            return null;
        }
    }
    console.warn("UTILITY WARNING: No 'user' data found in localStorage.");
    return null;
};



const showModal = () => {
    if (checkoutModal) checkoutModal.style.display = 'block';
};

const hideModal = () => {
    if (checkoutModal) checkoutModal.style.display = 'none';
    const tableInputSection = document.getElementById('table-input-section');
    const qrScannerSection = document.getElementById('qr-scanner-section');
    if (tableInputSection) tableInputSection.style.display = 'none';
    if (qrScannerSection) qrScannerSection.style.display = 'none';
};

const setupModalListeners = () => {
    if (document.getElementById('close-modal-btn')) {
        document.getElementById('close-modal-btn').addEventListener('click', hideModal);
    }
    
    if (document.getElementById('type-table-btn')) {
        document.getElementById('type-table-btn').addEventListener('click', () => {
            document.getElementById('table-input-section').style.display = 'block';
            document.getElementById('qr-scanner-section').style.display = 'none';
        });
    }
    
    if (document.getElementById('scan-qr-btn')) {
        document.getElementById('scan-qr-btn').addEventListener('click', () => {
            document.getElementById('table-input-section').style.display = 'none';
            document.getElementById('qr-scanner-section').style.display = 'block';
            alert("QR Scanning is not fully implemented yet. Please use the 'Type Table Number' option.");
        });
    }

    if (document.getElementById('confirm-table-btn') && tableNumberInput) {
        document.getElementById('confirm-table-btn').addEventListener('click', () => {
            const tableNumber = tableNumberInput.value.trim();
            if (tableNumber) {
                finalizeOrder(tableNumber);
            } else {
                alert("Please enter a table number.");
            }
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === checkoutModal) {
            hideModal();
        }
    });
};




const fetchFoodDetails = async () => {
    const productIds = [...new Set(cartItems.map(item => item.productId))];
    const foodCollection = collection(db, 'foods');

    for (const id of productIds) {
        try {
            if (!foodCache[id]) {
                const foodDocRef = doc(foodCollection, id);
                const foodSnap = await getDoc(foodDocRef);
                
                if (foodSnap.exists()) {
                    const data = foodSnap.data();
                    
                   
                    foodCache[id] = {
                        name: data.name || 'Unknown',
                        imageUrl: data.imageUrl || '', 
                      
                        fullPrice: data.fullPortionPrice || 0, 
                        halfPrice: data.halfPortionPrice || 0,
                    };
                } else {
                    console.error(`FETCH ERROR: Food document NOT FOUND for ID: ${id}`);
                }
            }
        } catch (error) {
            console.error(`FETCH CRITICAL ERROR: Failed to get food details for ID ${id}.`, error);
        }
    }
};

const loadCart = async () => {
    const userId = getCurrentUserId();
    
    if (!userId) {
        if (cartListContainer) cartListContainer.innerHTML = '<h2>Please log in to view your cart.</h2>';
        return;
    }
    
    if (cartListContainer) cartListContainer.innerHTML = '<p>Fetching your cart items...</p>';
    
    try {
        const qCart = query(collection(db, 'cart'), where("userId", "==", userId));
        const cartSnapshot = await getDocs(qCart);

        if (cartSnapshot.empty) {
            cartItems = [];
            renderCart();
            return;
        }

        cartItems = cartSnapshot.docs.map(doc => ({ ...doc.data(), cartDocId: doc.id }));
        
        await fetchFoodDetails();
        renderCart();

    } catch (error) {
        console.error("CART CRITICAL ERROR: Fatal error during cart loading.", error);
        if (cartListContainer) {
             cartListContainer.innerHTML = '<p class="error">Could not load cart data. Please check Firestore permissions.</p>';
        }
    }
};




const attachQuantityListeners = () => { 
    document.querySelectorAll('.qty-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const cartDocId = e.currentTarget.dataset.id;
            const portionType = e.currentTarget.dataset.type;
            const change = parseInt(e.currentTarget.dataset.change);
            
            await updateCartQuantity(cartDocId, portionType, change);
        });
    });
};

const renderCart = () => {
    totalCartValue = 0; 
    
    if (cartItems.length === 0) {
        if (cartListContainer) cartListContainer.innerHTML = '<h2>Your cart is empty.</h2><p>Start adding delicious items from the menu!</p>';
        if (cartSummaryBar) cartSummaryBar.innerHTML = '';
        return;
    }

    let htmlContent = '';

    cartItems.forEach(item => {
        const food = foodCache[item.productId];
        
        if (!food) {
            console.error(`RENDER WARNING: Skipping item because food details were missing for ID: ${item.productId}`);
            return; 
        }
        
      
        const fullSubtotal = (item.fullPortionQty || 0) * (food.fullPrice || 0);
        const halfSubtotal = (item.halfPortionQty || 0) * (food.halfPrice || 0);
        const itemTotal = fullSubtotal + halfSubtotal;
        totalCartValue += itemTotal; 

        const imageUrl = food.imageUrl || 'https://placehold.co/80x80?text=Food';

        htmlContent += `
            <div class="cart-item-card" data-id="${item.cartDocId}">
                <img src="${imageUrl}" alt="${food.name}" class="cart-item-image">
                <div class="item-details">
                    <h4>${food.name}</h4>
                    
                    ${(item.fullPortionQty || 0) > 0 ? `
                        <p>Full Qty (Rs.${food.fullPrice || 0}): 
                            <span class="qty-control-group">
                                <button class="qty-btn" data-id="${item.cartDocId}" data-type="full" data-change="-1">−</button>
                                <span class="qty-input">${item.fullPortionQty}</span>
                                <button class="qty-btn" data-id="${item.cartDocId}" data-type="full" data-change="+1">+</button>
                            </span>
                        </p>
                    ` : ''}

                    ${(item.halfPortionQty || 0) > 0 ? `
                        <p>Half Qty (Rs.${food.halfPrice || 0}): 
                            <span class="qty-control-group">
                                <button class="qty-btn" data-id="${item.cartDocId}" data-type="half" data-change="-1">−</button>
                                <span class="qty-input">${item.halfPortionQty}</span>
                                <button class="qty-btn" data-id="${item.cartDocId}" data-type="half" data-change="+1">+</button>
                            </span>
                        </p>
                    ` : ''}

                    <div class="price-row">
                        <button class="remove-btn" data-id="${item.cartDocId}" onclick="handleRemoveItem('${item.cartDocId}')">Remove</button>
                        <span class="subtotal-price">Rs.${itemTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
    });

    if (cartListContainer) cartListContainer.innerHTML = htmlContent;
    renderSummaryBar(totalCartValue);
    attachQuantityListeners(); 
};

const renderSummaryBar = (total) => {
    if (!cartSummaryBar) return;
    
   
    const displayTotal = (total || 0).toFixed(2);
    
    cartSummaryBar.innerHTML = `
        <div class="summary-total">Total: Rs.${displayTotal}</div>
        <button class="checkout-btn" id="checkout-btn" ${total === 0 ? 'disabled' : ''}>Proceed to Checkout</button>
    `;
    
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', showModal);
};

const updateCartQuantity = async (cartDocId, portionType, change) => {
    const itemIndex = cartItems.findIndex(item => item.cartDocId === cartDocId);
    if (itemIndex === -1) return;
    
    const item = cartItems[itemIndex];
    const qtyField = portionType === 'full' ? 'fullPortionQty' : 'halfPortionQty';
    let newQty = (item[qtyField] || 0) + change; 

    if (newQty < 0) newQty = 0;
    
    const otherQtyField = portionType === 'full' ? 'halfPortionQty' : 'fullPortionQty';
    const otherQty = item[otherQtyField] || 0;
    
    if (newQty === 0 && otherQty === 0) {
        await handleRemoveItem(cartDocId);
        return;
    }
    
    const updateData = {
        [qtyField]: newQty,
        updatedAt: new Date()
    };
    
    try {
        await updateDoc(doc(db, 'cart', cartDocId), updateData);
        item[qtyField] = newQty;
        renderCart(); 

    } catch (error) {
        console.error("Error updating quantity in cart:", error);
        alert("Failed to update quantity.");
    }
};

window.handleRemoveItem = async (cartDocId) => {
    if (!confirm("Are you sure you want to remove this item from the cart?")) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, 'cart', cartDocId));
        cartItems = cartItems.filter(item => item.cartDocId !== cartDocId);
        renderCart();

    } catch (error) {
        console.error("Error removing item from cart:", error);
        alert("Failed to remove item.");
    }
};



const finalizeOrder = async (tableNumber) => {
    if (!tableNumber || tableNumber.toString().trim() === "") {
        alert("Please provide a valid table number.");
        return;
    }
    
    if (cartItems.length === 0) {
        alert("Your cart is empty. Nothing to order.");
        return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
        alert("User session expired. Please log in again.");
        return;
    }
    
   const orderItems = cartItems.map(item => {
        const food = foodCache[item.productId];
        
        if (!food) {
            console.warn(`Skipping order item: Missing food details for ID: ${item.productId}`);
            return null; 
        }
        
        return {
          
            fullPortionPrice: food.fullPrice || 0,
            fullPortionQty: item.fullPortionQty || 0,
            halfPortionPrice: food.halfPrice || 0,
            halfPortionQty: item.halfPortionQty || 0,
            imageUrl: food.imageUrl || '',
            name: food.name || 'Unknown Item',
            productId: item.productId,
            
         
        };
    }).filter(item => item !== null && item !== undefined); 
    
    
    if (orderItems.length === 0) {
        alert("Your cart is empty after validation. Nothing to order.");
        return;
    }
    
 
    const validatedTotalAmount = isNaN(totalCartValue) ? 0 : totalCartValue;

   
    const orderDocument = {
        userId: userId,
        totalAmount: validatedTotalAmount,
        orderDate: new Date(),
        status: "Pending", 
        tableNumber: tableNumber,
        items: orderItems,
    };

    try {
    
        const orderRef = await addDoc(collection(db, 'orders'), orderDocument); 

     
        const deletePromises = cartItems.map(item => 
            deleteDoc(doc(db, 'cart', item.cartDocId))
        );
        await Promise.all(deletePromises);

        
        alert(`Order Placed Successfully! Table: ${tableNumber}. Order ID: ${orderRef.id}`);
        
        cartItems = [];
        renderCart();
        hideModal();
        
    } catch (error) {
        console.error("Error finalizing order:", error); 
        alert("Failed to place order. Check console for details.");
    }
};


document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    setupModalListeners();
});