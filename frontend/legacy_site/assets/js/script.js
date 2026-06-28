// script.js - Shared scripts for Adhvaytham Villas Multi-Page Application

document.addEventListener('DOMContentLoaded', () => {
    // 1. Highlight Active Page in Sidebar
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;
    const sidebarLinks = document.querySelectorAll('.sidebar-links a');
    
    let matched = false;
    sidebarLinks.forEach(link => {
        link.classList.remove('active-page');
        const href = link.getAttribute('href');
        if (href) {
            const hrefParts = href.split('#');
            const hrefBase = hrefParts[0];
            const hrefHash = hrefParts[1] ? '#' + hrefParts[1] : '';
            const filename = hrefBase.split('/').pop();
            
            if (filename && currentPath.includes(filename)) {
                // If there's a hash in the link, only match if current page hash matches
                if (hrefHash) {
                    if (currentHash === hrefHash) {
                        link.classList.add('active-page');
                        matched = true;
                    }
                } else {
                    // Link has no hash. Match if current path has no hash, or if no exact hash match succeeded
                    if (!currentHash) {
                        link.classList.add('active-page');
                        matched = true;
                    }
                }
            }
        }
    });
    
    // Subpage mapping if no direct match
    if (!matched) {
        sidebarLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                // Highlight Availability link if we are on villas.html
                if (href.includes('villas.html#availability') && currentPath.includes('villas.html')) {
                    link.classList.add('active-page');
                    matched = true;
                }
            }
        });
    }
    
    // Fallback: If no match, check if we are on index
    if (!matched && (currentPath === '/' || currentPath.endsWith('index.html'))) {
        const homeLinks = document.querySelectorAll('a[href$="index.html"], a[href$="index.html#home"], .sidebar-links a:first-child');
        homeLinks.forEach(link => link.classList.add('active-page'));
    }

    // 2. Sidebar Navigation Toggle (Off-canvas)
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const sidebarClose = document.querySelector('.sidebar-close');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    const sidebar = document.querySelector('.sidebar');
    const sidebarLinksList = document.querySelectorAll('.sidebar-links a');

    const openSidebar = () => {
        if (sidebar && sidebarOverlay) {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    const closeSidebar = () => {
        if (sidebar && sidebarOverlay) {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', openSidebar);
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    if (sidebarLinksList) {
        sidebarLinksList.forEach(link => {
            link.addEventListener('click', closeSidebar);
        });
    }

    // 3. FAQ Accordion (For faq.html)
    const faqHeaders = document.querySelectorAll('.faq-header');
    faqHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const faqItem = header.parentElement;
            const faqContent = faqItem.querySelector('.faq-content');
            const isActive = faqItem.classList.contains('active');
            
            // Close all other items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                const content = item.querySelector('.faq-content');
                if (content) content.style.maxHeight = null;
            });
            
            // Toggle active item
            if (!isActive) {
                faqItem.classList.add('active');
                faqContent.style.maxHeight = faqContent.scrollHeight + "px";
            }
        });
    });

    // 4. Gallery Category Filter (For gallery.html)
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryCards = document.querySelectorAll('.gallery-card');

    if (filterButtons && galleryCards.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filterValue = btn.getAttribute('data-filter');
                
                galleryCards.forEach(card => {
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // 5. Native Javascript Lightbox Viewer (For gallery.html)
    const galleryImages = document.querySelectorAll('.gallery-card');
    const lightbox = document.querySelector('.lightbox-modal');
    const lightboxImg = document.querySelector('.lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const arrowLeft = document.querySelector('.arrow-left');
    const arrowRight = document.querySelector('.arrow-right');
    
    let activeImagesList = [];
    let currentImgIndex = 0;

    const updateLightboxImage = () => {
        if (activeImagesList[currentImgIndex]) {
            const img = activeImagesList[currentImgIndex].querySelector('img');
            const title = activeImagesList[currentImgIndex].querySelector('.gallery-overlay h4')?.innerText || 'Adhvaytham Villas';
            const subtitle = activeImagesList[currentImgIndex].querySelector('.gallery-overlay p')?.innerText || '';
            
            lightboxImg.src = img.src;
            lightboxCaption.innerHTML = `<strong>${title}</strong><br><span style="font-size:12px; color:#A0AEC0;">${subtitle}</span>`;
        }
    };

    if (galleryImages.length > 0 && lightbox) {
        // Open lightbox
        galleryImages.forEach(card => {
            card.addEventListener('click', () => {
                // Get all currently visible gallery images (based on filters)
                activeImagesList = Array.from(galleryImages).filter(c => c.style.display !== 'none');
                currentImgIndex = activeImagesList.indexOf(card);
                if (currentImgIndex === -1) currentImgIndex = 0;
                
                updateLightboxImage();
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        // Close lightbox
        if (lightboxClose) {
            lightboxClose.addEventListener('click', () => {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Close on click outside image
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Navigate images
        if (arrowLeft) {
            arrowLeft.addEventListener('click', (e) => {
                e.stopPropagation();
                currentImgIndex = (currentImgIndex - 1 + activeImagesList.length) % activeImagesList.length;
                updateLightboxImage();
            });
        }

        if (arrowRight) {
            arrowRight.addEventListener('click', (e) => {
                e.stopPropagation();
                currentImgIndex = (currentImgIndex + 1) % activeImagesList.length;
                updateLightboxImage();
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            } else if (e.key === 'ArrowLeft') {
                currentImgIndex = (currentImgIndex - 1 + activeImagesList.length) % activeImagesList.length;
                updateLightboxImage();
            } else if (e.key === 'ArrowRight') {
                currentImgIndex = (currentImgIndex + 1) % activeImagesList.length;
                updateLightboxImage();
            }
        });
    }

    // 6. Villa Tabs (For villas.html)
    const tabBtns = document.querySelectorAll('.tab-btn');
    const villaCards = document.querySelectorAll('.villa-card');

    if (tabBtns && villaCards.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filterValue = btn.getAttribute('data-tab');
                
                villaCards.forEach(card => {
                    const status = card.getAttribute('data-status');
                    const config = card.getAttribute('data-config');
                    
                    if (filterValue === 'all' || status === filterValue || config === filterValue) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // 7. Form Submission Handler (For contact.html)
    const contactForm = document.getElementById('mpaContactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const date = document.getElementById('visitDate')?.value;
            
            let message = `Thank you, ${name}! Your request has been received. `;
            if (date) {
                message += `We have tentatively scheduled your site visit for ${date}. Our sales team will call you at ${phone} to confirm.`;
            } else {
                message += `Our sales representative will contact you shortly at ${phone} to assist with your enquiry.`;
            }
            
            alert(message);
            contactForm.reset();
        });
    }

    // 8. Newsletter form handler (Footer)
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input');
            alert(`Thank you for subscribing! We will send development updates to ${emailInput.value}.`);
            emailInput.value = '';
        });
    }

    // 9. Sidebar Dropdown Menu Logic
    const dropdownBtns = document.querySelectorAll('.dropdown-btn');
    dropdownBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdown = btn.parentElement;
            const container = dropdown.querySelector('.dropdown-container');
            const arrow = btn.querySelector('.dropdown-arrow');
            
            const isOpen = dropdown.classList.contains('active');
            
            // Close other dropdowns if any
            document.querySelectorAll('.sidebar-dropdown').forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('active');
                    const c = d.querySelector('.dropdown-container');
                    if (c) c.style.maxHeight = null;
                    const a = d.querySelector('.dropdown-arrow');
                    if (a) a.style.transform = 'rotate(0deg)';
                }
            });
            
            if (isOpen) {
                dropdown.classList.remove('active');
                container.style.maxHeight = null;
                arrow.style.transform = 'rotate(0deg)';
            } else {
                dropdown.classList.add('active');
                container.style.maxHeight = container.scrollHeight + 'px';
                arrow.style.transform = 'rotate(180deg)';
            }
        });
    });

    // Highlight Active Dropdown / Submenu Item and Auto-expand on Load
    const submenuLinks = document.querySelectorAll('.dropdown-container a');
    let hasActiveSubmenu = false;

    submenuLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            const linkParts = href.split('?');
            const linkPath = linkParts[0].split('/').pop();
            const linkQuery = linkParts[1] || "";
            
            const currentPath = window.location.pathname.split('/').pop();
            const currentQuery = window.location.search.substring(1);
            
            if (currentPath === linkPath || (currentPath === 'villa-detail.html' && linkPath === 'street-level-map.html')) {
                if (currentPath === 'villa-detail.html') {
                    if (linkQuery === "") {
                        link.classList.add('active-submenu');
                        hasActiveSubmenu = true;
                    }
                } else {
                    if (linkQuery === "" && currentQuery === "") {
                        link.classList.add('active-submenu');
                        hasActiveSubmenu = true;
                    } else if (linkQuery !== "" && currentQuery.includes(linkQuery)) {
                        link.classList.add('active-submenu');
                        hasActiveSubmenu = true;
                    }
                }
            }
        }
    });

    if (hasActiveSubmenu) {
        const activeSubmenu = document.querySelector('.active-submenu');
        if (activeSubmenu) {
            const dropdown = activeSubmenu.closest('.sidebar-dropdown');
            if (dropdown) {
                dropdown.classList.add('active');
                const container = dropdown.querySelector('.dropdown-container');
                const arrow = dropdown.querySelector('.dropdown-btn .dropdown-arrow');
                if (container) container.style.maxHeight = container.scrollHeight + 'px';
                if (arrow) arrow.style.transform = 'rotate(180deg)';
            }
        }
    }
});
