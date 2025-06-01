# 🧪 OOH Billboard Dashboard with Map & 7-Day View Predictions

A comprehensive Out-of-Home (OOH) Billboard Tracking System with interactive map visualization and machine learning-powered impression predictions.

## 🎯 Overview

This mini dashboard simulates a real-world OOH Billboard management system featuring:
- Interactive Leaflet.js map with billboard markers
- Real-time billboard data visualization
- 7-day impression predictions based on 60-day historical data
- Advanced search and filtering capabilities
- Responsive design with Tailwind CSS

## 🚀 Features

### 📍 Interactive Map
- **Leaflet.js Integration**: Interactive map centered on Colombo, Sri Lanka
- **Color-coded Markers**: Traffic level visualization (High: Red, Medium: Orange, Low: Green)
- **Billboard Details**: Click markers to view detailed information
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 📊 Prediction Analytics
- **Historical Data Analysis**: 60-day impression history for each billboard
- **7-Day Forecasting**: ML-powered predictions with confidence intervals
- **Visual Charts**: Line and bar charts using Recharts library
- **Detailed Tables**: Day-by-day breakdown with trend analysis

### 🔍 Search & Filter
- **Multi-criteria Search**: Filter by Billboard ID, Region, or ID number
- **Real-time Updates**: Map markers update instantly based on search results
- **Result Counter**: Shows filtered vs total billboard count

### 📈 Data Visualization
- **Summary Cards**: Key metrics at a glance
- **Interactive Charts**: Hover effects and detailed tooltips
- **Trend Analysis**: Day-over-day comparison with visual indicators
- **Confidence Levels**: Model confidence visualization

## 🏗️ Technology Stack

### Frontend
- **React.js** - Component-based UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Leaflet.js** - Interactive map library
- **Recharts** - Chart visualization library
- **React-Leaflet** - React wrapper for Leaflet

### Backend
- **Python Flask** - Lightweight web framework
- **Flask-CORS** - Cross-Origin Resource Sharing support
- **Custom ML Logic** - Moving average with trend analysis

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Python 3.7+
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ooh-billboard-dashboard
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install flask flask-cors
   ```

4. **Run the Flask server**
   ```bash
   python app.py
   ```
   Server will start on `http://localhost:5000`

### Frontend Setup

1. **Install Node.js dependencies**
   ```bash
   npm install
   ```

2. **Install required packages**
   ```bash
   npm install react react-dom
   npm install recharts react-leaflet leaflet
   npm install tailwindcss
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   Application will open on `http://localhost:3000`

## 📊 Sample Data Description

### Billboard Data Structure
```javascript
{
  "billboard_id": "B001",
  "id": 1,
  "latitude": 6.9271,
  "longitude": 79.8612,
  "region": "Colombo 1 (Fort)",
  "size": "10x20",
  "type": "Digital",
  "monthly_rate": 250000,
  "traffic_level": "high"
}
```

### Historical Data (60 Days)
- **Base Impressions**: Varies by billboard (1000-2000 daily)
- **Weekend Factor**: 70-90% of weekday traffic
- **Traffic Level Impact**: High (1500-2000), Medium (1200-1600), Low (1000-1400)
- **Random Variations**: ±20% daily fluctuation

### Prediction Algorithm
- **Moving Average**: 7-day rolling average as baseline
- **Trend Analysis**: Comparison between recent vs previous 7-day periods
- **Weekend Adjustment**: Reduced predictions for Saturday/Sunday
- **Confidence Decay**: 95% on Day 1, decreasing by 3% per day

## 🎮 Usage Guide

### 1. Viewing Billboards
- Map loads with 20 billboard locations across Colombo
- Color-coded markers indicate traffic levels
- Zoom and pan to explore different areas

### 2. Getting Predictions
- Click any marker to open billboard details popup
- Click "View 7-Day Predictions" button
- Detailed prediction panel opens below the map

### 3. Search Functionality
- Use search bar to filter by:
  - Billboard ID (e.g., "B001")
  - Region name (e.g., "Fort")
  - Numeric ID (e.g., "1")

### 4. Understanding Predictions
- **Line Chart**: Shows daily impression trends
- **Bar Chart**: Alternative visualization of the same data
- **Summary Cards**: Key metrics and totals
- **Detailed Table**: Day-by-day breakdown with trend indicators

## 🏗️ Architecture

### API Endpoints

#### GET `/api/billboards`
Returns list of all billboard locations and metadata.

**Response:**
```json
{
  "success": true,
  "data": [/* array of billboard objects */]
}
```

#### GET `/api/predict/<billboard_id>`
Returns historical data and 7-day predictions for specific billboard.

**Response:**
```json
{
  "success": true,
  "billboard_id": "B001",
  "past_60_days": [1200, 1230, ...],
  "predicted_7_days": [1190, 1220, ...],
  "detailed_data": {
    "historical_data": { /* 60-day data with metadata */ },
    "prediction": { /* 7-day forecast with confidence levels */ }
  }
}
```

## 🧠 Machine Learning Logic

### Prediction Model Features:
1. **Historical Analysis**: Analyzes 60 days of impression data
2. **Trend Detection**: Compares recent vs previous performance
3. **Seasonal Adjustment**: Accounts for weekday/weekend patterns
4. **Confidence Scoring**: Decreasing confidence over time
5. **Random Variation**: Realistic daily fluctuations

### Model Performance:
- **Baseline Accuracy**: Moving average provides stable baseline
- **Trend Sensitivity**: Responds to recent performance changes
- **Confidence Range**: 75-95% depending on forecast day
- **Update Frequency**: Real-time predictions on demand

## 🎨 UI/UX Features

### Design Principles:
- **Clean Interface**: Minimal, professional design
- **Color Coding**: Intuitive traffic level visualization
- **Responsive Layout**: Works on all device sizes
- **Loading States**: Clear feedback during data fetching
- **Error Handling**: Graceful error messages and recovery

### Interactive Elements:
- **Hover Effects**: Smooth transitions on buttons and charts
- **Click Feedback**: Visual confirmation of user actions
- **Real-time Updates**: Instant search results
- **Progressive Disclosure**: Details revealed on demand

## 🔧 Development Notes

### Backend Considerations:
- **CORS Enabled**: Supports cross-origin requests
- **Error Handling**: Comprehensive error responses
- **Data Validation**: Input sanitization and validation
- **Scalable Structure**: Easy to extend with real data sources

### Frontend Optimizations:
- **State Management**: Efficient React state handling
- **Component Reusability**: Modular component structure
- **Performance**: Optimized re-renders and data fetching
- **Accessibility**: Semantic HTML and ARIA labels


## 🐛 Troubleshooting

### Common Issues:

**Backend not connecting:**
- Ensure Flask server is running on port 5000
- Check CORS configuration
- Verify Python dependencies are installed

**Map not loading:**
- Check internet connection for tile layer
- Verify Leaflet CSS is properly imported
- Ensure marker icons are accessible

**Charts not displaying:**
- Confirm Recharts is properly installed
- Check browser console for JavaScript errors
- Verify data format matches expected structure

## 📄 License

This project is created as a development evaluation task. Feel free to use and modify as needed.

## 👨‍💻 Developer

Created as part of the OOH Dashboard development evaluation task, demonstrating full-stack development skills with React, Flask, and modern web technologies.

---

**Note**: This is a proof-of-concept demonstration with simulated data. In production, integrate with real billboard management systems and advanced ML models for accurate predictions.