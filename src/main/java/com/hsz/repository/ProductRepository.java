package com.hsz.repository;

import com.hsz.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findByIsActiveTrue();
    
    List<Product> findByIsFeaturedTrueAndIsActiveTrue();
    
    Page<Product> findByIsActiveTrue(Pageable pageable);
    
    Page<Product> findByCategoryAndIsActiveTrue(String category, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "(:category IS NULL OR p.category = :category) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:color IS NULL OR p.color = :color) AND " +
           "(:fabric IS NULL OR p.fabric = :fabric)")
    Page<Product> findProductsWithFilters(
        @Param("category") String category,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("color") String color,
        @Param("fabric") String fabric,
        Pageable pageable
    );
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchProducts(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.isActive = true")
    List<String> findAllCategories();
    
    @Query("SELECT DISTINCT p.color FROM Product p WHERE p.isActive = true AND p.color IS NOT NULL")
    List<String> findAllColors();
    
    @Query("SELECT DISTINCT p.fabric FROM Product p WHERE p.fabric IS NOT NULL ORDER BY p.fabric")
    List<String> findDistinctFabrics();
    
    @Query("SELECT DISTINCT p.fabric FROM Product p WHERE p.isActive = true AND p.fabric IS NOT NULL")
    List<String> findAllFabrics();
    
    @Query("SELECT DISTINCT p.category FROM Product p ORDER BY p.category")
    List<String> findDistinctCategories();
    
    @Query("SELECT DISTINCT p.color FROM Product p WHERE p.color IS NOT NULL ORDER BY p.color")
    List<String> findDistinctColors();
    
    // New methods for admin product management
    Long countByIsActiveTrue();
    
    Long countByIsFeaturedTrue();
    
    Long countByStockLessThan(Integer threshold);
    
    List<Product> findByStockLessThanAndIsActiveTrue(Integer threshold);
    
    @Query("SELECT COUNT(p) FROM Product p WHERE p.isActive = true")
    Long countActiveProducts();
}
