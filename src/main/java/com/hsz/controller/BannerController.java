package com.hsz.controller;

import com.hsz.model.Banner;
import com.hsz.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/banners")
public class BannerController {

    @Autowired
    private BannerRepository bannerRepository;

    @GetMapping
    public ResponseEntity<List<Banner>> getActiveBanners() {
        List<Banner> banners = bannerRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        return ResponseEntity.ok(banners);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Banner>> getAllBanners() {
        List<Banner> banners = bannerRepository.findAllOrderByDisplayOrder();
        return ResponseEntity.ok(banners);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Banner> getBannerById(@PathVariable Long id) {
        return bannerRepository.findById(id)
                .map(banner -> ResponseEntity.ok().body(banner))
                .orElse(ResponseEntity.notFound().build());
    }
}
