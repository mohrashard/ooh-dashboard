import random
from datetime import datetime, timedelta

def generate_dummy_impressions(billboard_id, days=60):
    impressions_data = []
    base_date = datetime.now() - timedelta(days=days)
    
    if billboard_id % 3 == 0:
        base_impressions = random.randint(1500, 2000)
        variation_range = (0.8, 1.3)
    elif billboard_id % 3 == 1:
        base_impressions = random.randint(1200, 1600)
        variation_range = (0.7, 1.2)
    else:
        base_impressions = random.randint(1000, 1400)
        variation_range = (0.6, 1.1)
    
    for i in range(days):
        current_date = base_date + timedelta(days=i)
        day_of_week = current_date.weekday()
        weekend_factor = random.uniform(0.7, 0.9) if day_of_week >= 5 else random.uniform(0.9, 1.1)
        daily_variation = random.uniform(variation_range[0], variation_range[1])
        daily_impressions = int(base_impressions * weekend_factor * daily_variation)
        
        impressions_data.append({
            "date": current_date.strftime('%Y-%m-%d'),
            "impressions": daily_impressions,
            "day_of_week": current_date.strftime('%A')
        })
    
    return impressions_data

def generate_7day_prediction(historical_data):
    if len(historical_data) < 7:
        avg_impressions = sum(day["impressions"] for day in historical_data) / len(historical_data)
        base_prediction = avg_impressions
    else:
        last_7_days = historical_data[-7:]
        recent_avg = sum(day["impressions"] for day in last_7_days) / 7
        
        if len(historical_data) >= 14:
            previous_7_days = historical_data[-14:-7]
            previous_avg = sum(day["impressions"] for day in previous_7_days) / 7
            trend_factor = recent_avg / previous_avg if previous_avg > 0 else 1.0
        else:
            trend_factor = 1.0
        
        base_prediction = recent_avg * trend_factor
    
    predictions = []
    base_date = datetime.now() + timedelta(days=1)
    
    for i in range(7):
        forecast_date = base_date + timedelta(days=i)
        day_of_week = forecast_date.weekday()
        day_factor = random.uniform(0.7, 0.9) if day_of_week >= 5 else random.uniform(0.9, 1.1)
        random_factor = random.uniform(0.85, 1.15)
        predicted_impressions = int(base_prediction * day_factor * random_factor)
        confidence = max(0.75, 0.95 - (i * 0.03))
        
        predictions.append({
            "day": f"Day {i+1}",
            "date": forecast_date.strftime('%Y-%m-%d'),
            "predicted_impressions": predicted_impressions,
            "confidence": round(confidence, 2),
            "day_of_week": forecast_date.strftime('%A')
        })
    
    return predictions