package com.hsz.repository;

import com.hsz.model.Cart;
import com.hsz.model.User;
import com.hsz.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    
    List<Cart> findByUser(User user);
    
    Optional<Cart> findByUserAndProduct(User user, Product product);
    
    void deleteByUser(User user);
    
    void deleteByUserAndProduct(User user, Product product);
    
    @Query("SELECT COUNT(c) FROM Cart c WHERE c.user = :user")
    Long countByUser(@Param("user") User user);
    
    @Query("SELECT SUM(c.quantity * c.product.price) FROM Cart c WHERE c.user = :user")
    Double getTotalAmountByUser(@Param("user") User user);
    
    boolean existsByUserAndProduct(User user, Product product);
}
