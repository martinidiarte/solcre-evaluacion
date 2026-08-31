SET NAMES utf8mb4;

DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS voters;
DROP TABLE IF EXISTS admins;

CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE voters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    document VARCHAR(20) NOT NULL UNIQUE,
    dob DATE NOT NULL,
    is_candidate BOOLEAN NOT NULL DEFAULT FALSE,
    address VARCHAR(255) NOT NULL,
    telephone_number VARCHAR(20) NOT NULL,
    sex ENUM('Masculino', 'Femenino', 'Otro') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE votes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    voter_id INT NOT NULL UNIQUE,
    candidate_id INT NOT NULL,
    voted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- indice para optimizar la busqueda de votos por candidato
    INDEX idx_votes_candidate_id (candidate_id),

    FOREIGN KEY (voter_id) REFERENCES voters(id),
    FOREIGN KEY (candidate_id) REFERENCES voters(id)
);


INSERT INTO admins (name, last_name, email, password_hash) VALUES
('Martin', 'Idiarte', 'martinidiarte@example.com', '$argon2id$v=19$m=65536,t=3,p=4$NQklDFr1o5N7m5SJkaCsOw$eXwX5HcJsBZpu5QMU8W7Hm4Ez+w7HxfAeeQZOWD/3Ho' );

INSERT INTO voters (name, last_name, document, dob, is_candidate, address, telephone_number, sex) VALUES
('Lucía', 'Fernández', '48392017', '1998-04-12', FALSE, 'Av. Rivera 1542', '099123456', 'Femenino'),
('Mateo', 'Rodríguez', '51278436', '1995-09-23', FALSE, '18 de Julio 2231', '098234567', 'Masculino'),
('Camila', 'Silva', '46715382', '2000-01-17', FALSE, 'Colonia 845', '097345678', 'Femenino'),
('Nicolás', 'Pereira', '53824179', '1997-06-05', FALSE, 'Bulevar Artigas 1980', '096456789', 'Masculino'),
('Valentina', 'Gómez', '49537621', '2001-11-30', FALSE, 'Mercedes 1124', '095567890', 'Femenino'),
('Santiago', 'Martínez', '52164983', '1994-03-14', FALSE, 'Maldonado 1765', '094678901', 'Masculino'),
('Florencia', 'López', '47826514', '1999-08-21', FALSE, 'San José 1320', '093789012', 'Femenino'),
('Joaquín', 'Suárez', '54631827', '1996-12-09', FALSE, 'Gaboto 1845', '092890123', 'Masculino'),

('Sofía', 'Torres', '45987231', '1993-05-18', TRUE, 'Canelones 2104', '091901234', 'Femenino'),
('Federico', 'Acosta', '53179642', '1992-10-27', TRUE, 'Durazno 1568', '090012345', 'Masculino');