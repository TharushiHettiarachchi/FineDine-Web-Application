# 🤖🍽️ Fine Dine – Waiter Robot Customer Web Application

## Overview

**Fine Dine** is a customer-side web application designed to integrate with an autonomous waiter robot in a smart restaurant environment. The application enables customers to digitally view the menu and place orders, which are then transmitted to the robot system through cloud-based services, creating a seamless and contactless dining experience.

This project focuses on the **web-based customer interface**, while both **admin panel and customer-side functionalities are also provided through a dedicated mobile application**.

---

## Role in the Waiter Robot System

The system consists of both **web and mobile applications** and acts as the **human–robot interaction layer** of the waiter robot ecosystem:

* Customers place orders using the web application or the mobile application
* Orders are stored and synchronized in real time using **Firebase**
* The waiter robot retrieves order data and performs delivery tasks accordingly
* Menu images are hosted and served efficiently via **Cloudinary**

This architecture enables reliable communication between users and the autonomous robot using cloud-based IoT principles.

---

## Key Features

* 📱 Customer-friendly digital menu
* 🧾 Simple and intuitive order placement
* ☁️ Real-time cloud data synchronization using Firebase
* 🖼️ Cloud-based image management with Cloudinary
* 📐 Responsive design for mobile and tablet devices

---

## Platforms

* 🌐 Web Application (Customer-side)
* 📱 Mobile Application (Admin panel + Customer-side)

## Technologies Used

* **Frontend:** HTML, CSS, JavaScript
* **Cloud & IoT:** Firebase (Realtime Database / Firestore)
* **Media Storage:** Cloudinary

---

## System Architecture (High-Level)

1. Customer selects items through the web interface
2. Order data is sent to Firebase in real time
3. Waiter robot system reads order data from Firebase
4. Robot navigates and serves food to the respective table

---

## Use Case

This application is ideal for:

* Autonomous waiter robot projects
* Smart restaurant and IoT-based food service systems
* Academic and research projects involving robotics and cloud integration

---

## Project Objective

The main objective of this project is to demonstrate how **web technologies and cloud services** can be integrated with **robotics and IoT systems** to enhance automation and customer experience in modern dining environments.

---

## Future Improvements

* Live order status tracking
* Voice or gesture-based interaction
* Robot feedback integration (delivery confirmation)
* Multi-language support

---

## Author

Developed as part of an autonomous waiter robot project focusing on robotics, IoT, and web-based human–machine interaction.
