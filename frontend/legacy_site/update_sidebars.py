import os
import re

root_dir = r"c:\Users\pothi\Downloads\adhvaytham villas"
pages_dir = os.path.join(root_dir, "pages")

root_sidebar = """<aside class="sidebar">
        <div class="sidebar-top">
            <span class="sidebar-close">&times;</span>
            <a href="index.html" class="sidebar-logo">Adhvaytham <span>Villas</span></a>
        </div>
        <nav class="sidebar-links">
            <a href="index.html">Home</a>
            <a href="pages/about.html">About</a>
            <div class="sidebar-dropdown">
                <button class="dropdown-btn">Master Layout <i class="fas fa-chevron-down dropdown-arrow"></i></button>
                <div class="dropdown-container">
                    <a href="pages/street-level-map.html">Street Level Map</a>
                    <a href="pages/street-level-map.html?view=master-plan">Master Plan</a>
                    <a href="pages/street-level-map.html?filter=all">All 120 Villas</a>
                    <a href="pages/street-level-map.html?filter=available">Available Villas</a>
                    <a href="pages/street-level-map.html?filter=occupied">Occupied Villas</a>
                    <a href="pages/street-level-map.html?filter=construction">Under Construction Villas</a>
                    <a href="pages/street-level-map.html?filter=sold">Sold Villas</a>
                </div>
            </div>
            <a href="pages/villas.html#availability">Availability</a>
            <a href="pages/amenities.html">Amenities</a>
            <a href="pages/gallery.html">Gallery</a>
            <a href="pages/location.html">Location</a>
            <a href="pages/contact.html">Contact</a>
        </nav>
        <div class="sidebar-bottom">
            <a href="pages/contact.html" class="btn btn-primary btn-full btn-sm">Schedule Site Visit</a>
        </div>
    </aside>"""

pages_sidebar = """<aside class="sidebar">
        <div class="sidebar-top">
            <span class="sidebar-close">&times;</span>
            <a href="../index.html" class="sidebar-logo">Adhvaytham <span>Villas</span></a>
        </div>
        <nav class="sidebar-links">
            <a href="../index.html">Home</a>
            <a href="about.html">About</a>
            <div class="sidebar-dropdown">
                <button class="dropdown-btn">Master Layout <i class="fas fa-chevron-down dropdown-arrow"></i></button>
                <div class="dropdown-container">
                    <a href="street-level-map.html">Street Level Map</a>
                    <a href="street-level-map.html?view=master-plan">Master Plan</a>
                    <a href="street-level-map.html?filter=all">All 120 Villas</a>
                    <a href="street-level-map.html?filter=available">Available Villas</a>
                    <a href="street-level-map.html?filter=occupied">Occupied Villas</a>
                    <a href="street-level-map.html?filter=construction">Under Construction Villas</a>
                    <a href="street-level-map.html?filter=sold">Sold Villas</a>
                </div>
            </div>
            <a href="villas.html#availability">Availability</a>
            <a href="amenities.html">Amenities</a>
            <a href="gallery.html">Gallery</a>
            <a href="location.html">Location</a>
            <a href="contact.html">Contact</a>
        </nav>
        <div class="sidebar-bottom">
            <a href="contact.html" class="btn btn-primary btn-full btn-sm">Schedule Site Visit</a>
        </div>
    </aside>"""

root_header = """<header class="top-bar">
        <button class="hamburger-btn" aria-label="Open Menu">
            <i class="fas fa-bars"></i>
        </button>
        <a href="index.html" class="logo">Adhvaytham <span>Villas</span></a>
    </header>"""

pages_header = """<header class="top-bar">
        <button class="hamburger-btn" aria-label="Open Menu">
            <i class="fas fa-bars"></i>
        </button>
        <a href="../index.html" class="logo">Adhvaytham <span>Villas</span></a>
    </header>"""

def update_file(file_path, sidebar_content, header_content):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    
    # Locate <aside class="sidebar"> ... </aside>
    pattern = re.compile(r'<aside class="sidebar">.*?</aside>', re.DOTALL)
    if pattern.search(content):
        new_content = pattern.sub(sidebar_content, new_content)
        print(f"Successfully updated sidebar in {os.path.basename(file_path)}")
    else:
        print(f"Could not find sidebar block in {os.path.basename(file_path)}")
        
    # Locate <header class="top-bar"> ... </header>
    header_pattern = re.compile(r'<header class="top-bar">.*?</header>', re.DOTALL)
    if header_pattern.search(new_content):
        new_content = header_pattern.sub(header_content, new_content)
        print(f"Successfully updated header in {os.path.basename(file_path)}")
    else:
        print(f"Could not find header block in {os.path.basename(file_path)}")
        
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

# Update root index.html
update_file(os.path.join(root_dir, "index.html"), root_sidebar, root_header)

# Update pages
for filename in os.listdir(pages_dir):
    if filename.endswith(".html"):
        update_file(os.path.join(pages_dir, filename), pages_sidebar, pages_header)

print("All sidebars and headers processed.")
