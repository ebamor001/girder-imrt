import $ from 'jquery';

import View from '@girder/core/views/View';
import events from '@girder/core/events';
import { cancelRestRequests } from '@girder/core/rest';
import { getCurrentUser } from '@girder/core/auth';
import {
    translate,
    setLanguage,
    getCurrentLanguage
} from '@girder/core/utilities/translations';

import '@girder/core/stylesheets/body/frontPage.styl';

const PROJECT = {
    "title": "OPLA",
    "subtitle": "Optimal MR Protocol for monitoring SVD patients at low magnetic field",
    "short": "Low-field MRI protocol workspace for SVD monitoring and clinical research.",
    "icon": "🧲",
    "logo": "/project-logos/opla.png",
    "themeClass": "g-opla-theme",
    "anr": "ANR-25-CE19-5558",
    "anrLink": "https://anr.fr/Project-ANR-25-CE19-5558",
    "grant": "ANR health technologies project",
    "duration": "ANR 2025 selected project",
    "coordinator": "Medical imaging consortium",
    "about": "OPLA focuses on optimized MR protocols for monitoring small vessel disease patients at low magnetic field. The platform provides a project-specific interface to organize imaging protocols, compare acquisitions, manage datasets and centralize collaborative review.",
    "mission": "Provide a clean workspace for low-field MRI protocol data, cohort organization, quality control and analysis outputs.",
    "partners": [
        {
            "name": "Université de Bordeaux",
            "role": "Academic partner",
            "logo": "/project-logos/universite_bordeaux.png"
        },
        {
            "name": "Université d’Angers",
            "role": "Academic and clinical research partner",
            "logo": "/project-logos/universite_angers.png"
        },
        {
            "name": "CNRS",
            "role": "Research partner",
            "logo": "/project-logos/cnrs.png"
        },
        {
            "name": "ANR / France 2030",
            "role": "Funding ecosystem",
            "logo": "/project-logos/france2030.jpg"
        }
    ],
    "competencies": [
        {
            "icon": "🧲",
            "title": "Low-field MRI",
            "text": "Protocol design for low magnetic field imaging systems."
        },
        {
            "icon": "🧠",
            "title": "SVD monitoring",
            "text": "Support for longitudinal monitoring of small vessel disease."
        },
        {
            "icon": "📐",
            "title": "Protocol optimization",
            "text": "Compare acquisition strategies and imaging quality."
        },
        {
            "icon": "🔐",
            "title": "Secure repository",
            "text": "Controlled access to sensitive research data."
        },
        {
            "icon": "📊",
            "title": "Analytics",
            "text": "Dashboard views for datasets, collections and results."
        },
        {
            "icon": "🤝",
            "title": "Clinical collaboration",
            "text": "Shared workspace between imaging and clinical teams."
        }
    ],
    "work": [
        {
            "title": "Protocol workspace",
            "text": "Organize imaging protocol versions, metadata and experimental comparisons."
        },
        {
            "title": "Monitoring dashboard",
            "text": "Help teams follow cohorts, collections and analysis outputs."
        },
        {
            "title": "Low-field review",
            "text": "Centralize quality review and collaborative interpretation."
        }
    ]
};

function languageLabel() {
    return getCurrentLanguage() === 'french' ? 'EN' : getCurrentLanguage() === 'english' ? 'DE' : 'FR';
}

function partnerCards() {
    return PROJECT.partners.map((partner) => `
        <div class="g-partner-card">
            <div class="g-partner-logo-wrap">
                <img class="g-partner-logo" src="${partner.logo}" alt="${partner.name} logo" />
            </div>
            <strong>${partner.name}</strong>
            <span>${partner.role}</span>
        </div>
    `).join('');
}

function competencyCards() {
    return PROJECT.competencies.map((item) => `
        <div class="g-feature-card">
            <div class="g-feature-emoji">${item.icon}</div>
            <h3>${item.title}</h3>
            <p>${item.text}</p>
        </div>
    `).join('');
}

function workCards() {
    return PROJECT.work.map((item) => `
        <div class="g-work-card">
            <h3>${item.title}</h3>
            <p>${item.text}</p>
        </div>
    `).join('');
}

