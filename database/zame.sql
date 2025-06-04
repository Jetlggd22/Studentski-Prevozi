-- Brisanje tabel, če že obstajajo (zaradi večkratnega zagona)

CREATE DATABASE IF NOT EXISTS studentski_prevoz;
USE studentski_prevoz; 
DROP TABLE IF EXISTS Ocena;
DROP TABLE IF EXISTS Rezervacija;
DROP TABLE IF EXISTS Prevoz;
DROP TABLE IF EXISTS Lokacija;
DROP TABLE IF EXISTS Uporabnik;

-- Tabela: Uporabnik
CREATE TABLE Uporabnik (
    idUporabnik VARCHAR(100) PRIMARY KEY,
    Ime VARCHAR(45),
    Priimek VARCHAR(45),
    Username VARCHAR(45),
    Telefon VARCHAR(45),
    Ocena FLOAT,
    Datum_registriranja DATETIME,
    Avto VARCHAR(45)
);

-- Tabela: Lokacija
CREATE TABLE Lokacija (
    idLokacija INT PRIMARY KEY,
    Ime VARCHAR(45),
    Longitude VARCHAR(45),
    Latitude VARCHAR(45)
);

-- Tabela: Prevoz
CREATE TABLE Prevoz (
    idPrevoz INT PRIMARY KEY,
    Cas_odhoda DATETIME,
    Cena INT,
    Prosta_mesta VARCHAR(45),
    Ponavljanje VARCHAR(45),
    TK_Lokacija_Odhod INT,
    TK_Lokacija_Prihod INT,
    TK_Voznik VARCHAR(100),
    FOREIGN KEY (TK_Lokacija_Odhod) REFERENCES Lokacija(idLokacija),
    FOREIGN KEY (TK_Lokacija_Prihod) REFERENCES Lokacija(idLokacija),
    FOREIGN KEY (TK_Voznik) REFERENCES Uporabnik(idUporabnik)
);

-- Tabela: Rezervacija
CREATE TABLE Rezervacija (
    idRezervacija INT PRIMARY KEY,
    Status VARCHAR(45),
    Ustvarjeno DATETIME,
    TK_Prevoz INT,
    TK_Potnik VARCHAR(100),
    FOREIGN KEY (TK_Prevoz) REFERENCES Prevoz(idPrevoz),
    FOREIGN KEY (TK_Potnik) REFERENCES Uporabnik(idUporabnik)
);

-- Tabela: Ocena
CREATE TABLE Ocena (
    idOcena INT PRIMARY KEY,
    Ocena INT,
    Komentar VARCHAR(45),
    TK_Rezervacija INT,
    TK_Prevoz INT,
    FOREIGN KEY (TK_Rezervacija) REFERENCES Rezervacija(idRezervacija),
    FOREIGN KEY (TK_Prevoz) REFERENCES Prevoz(idPrevoz)
);

-- INSERT primeri podatkov

