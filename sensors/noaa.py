import logging
import requests

logging.basicConfig(filename='history_noaa.log',format='%(asctime)s %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p', level=logging.INFO)

noaa_endpoint  = "<your_firebase_function_endpoint_here>"

try:
	sentRequest = requests.get(url = noaa_endpoint)
	logging.info("noaa endpoint was called with a return status code of " + str(sentRequest.status_code))
except:
	logging.info('exception occured')
