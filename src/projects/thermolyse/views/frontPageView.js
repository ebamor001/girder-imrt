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
    title: 'Thermolyse',
    subtitle: 'Plateforme IRM pour la simulation et la thermoablation',
    description: 'Visualiser, organiser et traiter les données IRM utilisées en radiologie interventionnelle.',
    logo: '/project-logos/thermolyse.png',
    mainTool: 'Simulation thermique',
    secondTool: 'Visualisation IRM',
    themeClass: 'g-thermolyse-theme'
};

function languageLabel() {
    return getCurrentLanguage() === 'french' ? 'EN' : getCurrentLanguage() === 'english' ? 'DE' : 'FR';
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
            <div class="g-project-page ${PROJECT.themeClass}">
                <header class="g-project-header">
                    <div class="g-brand">
                        <div class="g-brand-logo">
                            <img src="${PROJECT.logo}" alt="${PROJECT.title} logo" />
                        </div>
                        <div>
                            <h1>${translate(PROJECT.title)}</h1>
                            <p>${translate(PROJECT.subtitle)}</p>
                        </div>
                    </div>

                    <div class="g-auth">
                        <button class="g-btn g-language-switcher">
                            ${getCurrentLanguage() === 'french' ? 'EN' : getCurrentLanguage() === 'english' ? 'DE' : 'FR'}
                        </button>
                        <button class="g-btn g-login-link">${translate('Login')}</button>
                        <button class="g-btn g-register-link">${translate('Sign up')}</button>
                    </div>
                </header>

                <section class="g-hero">
                    <div class="g-hero-content">
                        <span class="g-badge">CRMSB / iMRT</span>
                        <h2>${translate(PROJECT.title)}</h2>
                        <p>${translate(PROJECT.description)}</p>

                        <div class="g-hero-actions">
                            <button class="g-main-btn g-access-platform-btn">${translate('Access the platform')}</button>
                            <button class="g-secondary-btn">${translate('Learn More')}</button>
                        </div>
                    </div>
                </section>

                <section class="g-cards">
                    <div class="g-card">
                        <div class="g-card-icon">🗂️</div>
                        <h3>${translate('Medical data')}</h3>
                        <p>${translate('Secure management of research datasets and imaging files.')}</p>
                    </div>

                    <div class="g-card">
                        <div class="g-card-icon">${PROJECT.icon}</div>
                        <h3>${translate(PROJECT.mainTool)}</h3>
                        <p>${translate('Dedicated tools for processing, visualization and scientific workflows.')}</p>
                    </div>

                    <div class="g-card">
                        <div class="g-card-icon">📊</div>
                        <h3>${translate(PROJECT.secondTool)}</h3>
                        <p>${translate('Interactive access to collections, results and collaborative resources.')}</p>
                    </div>
                </section>
            </div>
        `);

        return this;
    },

    renderDashboard: function (currentUser) {
        this.$el.html(`
            <div class="g-dashboard ${PROJECT.themeClass}">
                <section class="g-dashboard-hero">
                    <div class="g-dashboard-topbar">
                        <button class="g-language-pill g-language-switcher">${languageLabel()}</button>
                    </div>

                    <h1>${translate('Welcome to')} ${translate(PROJECT.title)}</h1>
                    <p>${translate('Hello')}, <strong>${currentUser.get('firstName') || currentUser.get('login')}</strong>.</p>
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
                        <span>🖥️</span>
                        <h3>Trame Viewer</h3>
                        <p>${translate('Launch interactive visualization tools.')}</p>
                    </a>
                </section>
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
