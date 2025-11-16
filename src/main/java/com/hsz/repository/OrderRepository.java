package com.hsz.repository;

import com.hsz.model.Order;
import com.hsz.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByUserOrderByOrderDateDesc(User user);
    
    Page<Order> findByUserOrderByOrderDateDesc(User user, Pageable pageable);
    
    Page<Order> findAllByOrderByOrderDateDesc(Pageable pageable);
    
    List<Order> findByStatus(Order.OrderStatus status);
    
    List<Order> findByPaymentStatus(Order.PaymentStatus paymentStatus);
    
    Optional<Order> findByRazorpayOrderId(String razorpayOrderId);
    
    @Query("SELECT COUNT(o) FROM Order o")
    Long countAllOrders();
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countOrdersByStatus(@Param("status") Order.OrderStatus status);
    
    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.paymentStatus = 'SUCCESS'")
    BigDecimal getTotalRevenue();
    
    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.paymentStatus = 'SUCCESS' AND " +
           "o.orderDate >= :startDate AND o.orderDate <= :endDate")
    BigDecimal getRevenueByDateRange(@Param("startDate") LocalDateTime startDate, 
                                   @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT o FROM Order o WHERE o.orderDate >= :startDate AND o.orderDate <= :endDate " +
           "ORDER BY o.orderDate DESC")
    List<Order> findOrdersByDateRange(@Param("startDate") LocalDateTime startDate, 
                                    @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE DATE(o.orderDate) = CURRENT_DATE")
    Long countTodaysOrders();
    
    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE DATE(o.orderDate) = CURRENT_DATE AND o.paymentStatus = 'SUCCESS'")
    BigDecimal getTodaysRevenue();
    
    // New methods for admin dashboard
    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.paymentStatus = 'SUCCESS'")
    BigDecimal calculateTotalRevenue();
    
    List<Order> findTop10ByOrderByOrderDateDesc();
    
    List<Order> findTop5ByOrderByOrderDateDesc();
    
    @Query("SELECT o FROM Order o ORDER BY o.orderDate DESC")
    List<Order> findAllOrdersByDateDesc();
}