const FrontPageView = View.extend({
    events: {
        'click .g-login-link': function () {
            events.trigger('g:loginUi');
        },
        'click .g-register-link': function () {
            events.trigger('g:registerUi');
        },
        'click .g-access-platform-btn': function () {
            events.trigger('g:loginUi');
        },
        'click .g-language-switcher': function (event) {
            event.preventDefault();

            const currentLanguage = getCurrentLanguage();
            let nextLanguage = 'french';

            if (currentLanguage === 'french') {
                nextLanguage = 'english';
            } else if (currentLanguage === 'english') {
                nextLanguage = 'german';
            }

            setLanguage(nextLanguage);
            this.render();
        }
    },

    initialize: function () {
        cancelRestRequests('fetch');
        $('body').addClass('g-landing-page-active');
        this.render();
    },

    render: function () {
        const currentUser = getCurrentUser();

        if (currentUser) {
            $('body').removeClass('g-landing-page-active');
            return this.renderDashboard(currentUser);
        }

        this.$el.html(`
            <div class="g-project-shell ${PROJECT.themeClass}">
                <div class="g-project-container">
                    <header class="g-topbar">
                        <div class="g-brand">
                            <img class="g-brand-logo" src="${PROJECT.logo}" alt="${PROJECT.title} logo" />
                            <div>
                                <h1 class="g-brand-title">${PROJECT.title}</h1>
                                <p class="g-brand-subtitle">${PROJECT.short}</p>
                            </div>
                        </div>

                        <div class="g-actions">
                            <button class="g-btn g-language-switcher">${languageLabel()}</button>
                            <button class="g-btn g-login-link">${translate('Login')}</button>
                            <button class="g-btn g-btn-secondary g-register-link">${translate('Sign up')}</button>
                        </div>
                    </header>

                    <section class="g-hero">
                        <div>
                            <span class="g-hero-kicker">${PROJECT.icon} ${PROJECT.anr}</span>
                            <h1>${PROJECT.title}</h1>
                            <p>${PROJECT.subtitle}</p>
                            <div class="g-hero-buttons">
                                <button class="g-hero-button g-access-platform-btn">${translate('Access the platform')}</button>
                                <a class="g-hero-button g-hero-button-alt" href="${PROJECT.anrLink}" target="_blank" rel="noreferrer">${translate('Learn More')}</a>
                            </div>
                        </div>

                        <aside class="g-hero-card">
                            <img class="g-hero-project-logo" src="${PROJECT.logo}" alt="${PROJECT.title} logo" />
                            <div class="g-meta-line">🏷️ <span>${PROJECT.anr}</span></div>
                            <div class="g-meta-line">👤 <span>${PROJECT.coordinator}</span></div>
                            <div class="g-meta-line">📅 <span>${PROJECT.duration}</span></div>
                            <div class="g-meta-line">💶 <span>${PROJECT.grant}</span></div>
                        </aside>
                    </section>

                    <section class="g-section">
                        <div class="g-section-header">
                            <div class="g-section-icon">📌</div>
                            <h2>${translate('Project overview')}</h2>
                        </div>
                        <p class="g-section-lead">${PROJECT.about}</p>
                        <div class="g-info-grid">
                            <div class="g-info-pill"><strong>Mission</strong><span>${PROJECT.mission}</span></div>
                            <div class="g-info-pill"><strong>Platform</strong><span>Girder-based repository for project datasets, collaborative work and visualization tools.</span></div>
                            <div class="g-info-pill"><strong>Access</strong><span>Authentication, groups and collections are kept from the official Girder workflow.</span></div>
                        </div>
                    </section>

                    <section class="g-section">
                        <div class="g-section-header">
                            <div class="g-section-icon">🧩</div>
                            <h2>${translate('Key competencies')}</h2>
                        </div>
                        <div class="g-card-grid">${competencyCards()}</div>
                    </section>

                    <section class="g-section">
                        <div class="g-section-header">
                            <div class="g-section-icon">🤝</div>
                            <h2>${translate('Consortium & partners')}</h2>
                        </div>
                        <div class="g-partners">${partnerCards()}</div>
                    </section>

                    <section class="g-section">
                        <div class="g-section-header">
                            <div class="g-section-icon">🧪</div>
                            <h2>${translate('Research workpackages')}</h2>
                        </div>
                        <div class="g-work-grid">${workCards()}</div>
                    </section>

                    <section class="g-section">
                        <div class="g-section-header">
                            <div class="g-section-icon">🏢</div>
                            <h2>${translate('About the platform')}</h2>
                        </div>
                        <p class="g-section-lead">This interface keeps the page structure used in the previous Vicky prototype while making the visual identity cleaner, more project-oriented and reusable across Thermolyse, OPLA and Smart IT.</p>
                    </section>
                </div>
            </div>
        `);

        return this;
    },

    renderDashboard: function (currentUser) {
        this.$el.html(`
            <div class="g-dashboard-shell ${PROJECT.themeClass}">
                <div class="g-project-container">
                    <section class="g-dashboard-hero">
                        <div class="g-dashboard-topbar">
                            <div class="g-dashboard-brand">
                                <img src="${PROJECT.logo}" alt="${PROJECT.title} logo" />
                                <span>${PROJECT.title}</span>
                            </div>
                            <button class="g-btn g-language-switcher">${languageLabel()}</button>
                        </div>

                        <h1>${translate('Welcome to')} ${PROJECT.title}</h1>
                        <p>${translate('Hello')}, <strong>${currentUser.get('firstName') || currentUser.get('login')}</strong>. ${PROJECT.mission}</p>
                    </section>

                    <section class="g-dashboard-grid">
                        <a class="g-dashboard-card" href="#user/${currentUser.id}">
                            <span>📁</span>
                            <h3>${translate('My data')}</h3>
                            <p>${translate('Access your files and datasets.')}</p>
                        </a>

                        <a class="g-dashboard-card" href="#collections">
                            <span>🗂️</span>
                            <h3>${translate('Collections')}</h3>
                            <p>${translate('Browse shared project collections.')}</p>
                        </a>

                        <a class="g-dashboard-card" href="#groups">
                            <span>👥</span>
                            <h3>${translate('Groups')}</h3>
                            <p>${translate('Collaborate with research teams.')}</p>
                        </a>

                        <a class="g-dashboard-card" href="/trame" target="_blank">
                            <span>🛠️</span>
                            <h3>Tools</h3>
                            <p>${translate('Launch interactive visualization tools.')}</p>
                        </a>
                    </section>
                    <section class="g-dashboard-section">
                        <h2>Contacts</h2>
                        <div class="g-contact-alert">
                            For any questions about the ${PROJECT.title} platform, please contact the project team.
                        </div>

                        <div class="g-contact-grid">
                            <div class="g-contact-card">
                                <strong>Valéry Ozenne</strong>
                                <span>Project Coordinator</span>
                                <a href="mailto:valery.ozenne@u-bordeaux.fr">valery.ozenne@u-bordeaux.fr</a>
                            </div>

                            <div class="g-contact-card">
                                <strong>Support Team</strong>
                                <span>Technical Support</span>
                                <a href="mailto:support@u-bordeaux.fr">support@u-bordeaux.fr</a>
                            </div>
                        </div>
                    </section>

                    <section class="g-dashboard-section">
                        <h2>Quick Stats</h2>
                        <div class="g-stats-grid">
                            <div class="g-stat-card"><strong>--</strong><span>Files Uploaded</span></div>
                            <div class="g-stat-card"><strong>--</strong><span>Collections</span></div>
                            <div class="g-stat-card"><strong>--</strong><span>Groups Joined</span></div>
                        </div>
                    </section>

                    <section class="g-dashboard-section">
                        <h2>Quick Actions</h2>
                        <div class="g-quick-actions">
                            <a class="g-action-btn" href="#collections">📁 Browse Collections</a>
                            <a class="g-action-btn" href="#user/${currentUser.id}">👤 My Data Space</a>
                            <a class="g-action-btn" href="#groups">👥 Manage Groups</a>
                        </div>
                    </section>
                </div>
            </div>
        `);

        return this;
    },

    destroy: function () {
        $('body').removeClass('g-landing-page-active');
        View.prototype.destroy.call(this);
    }
});

export default FrontPageView;
