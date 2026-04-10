package com.vincentgagnon;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;

public class Periode {
    public String jour;
    public int hDebut;
    public int mDebut;
    public int hFin;
    public int mFin;

    public Periode() {}

    public Periode(String jour, String debut, String fin) {
        this.jour = jour;
        setDebut(debut);
        setFin(fin);
    }

    @JsonProperty("debut")
    public void setDebut(String debut) {
        String[] parts = debut.split(":");
        this.hDebut = Integer.parseInt(parts[0]);
        this.mDebut = Integer.parseInt(parts[1]);
    }

    @JsonProperty("fin")
    public void setFin(String fin) {
        String[] parts = fin.split(":");
        this.hFin = Integer.parseInt(parts[0]);
        this.mFin = Integer.parseInt(parts[1]);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Periode p = (Periode) o;
        return Objects.equals(this.jour, p.jour) &&
                this.hDebut == p.hDebut &&
                this.mDebut == p.mDebut &&
                this.hFin == p.hFin &&
                this.mFin == p.mFin;
    }

    @Override
    public int hashCode() {
        return Objects.hash(jour, hDebut, mDebut, hFin, mFin);
    }
}