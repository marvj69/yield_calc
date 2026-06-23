    /***********************************************************
     * Date & Data Loading / Saving / Archiving
     ***********************************************************/

    // Get today's date in YYYY-MM-DD format using local time zone
    function getTodayDate() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // Format date for display (e.g., "Wed, Sep 25, 2024")
    function formatDateForDisplay(dateString) {
        try {
            // Handles YYYY-MM-DD format correctly regardless of timezone issues with Date constructor
            const [year, month, day] = dateString.split('-').map(Number);
            const date = new Date(year, month - 1, day); // Month is 0-indexed
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return dateString; // Fallback
        }
    }

    // Update the date display in the header
    function updateDateDisplay() {
      currentDateDisplay.textContent = formatDateForDisplay(currentDate);
    }

    // Check if the calendar date has changed, handle archiving, and load data
    function checkDateChangeAndLoadData() {
        const todayDate = getTodayDate();
        const savedDate = localStorage.getItem(LAST_SAVED_DATE_KEY);

        // Determine the date to operate on
        currentDate = savedDate || todayDate; // Use saved date if available, otherwise today

        if (savedDate && savedDate !== todayDate) {
            // Archive data from the 'savedDate' if it exists
            const prevCalendarData = loadDataFromStorage(CALENDAR_DATA_PREFIX + savedDate);
            const prevRunData = loadDataFromStorage(CURRENT_RUN_DATA_KEY); // Assumes this belongs to savedDate

            // Archive the last run data of the previous day if not empty
            if (prevRunData && prevRunData.length > 0) {
                archiveRunData(savedDate, prevRunData, "Auto-archived due to date change");
            }

            // Clear data for the new day
            calendarDayData = [];
            currentRunData = [];
            lastEndValue = null; // Reset carry-over values for a new day
            lastWidth = null;
            localStorage.removeItem(LAST_END_VALUE_KEY);
            localStorage.removeItem(LAST_WIDTH_KEY);
            localStorage.removeItem(INPUT_DRAFTS_KEY);
            currentDate = todayDate; // Set current date to today
        } else {
            // Load data for the current date
            calendarDayData = loadDataFromStorage(CALENDAR_DATA_PREFIX + currentDate) || [];
            currentRunData = loadDataFromStorage(CURRENT_RUN_DATA_KEY) || []; // Load potentially ongoing run
            lastEndValue = parseFloat(localStorage.getItem(LAST_END_VALUE_KEY)) || null;
            lastWidth = parseFloat(localStorage.getItem(LAST_WIDTH_KEY)) || null;

            // Restore input fields if applicable, respecting auto-fill setting
            if (autoFillEnabled && lastEndValue !== null) {
                startValueInput.value = lastEndValue.toFixed(2);
            }
            if (lastWidth !== null) widthInput.value = lastWidth.toFixed(2);
        }

        // Always save the current date as the last saved date
        localStorage.setItem(LAST_SAVED_DATE_KEY, currentDate);
        updateDateDisplay(); // Ensure display matches loaded/current date
    }

    // Helper to load and parse JSON from localStorage
    function loadDataFromStorage(key) {
        const data = localStorage.getItem(key);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (err) {
                localStorage.removeItem(key); // Remove corrupted data
                return null;
            }
        }
        return null;
    }

    function getDraftInputElements() {
        return [
            truckNumberInput,
            truckTonnageInput,
            startValueInput,
            endValueInput,
            widthInput,
            paverProdRate,
            paverWidth,
            paverYield,
            projTons,
            projLaneWidth,
            projYield,
            tonLength,
            tonWidth,
            tonDepth,
            runRemarksInput
        ].filter(Boolean);
    }

    function setupDraftInputListeners() {
        getDraftInputElements().forEach(el => {
            el.addEventListener('input', saveDraftInputs);
            el.addEventListener('change', saveDraftInputs);
        });
    }

    function saveDraftInputs() {
        try {
            const draftValues = {};
            getDraftInputElements().forEach(el => {
                if (el.id && el.value !== '') {
                    draftValues[el.id] = el.value;
                }
            });

            if (Object.keys(draftValues).length > 0) {
                localStorage.setItem(INPUT_DRAFTS_KEY, JSON.stringify(draftValues));
            } else {
                localStorage.removeItem(INPUT_DRAFTS_KEY);
            }
        } catch (error) {
            console.error("Error saving draft inputs:", error);
        }
    }

    function restoreDraftInputs() {
        const draftValues = loadDataFromStorage(INPUT_DRAFTS_KEY);
        if (draftValues && typeof draftValues === 'object') {
            getDraftInputElements().forEach(el => {
                if (!el.id) return;
                const savedValue = draftValues[el.id];
                if (typeof savedValue === 'string') {
                    el.value = savedValue;
                }
            });
        }

        updateLength();
        calculateYield();
        calculatePaverSpeed();
        calculateProjectedLength();
        calculateTonnageUsed();
        checkSaveButtonState();
        updateEntryProgress();
    }

    // Save all relevant data to localStorage
    function saveData() {
        try {
            localStorage.setItem(CURRENT_RUN_DATA_KEY, JSON.stringify(currentRunData));
            localStorage.setItem(CALENDAR_DATA_PREFIX + currentDate, JSON.stringify(calendarDayData));
            localStorage.setItem(LAST_SAVED_DATE_KEY, currentDate);
            if (lastEndValue !== null) localStorage.setItem(LAST_END_VALUE_KEY, lastEndValue.toString());
            else localStorage.removeItem(LAST_END_VALUE_KEY);
            if (lastWidth !== null) localStorage.setItem(LAST_WIDTH_KEY, lastWidth.toString());
            else localStorage.removeItem(LAST_WIDTH_KEY);
            saveDraftInputs();
        } catch (error) {
            console.error("Error saving data to localStorage:", error);
            alert("Error saving data. Local storage might be full or unavailable.");
        }
    }

     // Archives the provided run data under the specified date
    function archiveRunData(date, runData, remarks) {
        if (!runData || runData.length === 0) {
            return;
        }
        try {
            let archives = loadDataFromStorage(ARCHIVES_KEY) || {};
            if (!archives[date]) {
                archives[date] = [];
            }

            const runArchive = {
                runId: new Date().toISOString(), // Unique ID for the run
                data: runData,
                remarks: remarks || "N/A" // Ensure remarks are always present
            };

            archives[date].push(runArchive);
            localStorage.setItem(ARCHIVES_KEY, JSON.stringify(archives));
        } catch (error) {
            console.error("Error archiving run data:", error);
        }
    }


    function requestRunRemarks(options) {
      if (runRemarksResolver) {
          return Promise.resolve(null);
      }
      runRemarksRequired = options.required !== false;
      runRemarksDescription.textContent = options.description || '';
      runRemarksInput.value = options.defaultValue || '';
      runRemarksInput.placeholder = options.placeholder || 'Enter remarks or N/A';
      runRemarksError.textContent = '';
      confirmRunRemarksButton.textContent = options.confirmLabel || 'Start Run';
      runRemarksModal.classList.add('open');
      runRemarksModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      setTimeout(() => runRemarksInput.focus(), 30);

      return new Promise(resolve => {
          runRemarksResolver = resolve;
      });
    }

    function closeRunRemarksModal(value) {
      runRemarksModal.classList.remove('open');
      runRemarksModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      if (runRemarksResolver) {
          runRemarksResolver(value);
          runRemarksResolver = null;
      }
    }

    function submitRunRemarksModal() {
      const value = runRemarksInput.value.trim();
      if (runRemarksRequired && !value) {
          runRemarksError.textContent = "Remarks are required. Enter notes or 'N/A'.";
          runRemarksInput.focus();
          return;
      }
      closeRunRemarksModal(value);
    }

    // Action triggered by "Start New Run" button
    async function startNewRun() {
      let remarks = 'N/A';

      if (currentRunData.length > 0) {
          const firstLoad = currentRunData[0]?.loadNumber || '?';
          const lastLoad = currentRunData[currentRunData.length - 1]?.loadNumber || '?';
          const modalResult = await requestRunRemarks({
              required: true,
              defaultValue: 'N/A',
              description: `Enter remarks for the completed run (Load ${firstLoad} to ${lastLoad}).`,
              confirmLabel: 'Archive Run'
          });

          if (modalResult === null) return;
          remarks = modalResult;
          archiveRunData(currentDate, [...currentRunData], remarks);
      } else {
          const modalResult = await requestRunRemarks({
              required: false,
              defaultValue: '',
              description: 'Current run has no loads. Start a fresh run anyway?',
              placeholder: 'Optional notes',
              confirmLabel: 'Start Empty Run'
          });

          if (modalResult === null) return;
          remarks = modalResult || 'N/A';
          console.log("Start New Run clicked with an empty run. Note:", remarks);
      }

      // "Start New Run" Action: Clear current run data and reset form
      currentRunData = [];
      lastEndValue = null; // Clear carry-over values for a new run *within the same day*
      lastWidth = null;
      resetFormForNextTruck();

      // Update UI
      updateAllUI(); // Update tables, summaries, etc.

      // Save the cleared state
      saveData();

      // Clear last action for undo
      lastAction = { type: null, data: null };
      checkUndoButtonState();

      console.log("New run started on", currentDate);
    }

    /***********************************************************
     * Core Yield Calculator Functions
     ***********************************************************/
    function updateLength() {
      const startValue = parseFloat(startValueInput.value);
      const endValue = parseFloat(endValueInput.value);
      // Check if both values are valid numbers (not NaN), allowing zero
      calculatedLengthInput.value = (!isNaN(startValue) && !isNaN(endValue) && endValue >= 0) ? Math.abs(endValue - startValue).toFixed(2) : '';
    }

    function calculateYield() {
      const length = parseFloat(calculatedLengthInput.value) || 0;
      const width = parseFloat(widthInput.value) || 0;
      const tonnage = parseFloat(truckTonnageInput.value) || 0;

      if (length <= 0 || width <= 0 || tonnage <= 0) {
        if (lengthResult) lengthResult.textContent = '-';
        if (areaResult) areaResult.textContent = '-';
        if (weightResult) weightResult.textContent = '-';
        if (yieldResult) yieldResult.textContent = '-';
        checkSaveButtonState(); // Disable save if yield is invalid
        return;
      }

      const areaInSqFt = length * width;
      const areaInSqYd = areaInSqFt / SQ_FT_TO_SQ_YD;
      const weightInPounds = tonnage * TONS_TO_POUNDS;
      const yieldVal = areaInSqYd > 0 ? (weightInPounds / areaInSqYd) : 0;

      if (lengthResult) lengthResult.textContent = length.toFixed(2);
      if (areaResult) areaResult.textContent = areaInSqYd.toFixed(2);
      if (weightResult) weightResult.textContent = `${tonnage.toFixed(2)} / ${weightInPounds.toLocaleString()} lbs`;
      if (yieldResult) yieldResult.textContent = yieldVal.toFixed(2);

      checkSaveButtonState(); // Check if save can be enabled
    }

    function checkSaveButtonState() {
        const hasLoadNumber = truckNumberInput.value.trim() !== '';
        const hasValidYield = yieldResult.textContent !== '-' && parseFloat(yieldResult.textContent) > 0;
        saveTruckButton.disabled = !(hasLoadNumber && hasValidYield);
        updateEntryProgress();
    }


    function saveTruckData() {
      if (saveTruckButton.disabled) return; // Prevent saving if button is disabled

      saveTruckButton.disabled = true;
      saveTruckButton.innerHTML = 'Saving... <div class="loader"></div>';

      const loadNumber = truckNumberInput.value.trim();
      const startVal = parseFloat(startValueInput.value);
      const endVal = parseFloat(endValueInput.value);
      const lengthVal = parseFloat(calculatedLengthInput.value) || 0;
      const widthVal = parseFloat(widthInput.value) || 0;
      const areaVal = parseFloat(areaResult.textContent) || 0;
      const tonnageVal = parseFloat(truckTonnageInput.value) || 0;
      const weightVal = parseFloat(weightResult.textContent) || 0; // This is now in tons
      const yieldVal = parseFloat(yieldResult.textContent) || 0;

      const truckData = {
        id: Date.now().toString(), // Unique ID for the entry
        loadNumber,
        startValue: isNaN(startVal) ? 0 : startVal, // Handle NaN explicitly
        endValue: isNaN(endVal) ? 0 : endVal, // Handle NaN explicitly
        length: lengthVal,
        width: widthVal,
        area: areaVal,
        tonnage: tonnageVal,
        weight: tonnageVal, // Use tonnage directly for weight
        yield: yieldVal,
        date: currentDate // Use current app date
      };

      // Add to both current run and calendar day data
      currentRunData.push(truckData);
      calendarDayData.push(truckData);

      // Update last values for auto-population
      lastEndValue = endVal;
      lastWidth = widthVal;

      // Set last action for undo
      lastAction = { type: 'add', data: { ...truckData } }; // Store a copy

      // Save data, update UI, reset form
      saveData();
      updateAllUI();
      resetFormForNextTruck();

      saveTruckButton.innerHTML = 'Save Truck Data'; // Restore button text
      truckNumberInput.focus();
    }

    function resetFormForNextTruck() {
      truckNumberInput.value = '';
      truckTonnageInput.value = '';
      
      // Only auto-fill start value if the feature is enabled
      if (autoFillEnabled && lastEndValue !== null) {
          startValueInput.value = lastEndValue.toFixed(2);
      } else {
          startValueInput.value = '';
      }
      
      endValueInput.value = '';
      // Only auto-fill width if it wasn't manually cleared
      if (lastWidth !== null && widthInput.value === '') {
          widthInput.value = lastWidth.toFixed(2);
      } else if (lastWidth !== null && widthInput.value !== lastWidth.toFixed(2)) {
          // If user changed width manually, don't overwrite, but clear lastWidth carryover
          lastWidth = null;
          localStorage.removeItem(LAST_WIDTH_KEY);
      }
      calculatedLengthInput.value = '';
      areaResult.textContent = '-';
      weightResult.textContent = '-';
      yieldResult.textContent = '-';
      checkSaveButtonState(); // Should disable save button
      updateLength(); // Recalculate length based on new start value
      calculateYield(); // Recalculate yield based on cleared fields
      saveDraftInputs();
    }

    function deleteEntry(id) {
        const runIndex = currentRunData.findIndex(t => t.id === id);
        const dayIndex = calendarDayData.findIndex(t => t.id === id);
        
        // Check if the entry exists in any archived run for today
        let archives = loadDataFromStorage(ARCHIVES_KEY) || {};
        let runsForToday = archives[currentDate] || [];
        let archivedRunIndex = -1;
        let archivedTruckIndex = -1;
        
        // Look through today's archives for the entry
        for (let i = 0; i < runsForToday.length; i++) {
            const run = runsForToday[i];
            if (run.data && Array.isArray(run.data)) {
                const truckIndex = run.data.findIndex(t => t.id === id);
                if (truckIndex !== -1) {
                    archivedRunIndex = i;
                    archivedTruckIndex = truckIndex;
                    break;
                }
            }
        }

        // Determine which record to delete
        let truckToDelete = null;
        if (runIndex !== -1) {
            truckToDelete = currentRunData[runIndex];
        } else if (dayIndex !== -1) {
            truckToDelete = calendarDayData[dayIndex];
        } else if (archivedRunIndex !== -1 && archivedTruckIndex !== -1) {
            truckToDelete = runsForToday[archivedRunIndex].data[archivedTruckIndex];
        }

        if (!truckToDelete) return; // Not found in any dataset

        if (confirm(`Delete entry for Load ${truckToDelete?.loadNumber || id}? This cannot be undone in the same way as 'Undo Last Save'.`)) {
             // Set last action for potential (more complex) undo, different from simple 'add' undo
            lastAction = { type: 'delete', data: { ...truckToDelete } };

            // Remove from current run data if found there
            if (runIndex !== -1) {
                currentRunData.splice(runIndex, 1);
            }
            
            // Remove from calendar day data if found there
            if (dayIndex !== -1) {
                calendarDayData.splice(dayIndex, 1);
            }
            
            // Remove from archives if found there
            if (archivedRunIndex !== -1 && archivedTruckIndex !== -1) {
                runsForToday[archivedRunIndex].data.splice(archivedTruckIndex, 1);
                
                // If the run is now empty, consider removing it entirely
                if (runsForToday[archivedRunIndex].data.length === 0) {
                    runsForToday.splice(archivedRunIndex, 1);
                }
                
                // Update the archives in localStorage
                archives[currentDate] = runsForToday;
                localStorage.setItem(ARCHIVES_KEY, JSON.stringify(archives));
            }

            saveData();
            updateAllUI();
             // Disable simple undo after a delete action
             undoButton.disabled = true;
        }
    }

    // 15. Undo Last Action (Simple Undo for last saved truck)
    function undoLastAction() {
        if (lastAction.type === 'add' && lastAction.data) {
            const lastAddedId = lastAction.data.id;

            // Remove from currentRunData
            const runIndex = currentRunData.findIndex(t => t.id === lastAddedId);
            if (runIndex > -1) {
                currentRunData.splice(runIndex, 1);
            }

            // Remove from calendarDayData
            const dayIndex = calendarDayData.findIndex(t => t.id === lastAddedId);
            if (dayIndex > -1) {
                calendarDayData.splice(dayIndex, 1);
            }

            // Clear the last action so it can't be undone again
            lastAction = { type: null, data: null };

            // Update UI and save state
            saveData();
            updateAllUI(); // This includes checkUndoButtonState

            alert("Last saved truck entry removed.");

            // Potentially restore previous 'lastEndValue' and 'lastWidth'? More complex.
            // For simplicity, just remove the entry.

        } else {
            alert("No save action to undo.");
        }
    }

     function checkUndoButtonState() {
        undoButton.disabled = !(lastAction.type === 'add' && lastAction.data);
    }
