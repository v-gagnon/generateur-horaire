package com.vincentgagnon;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class Groupe {
    public String nom;
    public Periode[] periodes;

    @JsonIgnore
    public Cours cours;

    public Groupe() {}

    public Groupe(String nom, Periode[] periodes) {
        this.nom = nom;
        this.periodes = periodes;
    }
}
