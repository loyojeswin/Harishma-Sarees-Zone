package com.hsz.controller;

import com.hsz.model.Order;
import com.hsz.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderRepository.findAllOrdersByDateDesc();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Optional<Order> order = orderRepository.findById(id);
        return order.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            Optional<Order> optionalOrder = orderRepository.findById(id);
            
            if (!optionalOrder.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Order order = optionalOrder.get();
            String newStatus = request.get("status");
            
            if (newStatus != null) {
                try {
                    Order.OrderStatus status = Order.OrderStatus.valueOf(newStatus);
                    order.setStatus(status);
                    
                    Order updatedOrder = orderRepository.save(order);
                    return ResponseEntity.ok(updatedOrder);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().build();
                }
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getOrderStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countOrdersByStatus(Order.OrderStatus.PENDING);
        long processingOrders = orderRepository.countOrdersByStatus(Order.OrderStatus.PROCESSING);
        long shippedOrders = orderRepository.countOrdersByStatus(Order.OrderStatus.SHIPPED);
        long deliveredOrders = orderRepository.countOrdersByStatus(Order.OrderStatus.DELIVERED);
        
        stats.put("totalOrders", totalOrders);
        stats.put("pendingOrders", pendingOrders);
        stats.put("processingOrders", processingOrders);
        stats.put("shippedOrders", shippedOrders);
        stats.put("deliveredOrders", deliveredOrders);
        
        return ResponseEntity.ok(stats);
    }


    @GetMapping("/by-status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable String status) {
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            List<Order> orders = orderRepository.findByStatus(orderStatus);
            return ResponseEntity.ok(orders);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteOrder(@PathVariable Long id) {
        try {
            if (!orderRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            orderRepository.deleteById(id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Order deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to delete order");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}/payment-status")
    public ResponseEntity<Order> updatePaymentStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            Optional<Order> optionalOrder = orderRepository.findById(id);
            
            if (!optionalOrder.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Order order = optionalOrder.get();
            String newPaymentStatus = request.get("paymentStatus");
            
            if (newPaymentStatus != null) {
                try {
                    Order.PaymentStatus paymentStatus = Order.PaymentStatus.valueOf(newPaymentStatus);
                    order.setPaymentStatus(paymentStatus);
                    
                    Order updatedOrder = orderRepository.save(order);
                    return ResponseEntity.ok(updatedOrder);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().build();
                }
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
