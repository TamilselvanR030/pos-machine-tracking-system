CREATE DATABASE POS_Tracking;
GO

USE POS_Tracking;
GO

CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user', -- 'admin' or 'user'
    created_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Admin (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE POS_Devices (
    id INT IDENTITY(1,1) PRIMARY KEY,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    model VARCHAR(100),
    status VARCHAR(50) DEFAULT 'available',
    assigned_user_id INT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (assigned_user_id) REFERENCES Users(id)
);
GO

-- Insert a default admin for initial login
-- Password should be updated later, here we could use a known bcrypt hash or simple text if doing dev
-- Assuming we'll handle hash on the backend, for now this is just structure.
