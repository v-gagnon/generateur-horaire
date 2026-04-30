/*Variables du form*/
let coursesBuffer = [];
/*  Objet cours: String sigle, String nom, boolean estObligatoire, Array groupes
    Objet groupe: String nom, Array periodes
    Objet période: String jour, String début, String fin */
let groupCount = 0;

/*Variables de génération*/
let generatedSchedules = [];
let currentScheduleIndex = 0;
const CLASS_COLORS = ['#4A90E2', '#E94A3F', '#F5A623', '#7ED321', '#BD10E0', '#50E3C2', '#F8E71C', '#8B572A', '#9B9B9B', '#417505'];

//Helper de addPeriod()
function getHourOptions() {
    let options = '';
    for (let i = 8; i <= 22; i++) {
        options += `<option value="${i}">${i}</option>`;
    }
    return options;
}

//Ajoute les sélections d'horaires pour un groupe
function addPeriod(btn) {
    const container = btn.parentElement.previousElementSibling;
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

//Confirmation appelée par addGroup
function deleteGroup(btn) {
    if (confirm("Voulez-vous vraiment supprimer ce groupe et tous ses horaires ?")) {
        btn.parentElement.parentElement.parentElement.remove();
    }
}

//Ajoute un groupe au form du cours
function addGroup() {
    groupCount++;
    const container = document.getElementById('groupsContainer');

    const groupDiv = document.createElement('div');
    groupDiv.className = 'group-card';
    groupDiv.innerHTML = `
        <div class="group-header" onclick="toggleGroup(this)">
            <span>Groupe #${groupCount}</span>
            <span class="arrow">▼</span>
        </div>
        <div class="group-content">
            <label class="inline-group">
                Nom du groupe :
                <input type="text" class="nomGroupe" placeholder="ex: A">
            </label>
            <div class="periods-container"></div>
            <div class="button-group">
                <button type="button" onclick="addPeriod(this)">+ Ajouter une période</button>
                <button type="button" onclick="deleteGroup(this)">- Supprimer groupe</button>
            </div>
        </div>
    `;
    container.appendChild(groupDiv);
}

//Cache ou affiche les inputs du groupe
function toggleGroup(header) {
    const content = header.nextElementSibling;
    content.classList.toggle('visible');
    header.querySelector('.arrow').textContent = content.classList.contains('visible') ? '▲' : '▼';
}

//Réinitialise toutes les entrées du form
function resetForm() {
    document.getElementById('sigleCours').value = '';
    document.getElementById('nomCours').value = '';
    document.getElementById('coursObligatoire').checked = false;
    document.getElementById('groupsContainer').innerHTML = '';

    groupCount = 0;
}

//Appeler par le bouton réinitialiser
function confirmReset() {
    if (confirm("Voulez-vous vraiment tout réinitialiser? Cela videra le formulaire ET la liste des cours.")) {
        coursesBuffer = [];
        resetForm();
        renderList();
    }
}

//Helper de submitCourse, retourne true s'il n'y a aucune erreur
function validateCourse() {
    const sigle = document.getElementById('sigleCours').value.trim();
    const nom = document.getElementById('nomCours').value.trim();
    if (!sigle || !nom) {
        alert("Le cours doit avoir un nom et un sigle.");
        return false;
    }

    const groups = document.querySelectorAll('.group-card');
    if (groups.length === 0) {
        alert("Le cours doit avoir au moins un groupe.");
        return false;
    }

    for (const groupCard of groups) {
        const nomGroupe = groupCard.querySelector('.nomGroupe').value.trim();
        if (!nomGroupe) {
            alert("Les groupes doivent avoir un nom.");
            return false;
        }

        const periods = groupCard.querySelectorAll('.period-row');
        if (periods.length === 0) {
            alert(`Le groupe ${nomGroupe} doit avoir au moins une période.`);
            return false;
        }

        for (const row of periods) {
            const hD = parseInt(row.querySelector('.start-hour').value);
            const mD = parseInt(row.querySelector('.start-minute').value);
            const hF = parseInt(row.querySelector('.end-hour').value);
            const mF = parseInt(row.querySelector('.end-minute').value);

            const debut = hD * 60 + mD;
            const fin = hF * 60 + mF;

            if (fin <= debut) {
                alert(`L'heure de fin du groupe ${nomGroupe} doit être plus grande que son heure de début.`);
                return false;
            }
        }
    }

    return true;
}

//Ajoute un cours au tableau
function submitCourse() {
    if (!validateCourse()) return;

    const sigle = document.getElementById('sigleCours').value;
    const nom = document.getElementById('nomCours').value;
    const estObligatoire = document.getElementById('coursObligatoire').checked;

    const groupes = [];
    document.querySelectorAll('.group-card').forEach(groupCard => {
        const nomGroupe = groupCard.querySelector('.nomGroupe').value;
        const periodes = [];

        groupCard.querySelectorAll('.period-row').forEach(row => {
            periodes.push({
                jour: row.querySelector('.day-select').value,
                debut: `${row.querySelector('.start-hour').value}:${row.querySelector('.start-minute').value}`,
                fin: `${row.querySelector('.end-hour').value}:${row.querySelector('.end-minute').value}`
            });
        });

        groupes.push({ nom: nomGroupe, periodes: periodes });
    });

    const nouveauCours = { sigle, nom, estObligatoire, groupes };
    coursesBuffer.push(nouveauCours);

    resetForm();
    renderList();
}

//Refresh la liste des cours entrés
function renderList() {
    const mandatoryList = document.getElementById('mandatoryList');
    const optionalList = document.getElementById('optionalList');

    mandatoryList.innerHTML = '';
    optionalList.innerHTML = '';

    coursesBuffer.forEach((cours, index) => {
        const li = document.createElement('li');
        li.className = 'course-item';

        li.innerHTML = `
            <div style="width:100%; padding: 10px;" onclick="toggleDetails(${index})">
                <strong>${cours.sigle}</strong> - ${cours.nom}
            </div>
        `;

        const target = cours.estObligatoire ? mandatoryList : optionalList;
        target.appendChild(li);
    });
}

//Helper de toggleDetails
function formatScheduleForDisplay(groupes) {
    if (!groupes || groupes.length === 0) return "<p>Aucun horaire saisi.</p>";

    return groupes.map(g => `
        <div class="detail-group">
            <strong>Groupe ${g.nom} :</strong>
            <ul>
                ${g.periodes.map(p => `<li>${p.jour} : ${p.debut} à ${p.fin}</li>`).join('')}
            </ul>
        </div>
    `).join('');
}

//Affiche ou cache les détails d'un cours
function toggleDetails(index) {
    const details = document.getElementById('detailsContainer');

    if (index === -1) {
        details.classList.remove('visible');
        return;
    }

    const cours = coursesBuffer[index];

    details.classList.add('visible');
    details.innerHTML = `
        <div class="details-content">
            <h3>Horaires du cours ${cours.sigle}</h3>
            ${formatScheduleForDisplay(cours.groupes)}
        </div>
        <div class="button-group">
            <button onclick="toggleDetails(-1)">Cacher</button>
            <button onclick="editCourse(${index})">Modifier</button>
        </div>
    `;
}

//Enlève le cours de la liste et ajoute ses informations dans le form pour être modifié
function editCourse(index) {
    if (!confirm("Voulez-vous modifier ce cours? Cela effacera les informations présentement dans le formulaire.")) {
        return;
    }

    toggleDetails(-1);
    const cours = coursesBuffer[index];

    resetForm();
    document.getElementById('sigleCours').value = cours.sigle;
    document.getElementById('nomCours').value = cours.nom;
    document.getElementById('coursObligatoire').checked = cours.estObligatoire;

    cours.groupes.forEach(g => {
        addGroup();
        const lastGroup = document.getElementById('groupsContainer').lastElementChild;
        lastGroup.querySelector('.nomGroupe').value = g.nom;

        g.periodes.forEach(p => {
            addPeriod(lastGroup.querySelector('.button-group button'));
            const lastPeriod = lastGroup.querySelector('.periods-container').lastElementChild;

            const [hD, mD] = p.debut.split(':');
            const [hF, mF] = p.fin.split(':');

            lastPeriod.querySelector('.day-select').value = p.jour;
            lastPeriod.querySelector('.start-hour').value = hD;
            lastPeriod.querySelector('.start-minute').value = mD;
            lastPeriod.querySelector('.end-hour').value = hF;
            lastPeriod.querySelector('.end-minute').value = mF;
        });
    });

    coursesBuffer.splice(index, 1);
    renderList();
}

// Sauvegarde le contenu actuel du buffer
function saveData() {
    if (!window.javaApp) {
        alert("Erreur: Le pont Java n'est pas connecté.");
        return;
    }
    if (coursesBuffer.length === 0) {
        alert("Aucun cours à sauvegarder.");
        return;
    }

    const fileName = prompt("Entrez un nom pour la sauvegarde :");
    if (fileName && fileName.trim() !== "") {
        const jsonData = JSON.stringify(coursesBuffer);
        window.javaApp.saveSession(jsonData, fileName.trim());
        alert(`La session "${fileName.trim()}" a été sauvegardée.`);
    }
}

// Charge une session et met à jour l'interface
function loadData() {
    if (!window.javaApp) {
        alert("Erreur: Le pont Java n'est pas connecté.");
        return;
    }

    // Récupère la liste des fichiers depuis Java
    const sessionsJson = window.javaApp.getAvailableSessions();
    const sessions = JSON.parse(sessionsJson);

    if (sessions.length === 0) {
        alert("Aucune session sauvegardée trouvée dans le dossier data.");
        return;
    }

    // Construit un menu texte simple via prompt
    let menuMsg = "Entrez le numéro de la session à charger :\n\n";
    sessions.forEach((sessionName, index) => {
        menuMsg += `${index + 1}. ${sessionName}\n`;
    });

    const choice = prompt(menuMsg);
    if (!choice) return; // L'utilisateur a cliqué sur Annuler

    const index = parseInt(choice) - 1;

    if (index >= 0 && index < sessions.length) {
        const fileName = sessions[index];
        // Récupère les données depuis Java
        const loadedJson = window.javaApp.loadSession(fileName);

        if (loadedJson) {
            // Reconstruit la structure de données
            coursesBuffer = JSON.parse(loadedJson);
            resetForm(); // S'assure que le formulaire est propre
            renderList(); // Affiche les cours dans les colonnes
        }
    } else {
        alert("Sélection invalide.");
    }
}

//Envoie le contenu de coursesBuffer vers le backend
function sendBufferToJava() {
    if (window.javaApp) {
        const jsonData = JSON.stringify(coursesBuffer);
        let nbCoursOptionnels = parseInt(document.getElementById("numOptionnels").value) || 0;
        if (nbCoursOptionnels < 0) nbCoursOptionnels = 0;

        window.javaApp.sendSchedules(jsonData, nbCoursOptionnels);
    } else {
        alert("Erreur: Le pont Java n'est pas connecté.");
    }
}

// Fonction appelée directement par Java
function displaySchedules(jsonString) {
    generatedSchedules = JSON.parse(jsonString);
    currentScheduleIndex = 0;

    document.querySelector('.form-container').classList.add('hidden');
    document.querySelector('.horaires-container').classList.remove('hidden');

    updateScheduleView();
}

function hourLimit() {
    let maxHour = 0;
    const currentSchedule = generatedSchedules[currentScheduleIndex];
    currentSchedule.forEach(groupe => {
        groupe.periodes.forEach(periode => {
            const hFin = parseInt(periode.hFin);
            if ( hFin > maxHour) maxHour = hFin;
        })
    })
    return Math.max(19, maxHour);
}

// Moteur de rendu de la grille
function updateScheduleView() {
    const nav = document.getElementById('scheduleNav');
    const grid = document.getElementById('scheduleGrid');
    const noScheduleMsg = document.getElementById('noScheduleMessage');
    const btnEffacer = document.getElementById('btnEffacer');

    if (generatedSchedules.length === 0) {
        grid.style.display = 'none';
        noScheduleMsg.style.display = 'flex';
        btnEffacer.disabled = true;
        return;
    }

    const nbHourRows = (hourLimit() - 8) * 2 + 1;
    grid.style.gridTemplateRows = `40px repeat(${nbHourRows}, 30px)`;

    nav.innerHTML = '';
    grid.innerHTML = '';

    grid.style.display = 'grid';
    noScheduleMsg.style.display = 'none';
    btnEffacer.disabled = false;

    // 1. Dessin de la barre latérale
    generatedSchedules.forEach((_, idx) => {
        const btn = document.createElement('button');
        btn.textContent = `Horaire ${idx + 1}`;
        if (idx === currentScheduleIndex) btn.classList.add('active');
        btn.onclick = () => {
            currentScheduleIndex = idx;
            updateScheduleView();
        };
        nav.appendChild(btn);
    });

    // 2. Construction de la grille (Axes et Quadrillé)

    // 2.a En-tête vide au-dessus des heures
    const timeHeader = document.createElement('div');
    timeHeader.className = 'day-header';
    timeHeader.style.borderRight = '2px solid #ccc';
    grid.appendChild(timeHeader);

    // 2.b En-têtes des jours
    const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
    days.forEach(day => {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = day;
        grid.appendChild(header);
    });

    // 2.c Axe des heures
    for (let i = 0; i < nbHourRows; i+=2) {
        const hour = 8 + i/2;
        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-label';
        timeLabel.textContent = `${hour}:00`;
        timeLabel.style.gridRow = `${i + 2} / ${i + 4}`;
        timeLabel.style.gridColumn = '1';
        grid.appendChild(timeLabel);
    }

    // 2.d Quadrillé
    for (let i = 0; i < nbHourRows; i++) {
        for (let j = 0; j < 5; j++) {
            const gridCell = document.createElement('div');
            gridCell.className = 'grid-cell';
            gridCell.style.gridRow = `${i + 2}`;
            gridCell.style.gridColumn = `${j + 2}`;
            grid.appendChild(gridCell);
        }
    }

    // 3. Insertion des blocs de cours
    const currentSchedule = generatedSchedules[currentScheduleIndex];
    const courseColorMap = {};
    let colorIndex = 0;

    currentSchedule.forEach(groupe => {
        if (!courseColorMap[groupe.sigle]) {
            courseColorMap[groupe.sigle] = CLASS_COLORS[colorIndex % CLASS_COLORS.length];
            colorIndex++;
        }

        groupe.periodes.forEach(p => {
            const block = document.createElement('div');
            block.className = 'class-block';
            block.style.backgroundColor = courseColorMap[groupe.sigle];

            const column = days.indexOf(p.jour) + 2;
            const rowStart = (parseInt(p.hDebut) - 8) * 2 + (parseInt(p.mDebut) / 30) + 2;
            const rowEnd = (parseInt(p.hFin) - 8) * 2 + (parseInt(p.mFin) / 30) + 2;

            block.style.gridColumn = `${column}`;
            block.style.gridRow = `${rowStart} / ${rowEnd}`;

            block.innerHTML = `<span><b>${groupe.sigle}</b> (${groupe.groupe})</span>-<b>${groupe.nom}</b>`;
            grid.appendChild(block);
        });
    });
}

function deleteCurrentSchedule() {
    if (generatedSchedules.length > 0) {
        generatedSchedules.splice(currentScheduleIndex, 1);

        if (currentScheduleIndex >= generatedSchedules.length) {
            currentScheduleIndex = Math.max(0, generatedSchedules.length - 1);
        }

        updateScheduleView();
    }
}

function returnToForm() {
    document.querySelector('.horaires-container').classList.add('hidden');
    document.querySelector('.form-container').classList.remove('hidden');
}