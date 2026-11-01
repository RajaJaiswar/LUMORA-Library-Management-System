package com.library.librarymanagementsystem.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_configuration")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private boolean initialSetupCompleted;

    private LocalDateTime setupCompletedAt;

    @Column(length = 100)
    private String setupTokenHash;

    @Column(nullable = false)
    private boolean setupTokenUsed;
}