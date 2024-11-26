""" EE 250L Lab 02: GrovePi Sensors

List team members here.

Insert Github repository link here.
https://github.com/usc-ee250-fall2024/lab-02-grovepi-sensors-wesleychou7
"""

"""python3 interpreters in Ubuntu (and other linux distros) will look in a 
default set of directories for modules when a program tries to `import` one. 
Examples of some default directories are (but not limited to):
  /usr/lib/python3.5
  /usr/local/lib/python3.5/dist-packages

The `sys` module, however, is a builtin that is written in and compiled in C for
performance. Because of this, you will not find this in the default directories.
"""
import sys
import time

# By appending the folder of all the GrovePi libraries to the system path here,
# we are successfully `import grovepi`
sys.path.append("../../Software/Python/")
# This append is to support importing the LCD library.
sys.path.append("../../Software/Python/grove_rgb_lcd")

import grovepi
from grove_rgb_lcd import *

"""This if-statement checks if you are running this python file directly. That 
is, if you run `python3 grovepi_sensors.py` in terminal, this if-statement will 
be true"""
if __name__ == "__main__":
    ultrasonic_ranger = 4  # D4
    potentiometer = 0  # A0

    distance = 0
    threshold = 0
    text = ""

    # clear lcd screen before starting main loop
    setText("")

    while True:
        # So we do not poll the sensors too quickly which may introduce noise,
        # sleep for a reasonable time of 200ms between each iteration.
        time.sleep(0.2)

        try:
            # TODO:read distance value from Ultrasonic Ranger and print distance on LCD
            distance = grovepi.ultrasonicRead(ultrasonic_ranger)

            # TODO: read threshold from potentiometer
            threshold = grovepi.analogRead(potentiometer)

            object_present = distance < threshold

            # TODO: format LCD text according to threshhold
            setText_norefresh(
                f"{distance:4}cm {'OBJ PRES' if object_present else '        '}\n{threshold:4}cm"
            )

        except IOError:
            print("Error")
