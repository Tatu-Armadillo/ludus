package br.com.ludus.checkin.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import br.com.ludus.checkin.enums.AttendanceRequestStatusEnum;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "attendance_request", schema = "checkin", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "class_id", "student_id", "date" }),
        @UniqueConstraint(columnNames = { "token_hash" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "class_id", foreignKey = @ForeignKey(name = "fk_attendance_request_class"), nullable = false)
    private DancingClass dancingClass;

    @ManyToOne
    @JoinColumn(name = "student_id", foreignKey = @ForeignKey(name = "fk_attendance_request_student"), nullable = false)
    private Student student;

    @Column(name = "token_hash", length = 128, nullable = false)
    private String tokenHash;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private AttendanceRequestStatusEnum status;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
