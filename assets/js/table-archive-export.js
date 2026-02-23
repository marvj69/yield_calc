    /***********************************************************
     * UI Update Functions (Summaries & Tables)
     ***********************************************************/

    // Update the table showing the loads for the CURRENT DAY (all runs)
    function updateCurrentRunTable() {
      truckDataBody.innerHTML = ''; // Clear current run table body

      // Get archives for today
      const archives = loadDataFromStorage(ARCHIVES_KEY) || {};
      const runsForToday = archives[currentDate] || [];

      // Sort runs by their runId (timestamp)
      runsForToday.sort((a, b) => a.runId.localeCompare(b.runId));

      // Display archived runs from today first
      runsForToday.forEach(run => {
        // Add separator for each run
        const separatorRow = document.createElement('tr');
        separatorRow.className = 'run-separator';
        separatorRow.setAttribute('data-run-id', run.runId); // Add run ID for edit mode
        const runTime = new Date(run.runId).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        separatorRow.innerHTML = `<td colspan="11">Run ended at: ${runTime}<span>Remarks: ${run.remarks || 'N/A'}</span></td>`;
        truckDataBody.appendChild(separatorRow);

        // Add truck data for this run
        if (run.data && Array.isArray(run.data)) {
          run.data.forEach(truck => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${truck.loadNumber || ''}</td>
              <td>${(truck.startValue ?? 0).toFixed(2)}</td>
              <td>${(truck.endValue ?? 0).toFixed(2)}</td>
              <td>${(truck.length ?? 0).toFixed(2)}</td>
              <td>${(truck.width ?? 0).toFixed(2)}</td>
              <td>${(truck.area ?? 0).toFixed(2)}</td>
              <td>${(truck.tonnage ?? 0).toFixed(2)}</td>
              <td>${((truck.tonnage ?? 0) * 2000).toLocaleString()}</td>
              <td>${(truck.yield ?? 0).toFixed(2)}</td>
              <td>${formatDateForDisplay(truck.date) || ''}</td>
              <td>${truck.id ? `<span class="delete-btn" data-id="${truck.id}">✖</span>` : ''}</td>
            `;
            truckDataBody.appendChild(row);
          });
        }
      });

      // Then display current run data (if it exists)
      if (currentRunData.length > 0) {
        const currentRunHeader = document.createElement('tr');
        currentRunHeader.className = 'run-separator';
        currentRunHeader.innerHTML = '<td colspan="11">Current Run (In Progress)<span>Remarks: In progress</span></td>';
        truckDataBody.appendChild(currentRunHeader);

        currentRunData.forEach(truck => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${truck.loadNumber || ''}</td>
            <td>${(truck.startValue ?? 0).toFixed(2)}</td>
            <td>${(truck.endValue ?? 0).toFixed(2)}</td>
            <td>${(truck.length ?? 0).toFixed(2)}</td>
            <td>${(truck.width ?? 0).toFixed(2)}</td>
            <td>${(truck.area ?? 0).toFixed(2)}</td>
            <td>${(truck.tonnage ?? 0).toFixed(2)}</td>
            <td>${((truck.tonnage ?? 0) * 2000).toLocaleString()}</td>
            <td>${(truck.yield ?? 0).toFixed(2)}</td>
            <td>${formatDateForDisplay(truck.date) || ''}</td>
            <td>${truck.id ? `<span class="delete-btn" data-id="${truck.id}">✖</span>` : ''}</td>
          `;
          truckDataBody.appendChild(row);
        });
      }

      // Show message if no data for today
      if (runsForToday.length === 0 && currentRunData.length === 0) {
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = '<td colspan="11" style="text-align: center; font-style: italic;">No runs for today yet</td>';
        truckDataBody.appendChild(noDataRow);
      }

      renderCurrentRunCards(runsForToday);
      attachCurrentRunDeleteHandlers();

      // Update the footer for the table (show day totals)
      updateCurrentRunTableFooter();
    }

    function renderCurrentRunCards(runsForToday) {
      if (!truckDataCards) return;
      truckDataCards.innerHTML = '';

      let hasRows = false;
      const fragment = document.createDocumentFragment();

      runsForToday.forEach(run => {
        if (!run?.data || !Array.isArray(run.data) || run.data.length === 0) return;

        const runTime = run.runId
          ? new Date(run.runId).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Unknown time';
        fragment.appendChild(createMobileRunSeparatorElement(`Run ended at: ${runTime}`, run.remarks || 'N/A', run.runId || ''));

        run.data.forEach(truck => {
          fragment.appendChild(createTruckCardElement(truck));
          hasRows = true;
        });
      });

      if (currentRunData.length > 0) {
        fragment.appendChild(createMobileRunSeparatorElement('Current Run (In Progress)', 'In progress'));

        currentRunData.forEach(truck => {
          fragment.appendChild(createTruckCardElement(truck));
          hasRows = true;
        });
      }

      if (!hasRows) {
        fragment.appendChild(createMobileEmptyStateElement('No runs for today yet'));
      }

      truckDataCards.appendChild(fragment);
    }

    function renderArchiveCards(runsForDay, selectedDate) {
      if (!archiveDataCards) return;
      archiveDataCards.innerHTML = '';

      const fragment = document.createDocumentFragment();

      if (!selectedDate) {
        fragment.appendChild(createMobileEmptyStateElement('Select a date to view previous runs'));
        archiveDataCards.appendChild(fragment);
        return;
      }

      let hasRows = false;

      runsForDay.forEach((run, index) => {
        if (!run?.data || !Array.isArray(run.data) || run.data.length === 0) return;

        const runTime = run.runId
          ? new Date(run.runId).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Unknown time';
        const title = index === 0
          ? `Run ended at: ${runTime} (First run of day)`
          : `Run ended at: ${runTime}`;

        fragment.appendChild(createMobileRunSeparatorElement(title, run.remarks || 'N/A', run.runId || ''));

        run.data.forEach(truck => {
          fragment.appendChild(createTruckCardElement(truck, { includeDelete: false }));
          hasRows = true;
        });
      });

      if (!hasRows) {
        fragment.appendChild(createMobileEmptyStateElement('No data found for selected date'));
      }

      archiveDataCards.appendChild(fragment);
    }

    function createMobileRunSeparatorElement(title, remarks, runId = '') {
      const section = document.createElement('div');
      section.className = 'mobile-run-separator';
      if (runId) section.setAttribute('data-run-id', runId);
      section.innerHTML = `
        <div class="mobile-run-title">${title}</div>
        <div class="mobile-run-remarks">Remarks: ${remarks || 'N/A'}</div>
      `;
      return section;
    }

    function createMobileEmptyStateElement(message) {
      const emptyState = document.createElement('div');
      emptyState.className = 'mobile-empty-state';
      emptyState.textContent = message;
      return emptyState;
    }

    function createTruckCardElement(truck, options = {}) {
      const includeDelete = options.includeDelete !== false;
      const card = document.createElement('article');
      card.className = 'truck-card';

      const deleteBtn = includeDelete && truck.id
        ? `<button type="button" class="delete-btn card-delete-btn" data-id="${truck.id}" aria-label="Delete load ${truck.loadNumber || ''}">✖</button>`
        : '';

      card.innerHTML = `
        <div class="truck-card-head">
          <div class="truck-card-title">Load ${truck.loadNumber || '-'}</div>
          ${deleteBtn}
        </div>
        <div class="truck-card-grid">
          <div class="truck-card-row">
            <span class="truck-card-label">Start</span>
            <span class="truck-card-value">${(truck.startValue ?? 0).toFixed(2)}</span>
          </div>
          <div class="truck-card-row">
            <span class="truck-card-label">End</span>
            <span class="truck-card-value">${(truck.endValue ?? 0).toFixed(2)}</span>
          </div>
          <div class="truck-card-row">
            <span class="truck-card-label">Length (ft)</span>
            <span class="truck-card-value">${(truck.length ?? 0).toFixed(2)}</span>
          </div>
          <div class="truck-card-row">
            <span class="truck-card-label">Width (ft)</span>
            <span class="truck-card-value">${(truck.width ?? 0).toFixed(2)}</span>
          </div>
          <div class="truck-card-row">
            <span class="truck-card-label">Tonnage</span>
            <span class="truck-card-value">${(truck.tonnage ?? 0).toFixed(2)}</span>
          </div>
          <div class="truck-card-row">
            <span class="truck-card-label">Yield</span>
            <span class="truck-card-value">${(truck.yield ?? 0).toFixed(2)}</span>
          </div>
          <div class="truck-card-row">
            <span class="truck-card-label">Area (sq yd)</span>
            <span class="truck-card-value">${(truck.area ?? 0).toFixed(2)}</span>
          </div>
          <div class="truck-card-row">
            <span class="truck-card-label">Weight (lbs)</span>
            <span class="truck-card-value">${((truck.tonnage ?? 0) * 2000).toLocaleString()}</span>
          </div>
          <div class="truck-card-row">
            <span class="truck-card-label">Date</span>
            <span class="truck-card-value">${formatDateForDisplay(truck.date) || ''}</span>
          </div>
        </div>
      `;

      return card;
    }

    function attachCurrentRunDeleteHandlers() {
      document.querySelectorAll('#truckDataBody .delete-btn[data-id], #truckDataCards .delete-btn[data-id]').forEach(btn => {
        btn.addEventListener('click', (event) => {
          const id = event.currentTarget.getAttribute('data-id');
          if (id) deleteEntry(id);
        });
      });
    }

    // Update the footer totals for the table (showing day totals)
    function updateCurrentRunTableFooter() {
      // Use day totals (all data for today)
      const totals = calculateTotals(calendarDayData);
      runTotalLengthFoot.textContent = totals.totalLength.toFixed(2);
      runTotalAreaFoot.textContent = totals.totalArea.toFixed(2);
      runTotalTonnageFoot.textContent = totals.totalTonnage.toFixed(2);
      runTotalWeightFoot.textContent = (totals.totalWeight * TONS_TO_POUNDS).toLocaleString();
      runAvgYieldFoot.textContent = totals.avgYield.toFixed(2);
    }

    // Update the "Current Run Summary" box
    function updateCurrentRunSummary() {
        const totals = calculateTotals(currentRunData);
        runTotalTrucks.textContent = totals.count;
        runTotalLength.textContent = totals.totalLength.toFixed(2); // NEW
        runTotalArea.textContent = totals.totalArea.toFixed(2);
        runTotalWeight.textContent = `${totals.totalWeight.toFixed(2)} / ${(totals.totalWeight * TONS_TO_POUNDS).toLocaleString()} lbs`;
        runAverageYield.textContent = totals.avgYield.toFixed(2);
    }

    // Update the "Day Summary" box (using calendar day data)
    function updateDaySummary() {
        const totals = calculateTotals(calendarDayData);
        dayTotalTrucks.textContent = totals.count;
        dayTotalLength.textContent = totals.totalLength.toFixed(2); // NEW
        dayTotalArea.textContent = totals.totalArea.toFixed(2);
        dayTotalWeight.textContent = `${totals.totalWeight.toFixed(2)} / ${(totals.totalWeight * TONS_TO_POUNDS).toLocaleString()} lbs`;
        dayAverageYield.textContent = totals.avgYield.toFixed(2);
    }


    // Helper function to calculate totals for any given array of truck data
    function calculateTotals(dataArray) {
      const count = dataArray.length;
      const totalLength = dataArray.reduce((sum, t) => sum + (t.length || 0), 0);
      const totalArea = dataArray.reduce((sum, t) => sum + (t.area || 0), 0);
      const totalTonnage = dataArray.reduce((sum, t) => sum + (t.tonnage || 0), 0);
      const totalWeight = dataArray.reduce((sum, t) => sum + (t.tonnage || 0), 0); // Use tonnage for weight consistently
      const avgYield = (totalArea > 0) ? ((totalWeight * TONS_TO_POUNDS) / totalArea) : 0; // Convert tons to pounds for yield calc
      return { count, totalLength, totalArea, totalTonnage, totalWeight, avgYield };
    }


    /***********************************************************
     * Archive Viewing Functions
     ***********************************************************/

    function openArchiveModal() {
      populateArchiveDates(); // Populate dropdown with unique dates (previous days)
      archiveModal.style.display = 'block';
      
      // Clear previous data and set default view
      archiveDataBody.innerHTML = ''; 
      const noSelectionRow = document.createElement('tr');
      noSelectionRow.innerHTML = '<td colspan="10" style="text-align: center; font-style: italic;">Select a date to view previous runs</td>';
      archiveDataBody.appendChild(noSelectionRow);
      
      // Reset totals - pass an empty array
      updateArchiveFooterTotals([]);
      renderArchiveCards([], '');
      
      // Set the title to indicate these are previous days' runs
      document.querySelector('#archiveModal h2').textContent = "Previous Days' Run Data";
    }

    // Function to display today's runs in the archive view - REMOVED

    function closeArchiveModalFunc() {
      archiveModal.style.display = 'none';
    }

    // 9. Display Runs within Day: Populate dropdown with unique dates only
    function populateArchiveDates() {
      archiveDateSelect.innerHTML = '<option value="">Select a date...</option>'; // Clear existing options

      const archives = loadDataFromStorage(ARCHIVES_KEY) || {};
      const todayDate = getTodayDate(); // Get current date
      
      // Filter out today's date and get unique dates
      const uniqueDates = [...new Set(Object.keys(archives))]
                           .filter(date => date !== todayDate) // Filter out today
                           .sort((a, b) => new Date(b) - new Date(a)); // Sort descending

      uniqueDates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = formatDateForDisplay(date); // Display formatted date
        archiveDateSelect.appendChild(option);
      });
      
      // Display message if no previous dates
      if (uniqueDates.length === 0) {
        const noDataOption = document.createElement('option');
        noDataOption.disabled = true;
        noDataOption.textContent = "No previous days' data available";
        archiveDateSelect.appendChild(noDataOption);
      }
    }


     // 9. Display Runs within Day: Load all runs for the selected calendar date
    function loadArchiveDataForSelectedDate() {
        const selectedDate = archiveDateSelect.value;
        archiveDataBody.innerHTML = ''; // Clear previous data
        currentArchiveDisplayData = []; // Clear data holder

        if (!selectedDate) {
            // If no date is selected, show message
            const noSelectionRow = document.createElement('tr');
            noSelectionRow.innerHTML = '<td colspan="10" style="text-align: center; font-style: italic;">Select a date to view previous runs</td>';
            archiveDataBody.appendChild(noSelectionRow);
            // Reset totals
            updateArchiveFooterTotals([]);
            renderArchiveCards([], '');
            return;
        }

        // Set the title to indicate we're viewing a previous day
        document.querySelector('#archiveModal h2').textContent = `Run Data for ${formatDateForDisplay(selectedDate)}`;

        const archives = loadDataFromStorage(ARCHIVES_KEY) || {};
        const runsForDay = archives[selectedDate] || [];

        // Sort runs by their runId (timestamp)
        runsForDay.sort((a, b) => a.runId.localeCompare(b.runId));

        let allDataForDay = []; // To calculate totals

        runsForDay.forEach((run, index) => {
            // 10. Visual Separators
            if (index > 0) { // Add separator before the second run onwards
                const separatorRow = document.createElement('tr');
                separatorRow.className = 'run-separator';
                separatorRow.setAttribute('data-run-id', run.runId); // Add run ID for edit mode
                const runTime = new Date(run.runId).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                separatorRow.innerHTML = `<td colspan="10">Run ended at: ${runTime} <span>Remarks: ${run.remarks || 'N/A'}</span></td>`;
                archiveDataBody.appendChild(separatorRow);
            } else {
                 // Optional: Add header for the first run
                 const separatorRow = document.createElement('tr');
                 separatorRow.className = 'run-separator';
                 separatorRow.setAttribute('data-run-id', run.runId); // Add run ID for edit mode
                 const runTime = new Date(run.runId).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                 separatorRow.innerHTML = `<td colspan="10">Run ended at: ${runTime} (First run of day)<span>Remarks: ${run.remarks || 'N/A'}</span></td>`;
                 archiveDataBody.appendChild(separatorRow);
            }

            // Add truck data rows for this run
            if (run.data && Array.isArray(run.data)) {
                run.data.forEach(truck => {
                    // Ensure each record has an ID
                    if (!truck.id) {
                        truck.id = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    }
                    
                    const row = document.createElement('tr');
                    row.setAttribute('data-record-id', truck.id);
                    row.innerHTML = `
                        <td>${truck.loadNumber || ''}</td>
                        <td>${(truck.startValue ?? 0).toFixed(2)}</td>
                        <td>${(truck.endValue ?? 0).toFixed(2)}</td>
                        <td>${(truck.length ?? 0).toFixed(2)}</td>
                        <td>${(truck.width ?? 0).toFixed(2)}</td>
                        <td>${(truck.area ?? 0).toFixed(2)}</td>
                        <td>${(truck.tonnage ?? 0).toFixed(2)}</td>
                        <td>${((truck.tonnage ?? 0) * 2000).toLocaleString()}</td>
                        <td>${(truck.yield ?? 0).toFixed(2)}</td>
                        <td>${formatDateForDisplay(truck.date) || ''}</td>
                    `;
                    archiveDataBody.appendChild(row);
                    allDataForDay.push(truck); // Add to array for total calculation and export
                });
            }
        });

        // If no data for selected day, show a message
        if (allDataForDay.length === 0) {
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = '<td colspan="10" style="text-align: center; font-style: italic;">No data found for selected date</td>';
            archiveDataBody.appendChild(noDataRow);
        }

        currentArchiveDisplayData = allDataForDay; // Store for export
        updateArchiveFooterTotals(allDataForDay); // Update footer with totals for all runs of the day
        renderArchiveCards(runsForDay, selectedDate);
    }

    // Update the footer totals for the ARCHIVE table
    function updateArchiveFooterTotals(data) {
      // Ensure data is an array before passing to calculateTotals
      const dataArray = Array.isArray(data) ? data : [];
      const totals = calculateTotals(dataArray); // Use the common calculator
      archiveTotalLength.textContent = totals.totalLength.toFixed(2);
      archiveTotalAreaFoot.textContent = totals.totalArea.toFixed(2);
      archiveTotalTonnageFoot.textContent = totals.totalTonnage.toFixed(2);
      archiveTotalWeightFoot.textContent = totals.totalWeight.toFixed(2);
      archiveAvgYieldFoot.textContent = totals.avgYield.toFixed(2);
    }


    /***********************************************************
     * Export Functionality (Excel)
     ***********************************************************/

     // 13. Export selected day's data (all runs) to Excel
    function exportArchiveToExcel() {
        const selectedDate = archiveDateSelect.value;
        const todayDate = getTodayDate();
        let exportDate = selectedDate || todayDate; // If no date is selected, use today
        let exportTitle = selectedDate ? `HMA_Paving_${exportDate}` : `HMA_Paving_Today_${exportDate}`;

        if (currentArchiveDisplayData.length === 0) {
            alert('No data available to export.');
            return;
        }

        console.log(`Exporting ${currentArchiveDisplayData.length} records for ${exportDate} to Excel...`);

        // Prepare data for SheetJS: Array of objects
        const dataForSheet = currentArchiveDisplayData.map(item => ({
            'Date': formatDateForDisplay(item.date) || '',
            'Load Number': item.loadNumber || '',
            'Start Sta.': (item.startValue ?? 0).toFixed(2),
            'End Sta.': (item.endValue ?? 0).toFixed(2),
            'Length (ft)': (item.length ?? 0).toFixed(2),
            'Width (ft)': (item.width ?? 0).toFixed(2),
            'Area (sq yd)': (item.area ?? 0).toFixed(2),
            'Tonnage (tons)': (item.tonnage ?? 0).toFixed(2),
            'Weight (lbs)': ((item.tonnage ?? 0) * 2000).toLocaleString(),
            'Yield (lbs/sq yd)': (item.yield ?? 0).toFixed(2)
            // Remarks could be added as a column if desired, but they are in separators visually
        }));

        // Add a totals row at the end
        const totals = calculateTotals(currentArchiveDisplayData);
        dataForSheet.push({ // Add an empty row for spacing
             'Date': '', 'Load Number': '', 'Start Sta.': '', 'End Sta.': '', 'Length (ft)': '',
             'Width (ft)': '', 'Area (sq yd)': '', 'Tonnage (tons)': '', 'Weight (lbs)': '', 'Yield (lbs/sq yd)': ''
        });
        dataForSheet.push({
            'Date': 'TOTALS',
            'Load Number': '',
            'Start Sta.': '',
            'End Sta.': '',
            'Length (ft)': totals.totalLength.toFixed(2),
            'Width (ft)': '',
            'Area (sq yd)': totals.totalArea.toFixed(2),
            'Tonnage (tons)': totals.totalTonnage.toFixed(2),
            'Weight (lbs)': (totals.totalWeight * 2000).toLocaleString(),
            'Yield (lbs/sq yd)': totals.avgYield.toFixed(2)
        });

        try {
            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(dataForSheet);

            // Optional: Adjust column widths
             const columnWidths = [
                { wch: 15 }, // Date
                { wch: 12 }, // Load Number
                { wch: 12 }, // Start Sta.
                { wch: 12 }, // End Sta.
                { wch: 12 }, // Length (ft)
                { wch: 12 }, // Width (ft)
                { wch: 13 }, // Area (sq yd)
                { wch: 14 }, // Tonnage (tons)
                { wch: 18 },  // Weight (lbs)
                { wch: 18 }  // Yield (lbs/sq yd)
            ];
            worksheet['!cols'] = columnWidths;


            // Create workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Yield Data');

            // Generate filename
            const filename = exportDate === todayDate ? 
                `HMA_Paving_Today_${exportDate}.xlsx` : 
                `HMA_Paving_Previous_Day_${exportDate}.xlsx`;

            // Trigger download
            XLSX.writeFile(workbook, filename);
            console.log("Excel file generation successful.");

        } catch (error) {
            console.error("Error generating Excel file:", error);
            alert("Failed to generate Excel file. See console for details.");
        }
    }

    // Function to export today's data directly without opening the archive modal
    function exportTodayDataToExcel() {
        const todayDate = getTodayDate();
        const archives = loadDataFromStorage(ARCHIVES_KEY) || {};
        
        // Get all available dates (including today)
        const availableDates = [...new Set([...Object.keys(archives), todayDate])].sort((a, b) => new Date(b) - new Date(a));
        
        // Create and show date selection modal
        const modalHtml = `
        <div id="exportDateModal" style="display: block; position: fixed; z-index: 100; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.4);">
            <div style="background-color: var(--card-bg); margin: 15% auto; padding: 20px; border: 1px solid var(--border-color); border-radius: 5px; width: 80%; max-width: 400px; color: var(--text-color);">
                <h3 style="margin-top: 0; text-align: center;">Select Date to Export</h3>
                <select id="exportDateSelect" style="width: 100%; padding: 8px; margin-bottom: 15px; background-color: var(--input-bg); color: var(--text-color); border: 1px solid var(--input-border); border-radius: 4px;">
                    ${availableDates.map(date => `<option value="${date}">${date} (${formatDateForDisplay(date)})</option>`).join('')}
                </select>
                <div style="display: flex; justify-content: space-between; gap: 30px;">
                    <button id="cancelExportDate" style="padding: 8px 16px; background-color: var(--secondary); color: white; border: none; border-radius: 4px; cursor: pointer; min-width: 100px;">Cancel</button>
                    <button id="confirmExportDate" style="padding: 8px 16px; background-color: var(--accent); color: white; border: none; border-radius: 4px; cursor: pointer; min-width: 100px;">Export</button>
                </div>
            </div>
        </div>
        `;
        
        // Add modal to the body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);
        
        // Setup event listeners for the modal
        document.getElementById('cancelExportDate').addEventListener('click', function() {
            document.body.removeChild(modalContainer);
        });
        
        document.getElementById('confirmExportDate').addEventListener('click', function() {
            const dateToExport = document.getElementById('exportDateSelect').value;
            document.body.removeChild(modalContainer);
            
            // Continue with export process
            exportDataForDate(dateToExport);
        });
        
        // Close modal when clicking outside
        document.getElementById('exportDateModal').addEventListener('click', function(event) {
            if (event.target === document.getElementById('exportDateModal')) {
                document.body.removeChild(modalContainer);
            }
        });
    }
    
    // New function to handle the actual export after date selection
    function exportDataForDate(dateToExport) {
        const todayDate = getTodayDate();
        const archives = loadDataFromStorage(ARCHIVES_KEY) || {};
        
        // Get data for the specified date
        let dataToExport = [];
        
        // If exporting today's date, include current run data
        if (dateToExport === todayDate) {
            dataToExport = [...currentRunData];
            
            // Add calendar day data
            if (calendarDayData && Array.isArray(calendarDayData) && calendarDayData.length > 0) {
                dataToExport = [...dataToExport, ...calendarDayData];
            }
        }
        
        // Add archived data for the selected date
        if (archives[dateToExport]) {
            archives[dateToExport].forEach(run => {
                if (run.data && Array.isArray(run.data)) {
                    dataToExport = [...dataToExport, ...run.data];
                }
            });
        }
        
        // Remove duplicates by load number if present
        if (dataToExport.length > 0 && dataToExport[0].loadNumber) {
            const uniqueData = [];
            const loadNumbers = new Set();
            
            dataToExport.forEach(item => {
                if (item.loadNumber && !loadNumbers.has(item.loadNumber)) {
                    loadNumbers.add(item.loadNumber);
                    uniqueData.push(item);
                } else if (!item.loadNumber) {
                    // If no load number, just include it
                    uniqueData.push(item);
                }
            });
            
            dataToExport = uniqueData;
        }
        
        // Check if we have data to export
        if (dataToExport.length === 0) {
            alert(`No data available to export for ${dateToExport}.`);
            return;
        }
        
        console.log(`Exporting ${dataToExport.length} records for ${dateToExport} to Excel...`);
        
        // Prepare data for SheetJS: Array of objects
        const dataForSheet = dataToExport.map(item => ({
            'Date': formatDateForDisplay(item.date) || '',
            'Load Number': item.loadNumber || '',
            'Start Sta.': (item.startValue ?? 0).toFixed(2),
            'End Sta.': (item.endValue ?? 0).toFixed(2),
            'Length (ft)': (item.length ?? 0).toFixed(2),
            'Width (ft)': (item.width ?? 0).toFixed(2),
            'Area (sq yd)': (item.area ?? 0).toFixed(2),
            'Tonnage (tons)': (item.tonnage ?? 0).toFixed(2),
            'Weight (lbs)': ((item.tonnage ?? 0) * 2000).toLocaleString(),
            'Yield (lbs/sq yd)': (item.yield ?? 0).toFixed(2)
        }));
        
        // Add a totals row at the end
        const totals = calculateTotals(dataToExport);
        dataForSheet.push({ // Add an empty row for spacing
             'Date': '', 'Load Number': '', 'Start Sta.': '', 'End Sta.': '', 'Length (ft)': '',
             'Width (ft)': '', 'Area (sq yd)': '', 'Tonnage (tons)': '', 'Weight (lbs)': '', 'Yield (lbs/sq yd)': ''
        });
        dataForSheet.push({
            'Date': 'TOTALS',
            'Load Number': '',
            'Start Sta.': '',
            'End Sta.': '',
            'Length (ft)': totals.totalLength.toFixed(2),
            'Width (ft)': '',
            'Area (sq yd)': totals.totalArea.toFixed(2),
            'Tonnage (tons)': totals.totalTonnage.toFixed(2),
            'Weight (lbs)': (totals.totalWeight * 2000).toLocaleString(),
            'Yield (lbs/sq yd)': totals.avgYield.toFixed(2)
        });
        
        try {
            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
            
            // Optional: Adjust column widths
            const columnWidths = [
                { wch: 15 }, // Date
                { wch: 12 }, // Load Number
                { wch: 12 }, // Start Sta.
                { wch: 12 }, // End Sta.
                { wch: 12 }, // Length (ft)
                { wch: 12 }, // Width (ft)
                { wch: 13 }, // Area (sq yd)
                { wch: 14 }, // Tonnage (tons)
                { wch: 18 },  // Weight (lbs)
                { wch: 18 }  // Yield (lbs/sq yd)
            ];
            worksheet['!cols'] = columnWidths;
            
            // Create workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Yield Data');
            
            // Generate filename
            const filename = dateToExport === todayDate ? 
                `HMA_Paving_Today_${dateToExport}.xlsx` : 
                `HMA_Paving_${dateToExport}.xlsx`;
            
            // Trigger download
            XLSX.writeFile(workbook, filename);
            console.log("Excel file generation successful.");
            
        } catch (error) {
            console.error("Error generating Excel file:", error);
            alert("Failed to generate Excel file. See console for details.");
        }
    }
