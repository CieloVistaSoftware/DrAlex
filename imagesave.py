from PIL import ImageGrab
import datetime
import os

save_dir = r"C:\Users\jwpmi\Downloads\DrAlex\attachments"
os.makedirs(save_dir, exist_ok=True)
img = ImageGrab.grabclipboard()
if img:
    filename = f"clipboard_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
    img.save(os.path.join(save_dir, filename), 'PNG')
    print(f"Saved: {filename}")
else:
    print("No image in clipboard.")
