// Script to handle logo image fallback
document.addEventListener('DOMContentLoaded', function() {
    const logoImage = document.getElementById('logoImage');
    const logoFallback = document.getElementById('logoFallback');
    
    // If the image fails to load, show the fallback
    logoImage.addEventListener('error', function() {
        if (logoFallback) {
            logoImage.style.display = 'none';
            logoFallback.style.display = 'block';
        }
    });
    
    // If the image loads successfully, hide the fallback
    logoImage.addEventListener('load', function() {
        if (logoFallback) {
            logoImage.style.display = 'block';
            logoFallback.style.display = 'none';
            
            // Let CSS handle dimensions
            logoImage.style.display = 'block';
        }
    });
    
    // Let CSS handle dimensions
    logoImage.style.objectFit = 'contain';
});