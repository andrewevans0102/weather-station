import board
import adafruit_dht
import logging
import requests

logging.basicConfig(filename='history_weather.log',format='%(asctime)s %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p', level=logging.INFO)

dhtDevice = adafruit_dht.DHT11(board.D12)

weather_endpoint  = "<your_firebase_function_endpoint_here>"

try:
	temperature = round(dhtDevice.temperature * (9 / 5) + 32)
	humidity = dhtDevice.humidity
	weather_body = {
		'temp': str(temperature), 
		'humidity': str(humidity),
		}
	logging.info('reading successful with temp: ' + str(temperature) + ' and humidity ' + str(humidity))

	sentRequest = requests.post(url = weather_endpoint, data = weather_body)
	logging.info("weather was sent with status code of " + str(sentRequest.status_code))
except:
	logging.info('exception occured')
