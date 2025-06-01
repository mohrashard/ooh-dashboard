from flask import Flask, jsonify
from flask_cors import CORS
from data import generate_dummy_impressions, generate_7day_prediction

app = Flask(__name__)
CORS(app) 


BILLBOARDS = [
    {"billboard_id": "B001", "id": 1, "latitude": 6.9271, "longitude": 79.8612, "region": "Colombo 1 (Fort)", "size": "10x20", "type": "Digital", "monthly_rate": 250000, "traffic_level": "high"},
    {"billboard_id": "B002", "id": 2, "latitude": 6.9310, "longitude": 79.8500, "region": "Colombo 1 (Fort)", "size": "8x16", "type": "Static", "monthly_rate": 180000, "traffic_level": "high"}, 
    {"billboard_id": "B003", "id": 3, "latitude": 6.9138, "longitude": 79.8491, "region": "Colombo 3 (Kollupitiya)", "size": "12x24", "type": "Digital", "monthly_rate": 320000, "traffic_level": "high"},
    {"billboard_id": "B004", "id": 4, "latitude": 6.8867, "longitude": 79.8540, "region": "Colombo 4 (Bambalapitiya)", "size": "10x20", "type": "Static", "monthly_rate": 150000, "traffic_level": "medium"},
    {"billboard_id": "B005", "id": 5, "latitude": 6.8402, "longitude": 79.8712, "region": "Dehiwala", "size": "8x16", "type": "Static", "monthly_rate": 120000, "traffic_level": "medium"},
    {"billboard_id": "B006", "id": 6, "latitude": 6.9390, "longitude": 79.8528, "region": "Colombo 11 (Pettah)", "size": "15x30", "type": "Digital", "monthly_rate": 400000, "traffic_level": "high"},
    {"billboard_id": "B007", "id": 7, "latitude": 6.8729, "longitude": 79.8886, "region": "Nugegoda", "size": "10x20", "type": "Static", "monthly_rate": 140000, "traffic_level": "medium"},
    {"billboard_id": "B008", "id": 8, "latitude": 6.9076, "longitude": 79.8990, "region": "Rajagiriya", "size": "8x16", "type": "Static", "monthly_rate": 130000, "traffic_level": "medium"},
    {"billboard_id": "B009", "id": 9, "latitude": 6.8386, "longitude": 79.8631, "region": "Mount Lavinia", "size": "12x24", "type": "Digital", "monthly_rate": 280000, "traffic_level": "medium"},
    {"billboard_id": "B010", "id": 10, "latitude": 6.8741, "longitude": 79.8605, "region": "Colombo 6 (Wellawatte)", "size": "10x20", "type": "Static", "monthly_rate": 160000, "traffic_level": "medium"},
    {"billboard_id": "B011", "id": 11, "latitude": 6.8970, "longitude": 79.9180, "region": "Battaramulla", "size": "10x20", "type": "Static", "monthly_rate": 135000, "traffic_level": "medium"}, 
    {"billboard_id": "B012", "id": 12, "latitude": 6.9050, "longitude": 79.8530, "region": "Colombo 2 (Slave Island)", "size": "12x24", "type": "Digital", "monthly_rate": 310000, "traffic_level": "high"},
    {"billboard_id": "B013", "id": 13, "latitude": 6.8652, "longitude": 79.8790, "region": "Colombo 5 (Kirulapone)", "size": "8x16", "type": "Static", "monthly_rate": 125000, "traffic_level": "medium"},
    {"billboard_id": "B014", "id": 14, "latitude": 6.9025, "longitude": 79.8711, "region": "Colombo 5 (Havelock Town)", "size": "10x20", "type": "Digital", "monthly_rate": 270000, "traffic_level": "high"},
    {"billboard_id": "B015", "id": 15, "latitude": 6.8872, "longitude": 79.9056, "region": "Kohuwala", "size": "8x16", "type": "Static", "monthly_rate": 145000, "traffic_level": "medium"},
    {"billboard_id": "B016", "id": 16, "latitude": 6.8422, "longitude": 79.8741, "region": "Ratmalana", "size": "12x24", "type": "Digital", "monthly_rate": 260000, "traffic_level": "medium"},
    {"billboard_id": "B017", "id": 17, "latitude": 6.9556, "longitude": 79.8637, "region": "Colombo 13 (Kotahena)", "size": "10x20", "type": "Static", "monthly_rate": 155000, "traffic_level": "medium"},
    {"billboard_id": "B018", "id": 18, "latitude": 6.8908, "longitude": 79.9135, "region": "Colombo 5 (Narahenpita)", "size": "15x30", "type": "Digital", "monthly_rate": 390000, "traffic_level": "high"},
    {"billboard_id": "B019", "id": 19, "latitude": 6.9066, "longitude": 79.9023, "region": "Colombo 8 (Borella)", "size": "10x20", "type": "Static", "monthly_rate": 150000, "traffic_level": "medium"},
    {"billboard_id": "B020", "id": 20, "latitude": 6.9197, "longitude": 79.8700, "region": "Colombo 7 (Cinnamon Gardens)", "size": "12x24", "type": "Digital", "monthly_rate": 300000, "traffic_level": "high"}
]


@app.route('/')
def home():
    return "Billboard API is running! Use /api/billboards to get data"

@app.route('/api/billboards', methods=['GET'])
def get_billboards():
    return jsonify({
        "success": True,
        "data": BILLBOARDS
    })

@app.route('/api/predict/<billboard_id>', methods=['GET'])
def get_prediction(billboard_id):

    billboard = None
    if billboard_id.startswith('B'):
        billboard = next((b for b in BILLBOARDS if b['billboard_id'] == billboard_id), None)
    else:
        try:
            billboard_int_id = int(billboard_id)
            billboard = next((b for b in BILLBOARDS if b['id'] == billboard_int_id), None)
        except ValueError:
            pass
    
    if not billboard:
        return jsonify({"success": False, "message": "Billboard not found"}), 404
    

    past_60_days_data = generate_dummy_impressions(billboard['id'])
    predicted_7_days_data = generate_7day_prediction(past_60_days_data)
    
 
    past_60_days = [day['impressions'] for day in past_60_days_data]
    predicted_7_days = [day['predicted_impressions'] for day in predicted_7_days_data]

    total_impressions = sum(past_60_days)
    average_daily = total_impressions // len(past_60_days)
    total_predicted = sum(predicted_7_days)
    avg_confidence = sum(day['confidence'] for day in predicted_7_days_data) / len(predicted_7_days_data)
    
    return jsonify({
        "success": True,
        "billboard_id": billboard['billboard_id'],
        "billboard": billboard,
        "past_60_days": past_60_days,
        "predicted_7_days": predicted_7_days,
        "detailed_data": {
            "historical_data": {
                "data": past_60_days_data,
                "summary": {
                    "total_impressions": total_impressions,
                    "average_daily": average_daily,
                    "days_recorded": len(past_60_days_data)
                }
            },
            "prediction": {
                "forecast": predicted_7_days_data,
                "total_predicted": total_predicted,
                "average_confidence": round(avg_confidence, 2)
            }
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)