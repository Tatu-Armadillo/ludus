drop schema if exists checkin cascade;

create schema checkin;

-- create table checkin.audit (
--     id bigserial primary key,
--     create_at timestamp not null,
--     type_action varchar(255) not null
-- );

create table checkin.permission (
    id bigserial primary key,
    description varchar(255)
);

create table checkin.users (
    id bigserial primary key,
    account_non_expired boolean not null,
    account_non_locked boolean not null,
    credentials_non_expired boolean not null,
    enabled boolean not null,
    password varchar(255) not null unique,
    user_name varchar(255) not null unique
);

create table checkin.user_permission (
    id_permission bigint not null,
    id_user bigint not null,
    primary key(id_permission, id_user)
);

create table checkin.student (
    id bigserial primary key,
    name varchar(255) not null,
    contact varchar(11) not null,
    cpf varchar(11) unique,
    email varchar(255),
    gender varchar(20),
    is_active boolean not null,
    is_deleted boolean not null default false,
    enrollment_date date not null,
    date_birth date
);

create table checkin.dancing_class (
    id bigserial primary key,
    level varchar(255) not null, -- BEGINNER, INTERMEDIARY, ADVANCED
    status varchar(255) not null, -- IN_PROGRESS, COMPLETED, CANCELED
    day_week varchar(255) not null,
    start_schedule time not null,
    end_schedule time not null,
    start_date date not null,
    end_date date not null,
    is_deleted boolean not null default false,
    beat bigint not null
);

create table checkin.beat(
    id bigserial primary key,
    name varchar(255) unique not null,
    is_deleted boolean not null default false
);

create table checkin.dancing_class_student (
    id_student bigint not null,
    id_dancing_class bigint not null,
    role varchar(20) not null default 'CONDUCTED',
    primary key(id_dancing_class, id_student)
);
-- Para banco já existente: ALTER TABLE checkin.dancing_class_student ADD COLUMN IF NOT EXISTS role varchar(20) NOT NULL DEFAULT 'CONDUCTED';

create table checkin.lesson (
    id bigserial primary key,
    day date not null,
    start_schedule  time not null,
    end_schedule time not null,
    is_deleted boolean not null default false,
    dancing_class bigint not null
);

create table checkin.participation (
    id bigserial primary key,
    confirmed boolean not null,
    is_deleted boolean not null default false,
    lesson bigint not null,
    student bigint not null
);

create table checkin.event (
    id bigserial primary key,
    name varchar(255) not null,
    event_date date not null,
    event_time time not null,
    has_max_participants boolean not null default true,
    max_participants int not null default 0,
    status varchar(50) not null default 'IN_PROGRESS',
    is_deleted boolean not null default false
);

create table checkin.event_participant (
    id_event bigint not null,
    id_student bigint not null,
    primary key(id_event, id_student)
);

alter table checkin.user_permission add constraint fk_permission_user_permission foreign key (id_permission) references checkin.permission;
alter table checkin.user_permission add constraint fk_user_user_permission foreign key (id_user) references checkin.users;
alter table checkin.dancing_class add constraint fk_beat_dancing_class foreign key (beat) references checkin.beat;
alter table checkin.dancing_class_student add constraint fk_dancing_class_student_student foreign key (id_student) references checkin.student;
alter table checkin.dancing_class_student add constraint fk_dancing_class_student_dancing foreign key (id_dancing_class) references checkin.dancing_class;
alter table checkin.lesson add constraint fk_dancing_class_lesson foreign key (dancing_class) references checkin.dancing_class;
alter table checkin.participation add constraint fk_lesson_participation foreign key (lesson) references checkin.lesson;
alter table checkin.participation add constraint fk_student_participation foreign key (student) references checkin.student;
alter table checkin.event_participant add constraint fk_event_participant_event foreign key (id_event) references checkin.event;
alter table checkin.event_participant add constraint fk_event_participant_student foreign key (id_student) references checkin.student;

INSERT INTO checkin.users (user_name, password, account_non_expired, account_non_locked, credentials_non_expired, enabled) 
VALUES ('adm', '$2a$10$PqsrFKSSRev9lL0BMAE.IOvDB4r6plBA7c45UDzz4v0Wu1Es9XMs.', true, true, true, true);

INSERT INTO checkin.beat (name, is_deleted) VALUES
('SERTANEJO', false), ('FORRÓ', false), ('BACHATA', false), ('BOLERO', false), ('SAMBA DE GAFIEIRA', false), ('ZOUK', false);

-- ==================== SEED DATA (opcional) ====================
-- Ordem: students -> dancing_class -> dancing_class_student -> lesson -> participation
-- Todos os alunos referenciados em dancing_class_student devem existir e ter is_deleted = false.

INSERT INTO checkin.student (name, contact, cpf, email, gender, is_active, is_deleted, enrollment_date, date_birth) VALUES
('Ana Souza',       '11987654321', '12345678901', 'ana.souza@email.com',    'F', true,  false, CURRENT_DATE, '2000-05-12'),
('Bruno Pereira',   '21991234567', '23456789012', 'bruno.pereira@email.com', 'M', true,  false, CURRENT_DATE, '1999-08-23'),
('Carla Mendes',    '31999887766', '34567890123', 'carla.mendes@email.com',  'F', true,  false, CURRENT_DATE, '2001-01-30'),
('Daniel Oliveira', '41988776655', '45678901234', 'daniel.oliveira@email.com','M', false, false, CURRENT_DATE, '1998-11-15'),
('Eduarda Lima',    '51977665544', '56789012345', 'eduarda.lima@email.com',  'F', true,  false, CURRENT_DATE, '2002-07-04'),
('Fernando Costa',  '61999887766', '67890123456', 'fernando.costa@email.com','M', true,  false, CURRENT_DATE, '2000-03-18'),
('Gabriela Santos', '71988776655', '78901234567', 'gabriela.santos@email.com','F', true,  false, CURRENT_DATE, '1999-12-10'),
('Henrique Alves',  '81977665544', '89012345678', 'henrique.alves@email.com','M', false, false, CURRENT_DATE, '2001-09-22'),
('Isabela Rocha',   '91966554433', '90123456789', 'isabela.rocha@email.com', 'F', true,  false, CURRENT_DATE, '1998-06-05'),
('João Pedro',      '11955443322', '01234567890', 'joao.pedro@email.com',   'M', true,  false, CURRENT_DATE, '2002-11-30');

