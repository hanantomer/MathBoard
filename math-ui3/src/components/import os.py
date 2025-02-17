import os
import cv2
import time

def convert_to_monochrome(image_path):
    # Read the image
    image = cv2.imread(image_path)
    if image is None:
        print(f"Failed to load image {image_path}")
        return

    # Convert the image to grayscale
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Save the monochrome image
    monochrome_image_path = os.path.splitext(image_path)[0] + "_monochrome.png"
    cv2.imwrite(monochrome_image_path, gray_image)
    print(f"Converted {image_path} to monochrome and saved as {monochrome_image_path}")

def poll_directory(directory_path):
    processed_files = set()

    while True:
        for filename in os.listdir(directory_path):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
                file_path = os.path.join(directory_path, filename)
                if file_path not in processed_files:
                    convert_to_monochrome(file_path)
                    processed_files.add(file_path)
        
        time.sleep(1)

if __name__ == "__main__":
    directory_to_watch = "path/to/your/directory"
    poll_directory(directory_to_watch)