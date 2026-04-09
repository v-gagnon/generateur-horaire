let coursesBuffer = [];
/*  Objet cours: String sigle, String nom, boolean estObligatoire, Array groupes
    Objet groupe: String nom, Array periodes
    Objet période: String jour, String début, String fin */
let groupCount = 0;

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
                <button type="button" onclick="deleteGroup(this)">X Supprimer Groupe</button>
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
            <button onclick="toggleDetails(-1); editCourse(${index})">Modifier</button>
        </div>
    `;
}

//Enlève le cours de la liste et ajoute ses informations dans le form pour être modifié
function editCourse(index) {
    if (!confirm("Voulez-vous modifier ce cours? Cela effacera les informations présentement dans le formulaire.")) {
        return;
    }

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