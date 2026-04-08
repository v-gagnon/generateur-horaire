let groupCount = 0;

function getHourOptions() {
    let options = '';
    for (let i = 8; i <= 22; i++) {
        options += `<option value="${i}">${i}</option>`;
    }
    return options;
}

function addGroup() {
    groupCount++;
    const container = document.getElementById('groupsContainer');

    const groupDiv = document.createElement('div');
    groupDiv.className = 'group-card';
    groupDiv.innerHTML = `
        <div class="group-header" onclick="toggleCollapse(this)">
            <span>Groupe #${groupCount}</span>
            <span class="arrow">▼</span>
        </div>
        <div class="group-content">
            <div class="periods-container">
                </div>
            <button type="button" onclick="addPeriod(this)">+ Ajouter une période</button>
            <button type="button" class="danger-btn" onclick="this.parentElement.parentElement.remove()">Supprimer Groupe</button>
        </div>
    `;
    container.appendChild(groupDiv);
}

function addPeriod(btn) {
    const container = btn.previousElementSibling;
    const periodDiv = document.createElement('div');
    periodDiv.className = 'period-row';
    periodDiv.innerHTML = `
        <select class="day-select">
            <option value="Lundi">Lundi</option>
            <option value="Mardi">Mardi</option>
            <option value="Mercredi">Mercredi</option>
            <option value="Jeudi">Jeudi</option>
            <option value="Vendredi">Vendredi</option>
        </select>
        <div>
            <select class="start-hour">${getHourOptions()}</select>
            <span>:</span>
            <select class="start-minute">
                <option value="30">30</option>
                <option value="00">00</option>
            </select>
        </div>
        <span> à </span>
        <div>
            <select class="end-hour">${getHourOptions()}</select>
            <span>:</span>
            <select class="end-minute">
                <option value="30">30</option>
                <option value="00">00</option>
            </select>
        </div>
        <button type="button" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(periodDiv);
}

function toggleCollapse(header) {
    const content = header.nextElementSibling;
    content.classList.toggle('visible');
    header.querySelector('.arrow').textContent = content.classList.contains('visible') ? '▲' : '▼';
}

function submitCourse() {
    groupCount = 0;

    const sigle = document.getElementById('sigleCours').value;
    const nom = document.getElementById('nomCours').value;
    const isMandatory = document.getElementById('coursObligatoire').checked;

    if (!sigle || !nom) return alert("Remplissez les infos de base.");

    const li = document.createElement('li');
    li.innerHTML = `<strong>${sigle}</strong> - ${nom}`;

    const targetList = isMandatory ? document.getElementById('mandatoryList') : document.getElementById('optionalList');
    targetList.appendChild(li);

    // Reset simple
    document.getElementById('groupsContainer').innerHTML = '';
    document.getElementById('sigleCours').value = '';
    document.getElementById('nomCours').value = '';
}