package com.hsz.controller;

import com.hsz.model.Product;
import com.hsz.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Optional<Product> product = productRepository.findById(id);
        return product.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        try {
            Product savedProduct = productRepository.save(product);
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody Product productDetails) {
        try {
            Optional<Product> optionalProduct = productRepository.findById(id);
            
            if (!optionalProduct.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Product product = optionalProduct.get();
            
            // Update product fields
            product.setName(productDetails.getName());
            product.setCategory(productDetails.getCategory());
            product.setDescription(productDetails.getDescription());
            product.setPrice(productDetails.getPrice());
            product.setStock(productDetails.getStock());
            product.setColor(productDetails.getColor());
            product.setFabric(productDetails.getFabric());
            product.setSize(productDetails.getSize());
            product.setIsFeatured(productDetails.getIsFeatured());
            product.setIsActive(productDetails.getIsActive());
            
            // Update image path if provided
            if (productDetails.getImagePath() != null) {
                product.setImagePath(productDetails.getImagePath());
            }
            
            Product updatedProduct = productRepository.save(product);
            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id) {
        try {
            if (!productRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            productRepository.deleteById(id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Product deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to delete product");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}/toggle-featured")
    public ResponseEntity<Product> toggleFeatured(@PathVariable Long id) {
        try {
            Optional<Product> optionalProduct = productRepository.findById(id);
            
            if (!optionalProduct.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Product product = optionalProduct.get();
            product.setIsFeatured(!product.getIsFeatured());
            
            Product updatedProduct = productRepository.save(product);
            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<Product> toggleActive(@PathVariable Long id) {
        try {
            Optional<Product> optionalProduct = productRepository.findById(id);
            
            if (!optionalProduct.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Product product = optionalProduct.get();
            product.setIsActive(!product.getIsActive());
            
            Product updatedProduct = productRepository.save(product);
            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        List<String> categories = productRepository.findDistinctCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/colors")
    public ResponseEntity<List<String>> getColors() {
        List<String> colors = productRepository.findDistinctColors();
        return ResponseEntity.ok(colors);
    }

    @GetMapping("/fabrics")
    public ResponseEntity<List<String>> getFabrics() {
        List<String> fabrics = productRepository.findDistinctFabrics();
        return ResponseEntity.ok(fabrics);
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Product>> getFeaturedProducts() {
        List<Product> featuredProducts = productRepository.findByIsFeaturedTrueAndIsActiveTrue();
        return ResponseEntity.ok(featuredProducts);
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Product>> getLowStockProducts(@RequestParam(defaultValue = "10") int threshold) {
        List<Product> lowStockProducts = productRepository.findByStockLessThanAndIsActiveTrue(threshold);
        return ResponseEntity.ok(lowStockProducts);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getProductStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalProducts = productRepository.count();
        long activeProducts = productRepository.countByIsActiveTrue();
        long featuredProducts = productRepository.countByIsFeaturedTrue();
        long lowStockProducts = productRepository.countByStockLessThan(10);
        
        stats.put("totalProducts", totalProducts);
        stats.put("activeProducts", activeProducts);
        stats.put("featuredProducts", featuredProducts);
        stats.put("lowStockProducts", lowStockProducts);
        
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/{id}/update-stock")
    public ResponseEntity<Product> updateStock(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        try {
            Optional<Product> optionalProduct = productRepository.findById(id);
            
            if (!optionalProduct.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Product product = optionalProduct.get();
            Integer newStock = request.get("stock");
            
            if (newStock != null && newStock >= 0) {
                product.setStock(newStock);
                
                Product updatedProduct = productRepository.save(product);
                return ResponseEntity.ok(updatedProduct);
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
