package br.com.ludus.checkin.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import br.com.ludus.checkin.dto.attendance.AttendanceConfirmationInfoDto;
import br.com.ludus.checkin.dto.attendance.AttendanceRespondDto;
import br.com.ludus.checkin.service.AttendanceConfirmationService;

@ExtendWith(MockitoExtension.class)
class PublicAttendanceControllerTest {

    @Mock
    private AttendanceConfirmationService attendanceConfirmationService;

    @InjectMocks
    private PublicAttendanceController publicAttendanceController;

    @Test
    void shouldReturnConfirmationInfoForValidToken() {
        when(attendanceConfirmationService.getConfirmationInfo(eq("valid-token")))
                .thenReturn(new AttendanceConfirmationInfoDto(
                        "Ana Souza",
                        "SERTANEJO",
                        "Segunda-feira",
                        "19:00 - 20:30"));

        ResponseEntity<AttendanceConfirmationInfoDto> response = publicAttendanceController.getConfirmationInfo("valid-token");

        assertEquals(200, response.getStatusCode().value());
        assertEquals("Ana Souza", response.getBody().studentName());
        assertEquals("SERTANEJO", response.getBody().className());
        assertEquals("Segunda-feira", response.getBody().weekday());
        assertEquals("19:00 - 20:30", response.getBody().time());
    }

    @Test
    void shouldRegisterAttendanceResponse() {
        AttendanceRespondDto dto = new AttendanceRespondDto("token-123", "PRESENT");

        ResponseEntity<Map<String, String>> response = publicAttendanceController.respond(dto);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("Resposta registrada com sucesso.", response.getBody().get("message"));
        verify(attendanceConfirmationService).respond(any());
    }
}
