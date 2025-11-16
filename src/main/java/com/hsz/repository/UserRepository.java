package com.hsz.repository;

import com.hsz.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    Boolean existsByEmail(String email);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'USER'")
    Long countCustomers();
    
    // New methods for admin dashboard
    Long countByRole(String role);
    
    List<User> findByRole(String role);
    
    @Query("SELECT u FROM User u WHERE u.role = :role ORDER BY u.createdAt DESC")
    List<User> findByRoleOrderByCreatedAtDesc(@Param("role") String role);
    
    @Query("SELECT u FROM User u WHERE u.role = 'USER' ORDER BY u.createdAt DESC")
    List<User> findAllCustomersOrderByCreatedAtDesc();
}
