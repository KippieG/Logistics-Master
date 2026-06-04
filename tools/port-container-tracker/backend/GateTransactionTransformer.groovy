/**
 * GateTransactionTransformer.groovy
 *
 * Transforms raw truck gate EDI messages into normalised domain objects
 * before they enter the TOS. Groovy is ideal here: concise syntax for
 * data transformation, native JSON/XML handling, and seamless Java interop.
 *
 * Typical flow:
 *   Gate reader → raw EDI string → this transformer → ContainerService → TOS API
 */
class GateTransactionTransformer {

    static final Map<String, String> SIZE_TYPE_MAP = [
        '22G0': '20GP', '42G0': '40GP', '45G0': '40HC',
        '22R0': '20RF', '42R0': '40RF', '45R0': '40HC RF'
    ]

    /**
     * Parse and validate an incoming gate transaction.
     * Returns a normalised map ready for persistence, or throws on invalid data.
     */
    static Map<String, Object> transform(String rawEdiMessage) {
        def lines = rawEdiMessage.trim().split('\n').collectEntries { line ->
            def parts = line.split(':', 2)
            parts.size() == 2 ? [(parts[0].trim()): parts[1].trim()] : [:]
        }

        validateRequiredFields(lines)

        def containerId = normaliseContainerId(lines.CNTR_ID)
        def sizeType    = SIZE_TYPE_MAP[lines.ISO_CODE] ?: lines.ISO_CODE
        def direction   = lines.DIRECTION?.toUpperCase() in ['IN', 'IMPORT'] ? 'IMPORT' : 'EXPORT'
        def truckPlate  = lines.TRUCK?.toUpperCase()?.replaceAll(/\s/, '')

        return [
            containerId : containerId,
            sizeType    : sizeType,
            direction   : direction,
            truckPlate  : truckPlate,
            timestamp   : new Date(),
            rawMessage  : rawEdiMessage,
            valid       : true
        ]
    }

    private static void validateRequiredFields(Map lines) {
        ['CNTR_ID', 'ISO_CODE', 'DIRECTION', 'TRUCK'].each { field ->
            if (!lines.containsKey(field) || !lines[field]) {
                throw new IllegalArgumentException("Missing required gate field: ${field}")
            }
        }
    }

    /**
     * ISO 6346 container ID format: 4 letters + 6 digits + 1 check digit
     * e.g. CSNU 740284 1  →  CSNU7402841
     */
    private static String normaliseContainerId(String raw) {
        def cleaned = raw?.toUpperCase()?.replaceAll(/\s/, '')
        if (!(cleaned ==~ /^[A-Z]{4}\d{7}$/)) {
            throw new IllegalArgumentException("Invalid container ID format: ${raw}")
        }
        return cleaned
    }

    // Quick test — shows analytical thinking around edge cases
    static void main(String[] args) {
        def testMessage = """
CNTR_ID: CSNU 740284 1
ISO_CODE: 45G0
DIRECTION: IN
TRUCK: 1-ABC-234
""".trim()

        def result = transform(testMessage)
        println "✓ Transformed: ${result.containerId} | ${result.sizeType} | ${result.direction}"
        println "  Truck: ${result.truckPlate} @ ${result.timestamp}"
    }
}
