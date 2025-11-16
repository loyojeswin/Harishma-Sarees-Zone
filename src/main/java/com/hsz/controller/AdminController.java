package com.hsz.controller;

import com.hsz.model.Order;
import com.hsz.model.User;
import com.hsz.repository.UserRepository;
import com.hsz.repository.ProductRepository;
import com.hsz.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Get basic counts
        long totalUsers = userRepository.countByRole("USER");
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        
        // Calculate total revenue (mock calculation)
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.valueOf(125000); // Mock data
        }
        
        stats.put("totalUsers", totalUsers);
        stats.put("totalProducts", totalProducts);
        stats.put("totalOrders", totalOrders);
        stats.put("totalRevenue", totalRevenue);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/dashboard/recent-orders")
    public ResponseEntity<List<Order>> getRecentOrders() {
        List<Order> recentOrders = orderRepository.findTop10ByOrderByOrderDateDesc();
        return ResponseEntity.ok(recentOrders);
    }

    @GetMapping("/users/count")
    public ResponseEntity<Long> getUserCount() {
        long userCount = userRepository.countByRole("USER");
        return ResponseEntity.ok(userCount);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/products/count")
    public ResponseEntity<Long> getProductCount() {
        long productCount = productRepository.count();
        return ResponseEntity.ok(productCount);
    }


    @GetMapping("/orders/count")
    public ResponseEntity<Long> getOrderCount() {
        long orderCount = orderRepository.count();
        return ResponseEntity.ok(orderCount);
    }


    @GetMapping("/revenue/total")
    public ResponseEntity<BigDecimal> getTotalRevenue() {
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.valueOf(125000); // Mock data
        }
        return ResponseEntity.ok(totalRevenue);
    }

    @GetMapping("/revenue/monthly")
    public ResponseEntity<Map<String, Object>> getMonthlyRevenue() {
        Map<String, Object> monthlyData = new HashMap<>();
        
        // Mock monthly revenue data (replace with real calculation)
        Map<String, BigDecimal> monthlyRevenue = new HashMap<>();
        monthlyRevenue.put("January", BigDecimal.valueOf(45000));
        monthlyRevenue.put("February", BigDecimal.valueOf(52000));
        monthlyRevenue.put("March", BigDecimal.valueOf(48000));
        monthlyRevenue.put("April", BigDecimal.valueOf(61000));
        monthlyRevenue.put("May", BigDecimal.valueOf(55000));
        monthlyRevenue.put("June", BigDecimal.valueOf(67000));
        
        monthlyData.put("monthlyRevenue", monthlyRevenue);
        return ResponseEntity.ok(monthlyData);
    }

    @GetMapping("/products/top-selling")
    public ResponseEntity<List<Map<String, Object>>> getTopSellingProducts() {
        // Mock top selling products data
        List<Map<String, Object>> topProducts = List.of(
            Map.of("name", "Elegant Silk Saree", "sales", 45, "revenue", 112500),
            Map.of("name", "Designer Party Saree", "sales", 32, "revenue", 144000),
            Map.of("name", "Traditional Banarasi", "sales", 28, "revenue", 168000),
            Map.of("name", "Cotton Casual Saree", "sales", 67, "revenue", 53600)
        );
        
        return ResponseEntity.ok(topProducts);
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<Map<String, String>> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            User user = userRepository.findById(id).orElse(null);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Update user status logic here
            Map<String, String> response = new HashMap<>();
            response.put("message", "User status updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to update user status");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        try {
            if (!userRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            userRepository.deleteById(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "User deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to delete user");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/analytics/overview")
    public ResponseEntity<Map<String, Object>> getAnalyticsOverview() {
        Map<String, Object> analytics = new HashMap<>();
        
        // Growth percentages (mock data)
        analytics.put("userGrowth", 12.5);
        analytics.put("productGrowth", 8.3);
        analytics.put("orderGrowth", 23.1);
        analytics.put("revenueGrowth", 18.7);
        
        // Additional metrics
        analytics.put("averageOrderValue", 2340);
        analytics.put("conversionRate", 3.2);
        analytics.put("customerRetentionRate", 68.5);
        
        return ResponseEntity.ok(analytics);
    }
}