INSERT INTO checkin.dancing_class (level, status, day_week, start_schedule, end_schedule, start_date, end_date, is_deleted, beat) VALUES
('BEGINNER',     'IN_PROGRESS', 'MONDAY',    '18:00', '19:00',  '2026-02-01', '2026-03-01',  false, 1),
('INTERMEDIARY', 'IN_PROGRESS', 'TUESDAY',   '19:00', '20:30',  '2026-02-05', '2026-03-15',  false, 2),
('ADVANCED',     'COMPLETED',   'WEDNESDAY', '20:00', '21:30',  '2025-11-01', '2025-12-15',  false, 3),
('BEGINNER',     'CANCELED',    'THURSDAY',  '17:30', '18:30',  '2026-01-20', '2026-02-20',  false, 4),
('INTERMEDIARY', 'IN_PROGRESS', 'SATURDAY',  '10:00', '11:30',  '2026-02-10', '2026-04-10',  false, 5),
('BEGINNER',     'IN_PROGRESS', 'FRIDAY',    '18:00', '19:30',  '2026-02-15', '2026-03-20',  false, 4),
('INTERMEDIARY', 'IN_PROGRESS', 'MONDAY',    '20:00', '21:30',  '2026-02-12', '2026-03-25',  false, 2),
('ADVANCED',     'IN_PROGRESS', 'WEDNESDAY', '19:00', '20:30',  '2026-02-18', '2026-04-01',  false, 4),
('BEGINNER',     'IN_PROGRESS', 'TUESDAY',   '16:30', '17:30',  '2026-02-20', '2026-03-30',  false, 2),
('INTERMEDIARY', 'IN_PROGRESS', 'THURSDAY',  '19:30', '21:00',  '2026-02-22', '2026-04-05',  false, 1);

INSERT INTO checkin.dancing_class_student (id_dancing_class, id_student, role) VALUES
(1, 1, 'CONDUCTOR'),  (1, 2, 'CONDUCTED'),  (1, 3, 'CONDUCTED'),  (1, 4, 'CONDUCTED'),  (1, 5, 'CONDUCTED'),
(2, 2, 'CONDUCTOR'),  (2, 3, 'CONDUCTED'),  (2, 6, 'CONDUCTED'),  (2, 7, 'CONDUCTED'),
(3, 4, 'CONDUCTOR'),  (3, 5, 'CONDUCTED'),  (3, 8, 'CONDUCTED'),
(4, 6, 'CONDUCTOR'),  (4, 9, 'CONDUCTED'),  (4, 10, 'CONDUCTED'),
(5, 1, 'CONDUCTOR'),  (5, 7, 'CONDUCTED'),  (5, 8, 'CONDUCTED'),  (5, 9, 'CONDUCTED'),
(6, 2, 'CONDUCTOR'),  (6, 4, 'CONDUCTED'),  (6, 6, 'CONDUCTED'),  (6, 8, 'CONDUCTED'),  (6, 10, 'CONDUCTED'),
(7, 1, 'CONDUCTOR'),  (7, 3, 'CONDUCTED'),  (7, 5, 'CONDUCTED'),  (7, 7, 'CONDUCTED'),  (7, 9, 'CONDUCTED'),
(8, 2, 'CONDUCTOR'),  (8, 4, 'CONDUCTED'),  (8, 6, 'CONDUCTED'),  (8, 8, 'CONDUCTED'),  (8, 10, 'CONDUCTED'),
(9, 1, 'CONDUCTOR'),  (9, 3, 'CONDUCTED'),  (9, 5, 'CONDUCTED'),  (9, 7, 'CONDUCTED'),  (9, 9, 'CONDUCTED'),
(10, 2, 'CONDUCTOR'), (10, 4, 'CONDUCTED'), (10, 6, 'CONDUCTED'), (10, 8, 'CONDUCTED'), (10, 10, 'CONDUCTED');

INSERT INTO checkin.lesson (day, start_schedule, end_schedule, is_deleted, dancing_class) VALUES
('2026-02-16', '18:00', '19:00',  false, 1),
('2026-02-17', '19:00', '20:30', false, 2),
('2026-02-18', '20:00', '21:30', false, 3),
('2026-02-19', '17:30', '18:30', false, 4),
('2026-02-20', '10:00', '11:30', false, 5),
('2026-02-21', '18:00', '19:30', false, 6),
('2026-02-22', '20:00', '21:30', false, 7),
('2026-02-23', '19:00', '20:30', false, 8),
('2026-02-24', '16:30', '17:30', false, 9),
('2026-02-25', '19:30', '21:00', false, 10);

INSERT INTO checkin.participation (confirmed, is_deleted, lesson, student) VALUES
(true, false, 1, 1), (true, false, 1, 2), (false, false, 1, 3),
(true, false, 2, 2), (true, false, 2, 3), (false, false, 2, 6),
(true, false, 3, 4), (true, false, 3, 5),
(false, false, 4, 6),
(true, false, 5, 1);
