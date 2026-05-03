package com.vincentgagnon.horaires;

import java.util.LinkedList;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

    public Periode(String jour, int hDebut, int mDebut, int hFin, int mFin) {
        this.jour = jour;
        this.hDebut = hDebut;
        this.mDebut = mDebut;
        this.hFin = hFin;
        this.mFin = mFin;
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

    @JsonIgnore
    public Periode[] getBlocsHoraire() {
        LinkedList<Periode> blocsHoraire = new LinkedList<>();

        int startTime = hDebut * 60 + mDebut;
        int endTime = hFin * 60 + mFin;

        for (int currentTime = startTime; currentTime < endTime; currentTime += 30) {
            Periode bloc = new Periode(jour, (int)(currentTime / 60), currentTime % 60, (int)((currentTime + 30) / 60), (currentTime + 30) % 60);
            blocsHoraire.add(bloc);
        }

        return blocsHoraire.toArray(new Periode[0]);
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