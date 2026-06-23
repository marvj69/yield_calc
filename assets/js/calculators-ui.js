    /***********************************************************
     * Additional Calculators (results are transient; inputs are draft-persisted)
     ***********************************************************/
    function calculatePaverSpeed() { /* ... (implementation unchanged) ... */
      const R_p = parseFloat(paverProdRate.value) || 0;
      const W = parseFloat(paverWidth.value) || 0;
      const A = parseFloat(paverYield.value) || 0;
      if (R_p <= 0 || W <= 0 || A <= 0 || A === Infinity) {
        paverSpeedResult.textContent = '-'; return;
      }
      const L = (2000 * 9) / (W * A);
      const V = (R_p * L) / 60;
      paverSpeedResult.textContent = (V === Infinity || isNaN(V)) ? '-' : V.toFixed(2);
    }
    function calculateProjectedLength() { /* ... (implementation unchanged) ... */
      const T = parseFloat(projTons.value) || 0;
      const LW = parseFloat(projLaneWidth.value) || 0;
      const Y = parseFloat(projYield.value) || 0;
      if (T <= 0 || LW <= 0 || Y <= 0) {
        projLengthResult.textContent = '-'; return;
      }
      const denominator = (((LW * 100) / 9) * Y) / 2000;
      if (denominator <= 0 || denominator === Infinity || isNaN(denominator)) {
          projLengthResult.textContent = '-'; return;
      }
      const projLength = (T / denominator) * 100;
      projLengthResult.textContent = (projLength === Infinity || isNaN(projLength)) ? '-' : projLength.toFixed(2);
    }
    function calculateTonnageUsed() { /* ... (implementation unchanged) ... */
      const L = parseFloat(tonLength.value) || 0;
      const W = parseFloat(tonWidth.value) || 0;
      const D = parseFloat(tonDepth.value) || 0;
      if (L <= 0 || W <= 0 || D <= 0) {
        tonCalcResult.textContent = '-'; return;
      }
      const areaYd2 = (L * W) / 9;
      const lbs = areaYd2 * 110 * D; // Using standard 110 lb/sq yd/in rule of thumb
      const tonsUsed = lbs / 2000;
      tonCalcResult.textContent = tonsUsed.toFixed(2);
    }

    /***********************************************************
     * Sidebar, Theme, PWA, Misc Utils
     ***********************************************************/

    function initTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            darkModeSwitch.classList.add('active');
        } else {
            document.documentElement.removeAttribute('data-theme');
            darkModeSwitch.classList.remove('active');
        }
    }

     function toggleDarkMode() {
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem(THEME_KEY, 'light');
            darkModeSwitch.classList.remove('active');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem(THEME_KEY, 'dark');
            darkModeSwitch.classList.add('active');
        }
    }

    function setActiveTab(tabId, closeAfterSelect = false) {
        const targetTab = document.getElementById(tabId);
        if (!targetTab) return;

        const activeElement = document.activeElement;
        if (activeElement && typeof activeElement.blur === 'function') {
            activeElement.blur();
        }

        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        targetTab.classList.add('active');

        document.querySelectorAll('.sidebar-menu li[data-tab]').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
        });

        mobileTabButtons.forEach(button => {
            button.classList.toggle('active', button.getAttribute('data-tab') === tabId);
        });

        if (closeAfterSelect) {
            closeMenu();
        }

        if (window.innerWidth <= 768 && closeAfterSelect) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function setupMobileTabBar() {
        mobileTabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const tabId = button.getAttribute('data-tab');
                if (tabId) setActiveTab(tabId, true);
            });
        });
    }

    function setupSidebarMenu() {
        // Re-select menu items in case of dynamic changes (though unlikely here)
        const currentMenuItems = document.querySelectorAll('.sidebar-menu li');
        const sidebarCloseButton = document.getElementById('sidebarCloseButton');

        hamburgerIcon.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', closeMenu);
        if (sidebarCloseButton) {
            sidebarCloseButton.addEventListener('click', (e) => {
                e.stopPropagation();
                closeMenu();
            });
        }

        // Dark mode toggle listener
        darkModeToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent li click handler
            toggleDarkMode();
        });
        darkModeSwitch.addEventListener('click', (e) => {
             e.stopPropagation(); // Prevent li click handler
            toggleDarkMode();
        });

        // Auto-fill toggle listener
        if (autoFillToggle) {
            autoFillToggle.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent li click handler
                toggleAutoFill();
            });
        }
        if (autoFillSwitch) {
            autoFillSwitch.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent li click handler
                toggleAutoFill();
            });
        }


        currentMenuItems.forEach(item => {
            if (item.id === 'darkModeToggle') return; // Skip dark mode item

            if (item.id === 'aboutButton') {
                 // Special handler for About button
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openAboutModal();
                    closeMenu(); // Close sidebar after action
                });
            } else if (item.id === 'settingsButton') {
                // Special handler for Settings button
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openSettingsModal();
                    closeMenu(); // Close sidebar after action
                });
            } else if (item.getAttribute('data-tab')) {
                // Standard tab navigation handler
                item.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const tabId = this.getAttribute('data-tab');
                    if (tabId) setActiveTab(tabId, true);
                });
            }
        });
    }


    function toggleMenu() {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('open');
    }
    function closeMenu() {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    }
    function openAboutModal() {
      aboutModal.style.display = 'block';
      aboutModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('about-modal-open');
      closeMenu();
    }
    function closeAboutModalFunc() {
      aboutModal.style.display = 'none';
      aboutModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('about-modal-open');
    }

    // Settings Modal Functions
    function openSettingsModal() {
        if (!settingsModal) return;
        settingsModal.style.display = 'block';
        closeMenu(); // Ensure sidebar is closed when modal opens
    }
    function closeSettingsModalFunc() {
        if (!settingsModal) return;
        settingsModal.style.display = 'none';
    }

    function setupTouchControls() {
         document.addEventListener('touchmove', function() {
            // Intentionally passive: preserve native iOS scrolling and gesture behavior.
        }, { passive: true });
    }

    function setupNumericInputValidation() {
        const numericInputs = document.querySelectorAll('input[type="number"]');
        numericInputs.forEach(input => {
             input.addEventListener('input', function() {
                // Optional: Add more aggressive validation on input if needed
                const value = this.value;
                // Remove non-numeric characters except decimal point and leading minus (if allowed)
                // This example doesn't allow minus, enforces positive numbers or zero
                 let cleanedValue = value.replace(/[^\d.]/g, '');
                 // Ensure only one decimal point
                 const parts = cleanedValue.split('.');
                 if (parts.length > 2) {
                     cleanedValue = parts[0] + '.' + parts.slice(1).join('');
                 }
                 if (cleanedValue !== value) {
                     this.value = cleanedValue;
                 }
             });

            input.addEventListener('blur', function() {
                if (this.value !== '') {
                    const min = parseFloat(this.min);
                    const value = parseFloat(this.value);
                    if (!isNaN(min) && !isNaN(value) && value < min) {
                        this.value = min.toFixed(this.step.includes('.') ? this.step.split('.')[1].length : 0); // Format to correct decimal places
                    }
                     // Ensure non-empty fields aren't just "."
                    if (this.value === '.') {
                        this.value = '';
                    }
                }
            });
        });
    }

    function setupMobileInputFlow() {
        const inputFlows = [
            [truckNumberInput, truckTonnageInput, startValueInput, endValueInput, widthInput],
            [paverProdRate, paverWidth, paverYield],
            [projTons, projLaneWidth, projYield],
            [tonLength, tonWidth, tonDepth]
        ];

        inputFlows.forEach(flow => {
            flow.forEach((input, index) => {
                if (!input) return;
                const isLast = index === flow.length - 1;
                input.setAttribute('enterkeyhint', isLast ? 'done' : 'next');

                input.addEventListener('keydown', (event) => {
                    if (event.key !== 'Enter') return;
                    event.preventDefault();

                    if (!isLast && flow[index + 1]) {
                        flow[index + 1].focus();
                        return;
                    }

                    if (input === widthInput && !saveTruckButton.disabled) {
                        saveTruckData();
                        return;
                    }

                    input.blur();
                });

                input.addEventListener('focus', () => {
                    if (window.innerWidth > 768) return;
                    setTimeout(() => {
                        input.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                    }, 140);
                });
            });
        });
    }

    // Service Worker Registration (Optional but good for PWA)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js') // Make sure sw.js exists
          .then(registration => console.log('Service Worker registered successfully:', registration.scope))
          .catch(error => console.error('Service Worker registration failed:', error));
      });
    }

    // Add collapsible functionality for the truck information card
    document.addEventListener('DOMContentLoaded', function() {
      const truckInfoHeader = document.getElementById('truckInfoHeader');
      const truckInfoContent = document.getElementById('truckInfoContent');
      const collapseIcon = truckInfoHeader.querySelector('.collapse-icon');
      
      truckInfoHeader.addEventListener('click', function() {
        truckInfoContent.classList.toggle('collapsed');
        collapseIcon.classList.toggle('collapsed');
      });
    });
