package br.com.ludus.checkin.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import br.com.ludus.checkin.dto.attendance.AttendanceConfirmationInfoDto;
import br.com.ludus.checkin.dto.attendance.AttendanceRespondDto;
import br.com.ludus.checkin.dto.attendance.SendAttendanceResponseDto;
import br.com.ludus.checkin.dto.attendance.UpdateAttendanceDto;
import br.com.ludus.checkin.enums.AttendanceRequestStatusEnum;
import br.com.ludus.checkin.enums.AttendanceStatusEnum;
import br.com.ludus.checkin.model.AttendanceRequest;
import br.com.ludus.checkin.model.DancingClass;
import br.com.ludus.checkin.model.DancingClassEnrollment;
import br.com.ludus.checkin.model.Student;
import br.com.ludus.checkin.repository.AttendanceRequestRepository;
import br.com.ludus.checkin.repository.DancingClassEnrollmentRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceConfirmationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AttendanceConfirmationService.class);
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

    private final AttendanceRequestRepository attendanceRequestRepository;
    private final DancingClassEnrollmentRepository enrollmentRepository;
    private final DancingClassService dancingClassService;
    private final StudentAttendanceService studentAttendanceService;
    private final WhatsAppService whatsAppService;

    @Value("${attendance.confirmation.token-expiration-hours:12}")
    private int tokenExpirationHours;

    @Value("${attendance.confirmation.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Transactional(rollbackFor = Exception.class)
    public SendAttendanceResponseDto sendRequestsForToday(Long classId) {
        if (classId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe a turma.");
        }

        LocalDate attendanceDate = LocalDate.now();
        DancingClass dancingClass = dancingClassService.findById(classId);
        List<DancingClassEnrollment> enrollments = enrollmentRepository.findByDancingClassIdOrderByStudentName(classId);

        int sentMessages = 0;
        for (DancingClassEnrollment enrollment : enrollments) {
            Student student = enrollment.getStudent();
            if (student == null) {
                continue;
            }

            String token = UUID.randomUUID().toString().replace("-", "");
            String tokenHash = hashToken(token);
            LocalDateTime expiresAt = LocalDateTime.now().plusHours(Math.max(tokenExpirationHours, 1));

            AttendanceRequest request = attendanceRequestRepository
                    .findByDancingClassIdAndStudentIdAndDate(classId, student.getId(), attendanceDate)
                    .orElseGet(AttendanceRequest::new);

            request.setDancingClass(dancingClass);
            request.setStudent(student);
            request.setDate(attendanceDate);
            request.setTokenHash(tokenHash);
            request.setStatus(AttendanceRequestStatusEnum.PENDING);
            request.setRespondedAt(null);
            request.setExpiresAt(expiresAt);
            attendanceRequestRepository.save(request);

            String phone = Optional.ofNullable(student.getContact()).map(String::trim).orElse("");
            if (phone.isBlank()) {
                continue;
            }

            String link = buildConfirmationLink(token);
            String message = buildMessage(student.getName(), dancingClass, link);
            try {
                whatsAppService.sendMessage(phone, message);
                sentMessages++;
            } catch (RuntimeException ex) {
                LOGGER.error("Falha ao enviar WhatsApp para studentId={} phone={}", student.getId(), phone, ex);
            }
        }

        return new SendAttendanceResponseDto(attendanceDate, enrollments.size(), sentMessages);
    }

    @Transactional(readOnly = true)
    public AttendanceConfirmationInfoDto getConfirmationInfo(String token) {
        AttendanceRequest request = resolveActiveToken(token);
        DancingClass dancingClass = request.getDancingClass();

        return new AttendanceConfirmationInfoDto(
                request.getStudent().getName(),
                Optional.ofNullable(dancingClass.getBeat()).map(beat -> beat.getName()).orElse("Turma"),
                weekdayLabel(dancingClass.getDayWeek()),
                dancingClass.getStartSchedule().format(TIME_FORMAT) + " - " + dancingClass.getEndSchedule().format(TIME_FORMAT));
    }

    @Transactional(rollbackFor = Exception.class)
    public void respond(AttendanceRespondDto dto) {
        if (dto == null || dto.token() == null || dto.token().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token inválido.");
        }

        if (dto.status() == null || dto.status().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status inválido.");
        }

        AttendanceRequest request = resolveActiveToken(dto.token());
        if (request.getRespondedAt() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este link já foi respondido.");
        }

        String statusNormalized = dto.status().trim().toUpperCase(Locale.ROOT);
        AttendanceRequestStatusEnum requestStatus;
        AttendanceStatusEnum attendanceStatus;
        switch (statusNormalized) {
            case "PRESENT":
                requestStatus = AttendanceRequestStatusEnum.PRESENT;
                attendanceStatus = AttendanceStatusEnum.PRESENTE;
                break;
            case "ABSENT":
                requestStatus = AttendanceRequestStatusEnum.ABSENT;
                attendanceStatus = AttendanceStatusEnum.RECUSADO;
                break;
            default:
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status deve ser PRESENT ou ABSENT.");
        }

        request.setStatus(requestStatus);
        request.setRespondedAt(LocalDateTime.now());
        attendanceRequestRepository.save(request);

        studentAttendanceService.createOrUpdate(new UpdateAttendanceDto(
                request.getStudent().getId(),
                request.getDancingClass().getId(),
                request.getDate(),
                attendanceStatus.name()));
    }

    private AttendanceRequest resolveActiveToken(String token) {
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token inválido.");
        }

        String hash = hashToken(token.trim());
        AttendanceRequest request = attendanceRequestRepository.findByTokenHash(hash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Token não encontrado."));

        if (request.getExpiresAt() == null || request.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.GONE, "Token expirado.");
        }

        return request;
    }

    private String buildConfirmationLink(String token) {
        String baseUrl = frontendBaseUrl == null ? "" : frontendBaseUrl.trim();
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        return baseUrl + "/attendance/confirm?token=" + token;
    }

    private String buildMessage(String studentName, DancingClass dancingClass, String confirmationLink) {
        String className = Optional.ofNullable(dancingClass.getBeat())
                .map(beat -> beat.getName())
                .orElse("Turma");
        String weekday = weekdayLabel(dancingClass.getDayWeek());
        String time = dancingClass.getStartSchedule().format(TIME_FORMAT)
                + " - "
                + dancingClass.getEndSchedule().format(TIME_FORMAT);

        return """
                Olá %s, tudo bem?

                Contamos com você na aula de hoje:

                Turma: %s
                Dia: %s
                Horário: %s

                Confirme sua presença no link abaixo:
                %s
                """.formatted(
                Optional.ofNullable(studentName).orElse("Aluno(a)"),
                className,
                weekday,
                time,
                confirmationLink);
    }

    private String weekdayLabel(DayOfWeek dayOfWeek) {
        if (dayOfWeek == null) return "—";
        return switch (dayOfWeek) {
            case MONDAY -> "Segunda-feira";
            case TUESDAY -> "Terça-feira";
            case WEDNESDAY -> "Quarta-feira";
            case THURSDAY -> "Quinta-feira";
            case FRIDAY -> "Sexta-feira";
            case SATURDAY -> "Sábado";
            case SUNDAY -> "Domingo";
        };
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                builder.append(String.format("%02x", b));
            }
            return builder.toString();
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 não disponível", ex);
        }
    }
}
