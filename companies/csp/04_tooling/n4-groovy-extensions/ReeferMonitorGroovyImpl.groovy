/**
 * ReeferMonitorGroovyImpl.groovy
 * ================================
 * Navis N4 Code Extension — Reefer Temperature Monitor
 *
 * Hook: ReeferMonitor (N4 Mobile Reefer Monitor integration)
 * Trigger: Fires when N4 receives a reefer temperature update message
 *   from a reefer monitoring system or manual plug-in round.
 *
 * CSP Zeebrugge handles reefer containers for UK/Ireland trade routes.
 * Temperature deviations directly impact cargo claims — early detection
 * is critical. This hook auto-escalates when deviation persists.
 *
 * In production this integrates with N4's reefer plug-in round workflow.
 */
class ReeferMonitorGroovyImpl {

    static final double DEVIATION_THRESHOLD_C = 2.0   // Alert if >2°C off set-point
    static final int    ESCALATION_MINUTES    = 30     // Escalate if deviation >30 min

    /**
     * Main entry point — called by N4 on each reefer update.
     * @param reeferData  Map containing container ID, actual temp, set-point, timestamp
     */
    def processReeferUpdate(Map reeferData) {
        String containerId = reeferData.containerId
        double actualTemp  = reeferData.actualTemp as double
        double setPoint    = reeferData.setPoint as double
        String location    = reeferData.yardLocation ?: 'UNKNOWN'
        Date   timestamp   = reeferData.timestamp ?: new Date()

        double deviation = Math.abs(actualTemp - setPoint)
        boolean isDeviation = deviation > DEVIATION_THRESHOLD_C

        Map result = [
            containerId : containerId,
            setPoint    : setPoint,
            actualTemp  : actualTemp,
            deviation   : Math.round(deviation * 10) / 10.0,
            location    : location,
            timestamp   : timestamp.format('yyyy-MM-dd HH:mm'),
            status      : isDeviation ? 'ALERT' : 'OK'
        ]

        if (isDeviation) {
            handleDeviation(result, reeferData.previousAlertTime)
        } else {
            clearPreviousAlert(containerId)
            logInfo("Reefer OK: ${containerId} @ ${actualTemp}°C (set: ${setPoint}°C) — ${location}")
        }

        return result
    }

    private void handleDeviation(Map result, Date previousAlertTime) {
        String msg = "REEFER ALERT: ${result.containerId} | " +
                     "Actual: ${result.actualTemp}°C | " +
                     "Set-point: ${result.setPoint}°C | " +
                     "Deviation: ${result.deviation}°C | " +
                     "Location: ${result.location}"

        logWarning(msg)
        writeN4EventLog(result.containerId, msg)

        // Escalate if deviation has persisted
        if (previousAlertTime) {
            long minutesElapsed = (new Date().time - previousAlertTime.time) / 60000
            if (minutesElapsed >= ESCALATION_MINUTES) {
                escalate(result, minutesElapsed)
            }
        }
    }

    private void escalate(Map result, long minutesElapsed) {
        String escalationMsg =
            "REEFER ESCALATION: ${result.containerId} has been out of range " +
            "for ${minutesElapsed} minutes. " +
            "Deviation: ${result.deviation}°C. " +
            "Immediate inspection required at ${result.location}."

        logError(escalationMsg)
        // In production: send email/SMS to operations supervisor via N4 notification API
        notifySupervisor(result.containerId, escalationMsg)
    }

    private void writeN4EventLog(String containerId, String message) {
        // In production: uses N4 ArgoEventUtil to write to N4 event log
        println "[N4 EVENT LOG] ${message}"
    }

    private void notifySupervisor(String containerId, String message) {
        println "[SUPERVISOR ALERT] ${message}"
    }

    private void clearPreviousAlert(String containerId) {
        // In production: clear deviation flag on N4 unit custom field
    }

    private void logInfo(String msg)    { println "[INFO]  ${msg}" }
    private void logWarning(String msg) { println "[WARN]  ${msg}" }
    private void logError(String msg)   { println "[ERROR] ${msg}" }

    static void main(String[] args) {
        def monitor = new ReeferMonitorGroovyImpl()

        println "=== ReeferMonitorGroovyImpl — Simulator ===\n"

        println "Test 1: Temperature within range"
        def r1 = monitor.processReeferUpdate([
            containerId: 'OOLU8814423', actualTemp: -18.3,
            setPoint: -18.0, yardLocation: 'RF-A-04-02', timestamp: new Date()
        ])
        println "  Status: ${r1.status}\n"

        println "Test 2: Temperature deviation — alert"
        def r2 = monitor.processReeferUpdate([
            containerId: 'MSCU4401872', actualTemp: -14.1,
            setPoint: -18.0, yardLocation: 'RF-B-07-01', timestamp: new Date()
        ])
        println "  Status: ${r2.status} | Deviation: ${r2.deviation}°C\n"

        println "Test 3: Persistent deviation — escalation"
        Date thirtyFiveMinutesAgo = new Date(new Date().time - 35 * 60000)
        monitor.processReeferUpdate([
            containerId: 'HLXU2290034', actualTemp: -12.0,
            setPoint: -18.0, yardLocation: 'RF-C-02-05',
            timestamp: new Date(), previousAlertTime: thirtyFiveMinutesAgo
        ])
        println ""
        println "=== Simulation complete ==="
    }
}