INSERT INTO Uporabnik VALUES
("auth0|6835c8d19fabba1e6694e0e8", 'Maja', 'Zupančič', 'maja.zupancic', '040123456', 4.7, '2023-11-15 08:00:00', NULL),
("2", 'Tilen', 'Kralj', 'tilen.kralj', '040234567', 3.9, '2024-01-03 13:45:00', 'Volkswagen Golf'),
("3", 'Nina', 'Horvat', 'nina.horvat', '040345678', 4.5, '2023-09-21 16:30:00', NULL),
("4", 'Andraž', 'Mlakar', 'andraz.mlakar', '040456789', 2.8, '2023-12-10 11:10:00', NULL),
("5", 'Sara', 'Potočnik', 'sara.potocnik', '040567890', 4.2, '2024-02-18 09:25:00', 'Peugeot 208'),
("6", 'Luka', 'Bizjak', 'luka.bizjak', '040678901', 3.3, '2023-07-05 14:00:00', NULL),
("7", 'Anja', 'Kavčič', 'anja.kavcic', '040789012', 4.9, '2023-08-26 19:30:00', 'Škoda Fabia'),
("8", 'Žiga', 'Štucin', 'ziga.stucin', '040890123', 3.0, '2023-04-15 12:20:00', NULL),
("9", 'Eva', 'Ribič', 'eva.ribic', '040901234', 4.6, '2024-01-11 17:45:00', NULL),
("10", 'Miha', 'Novak', 'miha.novak', '040112233', 3.5, '2023-06-19 07:30:00', 'Toyota Yaris'),
("11", 'Tjaša', 'Jerman', 'tjasa.jerman', '040223344', 4.1, '2023-05-02 09:00:00', NULL),
("12", 'Blaž', 'Oblak', 'blaz.oblak', '040334455', 2.9, '2023-10-07 11:15:00', NULL),
("13", 'Neža', 'Vidmar', 'neza.vidmar', '040445566', 3.7, '2024-02-01 10:10:00', NULL),
("14", 'Gregor', 'Šubic', 'gregor.subic', '040556677', 4.0, '2023-03-23 15:35:00', 'Citroën C3'),
("15", 'Urška', 'Perko', 'urska.perko', '040667788', 2.5, '2023-09-12 18:05:00', NULL),
("16", 'Rok', 'Štrukelj', 'rok.strukelj', '040778899', 3.2, '2023-07-29 08:55:00', NULL),
("17", 'Klara', 'Blažič', 'klara.blazic', '040889900', 4.8, '2024-01-26 14:40:00', 'Mazda 2'),
("18", 'Jan', 'Pirc', 'jan.pirc', '040990011', 2.3, '2023-11-03 13:20:00', NULL),
("19", 'Ela', 'Kovač', 'ela.kovac', '041101112', 4.4, '2023-08-08 16:10:00', NULL),
("20", 'David', 'Šušteršič', 'david.sustersic', '041212223', 3.6, '2024-03-01 10:30:00', NULL);


INSERT INTO Lokacija VALUES
(1, 'ŠD Rožna dolina', '14.681823', '46.231084'),
(2, 'ŠD Bežigrad', '15.233842', '46.318788'),
(3, 'ŠD Litostroj', '14.656290', '45.979368'),
(4, 'ŠD Vič', '14.852969', '46.246526'),
(5, 'ŠD Mestni log', '14.387758', '45.661345'),
(6, 'ŠD Savsko naselje', '13.959159', '45.500606'),
(7, 'ŠD Akademski kolegij', '15.791407', '45.732360'),
(8, 'ŠD Šiška', '15.711788', '45.724938'),
(9, 'ŠD Rudnik', '14.910185', '46.384156'),
(10, 'ŠD Poljane', '13.608622', '45.797195'),
(11, 'FERI Maribor', '14.971287', '46.027750'),
(12, 'Fakulteta za računalništvo', '14.508190', '46.338086'),
(13, 'EF Ljubljana', '14.965945', '45.775037'),
(14, 'FMF', '15.715697', '45.954285'),
(15, 'Fakulteta za šport', '13.801722', '45.672790'),
(16, 'Fakulteta za kemijo', '14.646814', '46.477462'),
(17, 'Fakulteta za arhitekturo', '15.740502', '46.386546'),
(18, 'Fakulteta za strojništvo', '14.396660', '46.299313'),
(19, 'Fakulteta za elektrotehniko', '14.260026', '46.014839'),
(20, 'Fakulteta za gradbeništvo', '15.242099', '46.219239');


INSERT INTO Prevoz VALUES
(1, '2025-12-23 05:37:35', 8, 3, 'petek', 4, 14, "5"),
(2, '2025-12-27 11:03:36', 8, 1, 'četrtek', 3, 15, "10"),
(3, '2025-07-26 17:23:22', 7, 1, 'četrtek', 4, 14, "10"),
(4, '2025-05-21 11:46:34', 10, 2, 'torek', 7, 17, "10"),
(5, '2025-07-08 15:01:37', 12, 4, 'torek', 10, 17, "2"),
(6, '2025-10-22 01:32:07', 5, 3, 'sreda', 10, 12, "5"),
(7, '2025-07-20 04:57:37', 15, 4, 'ponedeljek', 10, 12, "10"),
(8, '2025-04-30 06:36:40', 5, 4, 'sreda', 2, 16, "14"),
(9, '2025-08-28 01:01:25', 5, 2, 'petek', 5, 18, "5"),
(10, '2025-10-12 20:16:16', 8, 1, 'sreda', 5, 15, "5"),
(11, '2025-12-27 22:59:38', 15, 2, 'petek', 4, 17, "10"),
(12, '2025-01-24 17:42:20', 15, 3, 'ponedeljek', 7, 18, "14"),
(13, '2025-01-21 09:09:00', 10, 2, 'ponedeljek', 10, 15, "10"),
(14, '2025-07-15 12:15:07', 5, 2, 'četrtek', 4, 12, "7"),
(15, '2025-09-22 03:27:41', 10, 4, 'torek', 7, 19, "17"),
(16, '2025-07-18 18:45:17', 5, 2, 'sreda', 2, 17, "2"),
(17, '2025-06-22 12:59:38', 10, 1, 'četrtek', 2, 11, "2"),
(18, '2025-03-01 22:18:29', 7, 1, 'petek', 3, 20, "5"),
(19, '2025-07-22 01:24:38', 5, 2, 'ponedeljek', 2, 13, "2"),
(20, '2025-02-28 23:04:07', 15, 4, 'torek', 1, 20, "7");


