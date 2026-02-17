package br.com.ludus.checkin.service;

import org.springframework.stereotype.Service;

import br.com.ludus.checkin.dto.dashboard.DashboardStatsDto;
import br.com.ludus.checkin.repository.DancingClassRepository;
import br.com.ludus.checkin.repository.StudentRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class DashboardService {

    private final StudentRepository studentRepository;
    private final DancingClassRepository dancingClassRepository;

    public DashboardStatsDto getStats() {
        long totalStudents = studentRepository.count();
        long totalClasses = dancingClassRepository.count();
        long activeEnrollments = dancingClassRepository.countActiveEnrollments();
        return new DashboardStatsDto(totalStudents, totalClasses, activeEnrollments);
    }
}
