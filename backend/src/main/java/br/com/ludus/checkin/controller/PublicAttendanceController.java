package br.com.ludus.checkin.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.ludus.checkin.dto.attendance.AttendanceConfirmationInfoDto;
import br.com.ludus.checkin.dto.attendance.AttendanceRespondDto;
import br.com.ludus.checkin.service.AttendanceConfirmationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;

@Tag(name = "Public-Attendance", description = "Public attendance confirmation endpoints")
@AllArgsConstructor
@RestController
@RequestMapping("/attendance")
public class PublicAttendanceController {

    private final AttendanceConfirmationService attendanceConfirmationService;

    @Operation(summary = "Validate attendance token and return class/student details")
    @GetMapping("/confirm")
    public ResponseEntity<AttendanceConfirmationInfoDto> getConfirmationInfo(@RequestParam String token) {
        return ResponseEntity.ok(attendanceConfirmationService.getConfirmationInfo(token));
    }

    @Operation(summary = "Respond attendance by token")
    @PostMapping("/respond")
    public ResponseEntity<Map<String, String>> respond(@RequestBody AttendanceRespondDto dto) {
        attendanceConfirmationService.respond(dto);
        return ResponseEntity.ok(Map.of("message", "Resposta registrada com sucesso."));
    }
}
