# StudentskiPrevoz.si
Ta projekt predstavlja timski razvoj spletne aplikacije za skupno vožnjo (carpooling), namenjene študentom, z glavnim ciljem izboljšanja organizacije prevozov in olajšanja iskanja sopotnikov med študentskimi domovi in fakultetami. Projekt je bil zasnovan kot rešitev za bolj učinkovit, varen in dostopen način transporta znotraj študentske skupnosti.

Razvoj aplikacije je potekal v skupini štirih članov, z jasno razdeljenimi odgovornostmi, modularno arhitekturo ter uporabo sodobnih spletnih tehnologij. Poseben poudarek je bil na uporabniški izkušnji, varnosti in hitrosti delovanja sistema.

Ključne funkcionalnosti aplikacije:
Registracija in prijava uporabnikov preko sistema Auth0, ki omogoča varno upravljanje uporabniških računov.
Objava in iskanje voženj: študentje lahko ponudijo prosta mesta v vozilu ali poiščejo obstoječe vožnje na podlagi lokacije, ure in razpoložljivosti.
Rezervacija sedežev, z avtomatskim posodabljanjem razpoložljivih mest v realnem času.
Prikaz lokacij in poti s pomočjo GEO.js API-ja, integriranega v uporabniški vmesnik.
Sistem ocen in komentarjev za voznike in opravljene vožnje, kar prispeva k večji preglednosti in varnosti platforme.
Uporaba MVC arhitekture za jasno ločevanje logike, prikaza in upravljanja s podatki, kar je olajšalo sodelovanje v skupini in vzdrževanje kode.
Aplikacija omogoča dinamičen prikaz podatkov – vse uporabniške akcije se vmesniku odražajo v realnem času, brez osveževanja strani, kar je omogočeno z učinkovito komunikacijo med odjemalcem in strežnikom.

Uporabljene tehnologije:
Node.js
Express.js
JavaScript
GEO.js API
Auth0 (avtentikacija in avtorizacija)
SQL (relacijska podatkovna baza)
MVC arhitektura
