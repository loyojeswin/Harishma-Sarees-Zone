package com.hsz.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(length = 200)
    private String name;

    @NotBlank
    @Column(length = 100)
    private String category;

    @Column(length = 1000)
    private String description;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @NotNull
    @Min(0)
    private Integer stock;

    @Column(name = "image_paths", columnDefinition = "LONGTEXT")
    private String imagePaths; // JSON array of image paths
    
    // Helper methods for image paths
    @Transient
    public List<String> getImagePathsList() {
        if (imagePaths == null || imagePaths.isEmpty()) {
            return new ArrayList<>();
        }
        try {
            // Simple JSON parsing for array of strings
            String cleanJson = imagePaths.trim();
            if (cleanJson.startsWith("[") && cleanJson.endsWith("]")) {
                cleanJson = cleanJson.substring(1, cleanJson.length() - 1);
                if (cleanJson.isEmpty()) {
                    return new ArrayList<>();
                }
                List<String> result = new ArrayList<>();
                String[] parts = cleanJson.split(",");
                for (String part : parts) {
                    String cleaned = part.trim();
                    if (cleaned.startsWith("\"") && cleaned.endsWith("\"")) {
                        cleaned = cleaned.substring(1, cleaned.length() - 1);
                    }
                    if (!cleaned.isEmpty()) {
                        result.add(cleaned);
                    }
                }
                return result;
            }
        } catch (Exception e) {
            // Fallback: treat as single image path
            List<String> result = new ArrayList<>();
            result.add(imagePaths);
            return result;
        }
        return new ArrayList<>();
    }
    
    @Transient
    public void setImagePathsList(List<String> imagePathsList) {
        if (imagePathsList == null || imagePathsList.isEmpty()) {
            this.imagePaths = null;
            return;
        }
        // Simple JSON array creation
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < imagePathsList.size(); i++) {
            if (i > 0) json.append(",");
            json.append("\"").append(imagePathsList.get(i).replace("\"", "\\\"")).append("\"");
        }
        json.append("]");
        this.imagePaths = json.toString();
    }
    
    // Backward compatibility - get first image
    @Transient
    public String getImagePath() {
        List<String> paths = getImagePathsList();
        return paths.isEmpty() ? null : paths.get(0);
    }
    
    // Backward compatibility - set single image
    @Transient
    public void setImagePath(String imagePath) {
        if (imagePath == null) {
            this.imagePaths = null;
        } else {
            List<String> paths = new ArrayList<>();
            paths.add(imagePath);
            setImagePathsList(paths);
        }
    }

    @Column(length = 50)
    private String color;

    @Column(length = 50)
    private String fabric;

    @Column(length = 50)
    private String size;

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<OrderItem> orderItems = new HashSet<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Cart> cartItems = new HashSet<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Wishlist> wishlistItems = new HashSet<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Review> reviews = new HashSet<>();

    public Product() {}

    public Product(String name, String category, String description, BigDecimal price, Integer stock) {
        this.name = name;
        this.category = category;
        this.description = description;
        this.price = price;
        this.stock = stock;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public String getImagePaths() { return imagePaths; }
    public void setImagePaths(String imagePaths) { this.imagePaths = imagePaths; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getFabric() { return fabric; }
    public void setFabric(String fabric) { this.fabric = fabric; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Set<OrderItem> getOrderItems() { return orderItems; }
    public void setOrderItems(Set<OrderItem> orderItems) { this.orderItems = orderItems; }

    public Set<Cart> getCartItems() { return cartItems; }
    public void setCartItems(Set<Cart> cartItems) { this.cartItems = cartItems; }

    public Set<Wishlist> getWishlistItems() { return wishlistItems; }
    public void setWishlistItems(Set<Wishlist> wishlistItems) { this.wishlistItems = wishlistItems; }

    public Set<Review> getReviews() { return reviews; }
    public void setReviews(Set<Review> reviews) { this.reviews = reviews; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public double getAverageRating() {
        if (reviews.isEmpty()) return 0.0;
        return reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
    }

    public int getReviewCount() {
        return reviews.size();
    }
}
