// Content Loader - Comprehensive logging and error handling
class ContentLoader {
    constructor() {
        this.content = null;
        this.isLoaded = false;
        this.debugMode = true; // Enable detailed logging
        this.init();
    }

    log(level, category, message, data = null) {
        if (!this.debugMode) return;
        
        const emoji = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            debug: '🔍'
        };
        
        const prefix = `${emoji[level] || '📝'} [${category}]`;
        
        if (data) {
            console.log(`${prefix} ${message}`, data);
        } else {
            console.log(`${prefix} ${message}`);
        }
    }

    async init() {
        try {
            this.log('info', 'INIT', 'Starting content loader initialization');
            await this.loadContent();
            this.analyzeContentStructure();
            this.populateContent();
            this.hideLoadingOverlay();
            this.log('success', 'INIT', 'Content loader initialization complete');
        } catch (error) {
            this.log('error', 'INIT', 'Content loader initialization failed', error);
            this.showErrorFallback();
            this.hideLoadingOverlay();
        }
    }

    async loadContent() {
        try {
            this.log('info', 'FETCH', 'Attempting to load data/content.json');
            
            const response = await fetch('data/content.json');
            this.log('debug', 'FETCH', `Response status: ${response.status} (${response.statusText})`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const text = await response.text();
            this.log('debug', 'FETCH', `Content loaded: ${text.length} characters`);
            this.log('debug', 'FETCH', `First 200 chars: ${text.substring(0, 200)}...`);
            
            this.content = JSON.parse(text);
            
            // Load additional policy files
            await this.loadPolicyFiles();
            
            this.isLoaded = true;
            this.log('success', 'FETCH', 'JSON parsed successfully');
            
        } catch (error) {
            this.log('error', 'FETCH', 'Failed to load content.json', {
                name: error.name,
                message: error.message,
                stack: error.stack?.split('\n').slice(0, 3)
            });
            throw error;
        }
    }

    async loadPolicyFiles() {
        this.log('info', 'POLICIES', 'Loading policy files');
        
        // Initialize pages object if it doesn't exist
        if (!this.content.pages) {
            this.content.pages = {};
        }
        
        // Load privacy policy
        try {
            const privacyResponse = await fetch('data/privacy-policy.json');
            if (privacyResponse.ok) {
                const privacyData = await privacyResponse.json();
                this.content.pages.privacy = privacyData;
                this.log('success', 'POLICIES', 'Privacy policy loaded');
            } else {
                this.log('warning', 'POLICIES', 'Privacy policy file not found');
            }
        } catch (error) {
            this.log('warning', 'POLICIES', 'Failed to load privacy policy', error.message);
        }
        
        // Load terms of service
        try {
            const termsResponse = await fetch('data/terms-policy.json');
            if (termsResponse.ok) {
                const termsData = await termsResponse.json();
                this.content.pages.terms = termsData;
                this.log('success', 'POLICIES', 'Terms of service loaded');
            } else {
                this.log('warning', 'POLICIES', 'Terms policy file not found');
            }
        } catch (error) {
            this.log('warning', 'POLICIES', 'Failed to load terms policy', error.message);
        }
    }

    analyzeContentStructure() {
        this.log('info', 'ANALYZE', 'Analyzing content structure');
        
        if (!this.content) {
            this.log('error', 'ANALYZE', 'No content to analyze');
            return;
        }

        // Log top-level structure
        const topLevelKeys = Object.keys(this.content);
        this.log('debug', 'ANALYZE', `Top-level keys: [${topLevelKeys.join(', ')}]`);

        // Analyze site info
        const siteInfo = this.content.siteInfo || this.content.site || {};
        this.log('debug', 'ANALYZE', 'Site info structure', {
            keys: Object.keys(siteInfo),
            title: siteInfo.title,
            name: siteInfo.name,
            tagline: siteInfo.tagline,
            subtitle: siteInfo.subtitle,
            description: siteInfo.description
        });

        // Analyze navigation
        const navigation = this.content.navigation || this.content.nav || this.content.menu || [];
        this.log('debug', 'ANALYZE', `Navigation: ${navigation.length} items`, 
            navigation.map(item => ({
                id: item.id || item.section || item.page,
                label: item.label || item.name || item.title
            }))
        );

        // Analyze pages
        const pages = this.content.pages || this.content.sections || this.content.content || {};
        this.log('debug', 'ANALYZE', `Pages: [${Object.keys(pages).join(', ')}]`);
        
        // Analyze footer
        const footer = this.content.footer || {};
        this.log('debug', 'ANALYZE', 'Footer structure', {
            copyright: footer.copyright,
            links: footer.links?.length || 0
        });
    }

    populateContent() {
        this.log('info', 'POPULATE', 'Starting content population');
        
        if (!this.content) {
            this.log('error', 'POPULATE', 'No content available for population');
            return;
        }

        this.populateSiteInfo();
        this.populateNavigation();
        this.populatePageContent();
        this.populateFooter();
        
        this.log('success', 'POPULATE', 'Content population complete');
    }

    populateSiteInfo() {
        this.log('info', 'SITE_INFO', 'Populating site information');
        
        const siteInfo = this.content.siteInfo || this.content.site || {};
        const headerInfo = this.content.header || {}; // Use dedicated header section if available
        
        // Update page title (meta)
        if (siteInfo.title) {
            document.title = siteInfo.title;
        }
        
        // Update header elements using header section if available, fall back to site section
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            const headerTitle = headerInfo.title || siteInfo.title;
            if (headerTitle) {
                pageTitle.textContent = headerTitle;
                this.log('success', 'SITE_INFO', `Page title updated: "${headerTitle}"`);
            }
        } else {
            this.log('warning', 'SITE_INFO', 'pageTitle element not found');
        }

        // Update page description in header
        const pageDescription = document.getElementById('pageDescription');
        if (pageDescription) {
            const headerDesc = headerInfo.description || siteInfo.description;
            if (headerDesc) {
                pageDescription.textContent = headerDesc;
                this.log('success', 'SITE_INFO', `Page description updated: "${headerDesc}"`);
            }
        } else {
            this.log('warning', 'SITE_INFO', 'pageDescription element not found');
        }
        
        // Update header logo if specified in content.json (prefer header section)
        const headerImg = document.querySelector('.logo-image');
        if (headerImg) {
            const logoSrc = headerInfo.logo || siteInfo.logo;
            const logoAlt = headerInfo.logoAlt || siteInfo.logoAlt || siteInfo.title || 'SEHT Clinic Logo';
            
            if (logoSrc) {
                headerImg.src = logoSrc;
                headerImg.alt = logoAlt;
                this.log('success', 'SITE_INFO', `Header logo updated: ${logoSrc}`);
            }
        }
        
        // Update additional header elements if they exist
        const headerSubtitle = document.querySelector('.header-subtitle');
        if (headerSubtitle) {
            headerSubtitle.textContent = headerInfo.subtitle || 'Smart Eye Health Technologies';
            this.log('debug', 'SITE_INFO', 'Header subtitle updated');
        }
        
        const headerTagline = document.querySelector('.header-tagline');
        if (headerTagline) {
            headerTagline.textContent = headerInfo.tagline || 'At SEHT, Vision is Possible';
            this.log('debug', 'SITE_INFO', 'Header tagline updated');
        }

        // Nav header has been removed, so we don't need to update navigation branding
        // Just log the site info for reference
        this.log('debug', 'SITE_INFO', 'Navigation header removed, skipping branding update', {
            name: siteInfo.name || siteInfo.title || 'SEHT-Smart Eye Health Technologies',
            subtitle: siteInfo.tagline || siteInfo.subtitle || 'Eye Care Specialist'
        });
    }

    populateNavigation() {
        this.log('info', 'NAVIGATION', 'Populating navigation menu');
        
        const navigation = this.content.navigation || this.content.nav || this.content.menu || [];
        const navList = document.getElementById('nav-list');
        
        if (!navList) {
            this.log('error', 'NAVIGATION', 'nav-list element not found');
            return;
        }

        if (navigation.length === 0) {
            this.log('warning', 'NAVIGATION', 'No navigation items found');
            return;
        }

        this.log('debug', 'NAVIGATION', `Processing ${navigation.length} navigation items`);
        
        navList.innerHTML = '';
        
        navigation.forEach((item, index) => {
            const itemId = item.id || item.section || item.page;
            const itemLabel = item.label || item.name || item.title;
            
            if (!itemId || !itemLabel) {
                this.log('warning', 'NAVIGATION', `Skipping invalid nav item at index ${index}`, item);
                return;
            }

            const li = document.createElement('li');
            li.setAttribute('role', 'none');
            
            const link = document.createElement('a');
            // Use href without hash tags for cleaner URLs
            // JS navigation will handle this through the data-section attribute
            link.href = `javascript:void(0)`;
            link.className = index === 0 ? 'nav-link active' : 'nav-link';
            link.setAttribute('data-section', itemId);
            link.setAttribute('role', 'menuitem');
            link.setAttribute('tabindex', index === 0 ? '0' : '-1');
            link.textContent = itemLabel;
            
            li.appendChild(link);
            navList.appendChild(li);
            
            this.log('debug', 'NAVIGATION', `Added nav item: ${itemLabel} (${itemId})`);
        });
        
        this.log('success', 'NAVIGATION', `Navigation populated with ${navigation.length} items`);
    }

    populatePageContent() {
        this.log('info', 'PAGES', 'Populating page content');
        
        const pages = this.content.pages || this.content.sections || this.content.content || {};
        const pageKeys = Object.keys(pages);
        
        if (pageKeys.length === 0) {
            this.log('warning', 'PAGES', 'No page content found');
            return;
        }

        this.log('debug', 'PAGES', `Processing ${pageKeys.length} pages: [${pageKeys.join(', ')}]`);
        
        pageKeys.forEach(pageId => {
            this.log('debug', 'PAGES', `Processing page: ${pageId}`);
            this.populatePage(pageId, pages[pageId]);
        });
        
        this.log('success', 'PAGES', 'Page content population complete');
    }

    populatePage(pageId, pageData) {
        const section = document.getElementById(pageId);
        if (!section) {
            this.log('warning', 'PAGE', `Section element not found: ${pageId}`);
            return;
        }

        if (!pageData) {
            this.log('warning', 'PAGE', `No data for page: ${pageId}`);
            return;
        }

        this.log('debug', 'PAGE', `Populating page: ${pageId}`, {
            dataKeys: Object.keys(pageData),
            title: pageData.title
        });

        // Update section title
        const sectionTitle = section.querySelector('.section-title');
        if (sectionTitle && pageData.title) {
            sectionTitle.textContent = pageData.title;
            this.log('debug', 'PAGE', `Updated section title: ${pageData.title}`);
        }

        // Handle different page types
        switch (pageId) {
            case 'home':
                this.populateHomePage(section, pageData);
                break;
            case 'about':
                this.populateAboutPage(section, pageData);
                break;
            case 'services':
                this.populateServicesPage(section, pageData);
                break;
            case 'portfolio':
                this.populatePortfolioPage(section, pageData);
                break;
            case 'contact':
                this.populateContactPage(section, pageData);
                break;
            case 'chat':
                this.populateChatPage(section, pageData);
                break;
            case 'privacy':
            case 'terms':
                this.populatePolicyPage(section, pageData);
                break;
            default:
                this.log('debug', 'PAGE', `No specific handler for page: ${pageId}`);
        }
    }

    populatePolicyPage(section, data) {
        this.log('debug', 'POLICY', 'Populating policy page', {
            title: data.title,
            lastUpdated: data.lastUpdated,
            contentSections: data.content?.length || 0,
            dataKeys: Object.keys(data),
            fullData: data
        });

        // Clear existing content except title
        section.innerHTML = '';
        
        // Add title
        if (data.title) {
            const titleElement = document.createElement('h2');
            titleElement.className = 'section-title';
            titleElement.textContent = data.title;
            section.appendChild(titleElement);
            this.log('debug', 'POLICY', `Added title: ${data.title}`);
        }

        // Add last updated info if available
        if (data.lastUpdated) {
            const updatedElement = document.createElement('p');
            updatedElement.style.color = 'var(--text-secondary, #cccccc)';
            updatedElement.style.fontSize = '0.875rem';
            updatedElement.style.marginBottom = '2rem';
            updatedElement.style.opacity = '0.8';
            updatedElement.textContent = `Last updated: ${data.lastUpdated}`;
            section.appendChild(updatedElement);
            this.log('debug', 'POLICY', `Added last updated: ${data.lastUpdated}`);
        }

        // Check if content exists and is an array
        if (!data.content) {
            this.log('warning', 'POLICY', 'No content property found in policy data');
            const errorCard = document.createElement('div');
            errorCard.className = 'content-card';
            errorCard.innerHTML = '<p class="card-description">No policy content available. Please check the JSON structure.</p>';
            section.appendChild(errorCard);
            return;
        }

        if (!Array.isArray(data.content)) {
            this.log('warning', 'POLICY', 'Content is not an array', typeof data.content);
            const errorCard = document.createElement('div');
            errorCard.className = 'content-card';
            errorCard.innerHTML = '<p class="card-description">Policy content format error. Content should be an array.</p>';
            section.appendChild(errorCard);
            return;
        }

        if (data.content.length === 0) {
            this.log('warning', 'POLICY', 'Content array is empty');
            const errorCard = document.createElement('div');
            errorCard.className = 'content-card';
            errorCard.innerHTML = '<p class="card-description">No policy content sections found.</p>';
            section.appendChild(errorCard);
            return;
        }

        // Add content sections
        this.log('debug', 'POLICY', `Processing ${data.content.length} content sections`);
        
        data.content.forEach((contentItem, index) => {
            this.log('debug', 'POLICY', `Processing section ${index}:`, {
                title: contentItem.title,
                descriptionLength: contentItem.description?.length || 0
            });

            const card = document.createElement('div');
            card.className = 'content-card';
            
            const titleText = contentItem.title || `Section ${index + 1}`;
            const descriptionText = contentItem.description || 'No description available';
            
            card.innerHTML = `
                <h3 class="card-title">${titleText}</h3>
                <p class="card-description">${descriptionText}</p>
            `;
            
            section.appendChild(card);
            this.log('debug', 'POLICY', `Added policy section: ${titleText}`);
        });
        
        this.log('success', 'POLICY', `Policy page populated with ${data.content.length} sections`);
    }

    populateHomePage(section, data) {
        this.log('debug', 'HOME', 'Populating home page', {
            hasHero: !!data.hero,
            hasServices: !!data.services,
            servicesCount: data.services?.length || 0,
            dataKeys: Object.keys(data)
        });

        // Update hero section
        if (data.hero) {
            const heroTitle = section.querySelector('.hero-title');
            const heroDescription = section.querySelector('.hero-description');
            
            if (heroTitle && data.hero.title) {
                heroTitle.textContent = data.hero.title;
                this.log('debug', 'HOME', `Hero title updated: ${data.hero.title}`);
            }
            
            if (heroDescription && data.hero.description) {
                heroDescription.textContent = data.hero.description;
                this.log('debug', 'HOME', 'Hero description updated');
            }
            
            // Ensure we have the hero content structure
            const heroSection = section.querySelector('.hero-section');
            if (heroSection) {
                // Make sure we have the hero-content div
                if (!heroSection.querySelector('.hero-content')) {
                    // Save current content
                    const currentContent = heroSection.innerHTML;
                    
                    heroSection.innerHTML = `
                        <div class="hero-content">
                            ${heroTitle ? heroTitle.outerHTML : '<h2 class="hero-title"></h2>'}
                            ${heroDescription ? heroDescription.outerHTML : '<p class="hero-description"></p>'}
                        </div>
                    `;
                    
                    this.log('debug', 'HOME', 'Hero structure updated');
                }
            }
        }

        // Try to find services from multiple possible sources
        let servicesData = data.services || this.content.services || [];
        
        // If no services in home page data, try to get from main services section
        if (!servicesData || servicesData.length === 0) {
            const servicesPage = this.content.pages?.services;
            if (servicesPage?.services) {
                servicesData = servicesPage.services.slice(0, 3); // Take first 3 for home page
                this.log('debug', 'HOME', `Using services from services page: ${servicesData.length} items`);
            }
        }

        // Update service cards
        if (servicesData && servicesData.length > 0) {
            this.populateServiceCards(section, servicesData);
        } else {
            this.log('warning', 'HOME', 'No services data found for home page');
            // Manually update the fallback cards with better content
            const cards = section.querySelectorAll('.content-card');
            if (cards.length >= 3) {
                const fallbackServices = [
                    { title: 'Comprehensive Eye Exams', description: 'Complete eye health evaluations using state-of-the-art equipment.' },
                    { title: 'Contact Lens Fitting', description: 'Expert fitting and follow-up care for all types of contact lenses.' },
                    { title: 'Prescription Glasses', description: 'High-quality prescription glasses tailored to your vision needs.' }
                ];
                
                fallbackServices.forEach((service, index) => {
                    if (cards[index]) {
                        const title = cards[index].querySelector('.card-title');
                        const description = cards[index].querySelector('.card-description');
                        if (title) title.textContent = service.title;
                        if (description) description.textContent = service.description;
                    }
                });
                this.log('debug', 'HOME', 'Applied fallback service content');
            }
        }
    }

    populateAboutPage(section, data) {
        this.log('debug', 'ABOUT', 'Populating about page', {
            dataKeys: Object.keys(data)
        });

        // Clear existing content to add our new cards
        while (section.children.length > 1) { // Keep the section title
            section.removeChild(section.lastChild);
        }

        // Update section title if it exists
        const sectionTitle = section.querySelector('.section-title');
        if (sectionTitle && data.title) {
            sectionTitle.textContent = data.title;
        }
        
        // Create main info card with description and mission
        if (data.description || data.mission) {
            const mainCard = document.createElement('div');
            mainCard.className = 'content-card';
            
            let mainCardContent = '';
            if (data.subtitle) {
                mainCardContent += `<h3 class="card-title">${data.subtitle}</h3>`;
            }
            if (data.description) {
                mainCardContent += `<p class="card-description">${data.description}</p>`;
            }
            if (data.mission) {
                mainCardContent += `<h4 style="margin-top: 1rem;">Our Mission</h4>`;
                mainCardContent += `<p class="card-description">${data.mission}</p>`;
            }
            
            mainCard.innerHTML = mainCardContent;
            section.appendChild(mainCard);
            this.log('debug', 'ABOUT', 'Added main info card');
        }
        
        // Create card for team info if it exists in the content
        const team = this.content.team;
        if (team && team.length > 0) {
            const teamCard = document.createElement('div');
            teamCard.className = 'content-card';
            teamCard.innerHTML = `<h3 class="card-title">Our Team</h3>`;
            
            team.forEach(member => {
                const memberDiv = document.createElement('div');
                memberDiv.className = 'team-member';
                memberDiv.style.marginBottom = '1rem';
                
                let memberHtml = `<h4>${member.name}</h4>`;
                memberHtml += `<p class="role">${member.role}</p>`;
                
                if (member.description) {
                    memberHtml += `<p>${member.description}</p>`;
                }
                
                if (member.specialties && member.specialties.length > 0) {
                    memberHtml += `<p><strong>Specialties:</strong> ${member.specialties.join(', ')}</p>`;
                }
                
                memberDiv.innerHTML = memberHtml;
                teamCard.appendChild(memberDiv);
            });
            
            section.appendChild(teamCard);
            this.log('debug', 'ABOUT', `Added team card with ${team.length} members`);
        }
        
        // Create card for values if they exist
        if (data.values && data.values.length > 0) {
            const valuesCard = document.createElement('div');
            valuesCard.className = 'content-card';
            
            let valuesHtml = `<h3 class="card-title">Our Values</h3>`;
            valuesHtml += `<ul style="padding-left: 1.5rem;">`;
            
            data.values.forEach(value => {
                valuesHtml += `<li>${value}</li>`;
            });
            
            valuesHtml += `</ul>`;
            valuesCard.innerHTML = valuesHtml;
            
            section.appendChild(valuesCard);
            this.log('debug', 'ABOUT', `Added values card with ${data.values.length} values`);
        }
    }

    populateServicesPage(section, data) {
        this.log('debug', 'SERVICES', 'Populating services page');
        if (data.services) {
            this.populateServiceCards(section, data.services);
        }
    }

    populateServiceCards(section, services) {
        this.log('debug', 'SERVICES', `Populating ${services.length} service cards`);
        
        const grid = section.querySelector('.content-grid');
        if (!grid) {
            this.log('warning', 'SERVICES', 'content-grid not found in section');
            return;
        }

        grid.innerHTML = '';
        
        services.forEach((service, index) => {
            const card = document.createElement('div');
            card.className = 'content-card';
            
            card.innerHTML = `
                <h3 class="card-title">${service.title}</h3>
                <p class="card-description">${service.description}</p>
                ${service.details ? `<div class="service-details"><p>${service.details}</p></div>` : ''}
            `;
            
            grid.appendChild(card);
            this.log('debug', 'SERVICES', `Added service card: ${service.title}`);
        });
    }

    populatePortfolioPage(section, data) {
        this.log('debug', 'PORTFOLIO', 'Populating portfolio page');
        
        // Use testimonials from the root of content.json if not found in page data
        let testimonials = data.testimonials || this.content.testimonials || [];
        
        this.log('debug', 'PORTFOLIO', `Found ${testimonials.length} testimonials`);

        if (testimonials && testimonials.length > 0) {
            // Clear the section but keep the title
            const sectionTitle = section.querySelector('.section-title');
            section.innerHTML = '';
            
            // Restore or create the section title
            if (sectionTitle) {
                section.appendChild(sectionTitle);
            } else {
                const newTitle = document.createElement('h2');
                newTitle.className = 'section-title';
                newTitle.textContent = data.title || 'Patient Stories & Well Wishes';
                section.appendChild(newTitle);
            }
            
            // Add description if it exists
            if (data.description) {
                const descriptionEl = document.createElement('p');
                descriptionEl.className = 'section-description';
                descriptionEl.textContent = data.description;
                section.appendChild(descriptionEl);
            }
            
            // Add testimonials
            testimonials.forEach((testimonial, index) => {
                const card = document.createElement('div');
                card.className = 'testimonial-card';
                
                card.innerHTML = `
                    <div class="testimonial-text">${testimonial.text}</div>
                    <div class="testimonial-author">
                        <div>
                            <div class="author-name">${testimonial.name}</div>
                            <div class="author-info">${testimonial.relationship || testimonial.info || ''}</div>
                            <div class="rating-stars">${'⭐'.repeat(testimonial.rating || 5)}</div>
                        </div>
                    </div>
                `;
                
                section.appendChild(card);
                this.log('debug', 'PORTFOLIO', `Added testimonial: ${testimonial.name}`);
            });
        } else {
            this.log('warning', 'PORTFOLIO', 'No testimonials found to display');
            
            // Create a fallback message
            const fallbackCard = document.createElement('div');
            fallbackCard.className = 'content-card';
            fallbackCard.innerHTML = `
                <h3 class="card-title">Patient Stories</h3>
                <p class="card-description">Patient testimonials will appear here. We're working on adding them soon!</p>
            `;
            
            section.appendChild(fallbackCard);
        }
    }

    populateContactPage(section, data) {
        this.log('debug', 'CONTACT', 'Populating contact page');

        if (data.contact) {
            const grid = section.querySelector('.content-grid');
            if (grid) {
                grid.innerHTML = '';
                
                Object.keys(data.contact).forEach(key => {
                    const item = data.contact[key];
                    const card = document.createElement('div');
                    card.className = 'content-card';
                    
                    card.innerHTML = `
                        <h3 class="card-title">${item.title}</h3>
                        <div class="card-description">${item.content}</div>
                    `;
                    
                    grid.appendChild(card);
                    this.log('debug', 'CONTACT', `Added contact card: ${item.title}`);
                });
            }
        }
    }

    populateChatPage(section, data) {
        this.log('debug', 'CHAT', 'Populating chat page');
        const sectionTitle = section.querySelector('.section-title');
        if (sectionTitle && data.title) {
            sectionTitle.textContent = data.title;
        }
    }

    populateFooter() {
        this.log('info', 'FOOTER', 'Populating footer');
        
        const footer = this.content.footer || {};
        
        // Update copyright - try multiple sources
        const footerCopyright = document.getElementById('footer-copyright');
        if (footerCopyright) {
            let copyrightText = footer.copyright;
            
            // If no copyright in footer, try to build from site info
            if (!copyrightText) {
                const siteInfo = this.content.siteInfo || this.content.site || {};
                const siteName = siteInfo.name || siteInfo.title || 'SEHT-Smart Eye Health Technologies';
                const currentYear = new Date().getFullYear();
                copyrightText = `© ${currentYear} ${siteName}. All rights reserved.`;
                this.log('debug', 'FOOTER', `Generated copyright: ${copyrightText}`);
            }
            
            footerCopyright.textContent = copyrightText;
            this.log('success', 'FOOTER', `Copyright updated: ${copyrightText}`);
        } else {
            this.log('warning', 'FOOTER', 'footer-copyright element not found');
        }

        // Update footer links
        if (footer.links && footer.links.length > 0) {
            const footerLinks = document.getElementById('footer-links');
            if (footerLinks) {
                footerLinks.innerHTML = '';
                
                footer.links.forEach(link => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    // Use javascript:void(0) instead of hash links for cleaner URLs
                    a.href = "javascript:void(0)";
                    a.className = 'footer-link responsive-footer-link';
                    
                    // Create text with line break for mobile display
                    const linkText = link.label || link.name || link.title;
                    a.innerHTML = linkText.split(' ').join('<br class="mobile-only">');
                    
                    // Use the ID directly as the section identifier
                    const sectionId = link.id;
                    if (sectionId) {
                        a.setAttribute('data-section', sectionId);
                        
                        // IMPORTANT: We no longer add click handlers here
                        // All navigation is handled by NavigationManager
                        this.log('debug', 'FOOTER', `Added footer link for section: ${sectionId}`);
                    }
                    
                    li.appendChild(a);
                    footerLinks.appendChild(li);
                    
                    this.log('debug', 'FOOTER', `Added footer link: ${link.label || link.name}`);
                });
                
                this.log('success', 'FOOTER', `Footer populated with ${footer.links.length} links`);
            } else {
                this.log('warning', 'FOOTER', 'footer-links element not found');
            }
        } else {
            this.log('warning', 'FOOTER', 'No footer links found in content');
            
            // Add fallback footer links
            const footerLinks = document.getElementById('footer-links');
            if (footerLinks) {
                const fallbackLinks = [
                    { label: 'Home', id: 'home' },
                    { label: 'About', id: 'about' },
                    { label: 'Services', id: 'services' },
                    { label: 'Contact', id: 'contact' }
                ];
                
                footerLinks.innerHTML = '';
                fallbackLinks.forEach(link => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = "javascript:void(0)";
                    a.className = 'footer-link responsive-footer-link';
                    a.setAttribute('data-section', link.id);
                    
                    // Create text with line break for mobile display
                    a.innerHTML = link.label.split(' ').join('<br class="mobile-only">');
                    
                    // IMPORTANT: No click handler added here
                    // All navigation is now handled by NavigationManager
                    
                    li.appendChild(a);
                    footerLinks.appendChild(li);
                });
                
                this.log('debug', 'FOOTER', 'Applied fallback footer links');
            }
        }
    }

    showErrorFallback() {
        this.log('warning', 'FALLBACK', 'Showing error fallback content');
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
            this.log('success', 'UI', 'Loading overlay hidden');
        }
    }

    // Public API methods
    getSiteInfo() {
        return this.content?.siteInfo || this.content?.site || {};
    }

    getPageData(pageId) {
        const pages = this.content?.pages || this.content?.sections || this.content?.content || {};
        return pages[pageId] || {};
    }

    getNavigation() {
        return this.content?.navigation || this.content?.nav || this.content?.menu || [];
    }

    isContentLoaded() {
        return this.isLoaded;
    }

    // Toggle debug mode
    setDebugMode(enabled) {
        this.debugMode = enabled;
        this.log('info', 'DEBUG', `Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
}

// Initialize content loader
const contentLoader = new ContentLoader();

// Simple footer link setup - no special handling needed
document.addEventListener('DOMContentLoaded', () => {
    console.log('Setting up footer links');
    
    // Just add data-section attributes to footer links
    const footerLinks = document.querySelectorAll('.footer-link');
    footerLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            const sectionId = href.substring(1);
            
            // Add data-section attribute for consistency with main nav
            if (!link.hasAttribute('data-section')) {
                link.setAttribute('data-section', sectionId);
            }
        }
    });
});

// Make it globally available
window.ContentLoader = contentLoader;

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentLoader;
}