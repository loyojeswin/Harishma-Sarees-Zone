package com.hsz.repository;

import com.hsz.model.OrderItem;
import com.hsz.model.Order;
import com.hsz.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    List<OrderItem> findByOrder(Order order);
    
    List<OrderItem> findByProduct(Product product);
    
    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.id = :orderId")
    List<OrderItem> findByOrderId(@Param("orderId") Long orderId);
    
    @Query("SELECT oi.product, SUM(oi.quantity) as totalSold FROM OrderItem oi " +
           "WHERE oi.order.paymentStatus = 'SUCCESS' " +
           "GROUP BY oi.product ORDER BY totalSold DESC")
    List<Object[]> findBestSellingProducts();
    
    @Query("SELECT SUM(oi.quantity) FROM OrderItem oi WHERE oi.product.id = :productId " +
           "AND oi.order.paymentStatus = 'SUCCESS'")
    Long getTotalSoldQuantityByProduct(@Param("productId") Long productId);
}
