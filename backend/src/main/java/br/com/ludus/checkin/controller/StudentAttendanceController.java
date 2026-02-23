package br.com.ludus.checkin.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.com.ludus.checkin.dto.attendance.StudentAttendanceItemDto;
import br.com.ludus.checkin.dto.attendance.UpdateAttendanceDto;
import br.com.ludus.checkin.model.StudentAttendance;
import br.com.ludus.checkin.service.StudentAttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;

@Tag(name = "Student-Attendance", description = "Endpoints for student attendance by class and date")
@AllArgsConstructor
@SecurityRequirement(name = "bearer-key")
@RestController
@RequestMapping("/student-attendance")
public class StudentAttendanceController {

    private final StudentAttendanceService studentAttendanceService;

    @Operation(summary = "List attendance by class and date (enrolled students with status; missing = PENDENTE)")
    @GetMapping
    public ResponseEntity<List<StudentAttendanceItemDto>> listByClassAndDate(
            @RequestParam Long classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate attendanceDate) {
        return ResponseEntity.ok(studentAttendanceService.listByClassAndDate(classId, attendanceDate));
    }

    @Operation(summary = "Create or update attendance for a student in a class on a date")
    @PutMapping
    public ResponseEntity<StudentAttendance> createOrUpdate(@RequestBody UpdateAttendanceDto dto) {
        return ResponseEntity.ok(studentAttendanceService.createOrUpdate(dto));
    }
}
