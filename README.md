# Smart Salon Management System (Frontend)

A React-based frontend application for managing salon operations with an AI-powered insights dashboard.

--------------------------------------------------

## Overview

This project provides a user-friendly interface for salon management, including appointment handling, service tracking, and analytics visualization. It also integrates an AI module that generates business insights based on salon data.

--------------------------------------------------

## Features

- Appointment Management  
- Service & Barber Management  
- Dashboard with Analytics (Top Services, Busiest Day, etc.)  
- AI Business Insights Generation  
- Responsive and user-friendly UI  

--------------------------------------------------

## AI Integration

The application includes an AI-powered feature that:

- Analyzes salon statistics  
- Generates business insights for decision-making  

Powered by microsoft/Phi-3-mini-4k-instruct via Hugging Face API.

--------------------------------------------------

## Tech Stack

Frontend: React.js, HTML, CSS, JavaScript  
API Communication: Axios / Fetch  
Backend: Spring Boot (separate repository)  
Database: MySQL / PostgreSQL  

--------------------------------------------------

## Project Structure

src/
 ├── components/
 ├── pages/
 ├── services/
 ├── App.js
 └── index.js

--------------------------------------------------

## Installation & Setup

1. Clone the repository

git clone https://github.com/Arav8750/smart_salon_frontend.git
cd smart_salon_frontend

2. Install dependencies

npm install

3. Run the application

npm start

The app will run at:
http://localhost:3000

--------------------------------------------------

## Backend Configuration

Make sure your backend is running and update API URL if needed.

Example:

const BASE_URL = "http://localhost:8080/api";

--------------------------------------------------

## Future Improvements

- Cloud deployment  
- Authentication and authorization  
- Real-time notifications  
- Advanced analytics  

--------------------------------------------------

## Author

Arav Ale  
GitHub: https://github.com/Arav8750  

--------------------------------------------------

## Note

This project was developed as part of a B.Tech academic project to demonstrate full-stack development and AI integration.
