package com.library.librarymanagementsystem.repository;


import com.library.librarymanagementsystem.entity.Role;
import com.library.librarymanagementsystem.entity.User;
import com.library.librarymanagementsystem.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;



public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByLibraryMemberId(String libraryMemberId);

    Optional<User> findByLibraryMemberId(String libraryMemberId);

    boolean existsByRole(Role role);

    long countByRoleAndStatus(Role role, UserStatus status);
}