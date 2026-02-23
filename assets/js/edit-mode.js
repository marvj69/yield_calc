    // Function to toggle edit mode for current run data
    function toggleEditMode() {
        if (isEditMode) {
            // Exit edit mode without saving
            cancelCurrentRunEdits();
            return;
        }

        // Enable edit mode
        isEditMode = true;
        editModeBtn.textContent = 'Disable Edit Mode';
        editModeBtn.style.backgroundColor = 'var(--danger)';
        
        // Hide the 'Previous Days' button while in edit mode
        viewArchivesButton.style.display = 'none';
        
        // Store original data for potential cancel
        originalCurrentRunData = JSON.parse(JSON.stringify(currentRunData));
        
        // Apply editable class to container
        document.getElementById('dataTab').classList.add('editable-mode-active');
        
        // Make table cells editable
        makeCurrentRunTableEditable();
    }

    // Function to toggle edit mode for archive data
    function toggleArchiveEditMode() {
        if (isArchiveEditMode) {
            // Exit edit mode without saving
            cancelArchiveEdits();
            return;
        }

        const selectedDate = archiveDateSelect.value;
        if (!selectedDate) {
            alert('Please select a date first before enabling edit mode.');
            return;
        }

        // Enable edit mode
        isArchiveEditMode = true;
        archiveEditModeBtn.textContent = 'Disable Edit Mode';
        archiveEditModeBtn.style.backgroundColor = 'var(--danger)';
        archiveEditControls.style.display = 'flex'; // Show controls

        // Hide export button while in edit mode
        exportArchiveButton.style.display = 'none';

        // Store original data for potential cancel
        originalArchiveData = JSON.parse(JSON.stringify(currentArchiveDisplayData));

        // Apply editable class to container
        document.querySelector('.archive-modal-content').classList.add('editable-mode-active');

        // Make table cells editable
        makeArchiveTableEditable();
    }

    // Make the current run table cells editable
    function makeCurrentRunTableEditable() {
        const rows = truckDataBody.querySelectorAll('tr');
        rows.forEach(row => {
            // Make run separator remarks editable
            if (row.classList.contains('run-separator')) {
                const remarksSpan = row.querySelector('span');
                if (remarksSpan) {
                    // Get only the remarks text without the label
                    const remarksText = remarksSpan.textContent.replace('Remarks: ', '');
                    
                    // Store the original text and replace with editable version
                    remarksSpan.dataset.originalValue = remarksText;
                    remarksSpan.innerHTML = `Remarks: <span contenteditable="true" class="editable-remarks" data-run-id="${row.getAttribute('data-run-id')}">${remarksText}</span>`;
                    
                    // Add event listeners
                    const editableSpan = remarksSpan.querySelector('.editable-remarks');
                    editableSpan.addEventListener('input', function() {
                        if (this.textContent !== this.parentNode.dataset.originalValue) {
                            this.classList.add('cell-edited');
                            editedCells.add(this);
                        } else {
                            this.classList.remove('cell-edited');
                            editedCells.delete(this);
                        }
                    });
                }
                return;
            }
            
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                // Make specific cells editable (load number, start/end value, width, tonnage)
                for (let i = 0; i < cells.length; i++) {
                    // Make only certain cells editable (exclude calculated fields)
                    if (i === 0 || i === 1 || i === 2 || i === 4 || i === 6) {
                        cells[i].setAttribute('contenteditable', 'true');
                        cells[i].dataset.originalValue = cells[i].textContent.trim();
                        cells[i].dataset.columnIndex = i;
                        cells[i].dataset.rowIndex = Array.from(rows).indexOf(row);
                        cells[i].addEventListener('input', handleCellEdit);
                        cells[i].addEventListener('blur', validateCellEdit);
                    } else if (i !== cells.length - 1) { // Exclude action column
                        cells[i].classList.add('non-editable');
                    }
                }
            }
        });
    }

    // Make the archive table cells editable
    function makeArchiveTableEditable() {
        const rows = archiveDataBody.querySelectorAll('tr');
        let dataIndex = 0;
        
        rows.forEach(row => {
            // Make run separator remarks editable
            if (row.classList.contains('run-separator')) {
                const remarksSpan = row.querySelector('span');
                if (remarksSpan) {
                    // Get only the remarks text without the label
                    const remarksText = remarksSpan.textContent.replace('Remarks: ', '');
                    
                    // Get the run ID from the row if available
                    const runId = row.getAttribute('data-run-id');
                    
                    // Store the original text and replace with editable version
                    remarksSpan.dataset.originalValue = remarksText;
                    remarksSpan.innerHTML = `Remarks: <span contenteditable="true" class="editable-remarks" data-run-id="${runId}">${remarksText}</span>`;
                    
                    // Add event listeners
                    const editableSpan = remarksSpan.querySelector('.editable-remarks');
                    editableSpan.addEventListener('input', function() {
                        if (this.textContent !== this.parentNode.dataset.originalValue) {
                            this.classList.add('cell-edited');
                            editedCells.add(this);
                        } else {
                            this.classList.remove('cell-edited');
                            editedCells.delete(this);
                        }
                    });
                }
                return;
            }
            
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                // Get data ID for this row (if we have it in currentArchiveDisplayData)
                const dataId = dataIndex < currentArchiveDisplayData.length ? 
                    currentArchiveDisplayData[dataIndex].id : null;
                
                // Store data-id on the row for tracking purposes
                if (dataId) {
                    row.setAttribute('data-record-id', dataId);
                }
                
                // Make specific cells editable (load number, start/end value, width, tonnage)
                for (let i = 0; i < cells.length; i++) {
                    // Make only certain cells editable (exclude calculated fields)
                    if (i === 0 || i === 1 || i === 2 || i === 4 || i === 6) {
                        cells[i].setAttribute('contenteditable', 'true');
                        cells[i].dataset.originalValue = cells[i].textContent.trim();
                        cells[i].dataset.columnIndex = i;
                        cells[i].dataset.rowIndex = dataIndex; // Use data index, not visual row index
                        cells[i].dataset.recordId = dataId; // Store the data ID for mapping
                        cells[i].addEventListener('input', handleArchiveCellEdit);
                        cells[i].addEventListener('blur', validateArchiveCellEdit);
                    } else {
                        cells[i].classList.add('non-editable');
                    }
                }
                
                // Increment data index for the next data row
                dataIndex++;
            }
        });
    }

    // Handle cell edit in current run table
    function handleCellEdit(e) {
        const cell = e.target;
        
        // Add visual indicator that cell has been edited
        const originalValue = cell.dataset.originalValue;
        if (cell.textContent.trim() !== originalValue) {
            cell.classList.add('cell-edited');
            editedCells.add(cell);
        } else {
            cell.classList.remove('cell-edited');
            editedCells.delete(cell);
        }
        
        // If editing is done in the current run (not archived runs), recalculate immediately
        if (!cell.closest('#archiveDataBody')) {
            const rowIndex = parseInt(cell.dataset.rowIndex);
            recalculateRowValues(rowIndex, cell.closest('tr'), 'current');
        }
    }

    // Handle cell edit in archive table
    function handleArchiveCellEdit(e) {
        const cell = e.target;
        
        // Add visual indicator that cell has been edited
        const originalValue = cell.dataset.originalValue;
        if (cell.textContent.trim() !== originalValue) {
            cell.classList.add('cell-edited');
            editedCells.add(cell);
        } else {
            cell.classList.remove('cell-edited');
            editedCells.delete(cell);
        }
        
        // Recalculate values for this row
        const rowIndex = parseInt(cell.dataset.rowIndex);
        const recordId = cell.dataset.recordId;
        recalculateRowValues(rowIndex, cell.closest('tr'), 'archive', recordId);
    }

    // Validate cell edit (ensure it's a number for numeric cells)
    function validateCellEdit(e) {
        const cell = e.target;
        const columnIndex = parseInt(cell.dataset.columnIndex);
        
        // Skip validation for load number (column 0)
        if (columnIndex === 0) return;
        
        // For numeric columns, ensure content is a valid number
        let value = cell.textContent.trim();
        if (value === '') {
            value = '0';
        }
        
        if (isNaN(parseFloat(value))) {
            // Invalid number, revert to original
            cell.textContent = cell.dataset.originalValue;
            cell.classList.remove('cell-edited');
            editedCells.delete(cell);
            alert('Please enter a valid number.');
        } else {
            // Valid number, format it nicely
            const formattedValue = parseFloat(value).toFixed(2);
            cell.textContent = formattedValue;
            
            // Check if value has actually changed after formatting
            if (formattedValue === cell.dataset.originalValue) {
                cell.classList.remove('cell-edited');
                editedCells.delete(cell);
            }
        }
    }

    // Same validation for archive cells
    function validateArchiveCellEdit(e) {
        validateCellEdit(e); // Reuse the same validation logic
    }

    // Recalculate row values based on edited cells
    function recalculateRowValues(rowIndex, row, tableType, recordId) {
        if (!row) return;
        
        const cells = row.querySelectorAll('td');
        if (cells.length < 9) return;
        
        // Get input values from editable cells
        const startValue = parseFloat(cells[1].textContent) || 0;
        const endValue = parseFloat(cells[2].textContent) || 0;
        const width = parseFloat(cells[4].textContent) || 0;
        const tonnage = parseFloat(cells[6].textContent) || 0;
        
        // Calculate new values
        const length = Math.abs(endValue - startValue);
        const areaInSqFt = length * width;
        const areaInSqYd = areaInSqFt / SQ_FT_TO_SQ_YD;
        const weightInPounds = tonnage * TONS_TO_POUNDS;
        const yieldVal = areaInSqYd > 0 ? (weightInPounds / areaInSqYd) : 0;
        
        // Update the calculated cells
        cells[3].textContent = length.toFixed(2); // Length
        cells[5].textContent = areaInSqYd.toFixed(2); // Area
        cells[6].textContent = tonnage.toFixed(2); // This should display the tonnage input value
        cells[7].textContent = yieldVal.toFixed(2); // Yield
        
        // Update the data object
        if (tableType === 'current') {
            // Find which dataset this row belongs to (current run or archived run from today)
            let datasetIndex = -1;
            let dataItem = null;
            
            // First check if it's in current run data
            const currentRunIndex = currentRunData.findIndex(
                item => item.id === row.querySelector('.delete-btn')?.getAttribute('data-id')
            );
            
            if (currentRunIndex !== -1) {
                datasetIndex = currentRunIndex;
                dataItem = currentRunData[datasetIndex];
            } else {
                // Check if it's in calendar day data
                const calendarDayIndex = calendarDayData.findIndex(
                    item => item.id === row.querySelector('.delete-btn')?.getAttribute('data-id')
                );
                
                if (calendarDayIndex !== -1) {
                    datasetIndex = calendarDayIndex;
                    dataItem = calendarDayData[datasetIndex];
                }
            }
            
            if (dataItem) {
                // Update the data object with new values
                dataItem.startValue = startValue;
                dataItem.endValue = endValue;
                dataItem.length = length;
                dataItem.width = width;
                dataItem.area = areaInSqYd;
                dataItem.tonnage = tonnage;
                dataItem.weight = tonnage;
                dataItem.yield = yieldVal;
                
                // Update summaries and footer totals
                updateCurrentRunSummary();
                updateDaySummary();
                updateCurrentRunTableFooter();
            }
        } else if (tableType === 'archive') {
            // For archive tables, use recordId or fallback to rowIndex
            let dataItem;
            
            if (recordId) {
                // Find the item by ID (more reliable)
                dataItem = currentArchiveDisplayData.find(item => item.id === recordId);
            } else if (rowIndex >= 0 && rowIndex < currentArchiveDisplayData.length) {
                // Fallback to index-based lookup
                dataItem = currentArchiveDisplayData[rowIndex];
            }
            
            if (dataItem) {
                // Update the data object with new values
                dataItem.startValue = startValue;
                dataItem.endValue = endValue;
                dataItem.length = length;
                dataItem.width = width;
                dataItem.area = areaInSqYd;
                dataItem.tonnage = tonnage;
                dataItem.weight = tonnage;
                dataItem.yield = yieldVal;
                
                // Update archive table footer totals
                updateArchiveFooterTotals(currentArchiveDisplayData);
            }
        }
    }

    // Save edits to current run data
    function saveCurrentRunEdits() {
        if (editedCells.size === 0) {
            alert('No changes to save.');
            return;
        }
        
        if (confirm('Save all edits to current day data?')) {
            // Process remarks edits for archived runs
            const archives = loadDataFromStorage(ARCHIVES_KEY) || {};
            const runsForToday = archives[currentDate] || [];
            let hasRemarksChanges = false;
            
            // Check for edited remarks
            const editedRemarks = truckDataBody.querySelectorAll('.editable-remarks.cell-edited');
            editedRemarks.forEach(remarksElem => {
                const runId = remarksElem.getAttribute('data-run-id');
                if (runId) {
                    // Find the run with this ID
                    const runIndex = runsForToday.findIndex(run => run.runId === runId);
                    if (runIndex !== -1) {
                        // Update the remarks
                        runsForToday[runIndex].remarks = remarksElem.textContent.trim();
                        hasRemarksChanges = true;
                    }
                }
            });
            
            // If we have remarks changes, save the archives
            if (hasRemarksChanges) {
                archives[currentDate] = runsForToday;
                localStorage.setItem(ARCHIVES_KEY, JSON.stringify(archives));
            }
            
            // Save to localStorage (for truck data edits)
            saveData();
            
            // Reset edit mode
            isEditMode = false;
            editModeBtn.textContent = 'Enable Edit Mode';
            editModeBtn.style.backgroundColor = 'var(--primary)';
            document.getElementById('dataTab').classList.remove('editable-mode-active');
            
            // Remove editable attributes
            removeEditableAttributes(truckDataBody);
            
            // Clear edited cells tracker
            editedCells.clear();
            
            // Show the 'Previous Days' button again
            viewArchivesButton.style.display = 'block';
            
            // Refresh the UI to show updated remarks
            updateCurrentRunTable();
            
            // Alert success
            alert('Changes saved successfully.');
        }
    }

    // Cancel edits to current run data
    function cancelCurrentRunEdits() {
        if (editedCells.size > 0) {
            if (!confirm('Discard all unsaved changes?')) {
                return;
            }
        }
        
        // Restore original data
        currentRunData = JSON.parse(JSON.stringify(originalCurrentRunData));
        
        // Reset edit mode
        isEditMode = false;
        editModeBtn.textContent = 'Enable Edit Mode';
        editModeBtn.style.backgroundColor = 'var(--primary)';
        document.getElementById('dataTab').classList.remove('editable-mode-active');
        
        // Remove editable attributes
        removeEditableAttributes(truckDataBody);
        
        // Clear edited cells tracker
        editedCells.clear();
        
        // Show the 'Previous Days' button again
        viewArchivesButton.style.display = 'block';
        
        // Refresh the UI
        updateCurrentRunTable();
        updateCurrentRunSummary();
        updateDaySummary();
    }

    // Save edits to archive data
    function saveArchiveEdits() {
        if (editedCells.size === 0) {
            alert('No changes to save.');
            return;
        }
        
        const selectedDate = archiveDateSelect.value;
        if (!selectedDate) {
            alert('Cannot save: No date selected.');
            return;
        }
        
        if (confirm('Save all edits to archived data?')) {
            // Get current archives
            let archives = loadDataFromStorage(ARCHIVES_KEY) || {};
            let runsForDay = archives[selectedDate] || [];
            
            // Sort runs by their runId (timestamp)
            runsForDay.sort((a, b) => a.runId.localeCompare(b.runId));
            
            // Create a map of original IDs to edited data
            const editedDataMap = {};
            currentArchiveDisplayData.forEach(item => {
                if (item && item.id) {
                    editedDataMap[item.id] = { ...item };
                }
            });
            
            // Check for edited remarks
            const editedRemarks = archiveDataBody.querySelectorAll('.editable-remarks.cell-edited');
            editedRemarks.forEach(remarksElem => {
                const runId = remarksElem.getAttribute('data-run-id');
                if (runId) {
                    // Find the run with this ID
                    const runIndex = runsForDay.findIndex(run => run.runId === runId);
                    if (runIndex !== -1) {
                        // Update the remarks
                        runsForDay[runIndex].remarks = remarksElem.textContent.trim();
                    }
                }
            });
            
            // Apply edits to each run based on matching IDs
            let anyChanges = false;
            runsForDay.forEach(run => {
                if (run.data && Array.isArray(run.data)) {
                    run.data.forEach((item, index) => {
                        if (item.id && editedDataMap[item.id]) {
                            // Replace the original data with edited data
                            run.data[index] = editedDataMap[item.id];
                            anyChanges = true;
                        }
                    });
                }
            });
            
            if (!anyChanges && editedRemarks.length === 0) {
                console.warn("No changes were mapped to archive structure. This shouldn't happen.");
            }
            
            // Save updated archives
            archives[selectedDate] = runsForDay;
            localStorage.setItem(ARCHIVES_KEY, JSON.stringify(archives));
            
            // Reset edit mode
            isArchiveEditMode = false;
            archiveEditModeBtn.textContent = 'Enable Edit Mode';
            archiveEditModeBtn.style.backgroundColor = 'var(--primary)';
            document.querySelector('.archive-modal-content').classList.remove('editable-mode-active');
            
            // Remove editable attributes
            removeEditableAttributes(archiveDataBody);
            
            // Clear edited cells tracker
            editedCells.clear();
            
            // Show export button again
            exportArchiveButton.style.display = 'block';

            // Refresh table and mobile cards with saved values
            loadArchiveDataForSelectedDate();
            
            // Alert success
            alert('Changes to archived data saved successfully.');
        }
    }

    // Cancel edits to archive data
    function cancelArchiveEdits() {
        if (editedCells.size > 0) {
            if (!confirm('Discard all unsaved changes?')) {
                return;
            }
        }
        
        // Restore original data
        currentArchiveDisplayData = JSON.parse(JSON.stringify(originalArchiveData));
        
        // Reset edit mode
        isArchiveEditMode = false;
        archiveEditModeBtn.textContent = 'Enable Edit Mode';
        archiveEditModeBtn.style.backgroundColor = 'var(--primary)';
        archiveEditControls.style.display = 'none'; // Hide controls
        document.querySelector('.archive-modal-content').classList.remove('editable-mode-active');
        
        // Remove editable attributes
        removeEditableAttributes(archiveDataBody);
        
        // Clear edited cells tracker
        editedCells.clear();
        
        // Show export button again
        exportArchiveButton.style.display = 'block';
        
        // Refresh the UI - reload the selected date
        loadArchiveDataForSelectedDate();
    }

    // Remove editable attributes from cells
    function removeEditableAttributes(tableBody) {
        // Remove contenteditable from cells
        const cells = tableBody.querySelectorAll('td[contenteditable="true"]');
        cells.forEach(cell => {
            cell.removeAttribute('contenteditable');
            cell.classList.remove('cell-edited');
            
            // Remove event listeners (tricky, so recreate the element)
            const newCell = cell.cloneNode(true);
            cell.parentNode.replaceChild(newCell, cell);
        });
        
        // Handle editable remarks specifically
        const editableRemarks = tableBody.querySelectorAll('.editable-remarks');
        editableRemarks.forEach(remarksElem => {
            const parentSpan = remarksElem.parentNode;
            if (parentSpan) {
                // Replace with simple text
                parentSpan.textContent = 'Remarks: ' + remarksElem.textContent;
            }
        });
    }

    // Add to closeArchiveModalFunc - ensure edit mode is reset
    function closeArchiveModalFunc() {
      if (isArchiveEditMode) {
        cancelArchiveEdits(); // This will also hide the controls
      } else {
         archiveEditControls.style.display = 'none'; // Ensure controls are hidden even if not in edit mode
      }
      archiveModal.style.display = 'none';
    }

    // Initialize auto-fill setting
    function initAutoFill() {
        const savedAutoFill = localStorage.getItem(AUTO_FILL_KEY);
        if (!autoFillSwitch) {
            autoFillEnabled = savedAutoFill !== 'false';
            return;
        }

        if (savedAutoFill === 'false') {
            autoFillEnabled = false;
            autoFillSwitch.classList.remove('active');
        } else {
            autoFillEnabled = true;
            autoFillSwitch.classList.add('active');
        }
    }

    // Toggle auto-fill setting
    function toggleAutoFill() {
        autoFillEnabled = !autoFillEnabled;

        if (!autoFillSwitch) {
            localStorage.setItem(AUTO_FILL_KEY, autoFillEnabled ? 'true' : 'false');
            return;
        }

        if (autoFillEnabled) {
            autoFillSwitch.classList.add('active');
            localStorage.setItem(AUTO_FILL_KEY, 'true');
        } else {
            autoFillSwitch.classList.remove('active');
            localStorage.setItem(AUTO_FILL_KEY, 'false');
        }
    }

    // Add listeners for settings modal close buttons
    if (closeSettingsModal) {
        closeSettingsModal.addEventListener('click', closeSettingsModalFunc);
    }
    if (closeSettingsButton) {
        closeSettingsButton.addEventListener('click', closeSettingsModalFunc);
    }
