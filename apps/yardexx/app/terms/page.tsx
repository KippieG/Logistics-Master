import Link from "next/link";

const S = { maxWidth: "780px", margin: "0 auto", padding: "3rem 5%", fontFamily: "system-ui, sans-serif" };
const H2 = { fontSize: "1.15rem", fontWeight: 800, color: "#0a1628", margin: "2rem 0 .75rem" };
const P = { color: "#4a5568", lineHeight: 1.75, fontSize: ".95rem", margin: "0 0 1rem" };

export default function TermsPage() {
  return (
    <div style={{ background: "#f4f6f9", minHeight: "calc(100vh - 64px)" }}>
      <div style={S}>
        <Link href="/" style={{ color: "#8a96a8", textDecoration: "none", fontSize: ".85rem" }}>← Startpagina</Link>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0a1628", margin: "1.5rem 0 .5rem", letterSpacing: "-1px" }}>Algemene Voorwaarden</h1>
        <p style={{ ...P, color: "#8a96a8" }}>Versie 1.0 · juni 2026 · YardExx BV · België</p>

        <div style={{ background: "#fff", borderRadius: "16px", padding: "2.5rem", border: "1px solid #e8edf4", marginTop: "2rem" }}>
          <h2 style={H2}>1. Definities</h2>
          <p style={P}><strong>YardExx:</strong> het online platform op yardexx.com voor de anonieme handel in terminalcapaciteit.</p>
          <p style={P}><strong>Terminal:</strong> een geverifieerd bedrijf dat als koper en/of verkoper op het platform actief is.</p>
          <p style={P}><strong>Listing:</strong> een publicatie van beschikbare of gevraagde terminalcapaciteit.</p>
          <p style={P}><strong>Deal:</strong> een overeenkomst tussen twee terminals over de overdracht van capaciteit, tot stand gekomen via het platform.</p>

          <h2 style={H2}>2. Toegang en verificatie</h2>
          <p style={P}>Gebruik van het platform is uitsluitend voorbehouden aan geverifieerde terminals. Verificatie geschiedt handmatig door YardExx na controle van de bedrijfsidentiteit (KBO/KvK, BTW-nummer). YardExx behoudt zich het recht voor verificatie te weigeren zonder opgave van redenen.</p>
          <p style={P}>Elke terminal is verantwoordelijk voor het vertrouwelijk houden van haar inloggegevens.</p>

          <h2 style={H2}>3. Rol van YardExx</h2>
          <p style={P}>YardExx is uitsluitend een <strong>elektronische marktplaats</strong> die vraag en aanbod samenbrengt. YardExx is <strong>geen partij</strong> in de overeenkomsten die via het platform tot stand komen. YardExx geeft geen garanties over de kwaliteit, beschikbaarheid of conformiteit van de aangeboden capaciteit.</p>
          <p style={P}>De logistieke en juridische uitvoering van een deal valt volledig buiten de verantwoordelijkheid van YardExx.</p>

          <h2 style={H2}>4. Listings en anonimiteit</h2>
          <p style={P}>Listings worden anoniem gepubliceerd. De identiteit van de plaatsende terminal is niet zichtbaar voor andere gebruikers zolang geen deal tot stand is gekomen. Na acceptatie van een aanvraag kunnen beide partijen <strong>vrijwillig</strong> hun identiteit onthullen. Anoniem blijven na een deal is te allen tijde toegestaan.</p>
          <p style={P}>Terminals zijn verantwoordelijk voor de juistheid van de informatie in hun listings. Misleidende of valse listings kunnen leiden tot onmiddellijke verwijdering van het platform.</p>

          <h2 style={H2}>5. Totstandkoming van een deal</h2>
          <p style={P}>Een deal komt tot stand op het moment dat de eigenaar van een listing een aanvraag accepteert. Op dat moment zijn beide partijen in principe gehouden aan de in de listing vermelde voorwaarden (type, volume, prijs, periode). YardExx beveelt aan om deals te bevestigen met een schriftelijke overeenkomst tussen de partijen.</p>

          <h2 style={H2}>6. Vergoeding</h2>
          <p style={P}>YardExx hanteert momenteel geen transactievergoeding. Het gebruik van het platform tijdens de beta-fase is kosteloos. YardExx behoudt zich het recht voor om in de toekomst een commissie- of abonnementsmodel in te voeren. Actieve terminals worden hier minimaal 30 dagen op voorhand van op de hoogte gesteld.</p>

          <h2 style={H2}>7. Verboden gebruik</h2>
          <p style={P}>Het is verboden om het platform te gebruiken voor:</p>
          <ul style={{ ...P, paddingLeft: "1.5rem" }}>
            <li style={{ marginBottom: ".5rem" }}>Het publiceren van valse of misleidende capaciteit</li>
            <li style={{ marginBottom: ".5rem" }}>Het achterhalen van de identiteit van andere terminals buiten de voorziene kanalen</li>
            <li style={{ marginBottom: ".5rem" }}>Concurrentieverstorende praktijken of het delen van commercieel gevoelige informatie</li>
            <li>Automatisch scrapen of systematische extractie van platformdata</li>
          </ul>

          <h2 style={H2}>8. Aansprakelijkheid</h2>
          <p style={P}>YardExx is niet aansprakelijk voor schade die voortvloeit uit deals gesloten via het platform, onjuiste listings, technische storingen of ongeoorloofde toegang tot accounts. De aansprakelijkheid van YardExx is in alle gevallen beperkt tot het bedrag dat de betrokken terminal in de voorgaande 12 maanden aan YardExx heeft betaald.</p>

          <h2 style={H2}>9. Intellectuele eigendom</h2>
          <p style={P}>De YardExx-naam, het logo en de platformsoftware zijn eigendom van YardExx. Terminals verlenen YardExx een niet-exclusieve licentie om listing-inhoud te tonen op het platform.</p>

          <h2 style={H2}>10. Toepasselijk recht en geschillen</h2>
          <p style={P}>Op deze voorwaarden is Belgisch recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechtbanken van Antwerpen, afdeling Antwerpen.</p>

          <h2 style={H2}>11. Wijzigingen</h2>
          <p style={P}>YardExx kan deze voorwaarden aanpassen. Bij wezenlijke wijzigingen ontvangen actieve terminals 30 dagen vooraf een melding per e-mail. Voortgezet gebruik van het platform na de ingangsdatum geldt als aanvaarding.</p>

          <p style={{ ...P, marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #f4f6f9" }}>
            Vragen? Stuur een e-mail naar <a href="mailto:legal@yardexx.com" style={{ color: "#00c9a7" }}>legal@yardexx.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
