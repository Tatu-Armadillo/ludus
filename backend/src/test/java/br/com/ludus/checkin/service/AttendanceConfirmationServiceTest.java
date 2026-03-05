package br.com.ludus.checkin.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import br.com.ludus.checkin.dto.attendance.AttendanceRespondDto;
import br.com.ludus.checkin.dto.attendance.UpdateAttendanceDto;
import br.com.ludus.checkin.enums.AttendanceRequestStatusEnum;
import br.com.ludus.checkin.model.AttendanceRequest;
import br.com.ludus.checkin.model.Beat;
import br.com.ludus.checkin.model.DancingClass;
import br.com.ludus.checkin.model.Student;
import br.com.ludus.checkin.repository.AttendanceRequestRepository;
import br.com.ludus.checkin.repository.DancingClassEnrollmentRepository;

@ExtendWith(MockitoExtension.class)
class AttendanceConfirmationServiceTest {

    @Mock
    private AttendanceRequestRepository attendanceRequestRepository;

    @Mock
    private DancingClassEnrollmentRepository enrollmentRepository;

    @Mock
    private DancingClassService dancingClassService;

    @Mock
    private StudentAttendanceService studentAttendanceService;

    @Mock
    private WhatsAppService whatsAppService;

    @InjectMocks
    private AttendanceConfirmationService attendanceConfirmationService;

    @Captor
    private ArgumentCaptor<UpdateAttendanceDto> updateAttendanceCaptor;

    @BeforeEach
    void setup() {
        ReflectionTestUtils.setField(attendanceConfirmationService, "frontendBaseUrl", "http://localhost:5173");
        ReflectionTestUtils.setField(attendanceConfirmationService, "tokenExpirationHours", 12);
    }

    @Test
    void shouldReturnConfirmationInfoForValidToken() {
        AttendanceRequest request = new AttendanceRequest();
        request.setTokenHash("hashed");
        request.setExpiresAt(LocalDateTime.now().plusHours(1));
        request.setStudent(buildStudent(1L, "Ana Souza"));
        request.setDancingClass(buildClass(1L, "SERTANEJO", DayOfWeek.MONDAY));

        when(attendanceRequestRepository.findByTokenHash(any())).thenReturn(Optional.of(request));

        var info = attendanceConfirmationService.getConfirmationInfo("valid-token");

        assertEquals("Ana Souza", info.studentName());
        assertEquals("SERTANEJO", info.className());
        assertEquals("Segunda-feira", info.weekday());
        assertEquals("19:00 - 20:30", info.time());
    }

    @Test
    void shouldRespondAsPresentAndUpdateAttendance() {
        AttendanceRequest request = new AttendanceRequest();
        request.setTokenHash("hashed");
        request.setExpiresAt(LocalDateTime.now().plusHours(1));
        request.setRespondedAt(null);
        request.setDate(LocalDate.of(2026, 3, 5));
        request.setStudent(buildStudent(2L, "Bruno Pereira"));
        request.setDancingClass(buildClass(3L, "FORRÓ", DayOfWeek.WEDNESDAY));

        when(attendanceRequestRepository.findByTokenHash(any())).thenReturn(Optional.of(request));
        when(attendanceRequestRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        attendanceConfirmationService.respond(new AttendanceRespondDto("valid-token", "PRESENT"));

        verify(attendanceRequestRepository).save(request);
        assertEquals(AttendanceRequestStatusEnum.PRESENT, request.getStatus());
        verify(studentAttendanceService).createOrUpdate(updateAttendanceCaptor.capture());
        assertEquals("PRESENTE", updateAttendanceCaptor.getValue().status());
        assertEquals(2L, updateAttendanceCaptor.getValue().studentId());
        assertEquals(3L, updateAttendanceCaptor.getValue().classId());
    }

    @Test
    void shouldFailWhenTokenAlreadyResponded() {
        AttendanceRequest request = new AttendanceRequest();
        request.setTokenHash("hashed");
        request.setExpiresAt(LocalDateTime.now().plusHours(1));
        request.setRespondedAt(LocalDateTime.now().minusMinutes(1));
        request.setDate(LocalDate.of(2026, 3, 5));
        request.setStudent(buildStudent(2L, "Bruno"));
        request.setDancingClass(buildClass(3L, "FORRÓ", DayOfWeek.WEDNESDAY));

        when(attendanceRequestRepository.findByTokenHash(any())).thenReturn(Optional.of(request));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> attendanceConfirmationService.respond(new AttendanceRespondDto("valid-token", "PRESENT")));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void shouldFailWhenTokenExpired() {
        AttendanceRequest request = new AttendanceRequest();
        request.setTokenHash("hashed");
        request.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        request.setStudent(buildStudent(1L, "Ana"));
        request.setDancingClass(buildClass(1L, "SERTANEJO", DayOfWeek.MONDAY));

        when(attendanceRequestRepository.findByTokenHash(any())).thenReturn(Optional.of(request));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> attendanceConfirmationService.getConfirmationInfo("expired-token"));

        assertEquals(HttpStatus.GONE, ex.getStatusCode());
    }

    @Test
    void shouldFailWhenStatusIsInvalid() {
        AttendanceRequest request = new AttendanceRequest();
        request.setTokenHash("hashed");
        request.setExpiresAt(LocalDateTime.now().plusHours(1));
        request.setStudent(buildStudent(1L, "Ana"));
        request.setDancingClass(buildClass(1L, "SERTANEJO", DayOfWeek.MONDAY));
        request.setDate(LocalDate.of(2026, 3, 5));

        when(attendanceRequestRepository.findByTokenHash(any())).thenReturn(Optional.of(request));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> attendanceConfirmationService.respond(new AttendanceRespondDto("valid-token", "UNKNOWN")));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    private Student buildStudent(Long id, String name) {
        Student student = new Student();
        student.setId(id);
        student.setName(name);
        student.setContact("11999999999");
        return student;
    }

    private DancingClass buildClass(Long id, String beatName, DayOfWeek dayOfWeek) {
        Beat beat = new Beat();
        beat.setName(beatName);

        DancingClass dancingClass = new DancingClass();
        dancingClass.setId(id);
        dancingClass.setBeat(beat);
        dancingClass.setDayWeek(dayOfWeek);
        dancingClass.setStartSchedule(LocalTime.of(19, 0));
        dancingClass.setEndSchedule(LocalTime.of(20, 30));
        return dancingClass;
    }
}
