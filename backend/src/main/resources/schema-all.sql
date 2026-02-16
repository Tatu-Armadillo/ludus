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
    primary key(id_dancing_class, id_student)
);

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

alter table checkin.user_permission add constraint fk_permission_user_permission foreign key (id_permission) references checkin.permission;
alter table checkin.user_permission add constraint fk_user_user_permission foreign key (id_user) references checkin.users;
alter table checkin.dancing_class add constraint fk_beat_dancing_class foreign key (beat) references checkin.beat;
alter table checkin.dancing_class_student add constraint fk_dancing_class_student_student foreign key (id_student) references checkin.student;
alter table checkin.dancing_class_student add constraint fk_dancing_class_student_dancing foreign key (id_dancing_class) references checkin.dancing_class;
alter table checkin.lesson add constraint fk_dancing_class_lesson foreign key (dancing_class) references checkin.dancing_class;
alter table checkin.participation add constraint fk_lesson_participation foreign key (lesson) references checkin.lesson;
alter table checkin.participation add constraint fk_student_participation foreign key (student) references checkin.student;

INSERT INTO checkin.users (user_name, password, account_non_expired, account_non_locked, credentials_non_expired, enabled) 
VALUES ('adm', '$2a$10$PqsrFKSSRev9lL0BMAE.IOvDB4r6plBA7c45UDzz4v0Wu1Es9XMs.', true, true, true, true);

insert into checkin.beat (name) values ('SERTANEJO'), ('FORRÓ'), ('BACHATA'), ('BOLERO'), ('SAMBA DE GAFIEIRA'), ('ZOUK');

----------------------------------------------- DELETAR DAQUI PARA BAIXO ---------------------------------------

INSERT INTO checkin.student (name, contact, cpf, is_active, date_birth, enrollment_date, is_deleted) VALUES
('Ana Souza',      '11987654321', '12345678901', true,  '2000-05-12', CURRENT_DATE, false),
('Bruno Pereira',  '21991234567', '23456789012', true,  '1999-08-23', CURRENT_DATE, true),
('Carla Mendes',   '31999887766', '34567890123', true,  '2001-01-30', CURRENT_DATE, false),
('Daniel Oliveira','41988776655', '45678901234', false, '1998-11-15', CURRENT_DATE, false),
('Eduarda Lima',   '51977665544', '56789012345', true,  '2002-07-04', CURRENT_DATE, false);

INSERT INTO checkin.dancing_class
(level, status, day_week, start_schedule, end_schedule, start_date, end_date, beat, is_deleted)
VALUES
('BEGINNER',      'IN_PROGRESS', 'MONDAY',    '18:00', '19:00', '2026-02-01', '2026-03-01', 1, false),
('INTERMEDIARY',  'IN_PROGRESS', 'TUESDAY',   '19:00', '20:30', '2026-02-05', '2026-03-15', 2, false),
('ADVANCED',      'COMPLETED',   'WEDNESDAY', '20:00', '21:30', '2025-11-01', '2025-12-15', 3, false),
('BEGINNER',      'CANCELED',    'THURSDAY',  '17:30', '18:30', '2026-01-20', '2026-02-20', 4, false),
('INTERMEDIARY',  'IN_PROGRESS', 'SATURDAY',  '10:00', '11:30', '2026-02-10', '2026-04-10', 5, false);

INSERT INTO checkin.student (name, contact, cpf, is_active, date_birth, enrollment_date, is_deleted) VALUES
('Fernando Costa', '61999887766', '67890123456', true, '2000-03-18', CURRENT_DATE, false),
('Gabriela Santos', '71988776655', '78901234567', true, '1999-12-10', CURRENT_DATE, false),
('Henrique Alves', '81977665544', '89012345678', false, '2001-09-22', CURRENT_DATE, false),
('Isabela Rocha', '91966554433', '90123456789', true, '1998-06-05', CURRENT_DATE, false),
('João Pedro', '11955443322', '01234567890', true, '2002-11-30', CURRENT_DATE, false);

INSERT INTO checkin.dancing_class
(level, status, day_week, start_schedule, end_schedule, start_date, end_date, beat, is_deleted)
VALUES
('BEGINNER',     'IN_PROGRESS', 'FRIDAY',   '18:00', '19:30', '2026-02-15', '2026-03-20', 4, false),
('INTERMEDIARY', 'IN_PROGRESS', 'MONDAY',   '20:00', '21:30', '2026-02-12', '2026-03-25', 2, false),
('ADVANCED',     'IN_PROGRESS', 'WEDNESDAY','19:00', '20:30', '2026-02-18', '2026-04-01', 4, false),
('BEGINNER',     'IN_PROGRESS', 'TUESDAY',  '16:30', '17:30', '2026-02-20', '2026-03-30', 2, false),
('INTERMEDIARY', 'IN_PROGRESS', 'THURSDAY', '19:30', '21:00', '2026-02-22', '2026-04-05', 1, false);

-- Inserindo dancing_class_student (relacionamentos)
INSERT INTO checkin.dancing_class_student (id_dancing_class, id_student) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),  -- turma 1 com vários alunos
(2, 2), (2, 3), (2, 6), (2, 7),          -- turma 2
(3, 4), (3, 5), (3, 8),                  -- turma 3
(4, 6), (4, 9), (4, 10),                 -- turma 4
(5, 1), (5, 7), (5, 8), (5, 9),          -- turma 5
(6, 2), (6, 4), (6, 6), (6, 8), (6, 10), -- turma 6
(7, 1), (7, 3), (7, 5), (7, 7), (7, 9),  -- turma 7
(8, 2), (8, 4), (8, 6), (8, 8), (8, 10), -- turma 8
(9, 1), (9, 3), (9, 5), (9, 7), (9, 9),  -- turma 9
(10, 2), (10, 4), (10, 6), (10, 8), (10, 10); -- turma 10

-- Inserindo lessons (10 registros)
INSERT INTO checkin.lesson (day, start_schedule, end_schedule, is_deleted, dancing_class) VALUES
('2026-02-16', '18:00', '19:00', false, 1),
('2026-02-17', '19:00', '20:30', false, 2),
('2026-02-18', '20:00', '21:30', false, 3),
('2026-02-19', '17:30', '18:30', false, 4),
('2026-02-20', '10:00', '11:30', false, 5),
('2026-02-21', '18:00', '19:30', false, 6),
('2026-02-22', '20:00', '21:30', false, 7),
('2026-02-23', '19:00', '20:30', false, 8),
('2026-02-24', '16:30', '17:30', false, 9),
('2026-02-25', '19:30', '21:00', false, 10);

-- Inserindo participations (10 registros)
INSERT INTO checkin.participation (confirmed, is_deleted, lesson, student) VALUES
(true, false, 1, 1),
(true, false, 1, 2),
(false, false, 1, 3),
(true, false, 2, 2),
(true, false, 2, 3),
(false, false, 2, 6),
(true, false, 3, 4),
(true, false, 3, 5),
(false, false, 4, 6),
(true, false, 5, 1);
