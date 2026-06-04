import Link from "next/link";

const S = { maxWidth: "780px", margin: "0 auto", padding: "3rem 5%", fontFamily: "system-ui, sans-serif" };
const H2 = { fontSize: "1.15rem", fontWeight: 800, color: "#0a1628", margin: "2rem 0 .75rem" };
const P = { color: "#4a5568", lineHeight: 1.75, fontSize: ".95rem", margin: "0 0 1rem" };

export default function PrivacyPage() {
  return (
    <div style={{ background: "#f4f6f9", minHeight: "calc(100vh - 64px)" }}>
      <div style={S}>
        <Link href="/" style={{ color: "#8a96a8", textDecoration: "none", fontSize: ".85rem" }}>← Startpagina</Link>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0a1628", margin: "1.5rem 0 .5rem", letterSpacing: "-1px" }}>Privacybeleid</h1>
        <p style={{ ...P, color: "#8a96a8" }}>Laatste update: juni 2026 · YardExx BV · België</p>

        <div style={{ background: "#fff", borderRadius: "16px", padding: "2.5rem", border: "1px solid #e8edf4", marginTop: "2rem" }}>
          <h2 style={H2}>1. Wie zijn wij?</h2>
          <p style={P}>YardExx is een B2B marketplace waarop terminals in de Benelux surplus capaciteit anoniem kunnen kopen en verkopen. YardExx is verantwoordelijk voor de verwerking van jouw persoonsgegevens in de zin van de AVG (GDPR).</p>
          <p style={P}><strong>Contactgegevens:</strong> hello@yardexx.com</p>

          <h2 style={H2}>2. Welke gegevens verzamelen wij?</h2>
          <p style={P}>Wij verwerken alleen de gegevens die strikt noodzakelijk zijn voor de werking van het platform:</p>
          <ul style={{ ...P, paddingLeft: "1.5rem" }}>
            <li style={{ marginBottom: ".5rem" }}><strong>E-mailadres</strong> — voor authenticatie en communicatie over transacties</li>
            <li style={{ marginBottom: ".5rem" }}><strong>Terminalnaam en regio</strong> — voor matching op het platform</li>
            <li style={{ marginBottom: ".5rem" }}><strong>Optioneel:</strong> contactpersoon, telefoonnummer, BTW-nummer — enkel voor verificatie en post-deal communicatie</li>
            <li style={{ marginBottom: ".5rem" }}><strong>Listing content</strong> — capaciteitstype, volume, prijs, periode (nooit gekoppeld aan je naam in de marketplace)</li>
            <li><strong>Technische logdata</strong> — IP-adressen voor rate limiting en beveiliging (max. 24u bewaard)</li>
          </ul>

          <h2 style={H2}>3. Anonimiteit als kernprincipe</h2>
          <p style={P}>De identiteit van een terminal is <strong>nooit zichtbaar</strong> voor andere gebruikers zolang er geen deal bevestigd is. Na een deal kunnen beide partijen er zelf voor kiezen om hun identiteit te delen — dit is nooit automatisch of verplicht.</p>
          <p style={P}>Zelfs na een deal kun je er voor kiezen anoniem te blijven. Enkel wanneer jij expliciet kiest om je identiteit te onthullen, wordt jouw terminalnaam en contact gedeeld met de andere partij.</p>

          <h2 style={H2}>4. Rechtsgrond voor verwerking</h2>
          <p style={P}>Wij verwerken je gegevens op basis van <strong>uitvoering van de overeenkomst</strong> (Art. 6(1)(b) AVG) — zonder basisgegevens kan je het platform niet gebruiken. Aanvullende gegevens (telefoonnummer, BTW-nummer) verwerken we op basis van <strong>toestemming</strong>.</p>

          <h2 style={H2}>5. Hoe lang bewaren wij je gegevens?</h2>
          <ul style={{ ...P, paddingLeft: "1.5rem" }}>
            <li style={{ marginBottom: ".5rem" }}>Actieve accounts: zolang je account actief is</li>
            <li style={{ marginBottom: ".5rem" }}>Verwijderde accounts: 30 dagen na verwijdering gewist</li>
            <li style={{ marginBottom: ".5rem" }}>Transactiegeschiedenis: 7 jaar (wettelijke bewaarplicht)</li>
            <li>Wachtwoord-resettokens: automatisch vervallen na 1 uur</li>
          </ul>

          <h2 style={H2}>6. Delen met derden</h2>
          <p style={P}>Wij verkopen of verhuren je gegevens <strong>nooit</strong> aan derden. We maken enkel gebruik van:</p>
          <ul style={{ ...P, paddingLeft: "1.5rem" }}>
            <li style={{ marginBottom: ".5rem" }}><strong>Resend</strong> (e-mailbezorging) — enkel je e-mailadres en de inhoud van transactionele e-mails</li>
            <li><strong>Vercel / Neon</strong> (hosting + database) — alle data opgeslagen in de EU (Frankfurt)</li>
          </ul>

          <h2 style={H2}>7. Cookies</h2>
          <p style={P}>YardExx gebruikt uitsluitend één <strong>functionele sessie-cookie</strong> (`yardexx_session`) die noodzakelijk is voor authenticatie. Deze cookie bevat een versleuteld token, heeft geen tracking-functie en vervalt automatisch na 7 dagen. Er worden geen marketing- of analytische cookies gebruikt.</p>

          <h2 style={H2}>8. Jouw rechten</h2>
          <p style={P}>Als betrokkene heb je het recht op inzage, correctie, verwijdering, beperking van verwerking, overdraagbaarheid en bezwaar. Stuur een e-mail naar <a href="mailto:privacy@yardexx.com" style={{ color: "#00c9a7" }}>privacy@yardexx.com</a>. Je hebt ook het recht om klacht in te dienen bij de Gegevensbeschermingsautoriteit (GBA): <a href="https://www.gegevensbeschermingsautoriteit.be" style={{ color: "#00c9a7" }} target="_blank" rel="noreferrer">gegevensbeschermingsautoriteit.be</a>.</p>

          <h2 style={H2}>9. Beveiliging</h2>
          <p style={P}>Wachtwoorden worden gehasht met bcrypt (cost factor 12). Sessies lopen via versleutelde JWT-tokens. Alle verbindingen verlopen via HTTPS. De database is niet publiek toegankelijk.</p>

          <h2 style={H2}>10. Wijzigingen</h2>
          <p style={P}>Bij significante wijzigingen aan dit beleid informeren we actieve gebruikers per e-mail. De meest recente versie is altijd beschikbaar op yardexx.com/privacy.</p>
        </div>
      </div>
    </div>
  );
}
