import sys
import time
import json
import paho.mqtt.client as mqtt

# By appending the folder of all the GrovePi libraries to the system path here,
# we are successfully `import grovepi`
sys.path.append('Software/Python/')
# This append is to support importing the LCD library.
sys.path.append('Software/Python/grove_rgb_lcd')

import grovepi
from grove_rgb_lcd import *


# MQTT setup
BROKER = "broker.hivemq.com"  # public MQTT broker
PORT = 1883
TOPIC = "ultrasonic/sensor"

client = mqtt.Client()
client.connect(BROKER, PORT, 60)

print("program started")

if __name__ == '__main__':
    print("main started")
    
    ultrasonic_ranger = 4
    potentiometer = 0

    # Connect the Grove Ultrasonic Ranger to digital port D4
    # SIG,NC,VCC,GND
    grovepi.pinMode(potentiometer, "INPUT")
    time.sleep(1)

    count = 0

    while True:
        
        print("while loop started")
        try:
            # Read distance value from Ultrasonic and potentiometer
            distance = grovepi.ultrasonicRead(ultrasonic_ranger)
            potentiometer_value = grovepi.analogRead(potentiometer)

            # Mapping the potentiometer value to the ultrasonic range
            threshold = 30

            if threshold >= 30:
                threshold = 30

            if distance < threshold:
                setRGB(255, 0, 0)
                count = 1
                setText_norefresh(str(int(threshold)) + "cm Too close\n" + str(distance) + "cm")
            elif distance > threshold and count == 1:
                setRGB(0, 255, 0)
                setText(str(int(threshold)) + "cm\n" + str(distance) + "cm")
                count = 0
            else:
                setRGB(0, 255, 0)
                setText_norefresh(str(int(threshold)) + "cm\n" + str(distance) + "cm")

            # Prepare data in JSON format
            data = {
                "distance": distance,
            }
            json_data = json.dumps(data)

            # Publish the JSON data to the MQTT topic
            client.publish(TOPIC, json_data)
            print(f"Published: {json_data}")

            # Sleep to prevent sensor noise
            time.sleep(0.2)

        except KeyboardInterrupt:
            setText("Program stopped")
            setRGB(0, 0, 0)
            client.disconnect()
            print("MQTT client disconnected")
            sys.exit(0)

        except Exception as e:
            print(f"Error: {e}")
