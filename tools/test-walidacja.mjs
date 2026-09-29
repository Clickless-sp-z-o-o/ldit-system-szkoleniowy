/* ============================================================================
   Testy walidacji danych na granicy zapisu (assets/walidacja.js, D-211).

     node tools/test-walidacja.mjs
   ============================================================================ */

import { przygotuj, licznik } from "./harness.mjs";

const t = licznik("Walidacja danych");
const w = await przygotuj();
const { Store, Auth, Walidacja } = w;

function kodBledu(fn) {
  try { fn(); return null; } catch (e) { return e.kod || e.message; }
}
const pola = (tabela, dane) => Walidacja.bledy(tabela, dane).map((b) => b.pole).join(",");

console.log("\nReguly");
t.rowne(pola("klienci", { nazwa: "Firma", nip: "5260250274", email: "biuro@firma.pl" }), "", "poprawny klient przechodzi");
t.rowne(pola("klienci", { nazwa: "" }), "nazwa", "brak wymaganej nazwy klienta");
t.rowne(pola("klienci", { nazwa: "Firma", nip: "5260250275" }), "nip", "NIP z bledna cyfra kontrolna");
t.rowne(pola("klienci", { nazwa: "Firma", email_2: "biuro-at-firma" }), "email_2", "zly adres e-mail drugiej osoby kontaktowej");
t.rowne(pola("uczestnicy", { imie_nazwisko: "Jan Nowak", pesel: "44051401359" }), "", "poprawny PESEL przechodzi");
t.rowne(pola("uczestnicy", { imie_nazwisko: "Jan Nowak", pesel: "44051401358" }), "pesel", "PESEL z bledna cyfra kontrolna");
t.rowne(pola("wnioski", { kwota_doplaty_dodatkowej: -100 }), "kwota_doplaty_dodatkowej", "ujemna doplata jest odrzucana");
t.rowne(pola("wnioski", { liczba_zatrudnionych: "7,5" }), "liczba_zatrudnionych", "liczba zatrudnionych musi byc calkowita");
t.rowne(pola("faktury", { numer: "FV/K/1", kwota: -2000 }), "", "faktura korygujaca moze miec kwote ujemna (D-161)");
t.rowne(pola("terminy", { data_od: "2026-10-10", data_do: "2026-10-01" }), "data_do", "koniec terminu przed poczatkiem");
t.rowne(pola("instytucje", { nazwa: "IS", strona_www: "www.is.pl" }), "strona_www", "strona www wymaga http(s)://");
t.rowne(pola("klienci", { telefon: "" }), "", "puste pole nieobowiazkowe przechodzi");

console.log("\nStraznik uzywa walidacji przy zapisie");
Auth.zaloguj("bartek@ldit.pl", "demo");
const klient = Store.get("klienci")[0];
t.rowne(kodBledu(() => Store.update("klienci", klient.id, { email: "zly-adres" })), "walidacja", "zapis zlego e-maila jest odrzucony");
t.rowne(Store.find("klienci", klient.id).email, klient.email, "odrzucony zapis nie zmienia bazy");
t.rowne(kodBledu(() => Store.update("klienci", klient.id, { nip: klient.nip, miasto: "Gdynia" })), null,
  "niezmieniony NIP z danych startowych nie blokuje edycji innego pola");
t.rowne(kodBledu(() => Store.update("klienci", klient.id, { nip: "1234567890" })), "walidacja", "nowy bledny NIP jest odrzucony");

t.podsumuj();
