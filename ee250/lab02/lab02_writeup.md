4.1
git clone git@github.com:my-name/my-imaginary-repo.git
cd my-imaginary-repo
touch my_second_file.py
echo 'print("Hello World")' >> my_second_file.py
git add my_second_file.py
git commit -m "add second file"
git push origin main

4.2
I developed locally (MacOS) on VSCode and pushed to GitHub.com. I then go to the RPi secure shell on my VM and pull the changes. This is quite inconvenient as I have to push and pull for every change I make. I will probably edit natively on the RPi next time.

4.3
The delay amount is 0.002 seconds. It uses the I2C communication protocol.