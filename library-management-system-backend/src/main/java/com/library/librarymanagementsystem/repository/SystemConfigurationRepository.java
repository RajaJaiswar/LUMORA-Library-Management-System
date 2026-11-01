package com.library.librarymanagementsystem.repository;

import com.library.librarymanagementsystem.entity.SystemConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemConfigurationRepository
        extends JpaRepository<SystemConfiguration, Long> {
}