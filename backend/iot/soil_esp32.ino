/*
  Smart Agriculture Project - IoT Module (Member 2's real implementation)
  ESP32 + Soil Moisture Sensor

  Reads analog moisture value, converts to %, sends over Serial
  as "Moisture:XX.XX" every 30 seconds for Python (serial_reader.py) to read.
*/

#define MOIST 25

const int DRY_VALUE = 4095;
const int WET_VALUE = 1085;

void setup()
{
    Serial.begin(115200);
}

void loop()
{
    int sensorValue = analogRead(MOIST);

    float moisture = ((float)(DRY_VALUE - sensorValue) /
                     (DRY_VALUE - WET_VALUE)) * 100.0;

    if (moisture > 100)
        moisture = 100;

    if (moisture < 0)
        moisture = 0;

    Serial.print("Moisture:");
    Serial.print(moisture, 2);

    delay(30000);
}