INSERT INTO Rezervacija VALUES
(1, 'čaka', '2024-02-14 16:24:31', 7, "11"),
(2, 'odpovedano', '2025-04-15 04:04:13', 5, "20"),
(3, 'potrjeno', '2024-02-06 04:15:02', 10, "20"),
(4, 'potrjeno', '2025-02-11 02:24:12', 16, "9"),
(5, 'potrjeno', '2025-08-13 08:14:34', 19, "15"),
(6, 'čaka', '2025-10-16 12:24:57', 9, "12"),
(7, 'čaka', '2024-08-12 08:46:39', 15, "9"),
(8, 'čaka', '2025-02-20 22:48:29', 12, "8"),
(9, 'potrjeno', '2024-05-03 09:39:55', 7, "8"),
(10, 'potrjeno', '2025-09-13 06:26:14', 12, "9"),
(11, 'potrjeno', '2025-01-31 06:53:45', 6, "18"),
(12, 'potrjeno', '2025-11-03 07:46:22', 19, "16"),
(13, 'potrjeno', '2024-10-29 03:55:15', 13, "19"),
(14, 'čaka', '2025-04-12 02:14:43', 18, "3"),
(15, 'odpovedano', '2024-01-19 01:18:28', 18, "20"),
(16, 'potrjeno', '2025-11-26 09:56:19', 16, "20"),
(17, 'čaka', '2024-09-08 15:38:03', 20, "18"),
(18, 'potrjeno', '2024-09-03 03:28:28', 14, "auth0|6835c8d19fabba1e6694e0e8"),
(19, 'potrjeno', '2025-03-17 12:47:44', 3, "12"),
(20, 'čaka', '2025-11-14 19:13:47', 14, "12");


INSERT INTO Ocena (idOcena, Ocena, Komentar, TK_Rezervacija, TK_Prevoz) VALUES
(1,  3, 'Malo zamude, a sicer v redu.',        NULL, 6),
(2,  5, 'Odličen voznik, vse je potekalo gladko.', NULL, 11),
(3,  3, 'Odličen voznik, vse je potekalo gladko.', NULL, 19),
(4,  4, 'Voznik je bil zelo prijazen in komunikativen.', NULL, 6),
(5,  4, 'Avto udoben, vožnja prijetna.',         NULL, 5),
(6,  4, 'Malo zamude, a sicer v redu.',        NULL, 10),
(7,  5, 'Malo zamude, a sicer v redu.',        NULL, 19),
(8,  3, 'Voznik je bil zelo prijazen in komunikativen.', NULL, 18),
(9,  1, 'Zelo prijetna vožnja, priporočam.',   NULL, 17),
(10, 3, 'Zelo prijetna vožnja, priporočam.',   NULL, 1),
(11, 5, 'Odličen voznik, vse je potekalo gladko.', NULL, 16),
(12, 1, 'Odličen voznik, vse je potekalo gladko.', NULL, 14),
(13, 5, 'Voznik je bil zelo prijazen in komunikativen.', NULL, 13),
(14, 2, 'Preveč hitro vozi.',                  NULL, 20),
(15, 3, 'Ne bi ponovil vožnje s tem voznikom.',   NULL, 11),
(16, 2, 'Vse po dogovoru, brez zapletov.',      NULL, 9),
(17, 5, 'Malo zamude, a sicer v redu.',        NULL, 6),
(18, 2, 'Odličen voznik, vse je potekalo gladko.', NULL, 10),
(19, 3, 'Malo zamude, a sicer v redu.',        NULL, 19),
(20, 4, 'Sopotnik je bil miren in spoštljiv.',    15, NULL);

select * from uporabnik;