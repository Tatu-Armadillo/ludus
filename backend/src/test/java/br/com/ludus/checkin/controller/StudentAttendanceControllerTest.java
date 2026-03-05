package br.com.ludus.checkin.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import br.com.ludus.checkin.dto.attendance.SendAttendanceRequestDto;
import br.com.ludus.checkin.dto.attendance.SendAttendanceResponseDto;
import br.com.ludus.checkin.dto.attendance.StudentAttendanceItemDto;
import br.com.ludus.checkin.dto.attendance.UpdateAttendanceDto;
import br.com.ludus.checkin.enums.AttendanceStatusEnum;
import br.com.ludus.checkin.model.StudentAttendance;
import br.com.ludus.checkin.service.AttendanceConfirmationService;
import br.com.ludus.checkin.service.StudentAttendanceService;

@ExtendWith(MockitoExtension.class)
class StudentAttendanceControllerTest {

    @Mock
    private StudentAttendanceService studentAttendanceService;

    @Mock
    private AttendanceConfirmationService attendanceConfirmationService;

    @InjectMocks
    private StudentAttendanceController studentAttendanceController;

    @Test
    void shouldListAttendanceByClassAndDate() {
        when(studentAttendanceService.listByClassAndDate(eq(1L), eq(LocalDate.of(2026, 3, 5))))
                .thenReturn(List.of(
                        new StudentAttendanceItemDto(1L, "Ana Souza", "CONDUCTED", "PENDENTE"),
                        new StudentAttendanceItemDto(2L, "Bruno Pereira", "CONDUCTOR", "PRESENTE")));

        ResponseEntity<List<StudentAttendanceItemDto>> response = studentAttendanceController
                .listByClassAndDate(1L, LocalDate.of(2026, 3, 5));

        assertEquals(200, response.getStatusCode().value());
        assertEquals(2, response.getBody().size());
        assertEquals("Ana Souza", response.getBody().get(0).studentName());
        assertEquals("PRESENTE", response.getBody().get(1).status());
    }

    @Test
    void shouldCreateOrUpdateAttendance() {
        StudentAttendance attendance = new StudentAttendance();
        attendance.setId(10L);
        attendance.setAttendanceDate(LocalDate.of(2026, 3, 5));
        attendance.setStatus(AttendanceStatusEnum.PRESENTE);

        when(studentAttendanceService.createOrUpdate(any())).thenReturn(attendance);

        UpdateAttendanceDto dto = new UpdateAttendanceDto(1L, 1L, LocalDate.of(2026, 3, 5), "PRESENTE");
        ResponseEntity<StudentAttendance> response = studentAttendanceController.createOrUpdate(dto);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(10L, response.getBody().getId());
        assertEquals(AttendanceStatusEnum.PRESENTE, response.getBody().getStatus());
    }

    @Test
    void shouldSendAttendanceRequestsForToday() {
        when(attendanceConfirmationService.sendRequestsForToday(eq(1L)))
                .thenReturn(new SendAttendanceResponseDto(LocalDate.of(2026, 3, 5), 20, 18));

        ResponseEntity<SendAttendanceResponseDto> response = studentAttendanceController
                .sendAttendanceRequests(new SendAttendanceRequestDto(1L));

        assertEquals(200, response.getStatusCode().value());
        assertEquals(LocalDate.of(2026, 3, 5), response.getBody().attendanceDate());
        assertEquals(20, response.getBody().totalStudents());
        assertEquals(18, response.getBody().sentMessages());
    }
}
