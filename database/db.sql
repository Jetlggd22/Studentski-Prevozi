-- CREATE DATABASE studentski_prevoz;


-- USE studentski_prevoz;


CREATE TABLE Uporabnik (
    IdUporabnik VARCHAR(100) PRIMARY KEY,
    Ime VARCHAR(45) NOT NULL,
    Priimek VARCHAR(45) NOT NULL,
    Username VARCHAR(45) UNIQUE NOT NULL,
    Telefon VARCHAR(45),
    Ocena FLOAT DEFAULT 0.0,
    Datum_registracije TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Avto VARCHAR(45)
) ENGINE=InnoDB;

CREATE TABLE Lokacija (
    idLokacija INT AUTO_INCREMENT PRIMARY KEY,
    Ime VARCHAR(45) NOT NULL,
    Longitude VARCHAR(45) NOT NULL,
    Latitude VARCHAR(45) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE Prevoz (
    IdPrevoz INT AUTO_INCREMENT PRIMARY KEY,
    Cas_odhoda DATETIME NOT NULL,
    Cena INT NOT NULL,
    Prosta_mesta INT NOT NULL,
    Ponavljanje VARCHAR(45),
    TK_Lokacija_Odhoda INT,
    TK_Lokacija_Prihoda INT,
    TK_Voznik VARCHAR(100),
    FOREIGN KEY (TK_Lokacija_Odhoda) REFERENCES Lokacija(idLokacija),
    FOREIGN KEY (TK_Lokacija_Prihoda) REFERENCES Lokacija(idLokacija),
    FOREIGN KEY (TK_Voznik) REFERENCES Uporabnik(IdUporabnik)
) ENGINE=InnoDB;

CREATE TABLE Rezervacija (
    IdRezervacija INT AUTO_INCREMENT PRIMARY KEY,
    Status VARCHAR(45) NOT NULL,
    Ustvarjeno TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TK_Prevoz INT,
    TK_Putnik VARCHAR(100),
    FOREIGN KEY (TK_Prevoz) REFERENCES Prevoz(IdPrevoz),
    FOREIGN KEY (TK_Putnik) REFERENCES Uporabnik(IdUporabnik)
) ENGINE=InnoDB;

CREATE TABLE Ocena (
    IdOcena INT AUTO_INCREMENT PRIMARY KEY,
    Ocena INT NOT NULL CHECK (Ocena BETWEEN 1 AND 5),
    Komentar VARCHAR(200),
    TK_Rezervacija INT,
    TK_Prevoz INT,
    FOREIGN KEY (TK_Rezervacija) REFERENCES Rezervacija(IdRezervacija),
    FOREIGN KEY (TK_Prevoz) REFERENCES Prevoz(IdPrevoz)
) ENGINE=InnoDB;


-- INSERT INTO Uporabnik (Ime, Priimek, Username, Telefon, Ocena, Avto) VALUES
-- ('Janez', 'Novak', 'janezn', '041123456', 4.5, 'Renault Clio'),
-- ('Marija', 'Kovač', 'marijak', '040987654', 4.2, 'VW Golf'),
-- ('Marko', 'Horvat', 'markoh', '051555666', 3.8, NULL),
-- ('Ana', 'Petek', 'anap', '031222333', 4.7, 'Opel Corsa'),
-- ('Peter', 'Kralj', 'peterk', '070444555', 4.0, 'Ford Fiesta');

-- INSERT INTO Lokacija (Ime, Longitude, Latitude) VALUES
-- ('Fakulteta za računalništvo, Ljubljana', '14.4700', '46.0514'),
-- ('Glavni avtobusni postaj, Ljubljana', '14.5112', '46.0569'),
-- ('Fakulteta za elektrotehniko, Ljubljana', '14.4656', '46.0483'),
-- ('Dijaški dom Tabor, Maribor', '15.6425', '46.5547'),
-- ('Fakulteta za strojništvo, Maribor', '15.6456', '46.5578'),
-- ('Avtobusna postaja, Maribor', '15.6439', '46.5603');


-- INSERT INTO Prevoz (Cas_odhoda, Cena, Prosta_mesta, Ponavljanje, TK_Lokacija_Odhoda, TK_Lokacija_Prihoda, TK_Voznik) VALUES
-- ('2023-11-15 07:30:00', 5, 3, 'Pon, Sre, Pet', 2, 1, 1),
-- ('2023-11-15 08:00:00', 4, 2, 'Torek, Četrtek', 4, 5, 2),
-- ('2023-11-16 16:00:00', 3, 4, 'Enkrat', 1, 2, 3),
-- ('2023-11-17 07:45:00', 6, 1, 'Pon-Pet', 6, 4, 4),
-- ('2023-11-18 09:00:00', 5, 2, 'Sobota', 3, 1, 5);

-- INSERT INTO Rezervacija (Status, TK_Prevoz, TK_Putnik) VALUES
-- ('Potrjena', 1, 3),
-- ('Potrjena', 1, 4),
-- ('Čaka', 2, 1),
-- ('Zavrnjena', 3, 2),
-- ('Potrjena', 4, 5),
-- ('Potrjena', 5, 1);


-- INSERT INTO Ocena (Ocena, Komentar, TK_Rezervacija, TK_Prevoz) VALUES
-- (5, 'Odličen prevoz, točnost in udobje!', 1, 1),
-- (4, 'Vse je bilo ok, malo bolj hladno v avtu', 5, 4),
-- (3, 'Prišli smo malo pozneje kot načrtovano', 6, 5);