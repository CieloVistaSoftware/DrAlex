<?php
// Example page showing how to use the header and footer partials

// Set page-specific variables
$pageTitle = "Home - Dr. Alex Kisitu";
$pageDescription = "Welcome to Dr. Alex Kisitu's professional eye care services";
?>

<!-- Include the header partial -->
<?php include 'partials/header.html'; ?>

<!-- Page-specific content -->
<div class="hero-section">
  <h1>Dr. Alex Kisitu</h1>
  <h2>Professional Eye Care Services</h2>
  <p>Providing exceptional vision care for over 15 years</p>
  <a href="contact.html" class="btn btn-primary">Schedule an Appointment</a>
</div>

<section class="services-overview">
  <h2>Our Services</h2>
  <div class="services-grid">
    <div class="service-card">
      <h3>Comprehensive Eye Exams</h3>
      <p>Complete evaluation of your vision and eye health</p>
    </div>
    <div class="service-card">
      <h3>Contact Lens Fitting</h3>
      <p>Expert fitting for all types of contact lenses</p>
    </div>
    <div class="service-card">
      <h3>Vision Therapy</h3>
      <p>Personalized treatment plans for vision improvement</p>
    </div>
  </div>
</section>

<!-- Include the footer partial -->
<?php include 'partials/footer.html'; ?>
