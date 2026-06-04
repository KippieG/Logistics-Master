package be.porttracker.service;

import be.porttracker.model.Container;
import be.porttracker.model.DwellReport;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ContainerService — core business logic for container lifecycle management.
 *
 * In a real terminal environment this would integrate with the TOS (e.g. Navis N4)
 * via its published REST or XML API. Here we demonstrate the analysis and
 * transformation layer that sits between the TOS and internal reporting tools.
 */
@Service
public class ContainerService {

    private static final int DWELL_SLA_DAYS = 5;

    private final ContainerRepository containerRepository;

    public ContainerService(ContainerRepository containerRepository) {
        this.containerRepository = containerRepository;
    }

    /**
     * Returns all containers currently exceeding the dwell-time SLA.
     * Sorted by dwell time descending so operations staff see the worst cases first.
     */
    public List<DwellReport> getDwellAlerts() {
        LocalDate today = LocalDate.now();

        return containerRepository.findAll().stream()
            .filter(c -> c.isInYard())
            .map(c -> {
                long dwell = ChronoUnit.DAYS.between(c.getArrivalDate(), today);
                return new DwellReport(c.getContainerId(), c.getSize(), c.getYardLocation(), dwell);
            })
            .filter(r -> r.getDwellDays() > DWELL_SLA_DAYS)
            .sorted((a, b) -> Long.compare(b.getDwellDays(), a.getDwellDays()))
            .collect(Collectors.toList());
    }

    /**
     * Calculates average vessel turnaround time in hours for a given date range.
     * Used to feed the BI dashboard and weekly KPI report.
     */
    public double getAverageTurnaroundHours(LocalDate from, LocalDate to) {
        return containerRepository.findVesselCallsInRange(from, to).stream()
            .mapToLong(call -> ChronoUnit.HOURS.between(call.getArrival(), call.getDeparture()))
            .average()
            .orElse(0.0);
    }

    /**
     * Returns TEU throughput totals split by import/export for a given week.
     * Designed to populate the weekly throughput chart in the dashboard.
     */
    public ThroughputSummary getWeeklyThroughput(LocalDate weekStart) {
        List<Container> weekContainers = containerRepository
            .findByArrivalDateBetween(weekStart, weekStart.plusDays(6));

        long importTeu = weekContainers.stream()
            .filter(c -> c.getDirection() == Direction.IMPORT)
            .mapToLong(Container::getTeuSize)
            .sum();

        long exportTeu = weekContainers.stream()
            .filter(c -> c.getDirection() == Direction.EXPORT)
            .mapToLong(Container::getTeuSize)
            .sum();

        return new ThroughputSummary(weekStart, importTeu, exportTeu);
    }
}
