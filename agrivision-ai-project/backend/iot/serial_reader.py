import serial
import threading
import time
SERIAL_PORT = 'COM11'
BAUD_RATE = 115200
latest_moisture = None
ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
time.sleep(3)
ser.reset_input_buffer()

def read_serial():
    global latest_moisture
    while True:
        try:
            line = ser.readline().decode('utf-8', errors='ignore').strip()
            if line.startswith('Moisture:'):
                latest_moisture = float(line.split(':')[1])
                print('Moisture:', latest_moisture, '%')
        except Exception:
            pass
thread = threading.Thread(target=read_serial, daemon=True)
thread.start()

def get_moisture():
    global latest_moisture
    timeout = time.time() + 5
    while latest_moisture is None:
        if time.time() > timeout:
            return None
        time.sleep(0.1)
    return latest_moisture
soil_data = {}

def save_soil_reading(soil_type):
    value = get_moisture()
    soil_data[soil_type] = value
    return value
