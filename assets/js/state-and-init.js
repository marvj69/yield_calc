    /***********************************************************
     * Data and State
     ***********************************************************/
    // Data for the current run (since last 'Start New Run')
    let currentRunData = [];
    // Data for the entire current calendar day
    let calendarDayData = [];
    // State for undo functionality
    let lastAction = { type: null, data: null }; // type: 'add', 'delete'
    // Holds data loaded for display in archive modal
    let currentArchiveDisplayData = [];

    let lastEndValue = null;
    let lastWidth = null;
    let currentDate = ''; // Initialized during app bootstrap

    // Constants
    const TONS_TO_POUNDS = 2000;
    const SQ_FT_TO_SQ_YD = 9;

    // Local Storage Keys
    const CURRENT_RUN_DATA_KEY = 'hmaPaving_currentRunData';
    const CALENDAR_DATA_PREFIX = 'hmaPaving_calendarData_';
    const ARCHIVES_KEY = 'hmaPaving_archives';
    const LAST_SAVED_DATE_KEY = 'hmaPaving_lastSavedDate';
    const LAST_END_VALUE_KEY = 'hmaPaving_lastEndValue';
    const LAST_WIDTH_KEY = 'hmaPaving_lastWidth';
    const THEME_KEY = 'hmaPaving_theme';
    const AUTO_FILL_KEY = 'hmaPaving_autoFill'; // Add new storage key
    const INPUT_DRAFTS_KEY = 'hmaPaving_inputDrafts';


    /***********************************************************
     * DOM Elements
     ***********************************************************/
    // Date Display
    const currentDateDisplay = document.getElementById('currentDateDisplay');
    // Input Fields
    const truckNumberInput = document.getElementById('truckNumber');
    const truckTonnageInput = document.getElementById('truckTonnage');
    const startValueInput = document.getElementById('startValue');
    const endValueInput = document.getElementById('endValue');
    const widthInput = document.getElementById('width');
    const calculatedLengthInput = document.getElementById('calculatedLength');
    // Buttons
    const saveTruckButton = document.getElementById('saveTruckButton');
    const startNewRunButton = document.getElementById('startNewRunButton') || document.getElementById('resetButton'); // Renamed ID
    const undoButton = document.getElementById('undoButton');
    // Current Truck Results Display
    const areaResult = document.getElementById('areaResult');
    const weightResult = document.getElementById('weightResult');
    const yieldResult = document.getElementById('yieldResult');
    const lengthResult = document.getElementById('lengthResult'); // NEW
    // Current Run Summary Display
    const runTotalTrucks = document.getElementById('runTotalTrucks');
    const runTotalArea = document.getElementById('runTotalArea');
    const runTotalWeight = document.getElementById('runTotalWeight');
    const runAverageYield = document.getElementById('runAverageYield');
    const runTotalLength = document.getElementById('runTotalLength'); // NEW
    // Day Summary Display
    const dayTotalTrucks = document.getElementById('dayTotalTrucks') || document.getElementById('totalTrucks'); // Renamed ID
    const dayTotalArea = document.getElementById('dayTotalArea') || document.getElementById('totalArea');     // Renamed ID
    const dayTotalWeight = document.getElementById('dayTotalWeight') || document.getElementById('totalWeight');   // Renamed ID
    const dayAverageYield = document.getElementById('dayAverageYield') || document.getElementById('averageYield'); // Renamed ID
    const dayTotalLength = document.getElementById('dayTotalLength'); // NEW
    const snapshotRunTrucks = document.getElementById('snapshotRunTrucks');
    const snapshotDayTrucks = document.getElementById('snapshotDayTrucks');
    const snapshotDayYield = document.getElementById('snapshotDayYield');
    const entryProgress = document.getElementById('entryProgress');
    const entryProgressFill = document.getElementById('entryProgressFill');
    const entryProgressText = document.getElementById('entryProgressText');
    // Current Run Data Table (in Data History Tab)
    const truckDataBody = document.getElementById('truckDataBody');
    const runTotalLengthFoot = document.getElementById('runTotalLengthFoot') || document.getElementById('totalLength'); // Renamed ID
    const runTotalAreaFoot = document.getElementById('runTotalAreaFoot') || document.getElementById('totalAreaFoot');     // Renamed ID
    const runTotalTonnageFoot = document.getElementById('runTotalTonnageFoot') || document.getElementById('totalTonnageFoot'); // Renamed ID
    const runTotalWeightFoot = document.getElementById('runTotalWeightFoot') || document.getElementById('totalWeightFoot');   // Renamed ID
    const runAvgYieldFoot = document.getElementById('runAvgYieldFoot') || document.getElementById('avgYieldFoot');       // Renamed ID

    // Archive Modal Elements
    const viewArchivesButton = document.getElementById('viewArchivesButton');
    const archiveModal = document.getElementById('archiveModal');
    const closeArchiveModal = document.getElementById('closeArchiveModal');
    const archiveDateSelect = document.getElementById('archiveDateSelect');
    const archiveDataBody = document.getElementById('archiveDataBody');
    const archiveTotalLength = document.getElementById('archiveTotalLength');
    const archiveTotalAreaFoot = document.getElementById('archiveTotalAreaFoot');
    const archiveTotalTonnageFoot = document.getElementById('archiveTotalTonnageFoot');
    const archiveTotalWeightFoot = document.getElementById('archiveTotalWeightFoot');
    const archiveAvgYieldFoot = document.getElementById('archiveAvgYieldFoot');
    const exportArchiveButton = document.getElementById('exportArchiveButton'); // Renamed ID

    // About Modal Elements
    const aboutButton = document.getElementById('aboutButton');
    const aboutModal = document.getElementById('aboutModal');
    const closeAboutModal = document.getElementById('closeAboutModal');
    const closeAboutButton = document.getElementById('closeAboutButton');

    // Additional Calculators' DOM references
    const paverProdRate = document.getElementById('paverProdRate');
    const paverWidth = document.getElementById('paverWidth');
    const paverYield = document.getElementById('paverYield');
    const paverSpeedResult = document.getElementById('paverSpeedResult');
    const projTons = document.getElementById('projTons');
    const projLaneWidth = document.getElementById('projLaneWidth');
    const projYield = document.getElementById('projYield');
    const projLengthResult = document.getElementById('projLengthResult');
    const tonLength = document.getElementById('tonLength');
    const tonWidth = document.getElementById('tonWidth');
    const tonDepth = document.getElementById('tonDepth');
    const tonCalcResult = document.getElementById('tonCalcResult');

    // Hamburger Menu Elements
    const hamburgerIcon = document.querySelector('.hamburger-icon');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');
    const menuItems = document.querySelectorAll('.sidebar-menu li'); // Re-query after potential DOM changes
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    const exportDataButton = document.getElementById('exportDataButton');
    const mobileTabButtons = document.querySelectorAll('#mobileTabBar .mobile-tab-btn');
    const truckDataCards = document.getElementById('truckDataCards');
    const archiveDataCards = document.getElementById('archiveDataCards');

    // New variables for edit mode
    let isEditMode = false;
    let isArchiveEditMode = false;
    let originalCurrentRunData = [];
    let originalArchiveData = [];
    let editedCells = new Set();

    // Additional DOM elements for edit mode
    const editModeBtn = document.getElementById('editModeBtn');
    const archiveEditModeBtn = document.getElementById('archiveEditModeBtn');
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    const cancelEditingBtn = document.getElementById('cancelEditingBtn');
    const saveArchiveChangesBtn = document.getElementById('saveArchiveChangesBtn');
    const cancelArchiveEditingBtn = document.getElementById('cancelArchiveEditingBtn');
    const archiveEditControls = document.getElementById('archiveEditControls');
    
    // New DOM elements for auto-fill toggle (within settings modal)
    // Note: These elements are now inside the settings modal, but IDs remain the same
    const autoFillToggle = document.getElementById('autoFillToggle');
    const autoFillSwitch = document.getElementById('autoFillSwitch');

    // Settings Modal Elements
    const settingsButton = document.getElementById('settingsButton');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsModal = document.getElementById('closeSettingsModal');
    const closeSettingsButton = document.getElementById('closeSettingsButton');
    const runRemarksModal = document.getElementById('runRemarksModal');
    const runRemarksDescription = document.getElementById('runRemarksDescription');
    const runRemarksInput = document.getElementById('runRemarksInput');
    const runRemarksError = document.getElementById('runRemarksError');
    const confirmRunRemarksButton = document.getElementById('confirmRunRemarksButton');
    const cancelRunRemarksButton = document.getElementById('cancelRunRemarksButton');

    // Auto-fill feature state
    let autoFillEnabled = true; // Default to enabled
    let runRemarksResolver = null;
    let runRemarksRequired = true;


    /***********************************************************
     * Initialization & Event Listeners
     ***********************************************************/
    document.addEventListener('DOMContentLoaded', function() {
        // Prevent scrolling and zooming
        setupTouchControls();
        // Validate numeric inputs
        setupNumericInputValidation();
        // Load theme first
        initTheme();
        // Load data and set up UI
        initializeAppData();
        // Setup event listeners
        setupEventListeners();
        // Initial UI update
        updateAllUI();
    });

    function initializeAppData() {
        // Load auto-fill setting before data restore so carry-over behavior respects user choice.
        initAutoFill();
        checkDateChangeAndLoadData(); // Handles loading based on date change
        restoreDraftInputs();
        updateDateDisplay();
    }

    function setupEventListeners() {
        const addListener = (element, eventName, handler) => {
            if (element) element.addEventListener(eventName, handler);
        };

        // Input listeners for real-time calculation
        [startValueInput, endValueInput, widthInput, truckTonnageInput].filter(Boolean).forEach(el => {
            el.addEventListener('input', () => {
                updateLength();
                calculateYield();
                updateEntryProgress();
            });
        });
        addListener(truckNumberInput, 'input', () => {
            checkSaveButtonState();
            updateEntryProgress();
        });

        // Button listeners
        addListener(saveTruckButton, 'click', saveTruckData);
        addListener(startNewRunButton, 'click', startNewRun); // Use renamed button/function
        addListener(undoButton, 'click', undoLastAction);

        // Archive listeners
        addListener(viewArchivesButton, 'click', openArchiveModal);
        addListener(closeArchiveModal, 'click', closeArchiveModalFunc);
        addListener(archiveDateSelect, 'change', loadArchiveDataForSelectedDate); // Renamed handler
        addListener(exportArchiveButton, 'click', exportArchiveToExcel); // Use renamed function

        // About modal listeners
        addListener(aboutButton, 'click', openAboutModal);
        addListener(closeAboutModal, 'click', closeAboutModalFunc);
        addListener(closeAboutButton, 'click', closeAboutModalFunc);
        
        // Export data button listener
        addListener(exportDataButton, 'click', exportTodayDataToExcel);

        // Modal closing on background click
        window.addEventListener('click', function(event) {
            if (event.target == archiveModal) closeArchiveModalFunc();
            if (event.target == aboutModal) closeAboutModalFunc();
            if (settingsModal && event.target == settingsModal) closeSettingsModalFunc(); // Close settings modal on overlay click
        });
        document.querySelector('#archiveModal > .archive-modal-content')?.addEventListener('click', e => e.stopPropagation());
        document.querySelector('#aboutModal > .archive-modal-content')?.addEventListener('click', e => e.stopPropagation());
        const settingsModalContent = document.querySelector('#settingsModal > .archive-modal-content');
        if (settingsModalContent) {
            settingsModalContent.addEventListener('click', e => e.stopPropagation()); // Prevent closing settings modal when clicking inside content
        }


        // Additional Calculator listeners
        [paverProdRate, paverWidth, paverYield].filter(Boolean).forEach(el => el.addEventListener('input', calculatePaverSpeed));
        [projTons, projLaneWidth, projYield].filter(Boolean).forEach(el => el.addEventListener('input', calculateProjectedLength));
        [tonLength, tonWidth, tonDepth].filter(Boolean).forEach(el => el.addEventListener('input', calculateTonnageUsed));
        setupMobileInputFlow();

        // Hamburger/Sidebar listeners
        setupSidebarMenu();
        setupMobileTabBar();
        const initialTabId = document.querySelector('.tab-content.active')?.id || 'yieldTab';
        setActiveTab(initialTabId);

        addListener(confirmRunRemarksButton, 'click', submitRunRemarksModal);
        addListener(cancelRunRemarksButton, 'click', () => closeRunRemarksModal(null));
        addListener(runRemarksModal, 'click', (event) => {
            if (event.target === runRemarksModal) {
                closeRunRemarksModal(null);
            }
        });
        addListener(runRemarksInput, 'input', () => {
            runRemarksError.textContent = '';
        });
        addListener(runRemarksInput, 'keydown', (event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                submitRunRemarksModal();
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && runRemarksModal.classList.contains('open')) {
                closeRunRemarksModal(null);
            }
        });
        setupDraftInputListeners();

        // Save data on page unload
        window.addEventListener('beforeunload', saveData); // Simple save, archiving handled by date check/startNewRun

        // Edit mode buttons listeners
        addListener(editModeBtn, 'click', toggleEditMode);
        addListener(archiveEditModeBtn, 'click', toggleArchiveEditMode);
        addListener(saveChangesBtn, 'click', saveCurrentRunEdits);
        addListener(cancelEditingBtn, 'click', cancelCurrentRunEdits);
        addListener(saveArchiveChangesBtn, 'click', saveArchiveEdits);
        addListener(cancelArchiveEditingBtn, 'click', cancelArchiveEdits);
    }

    function updateAllUI() {
        updateDateDisplay();
        updateCurrentRunTable(); // Renamed from updateTruckTable
        updateCurrentRunSummary(); // New function for run summary box
        updateDaySummary(); // Renamed from updateTotals
        updateCurrentRunTableFooter(); // Renamed from updateFooterTotals
        checkSaveButtonState();
        checkUndoButtonState();
        updateMobileSnapshot();
        updateEntryProgress();
    }

    function updateMobileSnapshot() {
        if (!snapshotRunTrucks || !snapshotDayTrucks || !snapshotDayYield) return;
        const runTotals = calculateTotals(currentRunData);
        const dayTotals = calculateTotals(calendarDayData);
        snapshotRunTrucks.textContent = runTotals.count.toString();
        snapshotDayTrucks.textContent = dayTotals.count.toString();
        snapshotDayYield.textContent = dayTotals.avgYield.toFixed(2);
    }

    function updateEntryProgress() {
        if (!entryProgress || !entryProgressFill || !entryProgressText) return;

        const hasLoadNumber = truckNumberInput.value.trim() !== '';
        const numericInputs = [truckTonnageInput, startValueInput, endValueInput, widthInput];
        const numericCompleted = numericInputs.reduce((count, input) => {
            const value = input.value.trim();
            return count + (value !== '' && !Number.isNaN(Number(value)) ? 1 : 0);
        }, 0);

        const completed = (hasLoadNumber ? 1 : 0) + numericCompleted;
        const totalFields = 5;
        const percent = Math.round((completed / totalFields) * 100);
        entryProgressFill.style.width = `${percent}%`;

        const readyToSave = !saveTruckButton.disabled;
        entryProgress.classList.toggle('ready', readyToSave);
        entryProgressText.textContent = readyToSave
            ? 'Ready to save this load'
            : `${completed}/${totalFields} required fields complete`;
    }
