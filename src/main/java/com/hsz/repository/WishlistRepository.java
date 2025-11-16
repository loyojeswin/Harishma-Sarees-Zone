package com.hsz.repository;

import com.hsz.model.Wishlist;
import com.hsz.model.User;
import com.hsz.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    
    List<Wishlist> findByUser(User user);
    
    Optional<Wishlist> findByUserAndProduct(User user, Product product);
    
    void deleteByUserAndProduct(User user, Product product);
    
    @Query("SELECT COUNT(w) FROM Wishlist w WHERE w.user = :user")
    Long countByUser(@Param("user") User user);
    
    boolean existsByUserAndProduct(User user, Product product);
    
    @Query("SELECT w.product FROM Wishlist w WHERE w.user = :user ORDER BY w.addedAt DESC")
    List<Product> findProductsByUser(@Param("user") User user);
}
