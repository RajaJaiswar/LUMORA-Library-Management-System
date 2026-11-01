package com.library.librarymanagementsystem.service;

import com.library.librarymanagementsystem.dto.request.RoleUpdateRequest;
import com.library.librarymanagementsystem.dto.request.StatusUpdateRequest;
import com.library.librarymanagementsystem.dto.request.UserProfileUpdateRequest;
import com.library.librarymanagementsystem.dto.response.UserResponse;
import com.library.librarymanagementsystem.entity.Role;
import com.library.librarymanagementsystem.entity.User;
import com.library.librarymanagementsystem.entity.UserStatus;
import com.library.librarymanagementsystem.exception.ResourceAlreadyExistsException;
import com.library.librarymanagementsystem.exception.ResourceNotFoundException;
import com.library.librarymanagementsystem.repository.UserRepository;
import com.library.librarymanagementsystem.service.Impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private User adminUser;
    private User memberUser;

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .id(1L)
                .name("Super Admin")
                .email("admin@test.com")
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now().minusDays(10))
                .updatedAt(LocalDateTime.now().minusDays(1))
                .build();

        memberUser = User.builder()
                .id(2L)
                .name("Regular Member")
                .email("member@test.com")
                .role(Role.MEMBER)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now().minusDays(5))
                .updatedAt(LocalDateTime.now().minusDays(1))
                .build();
    }

    @Test
    @DisplayName("updateRole should successfully promote Member to Librarian")
    void updateRole_Success_MemberToLibrarian() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(memberUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RoleUpdateRequest request = new RoleUpdateRequest(Role.LIBRARIAN);
        UserResponse response = userService.updateRole(2L, request);

        assertNotNull(response);
        assertEquals(Role.LIBRARIAN, response.getRole());
        assertEquals("member@test.com", response.getEmail());
        verify(userRepository).save(memberUser);
    }

    @Test
    @DisplayName("updateRole should throw IllegalArgumentException when attempting to demote last active Admin")
    void updateRole_ThrowsException_WhenRemovingLastActiveAdmin() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(userRepository.countByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE)).thenReturn(1L);

        RoleUpdateRequest request = new RoleUpdateRequest(Role.MEMBER);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateRole(1L, request)
        );

        assertEquals("Cannot remove the last active administrator", ex.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("updateRole should succeed when demoting Admin if multiple active Admins exist")
    void updateRole_Success_WhenMultipleActiveAdminsExist() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(userRepository.countByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE)).thenReturn(2L);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RoleUpdateRequest request = new RoleUpdateRequest(Role.LIBRARIAN);
        UserResponse response = userService.updateRole(1L, request);

        assertNotNull(response);
        assertEquals(Role.LIBRARIAN, response.getRole());
        verify(userRepository).save(adminUser);
    }

    @Test
    @DisplayName("updateStatus should throw IllegalArgumentException when Admin attempts to deactivate own account")
    void updateStatus_ThrowsException_WhenAdminDeactivatesSelf() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));

        StatusUpdateRequest request = new StatusUpdateRequest(UserStatus.INACTIVE);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateStatus(1L, request, "admin@test.com")
        );

        assertEquals("You cannot deactivate your own account", ex.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("updateStatus should throw IllegalArgumentException when attempting to deactivate last active Admin")
    void updateStatus_ThrowsException_WhenDeactivatingLastActiveAdmin() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(userRepository.countByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE)).thenReturn(1L);

        StatusUpdateRequest request = new StatusUpdateRequest(UserStatus.INACTIVE);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateStatus(1L, request, "other.admin@test.com")
        );

        assertEquals("Cannot deactivate the last active administrator", ex.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("updateStatus should succeed when deactivating Admin if caller is different and multiple active Admins exist")
    void updateStatus_Success_WhenMultipleActiveAdminsExist() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(userRepository.countByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE)).thenReturn(2L);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StatusUpdateRequest request = new StatusUpdateRequest(UserStatus.INACTIVE);
        UserResponse response = userService.updateStatus(1L, request, "other.admin@test.com");

        assertNotNull(response);
        assertEquals(UserStatus.INACTIVE, response.getStatus());
        verify(userRepository).save(adminUser);
    }

    @Test
    @DisplayName("updateStatus should succeed when deactivating a regular Member")
    void updateStatus_Success_DeactivatingMember() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(memberUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StatusUpdateRequest request = new StatusUpdateRequest(UserStatus.INACTIVE);
        UserResponse response = userService.updateStatus(2L, request, "admin@test.com");

        assertNotNull(response);
        assertEquals(UserStatus.INACTIVE, response.getStatus());
        verify(userRepository).save(memberUser);
    }

    @Test
    @DisplayName("updateRole should throw ResourceNotFoundException when user does not exist")
    void updateRole_ThrowsException_WhenUserNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        RoleUpdateRequest request = new RoleUpdateRequest(Role.ADMIN);

        assertThrows(
                ResourceNotFoundException.class,
                () -> userService.updateRole(999L, request)
        );
    }

    @Test
    @DisplayName("getAllUsers should return mapped user list")
    void getAllUsers_Success() {
        when(userRepository.findAll()).thenReturn(List.of(adminUser, memberUser));

        List<UserResponse> responses = userService.getAllUsers();

        assertNotNull(responses);
        assertEquals(2, responses.size());
        assertEquals("Super Admin", responses.get(0).getName());
        assertEquals("Regular Member", responses.get(1).getName());
    }

    @Test
    @DisplayName("getUserById should return single mapped user")
    void getUserById_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));

        UserResponse response = userService.getUserById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("admin@test.com", response.getEmail());
    }

    @Test
    @DisplayName("updateProfile should successfully update name and email")
    void updateProfile_Success() {
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));
        when(userRepository.existsByEmail("new.email@test.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserProfileUpdateRequest request = new UserProfileUpdateRequest("Updated Admin", "new.email@test.com");
        UserResponse response = userService.updateProfile(request, "admin@test.com");

        assertNotNull(response);
        assertEquals("Updated Admin", response.getName());
        assertEquals("new.email@test.com", response.getEmail());
        verify(userRepository).save(adminUser);
    }

    @Test
    @DisplayName("updateProfile should throw ResourceAlreadyExistsException when new email already exists")
    void updateProfile_ThrowsException_WhenEmailAlreadyExists() {
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));
        when(userRepository.existsByEmail("taken@test.com")).thenReturn(true);

        UserProfileUpdateRequest request = new UserProfileUpdateRequest("Updated Admin", "taken@test.com");

        ResourceAlreadyExistsException ex = assertThrows(
                ResourceAlreadyExistsException.class,
                () -> userService.updateProfile(request, "admin@test.com")
        );

        assertEquals("Email already registered", ex.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("updateProfile should throw ResourceNotFoundException when user is not found")
    void updateProfile_ThrowsException_WhenUserNotFound() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        UserProfileUpdateRequest request = new UserProfileUpdateRequest("Updated Admin", "new@test.com");

        assertThrows(
                ResourceNotFoundException.class,
                () -> userService.updateProfile(request, "unknown@test.com")
        );

        verify(userRepository, never()).save(any(User.class));
    }
}
