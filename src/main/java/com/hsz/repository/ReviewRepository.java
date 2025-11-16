package com.hsz.repository;

import com.hsz.model.Review;
import com.hsz.model.Product;
import com.hsz.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    List<Review> findByProduct(Product product);
    
    Page<Review> findByProductOrderByCreatedAtDesc(Product product, Pageable pageable);
    
    List<Review> findByUser(User user);
    
    Optional<Review> findByProductAndUser(Product product, User user);
    
    boolean existsByProductAndUser(Product product, User user);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product = :product")
    Double getAverageRatingByProduct(@Param("product") Product product);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product = :product")
    Long countByProduct(@Param("product") Product product);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product = :product AND r.rating = :rating")
    Long countByProductAndRating(@Param("product") Product product, @Param("rating") Integer rating);
    
    @Query("SELECT r FROM Review r ORDER BY r.createdAt DESC")
    Page<Review> findAllOrderByCreatedAtDesc(Pageable pageable);
}
