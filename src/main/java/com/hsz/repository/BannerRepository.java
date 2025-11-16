package com.hsz.repository;

import com.hsz.model.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    
    List<Banner> findByIsActiveTrueOrderByDisplayOrderAsc();
    
    @Query("SELECT b FROM Banner b ORDER BY b.displayOrder ASC, b.createdAt DESC")
    List<Banner> findAllOrderByDisplayOrder();
    
    @Query("SELECT COUNT(b) FROM Banner b WHERE b.isActive = true")
    Long countActiveBanners();
}
