import sys
import cv2
import numpy as np

def align_images(source_path, target_path, output_path):
    # Read the images (assuming they are generated PNGs from PDF)
    # We load them in grayscale for feature matching
    img1 = cv2.imread(target_path, cv2.IMREAD_GRAYSCALE)
    img2 = cv2.imread(source_path, cv2.IMREAD_GRAYSCALE)
    
    if img1 is None or img2 is None:
        print("Error: Could not read one of the images.")
        sys.exit(1)

    # Initialize ORB detector
    orb = cv2.ORB_create(nfeatures=10000, scaleFactor=1.2, edgeThreshold=31, fastThreshold=20)
    
    # Find keypoints and descriptors
    kp1, des1 = orb.detectAndCompute(img1, None)
    kp2, des2 = orb.detectAndCompute(img2, None)
    
    if des1 is None or des2 is None or len(kp1) < 10 or len(kp2) < 10:
        # Not enough features found, just copy the target as-is
        cv2.imwrite(output_path, img1)
        sys.exit(0)

    # Match features using Brute-Force Matcher
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    matches = bf.match(des1, des2)
    
    # Sort matches by distance
    matches = sorted(matches, key=lambda x: x.distance)
    
    # Keep top 15% of the matches to ensure quality
    keep = int(len(matches) * 0.15)
    if keep < 10:
        keep = 10
    matches = matches[:keep]
    
    # Extract location of good matches
    points1 = np.zeros((len(matches), 2), dtype=np.float32)
    points2 = np.zeros((len(matches), 2), dtype=np.float32)
    
    for i, match in enumerate(matches):
        points1[i, :] = kp1[match.queryIdx].pt
        points2[i, :] = kp2[match.trainIdx].pt
        
    # Find homography
    try:
        h, mask = cv2.findHomography(points1, points2, cv2.RANSAC, 5.0)
        
        # Check if homography is valid
        if h is not None:
            # Warp the target image to align with the source
            height, width = img2.shape
            aligned_img = cv2.warpPerspective(img1, h, (width, height), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=255)
            # Save aligned image
            cv2.imwrite(output_path, aligned_img)
            print(f"Success: Aligned image saved to {output_path}")
        else:
            # Fallback if homography failed
            print("Warning: Homography failed. Using original target image.")
            cv2.imwrite(output_path, img1)
    except Exception as e:
        print(f"Exception during homography: {e}")
        cv2.imwrite(output_path, img1)
        
if __name__ == '__main__':
    if len(sys.argv) < 4:
        print("Usage: python align_image.py <source_path> <target_path> <output_path>")
        sys.exit(1)
        
    source_path = sys.argv[1]
    target_path = sys.argv[2]
    output_path = sys.argv[3]
    
    align_images(source_path, target_path, output_path)
