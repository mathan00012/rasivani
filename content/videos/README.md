# Video stories (YouTube episodes as blog posts)

Each YouTube episode becomes a post at /blog/ta/<slug>/, /blog/te/<slug>/ and /blog/en/<slug>/,
listed first in that language's guides page, with the full script as text, the thumbnail,
and the YouTube video once its link is known. The nightly build publishes it on its date.

Add an episode:
1. python3 tools/video-post.py path/to/episodeNN.py path/to/epNN/UPLOAD-INFO.md <slug> <YYYY-MM-DD> --groups "scene|scene,scene|..."
   (--groups says which script scenes make each chapter in UPLOAD-INFO; without it each scene is its own section)
2. Copy the thumbnails to images/videos/epNN-ta.jpg, epNN-te.jpg, epNN-en.jpg (1280x720 JPEG).
3. After uploading to YouTube, paste the links into youtube.txt.
