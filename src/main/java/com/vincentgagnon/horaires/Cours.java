package com.vincentgagnon.horaires;

public class Cours {
    public String sigle;
    public String nom;
    public boolean estObligatoire;
    public Groupe[] groupes;

    public Cours() {}

    public Cours(String sigle, String nom, boolean estObligatoire, Groupe[] groupes) {
        this.sigle = sigle;
        this.nom = nom;
        this.estObligatoire = estObligatoire;
        this.groupes = groupes;
    }

    public void addBidirectionalGroupRelations() {
        if (this.groupes != null) {
            for (Groupe groupeActuel : this.groupes) {
                groupeActuel.cours = this;
            }
        }
    }
}
