
        // --- DATA ARCHITECTURE ---
        const DATA = {
            managers: [
                "Christopher Terry – Store General Manager",
                "Shanetta McIntee – Assistant Store Manager",
                "Joachima Ross – Men's Merchandise Manager",
                "Chanel Yancey – Kids Merchandise Manager",
                "Alexis Hutchinson – Home Merchandise Manager",
                "Angelique Hall – Front End Lead"
            ],
            shifts: ["7-3", "8-4", "9-5", "11-7", "12-8", "12-9", "12-10", "OFF"],
            associates: {
                "Men's Pad": ["Parrish Kimbrough", "Angelique Dunn", "Dominique Clark"],
                "Ladies Pad": ["Jada Jenkins", "Maxine Horton", "Felecia Reed"],
                "Kids/Boys Pad": ["Donovan Palmer", "Javaughn Harris", "Maya Shines"],
                "Home Pad": ["Itoya Brown", "Christian Ross", "Clifford Marshall"],
                "Front End / CS": ["Gayla Harrison", "Lisa Clark", "Alecia Mance", "Brejanae Butler", "Denise Johnson", "Nakya Fletcher", "Jaimee Burks", "Joshua Hayum", "Julie Harris"],
                "Back End / Logistics": ["Jordan Milford", "Devante Williams", "Robert Brown", "Seantwa Foster"],
                "Support / LP": ["Juel Fields (Door Greeter)", "Xevier Kelley (Door Greeter)", "Michael Dean (Door Greeter)", "Josephine Henning (Maintenance)", "Taylor Davis (Loss Prevention)"]
            },
            departments: {
                "Men's Apparel Pad": ["Top Pad", "Bottom Pad (Sized Denim)", "Shorts", "Big Men", "Active", "Men's Clearance", "Hosiery"],
                "Women's Apparel Pad": ["Juniors (JR)", "Missy", "Plus", "Intimate (Hung)", "Sleepwear (Clip-Hung)", "Scrubs", "Women's Clearance"],
                "Kids Department": ["Boys", "Boy Infants & Toddlers", "Girls", "Girl Infants & Toddlers", "Kids Clearance", "Kids Footwear", "Under-Fixture Housekeeping"],
                "Home Department": ["All Home Goods (Z-Lining)", "Label Facing", "Toys Pad", "Heavy Safety", "Linen & Bedding", "Home Clearance", "Stray Recovery"],
                "Customer Service / Front End": ["Perfume & Cologne Tables (Lockboxes)", "Q-Line Impulse Density", "Q-Line FIFO", "Cash Wrap Station", "POS Return Baskets", "Value Drop Signage", "Cart Bay"],
                "Backroom Pad": ["Backstock Organization", "FIFO Freight", "Emergency Exit Clears", "Security Dock Doors", "Pallet Stacking", "Salvage Bins", "Logistics Sweep"]
            },
            upgrades: [
                "Consolidating clearance runs",
                "Re-aligning denim size dividers",
                "Interlocking coordinate sets on single hangers",
                "Rack purging",
                "Endcap resets",
                "Visual color flows"
            ]
        };

        let timerInterval = null;
        let walkStartTime = null;
        let elapsedSeconds = 0;

        // --- INITIALIZATION ---
        function init() {
            populateSelect('plan-manager', DATA.managers, "Select Manager...");
            populateSelect('plan-shift', DATA.shifts, "Select Shift...");
            populateSelect('plan-dept', Object.keys(DATA.departments), "Select Main Department...");
            
            // Populate Associate Dropdown for SOP
            const allAssoc = [];
            for (const [dept, list] of Object.entries(DATA.associates)) {
                list.forEach(a => allAssoc.push(`${a} (${dept})`));
            }
            populateSelect('sop-associate', allAssoc, "Select Associate...");

            // Populate Upgrades Checkboxes
            const upgradePicker = document.getElementById('upgrade-picker');
            DATA.upgrades.forEach((up, idx) => {
                upgradePicker.innerHTML += `
                    <label class="flex items-center space-x-2 bg-slate-50 p-2 rounded border">
                        <input type="checkbox" id="upgrade-${idx}" value="${up}" data-save="true" class="w-5 h-5 text-navy rounded focus:ring-navy">
                        <span class="text-sm">${up}</span>
                    </label>
                `;
            });

            // Set default date
            document.getElementById('plan-date').valueAsDate = new Date();

            generateAuditCards();
            loadState();
            calculateScores();

            // Auto-save loop
            setInterval(saveState, 10000);
        }

        // --- UI UTILITIES ---
        function switchTab(tabId) {
            ['tab-planner', 'tab-audit', 'tab-deployment'].forEach(id => {
                document.getElementById(id).classList.add('hidden');
                document.getElementById('btn-' + id).classList.remove('border-navy', 'text-navy');
                document.getElementById('btn-' + id).classList.add('border-transparent', 'text-gray-400');
            });
            document.getElementById(tabId).classList.remove('hidden');
            document.getElementById('btn-' + tabId).classList.remove('border-transparent', 'text-gray-400');
            document.getElementById('btn-' + tabId).classList.add('border-navy', 'text-navy');
        }

        function populateSelect(elemId, dataArr, defaultText) {
            const el = document.getElementById(elemId);
            el.innerHTML = `<option value="">${defaultText}</option>` + 
                           dataArr.map(item => `<option value="${item}">${item}</option>`).join('');
        }

        function populateSubAreas() {
            const mainDept = document.getElementById('plan-dept').value;
            const subAreaSelect = document.getElementById('plan-subarea');
            if (mainDept && DATA.departments[mainDept]) {
                populateSelect('plan-subarea', DATA.departments[mainDept], "Select Specific Area...");
                subAreaSelect.disabled = false;
            } else {
                subAreaSelect.innerHTML = `<option value="">Select Main Dept First...</option>`;
                subAreaSelect.disabled = true;
            }
        }

        function getFlatAssociateList() {
            let list = [];
            for (const [dept, names] of Object.entries(DATA.associates)) {
                names.forEach(n => list.push(`${n} - ${dept}`));
            }
            return list;
        }

        // --- AUDIT SYSTEM ---
        function generateAuditCards() {
            const container = document.getElementById('audit-cards-container');
            container.innerHTML = '';
            
            Object.entries(DATA.departments).forEach(([dept, areas]) => {
                const safeDeptId = dept.replace(/[^a-zA-Z0-9]/g, '');
                let html = `
                <div class="bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
                    <div class="bg-navy text-white p-3 font-bold text-sm">${dept}</div>
                    <div class="p-4 flex-grow flex flex-col space-y-4">
                        <ul class="text-xs text-gray-600 list-disc pl-4 space-y-1 mb-4 flex-grow">
                            ${areas.map(a => `<li>${a}</li>`).join('')}
                        </ul>
                        <div class="border-t pt-4">
                            <div class="flex justify-between items-center mb-3">
                                <span class="text-sm font-bold text-gray-700">Status</span>
                                <select id="passfail-${safeDeptId}" data-save="true" onchange="calculateScores()" class="border border-gray-300 rounded p-2 text-sm font-bold bg-slate-50">
                                    <option value="Fail">FAIL ❌</option>
                                    <option value="Pass">PASS ✅</option>
                                </select>
                            </div>
                            <div class="space-y-1">
                                <div class="flex justify-between text-xs font-bold text-gray-500">
                                    <span>Grade (0)</span><span>(5)</span>
                                </div>
                                <input type="range" id="grade-${safeDeptId}" data-save="true" min="0" max="5" value="0" oninput="document.getElementById('gradeval-${safeDeptId}').innerText = this.value; calculateScores();" class="w-full touch-target">
                                <div class="text-center font-bold text-navy">Score: <span id="gradeval-${safeDeptId}">0</span>/5</div>
                            </div>
                        </div>
                    </div>
                </div>`;
                container.innerHTML += html;
            });
        }

        function calculateScores() {
            let totalScore = 0;
            let safetyPasses = 0;
            const safetyCriticalDepts = ['CustomerServiceFrontEnd', 'HomeDepartment', 'BackroomPad'];

            Object.keys(DATA.departments).forEach(dept => {
                const safeId = dept.replace(/[^a-zA-Z0-9]/g, '');
                const scoreEl = document.getElementById(`grade-${safeId}`);
                const passFailEl = document.getElementById(`passfail-${safeId}`);
                
                if (scoreEl) totalScore += parseInt(scoreEl.value || 0);
                
                if (safetyCriticalDepts.includes(safeId) && passFailEl && passFailEl.value === 'Pass') {
                    safetyPasses++;
                }
            });

            // FMI = (Sum / 30) * 100
            const fmi = Math.round((totalScore / 30) * 100);
            document.getElementById('fmi-score').innerText = `${fmi}%`;
            document.getElementById('fmi-score').className = `text-4xl font-black ${fmi >= 85 ? 'text-emerald' : fmi >= 70 ? 'text-yellow-600' : 'text-crimson'}`;

            // SCS = (Safety passes / 3) * 100
            const scs = Math.round((safetyPasses / 3) * 100);
            document.getElementById('scs-score').innerText = `${scs}%`;
            document.getElementById('scs-score').className = `text-4xl font-black ${scs === 100 ? 'text-emerald' : 'text-crimson'}`;
        }

        // --- TIMER SYSTEM ---
        function toggleTimer() {
            const btn = document.getElementById('btn-timer-toggle');
            if (timerInterval) {
                // Stop timer
                clearInterval(timerInterval);
                timerInterval = null;
                btn.innerText = "RESUME WALK";
                btn.classList.remove('bg-crimson');
                btn.classList.add('bg-blue-500');
            } else {
                // Start timer
                if (!walkStartTime) walkStartTime = Date.now() - (elapsedSeconds * 1000);
                timerInterval = setInterval(updateTimerDisplay, 1000);
                btn.innerText = "PAUSE WALK";
                btn.classList.remove('bg-emerald', 'bg-blue-500');
                btn.classList.add('bg-crimson');
                
                // Add un-tamperable start timestamp if not exists
                if (!localStorage.getItem('audit-secure-start')) {
                    localStorage.setItem('audit-secure-start', new Date().toISOString());
                }
            }
            saveState();
        }

        function updateTimerDisplay() {
            if (!walkStartTime) return;
            elapsedSeconds = Math.floor((Date.now() - walkStartTime) / 1000);
            const hrs = Math.floor(elapsedSeconds / 3600).toString().padStart(2, '0');
            const mins = Math.floor((elapsedSeconds % 3600) / 60).toString().padStart(2, '0');
            const secs = (elapsedSeconds % 60).toString().padStart(2, '0');
            document.getElementById('audit-timer').innerText = `${hrs}:${mins}:${secs}`;
        }

        function submitAudit() {
            if(confirm("Are you sure you want to finalize this audit? This action secures the timestamp.")) {
                if(timerInterval) toggleTimer(); // stop it
                localStorage.setItem('audit-secure-end', new Date().toISOString());
                alert("Audit submitted successfully! Floor Merchandising Index: " + document.getElementById('fmi-score').innerText);
            }
        }

        // --- DISPATCHER SYSTEM ---
        let rowCount = 0;
        function addAssociateRow(savedData = null) {
            rowCount++;
            const container = document.getElementById('dispatcher-container');
            const assocOptions = getFlatAssociateList().map(a => `<option value="${a}">${a}</option>`).join('');
            
            const html = `
            <div id="assoc-row-${rowCount}" class="bg-gray-50 border rounded p-3 space-y-3 dispatcher-row relative">
                <button onclick="this.parentElement.remove(); saveState();" class="absolute top-2 right-2 text-crimson font-bold text-xl px-2">&times;</button>
                <div class="pr-8">
                    <label class="block text-xs font-bold text-gray-500 mb-1">Roster Member</label>
                    <select class="assoc-name w-full border border-gray-300 rounded p-2 touch-target bg-white text-sm" data-save="true">
                        <option value="">Select Associate...</option>
                        ${assocOptions}
                    </select>
                </div>
                <div class="flex gap-2">
                    <div class="flex-1">
                        <label class="block text-xs font-bold text-gray-500 mb-1">Shift</label>
                        <select class="assoc-shift w-full border border-gray-300 rounded p-2 touch-target bg-white text-sm" data-save="true">
                            <option value="Day">Day</option>
                            <option value="Close">Close</option>
                        </select>
                    </div>
                    <div class="flex items-center justify-center p-2 border rounded bg-white mt-5">
                        <label class="flex items-center space-x-2 text-sm font-bold text-navy">
                            <input type="checkbox" class="assoc-clearance w-5 h-5 text-navy" data-save="true"> 
                            <span>Clearance Owner</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label class="flex justify-between text-xs font-bold text-gray-500 mb-1">
                        <span>EOD Quality Grade</span>
                        <span class="grade-display text-navy">5/10</span>
                    </label>
                    <input type="range" min="1" max="10" value="5" data-save="true" oninput="this.previousElementSibling.querySelector('.grade-display').innerText = this.value + '/10'; saveState();" class="assoc-grade w-full touch-target">
                </div>
            </div>`;
            
            container.insertAdjacentHTML('beforeend', html);
            
            if (savedData) {
                const row = document.getElementById(`assoc-row-${rowCount}`);
                row.querySelector('.assoc-name').value = savedData.name || '';
                row.querySelector('.assoc-shift').value = savedData.shift || 'Day';
                row.querySelector('.assoc-clearance').checked = savedData.clearance || false;
                row.querySelector('.assoc-grade').value = savedData.grade || 5;
                row.querySelector('.grade-display').innerText = (savedData.grade || 5) + '/10';
            }
        }

        function logSOP() {
            const assoc = document.getElementById('sop-associate').value;
            const mod = document.getElementById('sop-module').value;
            if(!assoc || !mod) {
                alert("Please select both an associate and a training module.");
                return;
            }
            // Just simulate logging by showing feedback
            const fb = document.getElementById('sop-log-feedback');
            fb.classList.remove('hidden');
            setTimeout(() => fb.classList.add('hidden'), 3000);
        }

        // --- STATE MANAGEMENT ---
        function saveState() {
            const state = {};
            
            // Standard inputs
            document.querySelectorAll('[data-save="true"]').forEach(el => {
                if (el.type === 'checkbox' || el.type === 'radio') {
                    if (el.checked) state[el.id || el.name + el.value] = el.value;
                } else if (!el.classList.contains('assoc-name') && !el.classList.contains('assoc-shift') && !el.classList.contains('assoc-clearance') && !el.classList.contains('assoc-grade')) {
                    state[el.id] = el.value;
                }
            });

            // Dispatcher rows
            const dispatcherRows = [];
            document.querySelectorAll('.dispatcher-row').forEach(row => {
                dispatcherRows.push({
                    name: row.querySelector('.assoc-name').value,
                    shift: row.querySelector('.assoc-shift').value,
                    clearance: row.querySelector('.assoc-clearance').checked,
                    grade: row.querySelector('.assoc-grade').value
                });
            });
            state.dispatcher = dispatcherRows;
            
            // Timer state
            state.elapsedSeconds = elapsedSeconds;
            if (walkStartTime) state.walkStartTime = walkStartTime;

            localStorage.setItem('forman611-state', JSON.stringify(state));

            // Show indicator
            const ind = document.getElementById('autosave-indicator');
            ind.style.opacity = 1;
            setTimeout(() => ind.style.opacity = 0, 1500);
        }

        function loadState() {
            const stored = localStorage.getItem('forman611-state');
            if (!stored) return;
            
            try {
                const state = JSON.parse(stored);
                
                // standard inputs
                document.querySelectorAll('[data-save="true"]').forEach(el => {
                    if (el.classList.contains('assoc-name') || el.classList.contains('assoc-shift') || el.classList.contains('assoc-clearance') || el.classList.contains('assoc-grade')) return;
                    
                    if (el.type === 'checkbox' || el.type === 'radio') {
                        if (state[el.id || el.name + el.value] === el.value) el.checked = true;
                    } else if (state[el.id] !== undefined) {
                        el.value = state[el.id];
                        // trigger onchange for sliders & selects manually
                        if(el.tagName === 'SELECT' && el.onchange) el.onchange();
                        if(el.type === 'range') {
                            const valId = el.id.replace('grade-', 'gradeval-');
                            if(document.getElementById(valId)) document.getElementById(valId).innerText = el.value;
                        }
                    }
                });

                // Dispatcher rows
                if (state.dispatcher && Array.isArray(state.dispatcher)) {
                    document.getElementById('dispatcher-container').innerHTML = '';
                    state.dispatcher.forEach(d => addAssociateRow(d));
                }

                // Timer
                if (state.elapsedSeconds) elapsedSeconds = state.elapsedSeconds;
                if (state.walkStartTime && localStorage.getItem('audit-secure-start')) {
                    // Check if timer was running
                    if (document.getElementById('btn-timer-toggle').innerText === "PAUSE WALK") {
                        walkStartTime = state.walkStartTime;
                        timerInterval = setInterval(updateTimerDisplay, 1000);
                    } else {
                        walkStartTime = null; // paused state
                        updateTimerDisplay(); // just show elapsed
                    }
                }

                calculateScores();

            } catch(e) {
                console.error("Error loading state:", e);
            }
        }

        // --- EXPORT & OFFLINE ---
        function exportCSV() {
            let csv = "FORMAN MILLS #611 - MANAGEMENT DAILY LOG\n\n";
            csv += "--- METADATA ---\n";
            csv += `Manager: ${document.getElementById('plan-manager').value}\n`;
            csv += `Date: ${document.getElementById('plan-date').value}\n`;
            csv += `Shift: ${document.getElementById('plan-shift').value}\n`;
            csv += `Main Target Dept: ${document.getElementById('plan-dept').value}\n`;
            csv += `Sub-Area: ${document.getElementById('plan-subarea').value}\n`;
            csv += `Target Duration: ${document.getElementById('plan-duration').value}\n`;
            
            const govStatus = document.querySelector('input[name="gov-status"]:checked');
            csv += `Governance Status: ${govStatus ? govStatus.value : 'None'}\n`;
            csv += `Notes: "${document.getElementById('gov-notes').value.replace(/\n/g, ' ')}"\n\n`;

            csv += "--- AUDIT COMPLIANCE ---\n";
            csv += `Walk Duration: ${document.getElementById('audit-timer').innerText}\n`;
            csv += `FMI Score: ${document.getElementById('fmi-score').innerText}\n`;
            csv += `SCS Score: ${document.getElementById('scs-score').innerText}\n`;
            csv += `Secure Start: ${localStorage.getItem('audit-secure-start') || 'N/A'}\n`;
            csv += `Secure End: ${localStorage.getItem('audit-secure-end') || 'N/A'}\n`;
            
            Object.keys(DATA.departments).forEach(dept => {
                const safeId = dept.replace(/[^a-zA-Z0-9]/g, '');
                const score = document.getElementById(`grade-${safeId}`) ? document.getElementById(`grade-${safeId}`).value : 0;
                const status = document.getElementById(`passfail-${safeId}`) ? document.getElementById(`passfail-${safeId}`).value : 'Fail';
                csv += `- ${dept}: ${status} | Grade: ${score}/5\n`;
            });

            csv += "\n--- ASSOCIATE DEPLOYMENT ---\n";
            csv += "Name,Shift,ClearanceOwner,Grade\n";
            document.querySelectorAll('.dispatcher-row').forEach(row => {
                const name = row.querySelector('.assoc-name').value;
                const shift = row.querySelector('.assoc-shift').value;
                const clearance = row.querySelector('.assoc-clearance').checked ? 'Yes' : 'No';
                const grade = row.querySelector('.assoc-grade').value;
                if(name) csv += `"${name}","${shift}","${clearance}",${grade}/10\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Store611_DailyLog_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        function showOfflineModal() {
            document.getElementById('offline-modal').classList.remove('hidden');
            document.getElementById('offline-modal').classList.add('flex');
        }

        function hideOfflineModal() {
            document.getElementById('offline-modal').classList.add('hidden');
            document.getElementById('offline-modal').classList.remove('flex');
        }

        function downloadApp() {
            const htmlContent = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'FormanMills611_Portal.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            hideOfflineModal();
        }

        // Run Init on Load
        window.addEventListener('DOMContentLoaded', init);

    