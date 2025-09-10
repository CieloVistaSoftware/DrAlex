// Script to force logo positioning
document.addEventListener('DOMContentLoaded', function() {
    // Get the logo container and image
    const logoContainer = document.querySelector('.header-left');
    const logoImage = document.querySelector('.logo-image');
    
    if (logoContainer && logoImage) {
        // Force logo container to be positioned absolutely at the left with 1rem margin
        logoContainer.style.position = 'absolute';
        logoContainer.style.left = '1rem';
        logoContainer.style.top = '50%';
        logoContainer.style.transform = 'translateY(-50%)';
        logoContainer.style.zIndex = '10';
        
        // Make sure the logo image is visible
        logoImage.style.display = 'block';
        logoImage.style.maxHeight = '6rem';
        logoImage.style.margin = '0';
        
        console.log('Logo positioning applied via JavaScript');
    } else {
        console.error('Logo elements not found');
    }
});