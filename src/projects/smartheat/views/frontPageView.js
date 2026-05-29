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
    "title": "SmartHeat",
    "subtitle": "Smart tools for medical imaging workflows",
    "short": "AI-ready workspace for medical imaging, data processing and visualization tools.",
    "icon": "🧠",
    "logo": "/project-logos/smart_it.png",
    "themeClass": "g-smartit-theme",
    "anr": "Internal platform",
    "anrLink": "#",
    "grant": "Research software environment",
    "duration": "Continuous development",
    "coordinator": "CRMSB / iMRT environment",
    "about": "Smart IT centralizes medical imaging data, AI-assisted workflows and scientific visualization tools in a single Girder-based research environment. It is designed to support several project-specific platforms while keeping a shared technical foundation.",
    "mission": "Offer a reusable frontend structure for imaging projects, processing tools, dashboards and secure collaboration.",
    "partners": [
        {
            "name": "CRMSB",
            "role": "Research environment",
            "logo": "/project-logos/crmsb.png"
        },
        {
            "name": "Université de Bordeaux",
            "role": "Academic partner",
            "logo": "/project-logos/universite_bordeaux.png"
        },
        {
            "name": "CNRS",
            "role": "Research partner",
            "logo": "/project-logos/cnrs.png"
        },
        {
            "name": "ANR / France 2030",
            "role": "Research funding ecosystem",
            "logo": "/project-logos/france2030.jpg"
        }
    ],
    "competencies": [
        {
            "icon": "🤖",
            "title": "AI workflows",
            "text": "Prepare data and workflows for intelligent processing tools."
        },
        {
            "icon": "🗂️",
            "title": "Data organization",
            "text": "Manage files, collections and project workspaces."
        },
        {
            "icon": "🛠️",
            "title": "Tools",
            "text": "Connect viewers, processing services and analysis interfaces."
        },
        {
            "icon": "🔐",
            "title": "Security",
            "text": "Support authenticated access and controlled collaboration."
        },
        {
            "icon": "📊",
            "title": "Dashboards",
            "text": "Provide project-level views of data and activities."
        },
        {
            "icon": "🤝",
            "title": "Reusable platform",
            "text": "One base system adapted to multiple research projects."
        }
    ],
    "work": [
        {
            "title": "Frontend templating",
            "text": "Select a project interface with PROJECT_TEMPLATE."
        },
        {
            "title": "Visualization integration",
            "text": "Prepare entry points for Trame, ParaView and analysis tools."
        },
        {
            "title": "Shared foundation",
            "text": "Keep one Girder base with project-specific UI layers."
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
